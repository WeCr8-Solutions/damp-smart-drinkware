// DAMP Performance Monitor - Google Engineering Best Practices
// Monitors Core Web Vitals, performance metrics, and user experience

// Ensure compatibility with Node.js environment
if (typeof window === 'undefined') {
    // Use globalThis for cross-environment compatibility
    const g = typeof global !== 'undefined' ? global : globalThis;
    g.window = {};
    g.document = {};
    g.navigator = {};
    g.performance = {};
    g.console = typeof console !== 'undefined' ? console : { log: () => {}, warn: () => {}, error: () => {} };
    g.sessionStorage = {
        getItem: () => null,
        setItem: () => {}
    };
    g.localStorage = {
        getItem: () => null,
        setItem: () => {}
    };
}

class DAMPPerformanceMonitor {
    constructor(options = {}) {
        // Only run in browser
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            throw new Error('DAMPPerformanceMonitor must be run in a browser environment.');
        }

        this.options = {
            enableAnalytics: true,
            enableConsoleLogging: true,
            enableBeaconAPI: true,
            sampleRate: 1.0,
            endpoint: '/api/analytics/performance',
            debug: window.location.hostname === 'localhost' && !window.navigator.userAgent.includes('Playwright'),
            ...options
        };

        this.metrics = {
            // Core Web Vitals
            LCP: null,
            FID: null,
            CLS: null,

            // Other Performance Metrics
            FCP: null,
            TTFB: null,
            TTI: null,

            // Custom Metrics
            navigationStart: null,
            loadComplete: null,

            // Resource Timing
            resources: [],

            // User Experience
            visibilityChanges: 0,
            scrollDepth: 0,
            timeOnPage: 0,

            // Device Info
            deviceType: null,
            connectionType: null,

            // Errors
            jsErrors: [],

            timestamp: Date.now()
        };

        this.observers = [];
        this.startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        this.isHidden = typeof document !== 'undefined' ? document.hidden : false;
        this.pageLoadTime = null;

