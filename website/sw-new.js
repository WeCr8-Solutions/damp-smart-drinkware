/* global self, caches, console, URL, fetch, Response, Request, Blob, crypto, BroadcastChannel, setInterval, setTimeout, location */

// DAMP Smart Drinkware - Advanced Service Worker
// Google Engineering Standards with Hot Module Replacement & Intelligent Caching
// Copyright 2025 WeCr8 Solutions LLC

// Service Worker Configuration Object
const SW = {
    // Core configurations
    CACHE_NAME: 'damp-v2.1.0',
    CACHE_STRATEGY_VERSION: '2.1.0',
    HOT_RELOAD_CHANNEL: 'damp-hot-reload',
    PERFORMANCE_CHANNEL: 'damp-performance',

    // Cache strategies
    strategies: {
        CRITICAL: 'critical-resources',     // HTML, critical CSS/JS
        STATIC: 'static-assets',           // Images, fonts, non-critical CSS/JS
        API: 'api-responses',              // API calls with TTL
        DYNAMIC: 'dynamic-content',        // User-generated content
        OFFLINE: 'offline-fallbacks'       // Offline pages and assets
    },

    // Cache configurations
    config: {
        'critical-resources': {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24,        // 24 hours
            strategy: 'NetworkFirst',
            networkTimeoutSeconds: 3             // Fallback to cache after 3s
        },
        'static-assets': {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30,   // 30 days
            strategy: 'CacheFirst',
            cachableResponses: {
                statuses: [0, 200]
            }
        },
        'api-responses': {
            maxEntries: 100,
            maxAgeSeconds: 60 * 5,              // 5 minutes
            strategy: 'NetworkFirst',
            networkTimeoutSeconds: 2,            // Fallback to cache after 2s
            backgroundSync: true                 // Enable background sync
        },
        'dynamic-content': {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5,              // 5 minutes for cart state
            strategy: 'NetworkFirst',            // Changed to ensure fresh cart data
            networkTimeoutSeconds: 2,
            backgroundSync: true,
            syncTag: 'cart-update'
        }
    },

    // State
    backgroundSyncQueues: new Map(),
    hmrEnabled: false,
    hmrClients: new Set(),
    performanceMetrics: {
        cacheHits: 0,
        cacheMisses: 0,
        networkLatency: []
    },

    // Initialization
    init() {
        this.initializeBackgroundSync();
        this.setupEventListeners();
        this.setupPerformanceMonitoring();
        return this;
    },

    // Background sync initialization
    initializeBackgroundSync() {
        ['cart-updates', 'analytics', 'form-submissions', 'preorders'].forEach(queueName => {
            this.backgroundSyncQueues.set(queueName, new Set());
        });
    },

    // Event listeners setup
    setupEventListeners() {
        self.addEventListener('install', event => this.handleInstall(event));
        self.addEventListener('activate', event => this.handleActivate(event));
        self.addEventListener('fetch', event => this.handleFetch(event));
        self.addEventListener('sync', event => this.handleSync(event));
        self.addEventListener('message', event => this.handleMessage(event));
    },

    // Install handler
    handleInstall(event) {
        event.waitUntil(
            Promise.all([
                this.cacheOfflinePage(),
                this.cacheCriticalAssets()
            ])
            .then(() => self.skipWaiting())
            .catch(error => console.error('[DAMP SW] Install error:', error))
        );
    },

    // Activate handler
    handleActivate(event) {
        event.waitUntil(
            Promise.all([
                this.cleanOldCaches(),
                this.initializeBackgroundSync()
            ])
            .then(() => self.clients.claim())
            .catch(error => console.error('[DAMP SW] Activation error:', error))
        );
    },

    // Cache the offline page
    async cacheOfflinePage() {
        const cache = await caches.open(this.strategies.OFFLINE);
        await cache.add('/offline.html');
    },

    // Cache critical assets
    async cacheCriticalAssets() {
        const cache = await caches.open(this.strategies.CRITICAL);
        const criticalAssets = [
            '/',
            '/index.html',
            '/css/main.css',
            '/js/app.js'
        ];
        await Promise.all(criticalAssets.map(url => cache.add(url)));
    },

    // Clean old caches
    async cleanOldCaches() {
        const cacheKeys = await caches.keys();
        const oldCaches = cacheKeys.filter(key => key.startsWith('damp-') && key !== this.CACHE_NAME);
        await Promise.all(oldCaches.map(key => caches.delete(key)));
    },

    // Fetch handler
    handleFetch(event) {
        // Skip non-GET requests
        if (event.request.method !== 'GET') return;

        // Handle HMR requests differently in development
        if (this.isHMRRequest(event.request)) {
            return this.handleHMRRequest(event);
        }

        const strategy = this.determineStrategy(event.request);
        event.respondWith(this.applyStrategy(strategy, event.request));
    },

    // Sync handler for background sync events
    handleSync(event) {
        if (event.tag === 'cart-sync') {
            event.waitUntil(this.syncCartUpdates());
        } else if (event.tag === 'analytics-sync') {
            event.waitUntil(this.syncAnalytics());
        }
    },

    // Message handler
    handleMessage(event) {
        const { type, data } = event.data;
        switch (type) {
            case 'enable-hmr':
                this.enableHMR(event.source);
                break;
            case 'disable-hmr':
                this.disableHMR(event.source);
                break;
            case 'cart-update':
                this.handleCartUpdate(data);
                break;
        }
    },

    // Determine cache strategy based on request
    determineStrategy(request) {
        const url = new URL(request.url);
        
        // Critical resources
        if (url.pathname.match(/\.(html|css|js)$/) && !url.pathname.includes('static')) {
            return this.strategies.CRITICAL;
        }
        
        // Static assets
        if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
            return this.strategies.STATIC;
        }
        
        // API calls
        if (url.pathname.startsWith('/api/')) {
            return this.strategies.API;
        }
        
        // Dynamic content (like cart)
        if (url.pathname.includes('cart') || url.pathname.includes('checkout')) {
            return this.strategies.DYNAMIC;
        }
        
        // Default to network-first for everything else
        return this.strategies.CRITICAL;
    },

    // Apply the selected caching strategy
    async applyStrategy(strategy, request) {
        const config = this.config[strategy];
        
        switch (config.strategy) {
            case 'CacheFirst':
                return this.cacheFirstStrategy(request, strategy);
            case 'NetworkFirst':
                return this.networkFirstStrategy(request, strategy);
            default:
                return this.networkFirstStrategy(request, strategy);
        }
    },

    // Cache-first strategy implementation
    async cacheFirstStrategy(request, cacheName) {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            this.trackPerformance('cache-hit', request.url);
            // Refresh cache in background
            this.refreshCacheInBackground(request, cacheName);
            return cachedResponse;
        }

        this.trackPerformance('cache-miss', request.url);
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        } catch (error) {
            return this.getOfflineFallback(request);
        }
    },

    // Network-first strategy implementation
    async networkFirstStrategy(request, cacheName) {
        try {
            const start = performance.now();
            const networkResponse = await fetch(request);
            this.trackPerformance('network-latency', performance.now() - start);
            
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                await cache.put(request, networkResponse.clone());
                return networkResponse;
            }
        } catch (error) {
            const cache = await caches.open(cacheName);
            const cachedResponse = await cache.match(request);
            if (cachedResponse) {
                this.trackPerformance('cache-hit', request.url);
                return cachedResponse;
            }
        }
        
        return this.getOfflineFallback(request);
    },

    // Cart sync implementation
    async syncCartUpdates() {
        const cartQueue = this.backgroundSyncQueues.get('cart-updates');
        if (!cartQueue || cartQueue.size === 0) return;

        console.log('[DAMP SW] Processing queued cart updates...');

        for (const request of cartQueue) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    cartQueue.delete(request);
                    console.log('[DAMP SW] Cart update processed successfully');
                } else {
                    throw new Error(`Cart update failed with status ${response.status}`);
                }
            } catch (error) {
                console.warn('[DAMP SW] Failed to process cart update:', error);
            }
        }

        // Update clients
        this.notifyClients('cart-sync-complete', {
            remaining: cartQueue.size
        });
    },

    // Handle cart updates
    handleCartUpdate(data) {
        const cartQueue = this.backgroundSyncQueues.get('cart-updates');
        const request = new Request('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        cartQueue.add(request);
        
        // Register for background sync if supported
        if ('sync' in self.registration) {
            self.registration.sync.register('cart-sync');
        } else {
            // Immediate sync fallback
            this.syncCartUpdates();
        }
    },

    // HMR support
    isHMRRequest(request) {
        return request.headers.get('accept').includes('hot-update');
    },

    async handleHMRRequest(event) {
        const request = event.request;
        const response = await fetch(request);
        if (response.ok) {
            this.broadcastHMRUpdate(request.url);
        }
        return response;
    },

    enableHMR(client) {
        this.hmrEnabled = true;
        this.hmrClients.add(client);
    },

    disableHMR(client) {
        this.hmrClients.delete(client);
    },

    broadcastHMRUpdate(url) {
        this.hmrClients.forEach(client => {
            client.postMessage({
                type: 'hmr-update',
                url: url
            });
        });
    },

    // Performance monitoring
    setupPerformanceMonitoring() {
        setInterval(() => {
            this.reportPerformanceMetrics();
        }, 60000); // Report every minute
    },

    trackPerformance(type, data) {
        switch (type) {
            case 'cache-hit':
                this.performanceMetrics.cacheHits++;
                break;
            case 'cache-miss':
                this.performanceMetrics.cacheMisses++;
                break;
            case 'network-latency':
                this.performanceMetrics.networkLatency.push(data);
                break;
        }
    },

    reportPerformanceMetrics() {
        const channel = new BroadcastChannel(this.PERFORMANCE_CHANNEL);
        channel.postMessage({
            type: 'metrics',
            data: {
                cacheHitRate: this.performanceMetrics.cacheHits / 
                    (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses),
                averageLatency: this.performanceMetrics.networkLatency.reduce((a, b) => a + b, 0) / 
                    this.performanceMetrics.networkLatency.length
            }
        });
        channel.close();
    },

    // Analytics sync
    async syncAnalytics() {
        const analyticsQueue = this.backgroundSyncQueues.get('analytics');
        if (!analyticsQueue || analyticsQueue.size === 0) return;

        for (const data of analyticsQueue) {
            try {
                const response = await fetch('/api/analytics', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    analyticsQueue.delete(data);
                }
            } catch (error) {
                console.warn('[DAMP SW] Failed to sync analytics:', error);
            }
        }
    },

    // Offline fallback
    async getOfflineFallback(request) {
        // Check if it's a page request
        if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
            const cache = await caches.open(this.strategies.OFFLINE);
            return cache.match('/offline.html') || new Response(
                'You are offline. Please check your internet connection.',
                {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                }
            );
        }

        // For assets, return a minimal response
        return new Response(null, { status: 504 });
    },

    // Cache refresh utility
    async refreshCacheInBackground(request, cacheName) {
        try {
            const cache = await caches.open(cacheName);
            const response = await fetch(request);
            if (response.ok) {
                await cache.put(request, response);
            }
        } catch (error) {
            console.warn('[DAMP SW] Background cache refresh failed:', error);
        }
    },

    // Client notification utility
    notifyClients(type, data) {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type,
                    data
                });
            });
        });
    }
};

// Initialize the service worker
SW.init();

// Event Listeners
self.addEventListener('install', event => SW.handleInstall(event));
self.addEventListener('activate', event => SW.handleActivate(event));
self.addEventListener('fetch', event => SW.handleFetch(event));
self.addEventListener('sync', event => SW.handleSync(event));
self.addEventListener('message', event => {
    const { type, data } = event.data || {};
    switch (type) {
        case 'enable-hmr':
            SW.enableHMR(event.source);
            break;
        case 'disable-hmr':
            SW.disableHMR(event.source);
            break;
        case 'cart-update':
            SW.handleCartUpdate(data);
            break;
    }
});