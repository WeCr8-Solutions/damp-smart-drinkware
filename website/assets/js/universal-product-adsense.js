/**
 * Universal AdSense Integration for All DAMP Product Pages
 * Auto-detects product pages and applies appropriate ad placements
 */

(function() {
    'use strict';

    // Configuration
    const ADSENSE_CLIENT_ID = 'ca-pub-3639153716376265';
    const PRODUCT_PAGE_PATTERNS = [
        '/pages/damp-handle',
        '/pages/baby-bottle',
        '/pages/cup-sleeve',
        '/pages/silicone-bottom'
    ];

    /**
     * Check if current page is a product page
     */
    function isProductPage() {
        const currentPath = window.location.pathname.toLowerCase();
        return PRODUCT_PAGE_PATTERNS.some(pattern => currentPath.includes(pattern)) ||
               currentPath.includes('-v1.0.html') ||
               document.title.toLowerCase().includes('damp') && currentPath.includes('/pages/');
    }

    /**
     * Load AdSense script dynamically
     */
    function loadAdSenseScript() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`script[src*="googlesyndication.com"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

            script.onload = () => {
                // Add meta tag
                if (!document.querySelector('meta[name="google-adsense-account"]')) {
                    const meta = document.createElement('meta');
                    meta.name = 'google-adsense-account';
                    meta.content = ADSENSE_CLIENT_ID;
                    document.head.appendChild(meta);
                }
                resolve();
            };

            script.onerror = () => reject(new Error('Failed to load AdSense'));
            document.head.appendChild(script);
        });
    }

    /**
     * Load AdSense styles dynamically
     */
    function loadAdSenseStyles() {
        if (document.querySelector('link[href*="adsense-styles.css"]')) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '../assets/css/adsense-styles.css';
        document.head.appendChild(link);
    }

    /**
     * Create a discrete ad unit
     */
    function createProductAd(format = 'rectangle', className = '') {
        const adContainer = document.createElement('div');
        adContainer.className = `damp-ad-container ${className}`;
        adContainer.style.cssText = `
            margin: 60px auto;
            text-align: center;
            opacity: 0;
            transition: opacity 0.4s ease;
            max-width: 100%;
        `;

        // Ad label
        const label = document.createElement('div');
        label.className = 'damp-ad-label';
        label.textContent = 'Advertisement';
        label.style.cssText = `
            font-size: 0.75rem;
            color: #888;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 500;
            opacity: 0.7;
        `;

        // Ad unit
        const adUnit = document.createElement('ins');
        adUnit.className = 'adsbygoogle damp-ad-unit';
        adUnit.style.display = 'block';
        adUnit.dataset.adClient = ADSENSE_CLIENT_ID;
        adUnit.dataset.adFormat = format === 'responsive' ? 'auto' : '300x250';
        adUnit.dataset.fullWidthResponsive = 'true';

        if (format === 'banner') {
            adUnit.dataset.adFormat = '728x90';
            adUnit.style.width = '728px';
            adUnit.style.height = '90px';
        } else if (format === 'mobile') {
            adUnit.dataset.adFormat = '320x50';
            adUnit.style.width = '320px';
            adUnit.style.height = '50px';
        }

        adUnit.style.cssText += `
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 212, 255, 0.1);
        `;

        adContainer.appendChild(label);
        adContainer.appendChild(adUnit);

        // Activate ad with delay for better UX
        setTimeout(() => {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                adContainer.style.opacity = '1';
            } catch (error) {
                console.error('AdSense activation failed:', error);
                adContainer.style.display = 'none';
            }
        }, 1000);

        return adContainer;
    }

    /**
     * Place ads strategically on product pages
     */
    function placeProductAds() {
        // Ad after specifications/features section
        const specSelectors = [
            '.specifications-section',
            '.bg-surface',
            'section:nth-of-type(3)',
            '.section:last-of-type:not([class*="cta"])'
        ];

        let targetSection = null;
        for (const selector of specSelectors) {
            try {
                targetSection = document.querySelector(selector);
                if (targetSection) break;
            } catch (e) {
                continue;
            }
        }

        if (targetSection) {
            const format = window.innerWidth < 768 ? 'mobile' : 'rectangle';
            const productAd = createProductAd(format, 'damp-ad-after-specifications');

            // Insert after the target section
            if (targetSection.nextSibling) {
                targetSection.parentNode.insertBefore(productAd, targetSection.nextSibling);
            } else {
                targetSection.parentNode.appendChild(productAd);
            }

            console.log('📢 Product page ad placed after specifications');
        }

        // Track for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_placement', {
                event_category: 'AdSense',
                event_label: 'Product Page Auto-Placement',
                page_location: window.location.href
            });
        }
    }

    /**
     * Initialize product page AdSense
     */
    async function initProductAdSense() {
        if (!isProductPage()) return;

        try {
            console.log('🔄 Initializing product page AdSense...');

            // Load resources
            loadAdSenseStyles();
            await loadAdSenseScript();

            // Wait for DOM to be fully ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', placeProductAds);
            } else {
                setTimeout(placeProductAds, 500);
            }

            console.log('✅ Product page AdSense initialized');

        } catch (error) {
            console.error('❌ Product page AdSense failed:', error);
        }
    }

    // Initialize immediately
    initProductAdSense();

})();