        this.init();
    }

    init() {
        this.detectDevice();
        this.detectConnection();
        this.setupCoreWebVitals();
        this.setupNavigationTiming();
        this.setupResourceTiming();
        this.setupUserExperience();
        this.setupErrorTracking();
        this.setupVisibilityAPI();
        this.setupBeforeUnload();

        if (this.options.debug) {
            this.setupDebugMode();
        }
    }

    // Core Web Vitals Monitoring
    setupCoreWebVitals() {
        if (typeof window === 'undefined' || typeof window.PerformanceObserver === 'undefined') {
            if (typeof console !== 'undefined') {
                console.warn('PerformanceObserver not supported');
            }
            return;
        }

        try {
            // Largest Contentful Paint (LCP)
            const lcpObserver = new window.PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (!lastEntry) return;

                this.metrics.LCP = {
                    value: lastEntry.startTime,
                    element: lastEntry.element,
                    url: lastEntry.url,
                    timestamp: Date.now()
                };

                this.trackWebVital('LCP', lastEntry.startTime);
            });

            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(lcpObserver);

            // First Input Delay (FID)
            const fidObserver = new window.PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.FID = {
                        value: entry.processingStart - entry.startTime,
                        startTime: entry.startTime,
                        processingStart: entry.processingStart,
                        timestamp: Date.now()
                    };

                    this.trackWebVital('FID', entry.processingStart - entry.startTime);
                });
            });

            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.push(fidObserver);

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            let clsEntries = [];

            const clsObserver = new window.PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push(entry);
                    }
                });

                this.metrics.CLS = {
                    value: clsValue,
                    entries: clsEntries,
                    timestamp: Date.now()
                };

                this.trackWebVital('CLS', clsValue);
            });

            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(clsObserver);

            // First Contentful Paint (FCP)
            const fcpObserver = new window.PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.FCP = {
                            value: entry.startTime,
                            timestamp: Date.now()
                        };

                        this.trackWebVital('FCP', entry.startTime);
                    }
                });
            });

            fcpObserver.observe({ entryTypes: ['paint'] });
            this.observers.push(fcpObserver);

        } catch (error) {
            if (typeof console !== 'undefined') {
                console.error('Failed to setup Core Web Vitals monitoring:', error);
            }
        }
    }

    // Navigation Timing
    setupNavigationTiming() {
        if (typeof window === 'undefined' || typeof window.performance === 'undefined' || !window.performance.getEntriesByType) {
            return;
        }

        window.addEventListener('load', () => {
            window.setTimeout(() => {
                const navEntries = window.performance.getEntriesByType('navigation');
                if (!navEntries || navEntries.length === 0) return;
                const nav = navEntries[0];

                this.metrics.navigationStart = nav.startTime;
                this.metrics.loadComplete = nav.loadEventEnd;
                this.pageLoadTime = nav.loadEventEnd - nav.startTime;

                // Calculate TTFB
                this.metrics.TTFB = {
                    value: nav.responseStart - nav.startTime,
                    timestamp: Date.now()
                };

                // Track navigation type
                this.metrics.navigationType = nav.type || 'navigate';

                // Calculate additional metrics
                this.metrics.domContentLoaded = nav.domContentLoadedEventEnd - nav.startTime;
                this.metrics.domInteractive = nav.domInteractive - nav.startTime;
                this.metrics.domComplete = nav.domComplete - nav.startTime;

                this.trackMetric('PageLoad', this.pageLoadTime);
                this.trackMetric('TTFB', this.metrics.TTFB.value);

            }, 0);
        });
    }

    // Resource Timing
    setupResourceTiming() {
        if (typeof window === 'undefined' || typeof window.performance === 'undefined' || typeof window.PerformanceObserver === 'undefined' || !window.performance.getEntriesByType) {
            return;
        }

        const resourceObserver = new window.PerformanceObserver((list) => {
            const entries = list.getEntries();

            entries.forEach(entry => {
                const resourceData = {
                    name: entry.name,
                    type: entry.initiatorType,
                    startTime: entry.startTime,
                    duration: entry.duration,
                    size: entry.transferSize,
                    cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
                    timestamp: Date.now()
                };

                this.metrics.resources.push(resourceData);

                // Track slow resources
                if (entry.duration > 1000) {
                    this.trackMetric('SlowResource', entry.duration, {
                        resource: entry.name,
                        type: entry.initiatorType
                    });
                }

                // Track large resources
                if (entry.transferSize > 500000) { // 500KB
                    this.trackMetric('LargeResource', entry.transferSize, {
                        resource: entry.name,
                        type: entry.initiatorType
                    });
                }
            });
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
    }

    // User Experience Monitoring
    setupUserExperience() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        let scrollDepth = 0;
        let maxScrollDepth = 0;

        // Scroll depth tracking
        const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            scrollDepth = Math.round((scrollTop / documentHeight) * 100);

            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.metrics.scrollDepth = maxScrollDepth;

                // Track milestone scroll depths
                if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
                    this.trackMetric('ScrollDepth', 25);
                } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
                    this.trackMetric('ScrollDepth', 50);
                } else if (maxScrollDepth >= 75 && maxScrollDepth < 100) {
                    this.trackMetric('ScrollDepth', 75);
                } else if (maxScrollDepth >= 100) {
                    this.trackMetric('ScrollDepth', 100);
                }
            }
        };

        // Throttled scroll event
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.clearTimeout(scrollTimeout);
            }
            scrollTimeout = window.setTimeout(trackScrollDepth, 100);
        });

        // Click tracking
        document.addEventListener('click', (event) => {
            const target = event.target;
            const tagName = target.tagName?.toLowerCase();

            if (['a', 'button', 'input'].includes(tagName)) {
                this.trackMetric('Click', 1, {
                    element: tagName,
                    text: target.textContent?.substring(0, 100),
                    href: target.href,
                    id: target.id,
                    className: target.className
                });
            }
        });

        // Form interactions
        document.addEventListener('submit', (event) => {
            this.trackMetric('FormSubmit', 1, {
                form: event.target.id || event.target.className,
                action: event.target.action
            });
        });

        // Time on page tracking
        window.setInterval(() => {
            if (!this.isHidden && typeof window.performance !== 'undefined' && window.performance.now) {
                this.metrics.timeOnPage = Math.round((window.performance.now() - this.startTime) / 1000);
            }
        }, 1000);
    }

    // Error Tracking
    setupErrorTracking() {
        if (typeof window === 'undefined') return;
        // JavaScript errors
        window.addEventListener('error', (event) => {
            const error = {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            };

            this.metrics.jsErrors.push(error);
            this.trackMetric('JSError', 1, error);
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            const error = {
                reason: event.reason,
                promise: event.promise,
                timestamp: Date.now()
            };

            this.metrics.jsErrors.push(error);
            this.trackMetric('UnhandledRejection', 1, error);
        });
    }

    // Visibility API
    setupVisibilityAPI() {
        if (typeof document === 'undefined') return;
        document.addEventListener('visibilitychange', () => {
            this.isHidden = document.hidden;

            if (document.hidden) {
                this.metrics.visibilityChanges++;
                this.trackMetric('PageHidden', 1);
            } else {
                this.trackMetric('PageVisible', 1);
            }
        });
    }

    // Before Unload - Send final metrics
    setupBeforeUnload() {
        if (typeof window === 'undefined') return;
        window.addEventListener('beforeunload', () => {
            this.sendMetrics(true);
        });

        // Send metrics periodically
        window.setInterval(() => {
            this.sendMetrics();
        }, 30000); // Every 30 seconds
    }

    // Device Detection
    detectDevice() {
        if (typeof navigator === 'undefined') return;
        const userAgent = navigator.userAgent || '';
        let deviceType = 'desktop';

        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            deviceType = 'mobile';
        } else if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
            deviceType = 'tablet';
        }

        this.metrics.deviceType = deviceType;
        this.metrics.userAgent = userAgent;
        this.metrics.screen = {
            width: typeof window !== 'undefined' && typeof window.screen !== 'undefined' ? window.screen.width : null,
            height: typeof window !== 'undefined' && typeof window.screen !== 'undefined' ? window.screen.height : null,
            pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
        };
    }

    // Connection Detection
    detectConnection() {
        if (typeof navigator === 'undefined') return;
        const connection = navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection;
        if (connection) {
            this.metrics.connectionType = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
    }

    // Navigation Type Helper
    getNavigationType(type) {
        // Use string type from Navigation Timing Level 2
        if (typeof type === 'string') return type;
        switch (type) {
            case 0: return 'navigate';
            case 1: return 'reload';
            case 2: return 'back_forward';
            default: return 'unknown';
        }
    }

    // Track Web Vital
    trackWebVital(name, value) {
        const rating = this.getWebVitalRating(name, value);

        if (this.options.enableConsoleLogging && typeof console !== 'undefined') {
            console.log(`${name}: ${Math.round(value)}ms (${rating})`);
        }

        this.trackMetric(name, value, { rating });
    }

    // Get Web Vital Rating
    getWebVitalRating(name, value) {
        const thresholds = {
            LCP: [2500, 4000],
            FID: [100, 300],
            CLS: [0.1, 0.25],
            FCP: [1800, 3000],
            TTFB: [800, 1800]
        };

        const [good, needsImprovement] = thresholds[name] || [0, 0];

        if (value <= good) return 'good';
        if (value <= needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    // Track Generic Metric
    trackMetric(name, value, data = {}) {
        const metric = {
            name,
            value,
            data,
            timestamp: Date.now(),
            url: typeof window !== 'undefined' ? window.location.href : '',
            ...this.getSessionInfo()
        };

        // Send to analytics
        if (this.options.enableAnalytics && Math.random() <= this.options.sampleRate) {
            this.sendToAnalytics(metric);
        }

        // Console logging
        if (this.options.enableConsoleLogging && typeof console !== 'undefined') {
            console.log(`Metric: ${name}`, value, data);
        }
    }

    // Session Information
    getSessionInfo() {
        return {
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            timestamp: Date.now(),
            url: typeof window !== 'undefined' ? window.location.href : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            deviceType: this.metrics.deviceType,
            connectionType: this.metrics.connectionType
        };
    }

    // Get or create session ID
    getSessionId() {
        if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return '';
        let sessionId = window.sessionStorage.getItem('damp-session-id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            window.sessionStorage.setItem('damp-session-id', sessionId);
        }
        return sessionId;
    }

    // Get or create user ID
    getUserId() {
        if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return '';
        let userId = window.localStorage.getItem('damp-user-id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            window.localStorage.setItem('damp-user-id', userId);
        }
        return userId;
    }

    // Send to Analytics
    sendToAnalytics(metric) {
        if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
            window.gtag('event', metric.name, {
                event_category: 'Performance',
                event_label: metric.name,
                value: Math.round(metric.value),
                custom_map: {
                    metric_data: JSON.stringify(metric.data)
                }
            });
        }
    }

    // Send Metrics to Server
    sendMetrics(isBeforeUnload = false) {
        // Skip sending metrics if no backend endpoint is configured
        if (!this.options.endpoint || this.options.endpoint === '/api/analytics/performance') {
            if (this.options.debug && typeof console !== 'undefined') {
                console.log('📊 Performance metrics collected (backend endpoint not configured):', this.metrics);
            }
            return;
        }

        const metricsData = {
            ...this.metrics,
            sessionInfo: this.getSessionInfo(),
            isBeforeUnload
        };

        if (this.options.enableBeaconAPI && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            navigator.sendBeacon(
                this.options.endpoint,
                JSON.stringify(metricsData)
            );
        } else {
            // Fallback to fetch
            if (!isBeforeUnload && typeof window !== 'undefined' && typeof window.fetch !== 'undefined') {
                window.fetch(this.options.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(metricsData)
                }).catch(error => {
                    if (typeof console !== 'undefined') {
                        console.error('Failed to send metrics:', error);
                    }
                });
            }
        }
    }

    // Debug Mode
    setupDebugMode() {
        if (typeof document === 'undefined' || typeof window === 'undefined') return;
        // Add debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'damp-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            border-radius: 5px;
            max-height: 400px;
            overflow-y: auto;
        `;

        document.body.appendChild(debugPanel);

        // Update debug panel
        const updateDebugPanel = () => {
            const html = `
                <strong>Performance Metrics</strong><br>
                LCP: ${this.metrics.LCP?.value ? Math.round(this.metrics.LCP.value) + 'ms' : 'N/A'}<br>
                FID: ${this.metrics.FID?.value ? Math.round(this.metrics.FID.value) + 'ms' : 'N/A'}<br>
                CLS: ${this.metrics.CLS?.value ? this.metrics.CLS.value.toFixed(3) : 'N/A'}<br>
                FCP: ${this.metrics.FCP?.value ? Math.round(this.metrics.FCP.value) + 'ms' : 'N/A'}<br>
                TTFB: ${this.metrics.TTFB?.value ? Math.round(this.metrics.TTFB.value) + 'ms' : 'N/A'}<br>
                <br>
                <strong>User Experience</strong><br>
                Scroll Depth: ${this.metrics.scrollDepth}%<br>
                Time on Page: ${this.metrics.timeOnPage}s<br>
                Visibility Changes: ${this.metrics.visibilityChanges}<br>
                JS Errors: ${this.metrics.jsErrors.length}<br>
                <br>
                <strong>Resources</strong><br>
                Loaded: ${this.metrics.resources.length}<br>
                <br>
                <strong>Device</strong><br>
                Type: ${this.metrics.deviceType}<br>
                Connection: ${this.metrics.connectionType?.effectiveType || 'N/A'}<br>
            `;

            debugPanel.innerHTML = html;
        };

        window.setInterval(updateDebugPanel, 1000);

        // Add global debug functions
        (window).dampPerformance = {
            getMetrics: () => this.metrics,
            sendMetrics: () => this.sendMetrics(),
            clearMetrics: () => this.clearMetrics()
        };
    }

    // Clear Metrics
    clearMetrics() {
        this.metrics = {
            LCP: null,
            FID: null,
            CLS: null,
            FCP: null,
            TTFB: null,
            TTI: null,
            navigationStart: null,
            loadComplete: null,
            resources: [],
            visibilityChanges: 0,
            scrollDepth: 0,
            timeOnPage: 0,
            deviceType: null,
            connectionType: null,
            jsErrors: [],
            timestamp: Date.now()
        };
    }

    // Get Performance Report
    getPerformanceReport() {
        return {
            coreWebVitals: {
                LCP: this.metrics.LCP,
                FID: this.metrics.FID,
                CLS: this.metrics.CLS
            },
            otherMetrics: {
                FCP: this.metrics.FCP,
                TTFB: this.metrics.TTFB,
                pageLoadTime: this.pageLoadTime
            },
            userExperience: {
                scrollDepth: this.metrics.scrollDepth,
                timeOnPage: this.metrics.timeOnPage,
                visibilityChanges: this.metrics.visibilityChanges
            },
            resources: this.metrics.resources,
            errors: this.metrics.jsErrors,
            device: {
                type: this.metrics.deviceType,
                connection: this.metrics.connectionType,
                screen: this.metrics.screen
            }
        };
    }

    // Cleanup
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.sendMetrics(true);

        if (this.options.debug) {
            const debugPanel = document.getElementById('damp-debug-panel');
            if (debugPanel) {
                debugPanel.remove();
            }
        }
    }
}

// Export the class for external use
export default DAMPPerformanceMonitor;

// Attach to window only in debug mode
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    if (!window.DAMPPerformanceMonitor) {
        window.DAMPPerformanceMonitor = DAMPPerformanceMonitor;
    }
}

// Auto-initialize performance monitoring
let dampPerformanceMonitor;

function initPerformanceMonitoring(options = {}) {
    if (typeof window !== 'undefined' && !window.dampPerformanceMonitor) {
        dampPerformanceMonitor = new DAMPPerformanceMonitor(options);
        window.dampPerformanceMonitor = dampPerformanceMonitor;
    }
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
    } else {
        initPerformanceMonitoring();
    }
}

// Export for modules
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DAMPPerformanceMonitor;
}

if (typeof console !== 'undefined') {
    console.log('DAMP Performance Monitor initialized');
}