/**
 * DAMP Advanced Performance Optimization System
 * Implements chunking, blob optimization, prefetching, and resource management
 * Google Engineering Standards with Security Focus
 * Copyright 2025 WeCr8 Solutions LLC
 */

class DAMPPerformanceOptimizer {
    constructor() {
        this.chunkCache = new Map();
        this.blobCache = new Map();
        this.prefetchQueue = new Set();
        this.criticalResources = new Set();
        this.performanceMetrics = {
            loadTimes: [],
            chunkLoadTimes: [],
            cacheHitRatio: 0,
            memoryUsage: 0
        };

        this.init();
    }

    init() {
        this.setupResourceHints();
        this.setupChunking();
        this.setupBlobOptimization();
        this.setupPrefetching();
        this.setupCriticalResourceLoading();
        this.setupPerformanceMonitoring();
        this.setupMemoryManagement();

        console.log('🚀 DAMP Performance Optimizer initialized');
    }

    // ==========================================================================
    // RESOURCE HINTS & PRELOADING
    // ==========================================================================

    setupResourceHints() {
        // Preload critical fonts
        this.preloadResource('/assets/fonts/system-ui.woff2', 'font', 'font/woff2');

        // DNS prefetch for external resources
        this.addDNSPrefetch('https://www.gstatic.com');
        this.addDNSPrefetch('https://firebaseapp.com');
        this.addDNSPrefetch('https://googleapis.com');

        // Preconnect to critical origins
        this.preconnect('https://www.gstatic.com', true);
        this.preconnect('https://js.stripe.com', true);
    }

    preloadResource(href, as, type = null, crossorigin = null) {
        if (document.querySelector(`link[href="${href}"]`)) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (type) link.type = type;
        if (crossorigin) link.crossOrigin = crossorigin;

        document.head.appendChild(link);
    }

    addDNSPrefetch(href) {
        if (document.querySelector(`link[href="${href}"][rel="dns-prefetch"]`)) return;

        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = href;
        document.head.appendChild(link);
    }

    preconnect(href, crossorigin = false) {
        if (document.querySelector(`link[href="${href}"][rel="preconnect"]`)) return;

        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        if (crossorigin) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    // ==========================================================================
    // JAVASCRIPT CHUNKING
    // ==========================================================================

    setupChunking() {
        this.chunkRegistry = {
            // Core chunks
            'core': [
                'assets/js/firebase-config.js',
                'assets/js/auth-service.js'
            ],
            // Authentication chunk
            'auth': [
                'assets/js/auth-modal.js',
                'assets/js/components/auth-forms.js'
            ],
            // Voting system chunk
            'voting': [
                'assets/js/voting-system.js',
                'assets/js/simple-voting-system.js'
            ],
            // E-commerce chunk
            'ecommerce': [
                'assets/js/store/cart.js',
                'assets/js/store/checkout.js',
                'assets/js/store/stripe-integration.js'
            ],
            // Analytics chunk
            'analytics': [
                'assets/js/analytics/google-analytics.js',
                'assets/js/analytics/performance-monitor.js'
            ]
        };
    }

    async loadChunk(chunkName) {
        if (this.chunkCache.has(chunkName)) {
            return this.chunkCache.get(chunkName);
        }

        const startTime = performance.now();

        try {
            const chunk = this.chunkRegistry[chunkName];
            if (!chunk) {
                throw new Error(`Unknown chunk: ${chunkName}`);
            }

            const promises = chunk.map(script => this.loadScript(script));
            const results = await Promise.all(promises);

            const loadTime = performance.now() - startTime;
            this.performanceMetrics.chunkLoadTimes.push({
                chunk: chunkName,
                loadTime,
                timestamp: Date.now()
            });

            this.chunkCache.set(chunkName, results);
            console.log(`✅ Chunk '${chunkName}' loaded in ${loadTime.toFixed(2)}ms`);

            return results;
        } catch (error) {
            console.error(`❌ Failed to load chunk '${chunkName}':`, error);
            throw error;
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.defer = true;

            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

            document.head.appendChild(script);
        });
    }

    // ==========================================================================
    // BLOB OPTIMIZATION
    // ==========================================================================

