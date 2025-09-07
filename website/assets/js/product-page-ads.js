/**
 * DAMP Product Page AdSense Integration
 * Universal ad placement for all product pages
 */

class ProductPageAds {
    constructor() {
        this.initialized = false;
        this.pageType = this.detectProductType();
        this.init();
    }

    /**
     * Detect the product type from the page URL or title
     */
    detectProductType() {
        const url = window.location.pathname.toLowerCase();
        const title = document.title.toLowerCase();

        if (url.includes('damp-handle') || title.includes('handle')) return 'handle';
        if (url.includes('baby-bottle') || title.includes('baby')) return 'baby-bottle';
        if (url.includes('cup-sleeve') || title.includes('sleeve')) return 'cup-sleeve';
        if (url.includes('silicone-bottom') || title.includes('silicone')) return 'silicone-bottom';

        return 'product';
    }

    /**
     * Initialize product page ads
     */
    async init() {
        // Wait for AdSense manager to be available
        if (!window.dampAdsense) {
            setTimeout(() => this.init(), 500);
            return;
        }

        await this.waitForAdSenseManager();
        this.placePrimaryAds();
        this.initialized = true;

        console.log(`✅ Product page ads initialized for: ${this.pageType}`);
    }

    /**
     * Wait for AdSense manager to be ready
     */
    waitForAdSenseManager() {
        return new Promise((resolve) => {
            const checkManager = () => {
                if (window.dampAdsense && window.dampAdsense.initialized) {
                    resolve();
                } else {
                    setTimeout(checkManager, 100);
                }
            };
            checkManager();
        });
    }

    /**
     * Place primary ads on product pages
     */
    placePrimaryAds() {
        // Primary ad after specifications, before CTA
        this.placeSpecificationAd();

        // Secondary ad in sidebar if available
        this.placeSidebarAd();

        // Track ad placements for analytics
        this.trackAdPlacements();
    }

    /**
     * Place ad after specifications section
     */
    placeSpecificationAd() {
        // Look for specifications section
        const specSelectors = [
            '.specifications-section',
            '.section:has(.specifications)',
            '.bg-surface',
            'section:nth-of-type(3)', // Usually the specs section
        ];

        let specSection = null;
        for (const selector of specSelectors) {
            try {
                specSection = document.querySelector(selector);
                if (specSection) break;
            } catch (e) {
                // Continue to next selector if current one fails
                continue;
            }
        }

        if (specSection) {
            const adContainer = document.createElement('div');
            adContainer.id = 'product-spec-ad';
            adContainer.className = 'product-ad-container';

            const adUnit = window.dampAdsense.createAdUnit({
                format: 'rectangle',
                placement: 'product',
                className: 'damp-ad-after-specifications'
            });

            adContainer.appendChild(adUnit);
            specSection.parentNode.insertBefore(adContainer, specSection.nextSibling);

            console.log('📢 Specifications ad placed');
        }
    }

    /**
     * Place sidebar ad if layout supports it
     */
    placeSidebarAd() {
        // Look for sidebar or wide layout containers
        const sidebarSelectors = [
            '.product-sidebar',
            '.product-details-sidebar',
            '.container:has(.product-gallery)'
        ];

        let sidebarContainer = null;
        for (const selector of sidebarSelectors) {
            try {
                sidebarContainer = document.querySelector(selector);
                if (sidebarContainer) break;
            } catch (e) {
                continue;
            }
        }

        if (sidebarContainer && window.innerWidth > 1024) {
            const adContainer = document.createElement('div');
            adContainer.id = 'product-sidebar-ad';
            adContainer.className = 'product-sidebar-ad-container';
            adContainer.style.cssText = `
                position: sticky;
                top: 100px;
                margin: 40px 0;
                text-align: center;
            `;

            const adUnit = window.dampAdsense.createAdUnit({
                format: 'rectangle',
                placement: 'product',
                className: 'damp-ad-sidebar'
            });

            adContainer.appendChild(adUnit);
            sidebarContainer.appendChild(adContainer);

            console.log('📢 Sidebar ad placed');
        }
    }

    /**
     * Track ad placements for analytics
     */
    trackAdPlacements() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_placement', {
                event_category: 'AdSense',
                event_label: `Product Page - ${this.pageType}`,
                page_type: 'product',
                product_type: this.pageType
            });
        }
    }

    /**
     * Add responsive ad based on device
     */
    addResponsiveAd(container, placement = 'product') {
        if (!container || !window.dampAdsense) return null;

        const format = window.innerWidth < 768 ? 'mobile' : 'rectangle';

        const adUnit = window.dampAdsense.createAdUnit({
            format,
            placement,
            className: `damp-ad-responsive-${placement}`
        });

        container.appendChild(adUnit);
        return adUnit;
    }

    /**
     * Clean up ads (for SPA navigation)
     */
    cleanup() {
        const adContainers = document.querySelectorAll('.product-ad-container, .product-sidebar-ad-container');
        adContainers.forEach(container => container.remove());
        this.initialized = false;
    }
}

// Auto-initialize for product pages
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is a product page
    const isProductPage = window.location.pathname.includes('/pages/') &&
                         (window.location.pathname.includes('-v1.0.html') ||
                          document.title.toLowerCase().includes('damp'));

    if (isProductPage) {
        window.productPageAds = new ProductPageAds();
    }
});

// Export for manual initialization
window.ProductPageAds = ProductPageAds;