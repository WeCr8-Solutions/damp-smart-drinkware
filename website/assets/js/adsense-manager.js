/**
 * DAMP AdSense Manager
 * Discrete advertising integration following Google best practices
 */

class DAMPAdSenseManager {
    constructor() {
        this.config = window.DAMP_CONFIG?.adsense || {};
        this.initialized = false;
        this.adUnits = new Map();
        this.lazyLoadObserver = null;

        this.init();
    }

    /**
     * Initialize AdSense with error handling
     */
    async init() {
        if (!this.config.enabled || !this.config.clientId) {
            console.log('🚫 AdSense disabled or not configured');
            return;
        }

        try {
            await this.loadAdSenseScript();
            this.setupLazyLoading();
            this.initialized = true;
            console.log('✅ DAMP AdSense Manager initialized');
        } catch (error) {
            console.error('❌ AdSense initialization failed:', error);
        }
    }

    /**
     * Load AdSense script asynchronously
     */
    loadAdSenseScript() {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            if (document.querySelector(`script[src*="googlesyndication.com"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.clientId}`;

            script.onload = () => {
                // Add meta tag for AdSense verification
                if (!document.querySelector('meta[name="google-adsense-account"]')) {
                    const meta = document.createElement('meta');
                    meta.name = 'google-adsense-account';
                    meta.content = this.config.clientId;
                    document.head.appendChild(meta);
                }
                resolve();
            };

            script.onerror = () => reject(new Error('Failed to load AdSense script'));
            document.head.appendChild(script);
        });
    }

    /**
     * Setup lazy loading for ad units
     */
    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        this.lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adId = entry.target.dataset.adId;
                    this.activateAdUnit(adId);
                    this.lazyLoadObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px'
        });
    }

    /**
     * Create a discrete ad unit
     */
    createAdUnit(options = {}) {
        const {
            format = 'rectangle',
            placement = 'content',
            className = '',
            style = {},
            lazy = true
        } = options;

        const adId = `damp-ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const formatSize = this.config.adFormats[format] || this.config.adFormats.rectangle;

        // Create ad container with DAMP styling
        const adContainer = document.createElement('div');
        adContainer.className = `damp-ad-container ${className}`;
        adContainer.dataset.adId = adId;
        adContainer.dataset.placement = placement;

        // Apply discrete styling
        Object.assign(adContainer.style, {
            margin: '40px auto',
            textAlign: 'center',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            maxWidth: '100%',
            ...style
        });

        // Create ad unit
        const adUnit = document.createElement('ins');
        adUnit.className = 'adsbygoogle damp-ad-unit';
        adUnit.style.display = 'block';
        adUnit.dataset.adClient = this.config.clientId;
        adUnit.dataset.adFormat = format === 'responsive' ? 'auto' : formatSize;
        adUnit.dataset.fullWidthResponsive = 'true';

        // Set dimensions for fixed formats
        if (format !== 'responsive' && formatSize.includes('x')) {
            const [width, height] = formatSize.split('x');
            adUnit.style.width = `${width}px`;
            adUnit.style.height = `${height}px`;
        }

        // Add subtle label
        const label = document.createElement('div');
        label.className = 'damp-ad-label';
        label.textContent = 'Advertisement';
        label.style.cssText = `
            font-size: 0.75rem;
            color: #888;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        adContainer.appendChild(label);
        adContainer.appendChild(adUnit);

        // Store ad unit reference
        this.adUnits.set(adId, {
            container: adContainer,
            unit: adUnit,
            activated: false,
            placement,
            format
        });

        // Setup lazy loading
        if (lazy && this.lazyLoadObserver) {
            this.lazyLoadObserver.observe(adContainer);
        }

        return adContainer;
    }

    /**
     * Activate an ad unit (called by lazy loading or immediately)
     */
    async activateAdUnit(adId) {
        const adData = this.adUnits.get(adId);
        if (!adData || adData.activated) return;

        try {
            // Push ad to AdSense
            (window.adsbygoogle = window.adsbygoogle || []).push({});

            // Fade in the ad container
            setTimeout(() => {
                adData.container.style.opacity = '1';
            }, 100);

            adData.activated = true;
            console.log(`📢 AdSense unit activated: ${adId} (${adData.placement})`);
        } catch (error) {
            console.error(`❌ Failed to activate ad unit ${adId}:`, error);
        }
    }

    /**
     * Insert ad at specific placement
     */
    insertAdAtPlacement(placement, targetElement, position = 'after') {
        if (!this.initialized || !targetElement) return null;

        const format = this.getOptimalFormat(placement);
        const adUnit = this.createAdUnit({
            format,
            placement,
            className: `damp-ad-${placement}`
        });

        // Insert ad relative to target element
        if (position === 'after') {
            targetElement.parentNode.insertBefore(adUnit, targetElement.nextSibling);
        } else if (position === 'before') {
            targetElement.parentNode.insertBefore(adUnit, targetElement);
        } else if (position === 'inside') {
            targetElement.appendChild(adUnit);
        }

        return adUnit;
    }

    /**
     * Get optimal ad format based on placement
     */
    getOptimalFormat(placement) {
        const formatMap = {
            'homepage': 'banner',
            'product': 'rectangle',
            'content': 'rectangle',
            'mobile': 'mobile',
            'sidebar': 'rectangle',
            'footer': 'banner'
        };

        // Detect mobile for responsive formatting
        if (window.innerWidth < 768) {
            return 'mobile';
        }

        return formatMap[placement] || 'rectangle';
    }

    /**
     * Auto-place ads based on page type and configuration
     */
    autoPlaceAds(pageType = 'general') {
        if (!this.initialized) return;

        const placements = this.config.placements[pageType] || [];

        placements.forEach(placement => {
            this.placeAdBySelector(placement);
        });
    }

    /**
     * Place ad by CSS selector or placement identifier
     */
    placeAdBySelector(placement) {
        const selectors = {
            'after-hero': '.hero-section',
            'between-features': '.features-section',
            'before-testimonials': '.testimonials-section',
            'after-specifications': '.specifications-section',
            'before-cta': '.cta-section',
            'mid-content': '.content-section',
            'before-footer': 'footer',
            'cart-sidebar': '.cart-sidebar',
            'success-celebration': '.success-message'
        };

        const selector = selectors[placement];
        if (!selector) return;

        const targetElement = document.querySelector(selector);
        if (targetElement) {
            this.insertAdAtPlacement(placement, targetElement, 'after');
        }
    }

    /**
     * Clean up ad units (for SPA navigation)
     */
    cleanup() {
        this.adUnits.clear();
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.disconnect();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dampAdsense = new DAMPAdSenseManager();
});

// Export for manual initialization
window.DAMPAdSenseManager = DAMPAdSenseManager;