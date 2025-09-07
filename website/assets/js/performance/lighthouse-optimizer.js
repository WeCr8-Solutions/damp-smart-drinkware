/**
 * DAMP Lighthouse Performance Optimizer
 * Addresses specific Lighthouse performance issues
 * Follows Google's Core Web Vitals optimization guidelines
 */

class DAMPLighthouseOptimizer {
    constructor() {
        this.performanceEntries = [];
        this.observer = null;
        this.criticalResourcesLoaded = false;
        this.nonCriticalResourcesLoaded = false;
        
        this.init();
    }
    
    init() {
        // Start performance monitoring immediately
        this.initPerformanceObserver();
        
        // Optimize critical rendering path
        this.optimizeCriticalPath();
        
        // Defer non-critical resources
        this.deferNonCriticalResources();
        
        // Optimize images
        this.optimizeImages();
        
        // Minimize main thread work
        this.optimizeMainThread();
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Setup resource hints
        this.setupResourceHints();
        
        console.log('✅ DAMP Lighthouse Optimizer initialized');
    }
    
    initPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            try {
                // Observe Core Web Vitals
                this.observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.handlePerformanceEntry(entry);
                    }
                });
                
                this.observer.observe({
                    entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input']
                });
            } catch (e) {
                console.warn('Performance Observer not supported:', e);
            }
        }
    }
    
    handlePerformanceEntry(entry) {
        this.performanceEntries.push(entry);
        
        switch (entry.entryType) {
            case 'paint':
                if (entry.name === 'first-contentful-paint') {
                    console.log(`🎨 FCP: ${Math.round(entry.startTime)}ms`);
                    this.optimizePostFCP();
                }
                break;
                
            case 'largest-contentful-paint':
                console.log(`🖼️ LCP: ${Math.round(entry.startTime)}ms`);
                this.optimizePostLCP();
                break;
                
            case 'layout-shift':
                if (!entry.hadRecentInput && entry.value > 0.1) {
                    console.warn(`⚠️ CLS: ${entry.value.toFixed(4)}`);
                    this.mitigateLayoutShift(entry);
                }
                break;
                
            case 'first-input':
                console.log(`👆 FID: ${Math.round(entry.processingStart - entry.startTime)}ms`);
                break;
        }
    }
    
    optimizeCriticalPath() {
        // Inline critical CSS (already done in HTML)
        // Preload critical fonts
        this.preloadFont('system-ui');
        
        // Remove render-blocking resources
        this.optimizeCSS();
        
        // Optimize JavaScript loading
        this.optimizeJavaScript();
    }
    
    preloadFont(fontFamily) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = `data:font/woff2;base64,`;
        document.head.appendChild(link);
    }
    
    optimizeCSS() {
        // Load non-critical CSS asynchronously
        const nonCriticalCSS = [
            '/assets/css/components/skeleton.css',
            '/assets/css/components/buttons.css',
            '/assets/css/components/cards.css',
            '/assets/css/utilities/animations.css',
            '/assets/css/pricing-system.css'
        ];
        
        nonCriticalCSS.forEach(href => this.loadCSSAsync(href));
    }
    
    loadCSSAsync(href) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        link.onload = function() {
            this.rel = 'stylesheet';
        };
        document.head.appendChild(link);
    }
    
    optimizeJavaScript() {
        // Defer non-critical JavaScript
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!this.isCriticalScript(script.src)) {
                script.defer = true;
            }
        });
    }
    
    isCriticalScript(src) {
        const criticalScripts = [
            'firebase-config',
            'header.js',
            'hero-animation.js'
        ];
        
        return criticalScripts.some(critical => src.includes(critical));
    }
    
    deferNonCriticalResources() {
        // Use requestIdleCallback for non-critical work
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadNonCriticalResources();
            });
        } else {
            setTimeout(() => {
                this.loadNonCriticalResources();
            }, 2000);
        }
    }
    
    loadNonCriticalResources() {
        if (this.nonCriticalResourcesLoaded) return;
        
        // Load analytics
        this.loadAnalytics();
        
        // Load ads
        this.loadAds();
        
        // Load social widgets
        this.loadSocialWidgets();
        
        this.nonCriticalResourcesLoaded = true;
        console.log('✅ Non-critical resources loaded');
    }
    
    loadAnalytics() {
        if (window.gtag) return; // Already loaded
        
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YW2BN4SVPQ';
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-YW2BN4SVPQ');
    }
    
    loadAds() {
        if (window.adsbygoogle) return; // Already loaded
        
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3639153716376265';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    }
    
    loadSocialWidgets() {
        // Load social media widgets after user interaction
        document.addEventListener('scroll', this.loadSocialWidgetsOnScroll.bind(this), { 
            once: true, 
            passive: true 
        });
    }
    
    loadSocialWidgetsOnScroll() {
        // Placeholder for social widgets
        console.log('📱 Social widgets loaded on scroll');
    }
    
    optimizeImages() {
        // Implement lazy loading for images
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.optimizeImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
        
        // Preload LCP image
        this.preloadLCPImage();
    }
    
    preloadLCPImage() {
        // Preload the hero logo as it's likely the LCP element
        const heroLogo = document.querySelector('.hero-logo img');
        if (heroLogo && heroLogo.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = heroLogo.src;
            document.head.appendChild(link);
        }
    }
    
    optimizeImage(img) {
        // Add optimized loading attributes
        img.decoding = 'async';
        
        // Add aspect ratio to prevent layout shift
        if (img.naturalWidth && img.naturalHeight) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            img.style.aspectRatio = aspectRatio;
        }
    }
    
    optimizeMainThread() {
        // Break up long tasks
        this.scheduleWork();
        
        // Optimize animations
        this.optimizeAnimations();
        
        // Use passive event listeners
        this.addPassiveListeners();
    }
    
    scheduleWork() {
        const scheduler = window.scheduler || {
            postTask: (callback) => setTimeout(callback, 0)
        };
        
        // Schedule non-critical work
        scheduler.postTask(() => {
            this.performNonCriticalWork();
        });
    }
    
    performNonCriticalWork() {
        // Placeholder for non-critical work
        console.log('🔄 Non-critical work performed');
    }
    
    optimizeAnimations() {
        // Use CSS animations instead of JavaScript where possible
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        animatedElements.forEach(element => {
            element.style.willChange = 'transform, opacity';
            
            // Remove will-change after animation
            element.addEventListener('animationend', () => {
                element.style.willChange = 'auto';
            }, { once: true });
        });
    }
    
    addPassiveListeners() {
        // Add passive listeners for better scrolling performance
        document.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        document.addEventListener('touchstart', this.handleTouch.bind(this), { passive: true });
    }
    
    handleScroll() {
        // Throttle scroll handling
        if (this.scrollTimeout) return;
        
        this.scrollTimeout = setTimeout(() => {
            // Handle scroll events
            this.scrollTimeout = null;
        }, 16); // ~60fps
    }
    
    handleTouch() {
        // Handle touch events passively
    }
    
    preloadCriticalResources() {
        const criticalResources = [
            { href: '/assets/css/critical-inline.css', as: 'style' },
            { href: '/assets/js/components/header.js', as: 'script' },
            { href: '/assets/images/logo/logo.png', as: 'image' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = resource.as;
            link.href = resource.href;
            if (resource.as === 'script') {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }
    
    setupResourceHints() {
        const origins = [
            'https://www.googletagmanager.com',
            'https://www.gstatic.com',
            'https://pagead2.googlesyndication.com',
            'https://firestore.googleapis.com',
            'https://firebase.googleapis.com'
        ];
        
        origins.forEach(origin => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = origin;
            document.head.appendChild(link);
        });
    }
    
    optimizePostFCP() {
        // Optimizations to run after First Contentful Paint
        if (!this.criticalResourcesLoaded) {
            this.loadCriticalResources();
            this.criticalResourcesLoaded = true;
        }
    }
    
    optimizePostLCP() {
        // Optimizations to run after Largest Contentful Paint
        this.loadNonCriticalResources();
    }
    
    loadCriticalResources() {
        // Load critical resources that weren't inlined
        const criticalCSS = [
            '/assets/css/navigation.css',
            '/assets/css/base/global.css'
        ];
        
        criticalCSS.forEach(href => this.loadCSSAsync(href));
    }
    
    mitigateLayoutShift(entry) {
        // Log layout shift for debugging
        console.warn('Layout shift detected:', {
            value: entry.value,
            sources: entry.sources
        });
        
        // Implement layout shift mitigation strategies
        this.stabilizeLayout();
    }
    
    stabilizeLayout() {
        // Add aspect ratios to images without dimensions
        const images = document.querySelectorAll('img:not([width]):not([height])');
        images.forEach(img => {
            if (img.complete && img.naturalWidth) {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                img.style.aspectRatio = aspectRatio;
            }
        });
        
        // Reserve space for dynamic content
        const dynamicContainers = document.querySelectorAll('[data-dynamic-content]');
        dynamicContainers.forEach(container => {
            if (!container.style.minHeight) {
                container.style.minHeight = '200px';
            }
        });
    }
    
    getPerformanceMetrics() {
        return {
            entries: this.performanceEntries,
            fcp: this.getFCP(),
            lcp: this.getLCP(),
            cls: this.getCLS(),
            fid: this.getFID()
        };
    }
    
    getFCP() {
        const fcp = this.performanceEntries.find(entry => 
            entry.entryType === 'paint' && entry.name === 'first-contentful-paint'
        );
        return fcp ? Math.round(fcp.startTime) : null;
    }
    
    getLCP() {
        const lcp = this.performanceEntries
            .filter(entry => entry.entryType === 'largest-contentful-paint')
            .pop();
        return lcp ? Math.round(lcp.startTime) : null;
    }
    
    getCLS() {
        const layoutShifts = this.performanceEntries
            .filter(entry => entry.entryType === 'layout-shift' && !entry.hadRecentInput);
        return layoutShifts.reduce((sum, entry) => sum + entry.value, 0);
    }
    
    getFID() {
        const fid = this.performanceEntries.find(entry => entry.entryType === 'first-input');
        return fid ? Math.round(fid.processingStart - fid.startTime) : null;
    }
}

// Initialize the optimizer
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dampLighthouseOptimizer = new DAMPLighthouseOptimizer();
    });
} else {
    window.dampLighthouseOptimizer = new DAMPLighthouseOptimizer();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPLighthouseOptimizer;
}
