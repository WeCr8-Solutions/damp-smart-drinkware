/**
 * DAMP Master AdSense Controller
 * Orchestrates all AdSense functionality across the entire website
 * Performance-optimized with lazy loading and error handling
 */

(function() {
    'use strict';

    // Configuration
    const ADSENSE_CONFIG = {
        clientId: 'ca-pub-3639153716376265',
        enabled: true,
        performance: {
            lazyLoadDelay: 1000,
            intersectionThreshold: 0.1,
            maxRetries: 3
        },
        debug: window.location.hostname === 'localhost'
    };

    // Global state
    let isInitialized = false;
    let loadAttempts = 0;
    let adUnitsLoaded = 0;

    /**
     * Detect page type for targeted ad loading
     */
    function detectPageType() {
        const path = window.location.pathname.toLowerCase();
        const title = document.title.toLowerCase();

        if (path === '/' || path === '/index.html') return 'homepage';
        if (path.includes('-v1.0.html') || title.includes('damp')) return 'product';
        if (path.includes('/cart') || path.includes('/checkout') ||
            path.includes('/success') || path.includes('/waitlist')) return 'ecommerce';
        if (path.includes('/pages/')) return 'content';

        return 'general';
    }

    /**
     * Load appropriate AdSense modules based on page type
     */
    async function loadPageSpecificModules() {
        const pageType = detectPageType();
        const promises = [];

        // Always load core manager
        promises.push(loadScript('../assets/js/adsense-manager.js'));

        // Load page-specific modules
        switch (pageType) {
            case 'product':
                promises.push(loadScript('../assets/js/universal-product-adsense.js'));
                break;
            case 'content':
                promises.push(loadScript('../assets/js/content-page-adsense.js'));
                break;
            case 'ecommerce':
                promises.push(loadScript('../assets/js/ecommerce-adsense.js'));
                break;
            case 'homepage':
                // Homepage ads are handled directly in index.html
                break;
        }

        try {
            await Promise.all(promises);
            console.log(`✅ AdSense modules loaded for ${pageType} page`);
            return true;
        } catch (error) {
            console.error('❌ Failed to load AdSense modules:', error);
            return false;
        }
    }

    /**
     * Load script with error handling and caching
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;

            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));

            document.head.appendChild(script);
        });
    }

    /**
     * Performance monitoring for ads
     */
    function trackAdPerformance(eventType, data = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventType, {
                event_category: 'AdSense_Performance',
                ...data,
                page_type: detectPageType(),
                ad_units_loaded: adUnitsLoaded,
                timestamp: Date.now()
            });
        }

        if (ADSENSE_CONFIG.debug) {
            console.log(`📊 AdSense Performance: ${eventType}`, data);
        }
    }

    /**
     * Error handling and fallback
     */
    function handleAdError(error, context = 'general') {
        console.error(`❌ AdSense Error (${context}):`, error);

        trackAdPerformance('ad_error', {
            error_message: error.message,
            context: context,
            attempt: loadAttempts
        });

        // Retry logic for critical failures
        if (loadAttempts < ADSENSE_CONFIG.performance.maxRetries) {
            loadAttempts++;
            setTimeout(() => {
                console.log(`🔄 Retrying AdSense initialization (attempt ${loadAttempts})`);
                initializeMasterAdSense();
            }, 2000 * loadAttempts);
        }
    }

    /**
     * Intersection Observer for lazy loading ads
     */
    function setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            console.warn('⚠️ IntersectionObserver not supported, ads will load immediately');
            return null;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adContainer = entry.target;
                    const adUnit = adContainer.querySelector('.adsbygoogle');

                    if (adUnit && !adUnit.dataset.loaded) {
                        try {
                            (window.adsbygoogle = window.adsbygoogle || []).push({});
                            adUnit.dataset.loaded = 'true';
                            adUnitsLoaded++;

                            trackAdPerformance('ad_loaded', {
                                ad_id: adContainer.id || 'unknown',
                                load_time: Date.now()
                            });

                            observer.unobserve(adContainer);
                        } catch (error) {
                            handleAdError(error, 'lazy_loading');
                        }
                    }
                }
            });
        }, {
            threshold: ADSENSE_CONFIG.performance.intersectionThreshold,
            rootMargin: '50px'
        });

        return observer;
    }

    /**
     * Content Security Policy compliance check
     */
    function checkCSPCompliance() {
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (cspMeta && cspMeta.content) {
            const cspContent = cspMeta.content.toLowerCase();
            if (!cspContent.includes('pagead2.googlesyndication.com')) {
                console.warn('⚠️ CSP may block AdSense. Add googlesyndication.com to script-src');
                return false;
            }
        }
        return true;
    }

    /**
     * Ad blocker detection
     */
    function detectAdBlocker() {
        return new Promise((resolve) => {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            testAd.style.cssText = 'position:absolute;left:-10000px;';

            document.body.appendChild(testAd);

            setTimeout(() => {
                const blocked = testAd.offsetHeight === 0;
                document.body.removeChild(testAd);

                if (blocked) {
                    console.log('🚫 Ad blocker detected');
                    trackAdPerformance('ad_blocker_detected');
                }

                resolve(!blocked);
            }, 100);
        });
    }

    /**
     * Initialize master AdSense system
     */
    async function initializeMasterAdSense() {
        if (isInitialized) return;
        loadAttempts++;

        try {
            console.log('🚀 DAMP Master AdSense initializing...');

            // Performance and compatibility checks
            const [cspOk, adBlockerOk] = await Promise.all([
                Promise.resolve(checkCSPCompliance()),
                detectAdBlocker()
            ]);

            if (!cspOk) {
                console.warn('⚠️ CSP issues detected, ads may not load properly');
            }

            if (!adBlockerOk) {
                console.log('ℹ️ Ad blocker detected, limited functionality');
                trackAdPerformance('initialization_blocked');
                return;
            }

            // Load page-specific modules
            const modulesLoaded = await loadPageSpecificModules();
            if (!modulesLoaded) {
                throw new Error('Failed to load required modules');
            }

            // Setup performance monitoring
            setupLazyLoading();

            // Track successful initialization
            trackAdPerformance('initialization_success', {
                page_type: detectPageType(),
                load_time: Date.now() - window.performance.navigationStart
            });

            isInitialized = true;
            console.log('✅ DAMP Master AdSense initialized successfully');

        } catch (error) {
            handleAdError(error, 'initialization');
        }
    }

    /**
     * Public API
     */
    window.DAMPAdSense = {
        init: initializeMasterAdSense,
        isInitialized: () => isInitialized,
        getStats: () => ({
            adUnitsLoaded,
            loadAttempts,
            pageType: detectPageType()
        }),
        trackEvent: trackAdPerformance
    };

    // Auto-initialize based on page load state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeMasterAdSense, ADSENSE_CONFIG.performance.lazyLoadDelay);
        });
    } else {
        setTimeout(initializeMasterAdSense, ADSENSE_CONFIG.performance.lazyLoadDelay);
    }

    // Graceful cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (isInitialized) {
            trackAdPerformance('session_end', {
                total_ads_loaded: adUnitsLoaded,
                session_duration: Date.now() - window.performance.navigationStart
            });
        }
    });

})();