    setupBlobOptimization() {
        this.blobTypes = {
            image: ['image/jpeg', 'image/png', 'image/webp'],
            video: ['video/mp4', 'video/webm'],
            audio: ['audio/mp3', 'audio/webm'],
            document: ['application/pdf']
        };
    }

    async optimizeAndCacheBlob(url, type = 'image') {
        if (this.blobCache.has(url)) {
            return this.blobCache.get(url);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const optimizedBlob = await this.optimizeBlob(blob, type);

            // Create object URL for optimized blob
            const objectURL = URL.createObjectURL(optimizedBlob);

            this.blobCache.set(url, {
                blob: optimizedBlob,
                objectURL,
                size: optimizedBlob.size,
                type: optimizedBlob.type,
                cached: Date.now()
            });

            console.log(`📦 Blob cached: ${url} (${this.formatBytes(optimizedBlob.size)})`);
            return this.blobCache.get(url);
        } catch (error) {
            console.error('❌ Blob optimization failed:', error);
            throw error;
        }
    }

    async optimizeBlob(blob, type) {
        // For images, we can implement compression
        if (type === 'image' && blob.type.startsWith('image/')) {
            return this.compressImage(blob);
        }

        // For other types, return as-is for now
        return blob;
    }

    async compressImage(blob, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate optimal dimensions
                const maxWidth = 1920;
                const maxHeight = 1080;
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, blob.type, quality);
            };

            img.src = URL.createObjectURL(blob);
        });
    }

    // ==========================================================================
    // INTELLIGENT PREFETCHING
    // ==========================================================================

    setupPrefetching() {
        this.setupHoverPrefetch();
        this.setupViewportPrefetch();
        this.setupPredictivePrefetch();
    }

    setupHoverPrefetch() {
        // Prefetch resources when user hovers over links
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[href]');
            if (link && !this.prefetchQueue.has(link.href)) {
                this.prefetchResource(link.href);
            }
        });
    }

    setupViewportPrefetch() {
        // Prefetch resources for elements entering viewport
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const prefetchUrl = element.dataset.prefetch;
                        if (prefetchUrl) {
                            this.prefetchResource(prefetchUrl);
                        }
                    }
                });
            }, { rootMargin: '100px' });

            // Observe elements with data-prefetch attribute
            document.querySelectorAll('[data-prefetch]').forEach(el => {
                observer.observe(el);
            });
        }
    }

    setupPredictivePrefetch() {
        // Prefetch based on user behavior patterns
        this.userBehavior = {
            visitedPages: new Set(),
            clickPatterns: [],
            timeOnPage: 0
        };

        // Track page visits
        this.userBehavior.visitedPages.add(window.location.pathname);

        // Predict next likely pages and prefetch
        setTimeout(() => {
            this.predictAndPrefetch();
        }, 2000);
    }

    predictAndPrefetch() {
        const currentPath = window.location.pathname;
        const predictions = this.getPredictedPages(currentPath);

        predictions.forEach(url => {
            if (!this.prefetchQueue.has(url)) {
                this.prefetchResource(url);
            }
        });
    }

    getPredictedPages(currentPath) {
        const predictions = [];

        // Common navigation patterns
        if (currentPath.includes('index.html') || currentPath === '/') {
            predictions.push('/pages/how-it-works.html', '/pages/products.html', '/pages/pre-order.html');
        } else if (currentPath.includes('products')) {
            predictions.push('/pages/pre-order.html', '/pages/cart.html');
        } else if (currentPath.includes('product-voting')) {
            predictions.push('/pages/profile.html', '/pages/pre-order.html');
        }

        return predictions;
    }

    prefetchResource(url) {
        if (this.prefetchQueue.has(url)) return;

        this.prefetchQueue.add(url);

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.onload = () => {
            console.log(`🔮 Prefetched: ${url}`);
        };
        link.onerror = () => {
            console.warn(`⚠️ Prefetch failed: ${url}`);
        };

        document.head.appendChild(link);
    }

    // ==========================================================================
    // CRITICAL RESOURCE LOADING
    // ==========================================================================

    setupCriticalResourceLoading() {
        // Define critical resources that should load first
        this.criticalResources = new Set([
            'assets/css/main.css',
            'assets/css/navigation.css',
            'assets/js/components/header.js',
            'assets/js/firebase-config.js'
        ]);

        // Load critical resources with high priority
        this.loadCriticalResources();
    }

    async loadCriticalResources() {
        const promises = Array.from(this.criticalResources).map(resource => {
            if (resource.endsWith('.css')) {
                return this.loadCriticalCSS(resource);
            } else if (resource.endsWith('.js')) {
                return this.loadScript(resource);
            }
        });

        try {
            await Promise.all(promises);
            console.log('✅ Critical resources loaded');

            // Signal that critical resources are ready
            document.dispatchEvent(new CustomEvent('critical-resources-loaded'));
        } catch (error) {
            console.error('❌ Critical resource loading failed:', error);
        }
    }

    loadCriticalCSS(href) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`link[href="${href}"]`)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;

            document.head.appendChild(link);
        });
    }

    // ==========================================================================
    // PERFORMANCE MONITORING
    // ==========================================================================

    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        this.monitorWebVitals();

        // Monitor memory usage
        this.monitorMemoryUsage();

        // Monitor cache performance
        this.monitorCachePerformance();

        // Report performance metrics
        setInterval(() => {
            this.reportPerformanceMetrics();
        }, 30000); // Every 30 seconds
    }

    monitorWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('📊 LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('📊 FID:', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        new PerformanceObserver((entryList) => {
            let clsValue = 0;
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('📊 CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.performanceMetrics.memoryUsage = {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
            }, 10000); // Every 10 seconds
        }
    }

    monitorCachePerformance() {
        const totalRequests = this.chunkCache.size + this.blobCache.size + this.prefetchQueue.size;
        const cacheHits = this.chunkCache.size + this.blobCache.size;

        this.performanceMetrics.cacheHitRatio = totalRequests > 0 ? cacheHits / totalRequests : 0;
    }

    reportPerformanceMetrics() {
        const metrics = {
            ...this.performanceMetrics,
            cacheStats: {
                chunkCache: this.chunkCache.size,
                blobCache: this.blobCache.size,
                prefetchQueue: this.prefetchQueue.size
            },
            timestamp: Date.now()
        };

        console.log('📈 Performance Metrics:', metrics);

        // Send to analytics if available
        if (window.gtag) {
            window.gtag('event', 'performance_metrics', {
                custom_parameter: JSON.stringify(metrics)
            });
        }
    }

    // ==========================================================================
    // MEMORY MANAGEMENT
    // ==========================================================================

    setupMemoryManagement() {
        // Clean up caches periodically
        setInterval(() => {
            this.cleanupCaches();
        }, 300000); // Every 5 minutes

        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    cleanupCaches() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes

        // Clean up blob cache
        for (const [url, data] of this.blobCache.entries()) {
            if (now - data.cached > maxAge) {
                URL.revokeObjectURL(data.objectURL);
                this.blobCache.delete(url);
            }
        }

        // Clean up chunk cache (keep more recent)
        if (this.chunkCache.size > 10) {
            const entries = Array.from(this.chunkCache.entries());
            const toDelete = entries.slice(0, entries.length - 10);
            toDelete.forEach(([key]) => {
                this.chunkCache.delete(key);
            });
        }

        console.log('🧹 Cache cleanup completed');
    }

    cleanup() {
        // Revoke all blob URLs
        for (const [, data] of this.blobCache.entries()) {
            URL.revokeObjectURL(data.objectURL);
        }

        // Clear caches
        this.chunkCache.clear();
        this.blobCache.clear();
        this.prefetchQueue.clear();

        console.log('🧹 Performance optimizer cleanup completed');
    }

    // ==========================================================================
    // UTILITIES
    // ==========================================================================

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // ==========================================================================
    // PUBLIC API
    // ==========================================================================

    // Load chunk on demand
    async loadChunkOnDemand(chunkName) {
        return this.loadChunk(chunkName);
    }

    // Optimize and cache image
    async cacheImage(url) {
        return this.optimizeAndCacheBlob(url, 'image');
    }

    // Get performance metrics
    getMetrics() {
        return { ...this.performanceMetrics };
    }

    // Force cache cleanup
    forceCacheCleanup() {
        this.cleanupCaches();
    }
}

// Initialize performance optimizer
window.addEventListener('DOMContentLoaded', () => {
    window.dampPerformance = new DAMPPerformanceOptimizer();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPPerformanceOptimizer;
}
