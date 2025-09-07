/**
 * Universal AdSense Integration for DAMP E-commerce Pages
 * Handles cart, checkout, success, waitlist, and pre-order pages
 */

(function() {
    'use strict';

    // Configuration
    const ADSENSE_CLIENT_ID = 'ca-pub-3639153716376265';
    const ECOMMERCE_PAGE_PATTERNS = [
        '/pages/cart',
        '/pages/checkout',
        '/pages/success',
        '/pages/waitlist',
        '/pages/pre-order',
        '/pages/pre-sale-funnel'
    ];

    /**
     * Check if current page is an e-commerce page
     */
    function isEcommercePage() {
        const currentPath = window.location.pathname.toLowerCase();
        return ECOMMERCE_PAGE_PATTERNS.some(pattern => currentPath.includes(pattern));
    }

    /**
     * Load AdSense script dynamically
     */
    function loadAdSenseScript() {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src*="googlesyndication.com"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

            script.onload = () => {
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
     * Load AdSense styles
     */
    function loadAdSenseStyles() {
        if (document.querySelector('link[href*="adsense-styles.css"]')) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '../assets/css/adsense-styles.css';
        document.head.appendChild(link);
    }

    /**
     * Create subtle e-commerce ad unit
     */
    function createEcommerceAd(format = 'rectangle', className = '', placement = 'general') {
        const adContainer = document.createElement('div');
        adContainer.className = `damp-ad-container ${className}`;

        // E-commerce specific styling - more subtle
        let containerStyles = `
            margin: 40px auto;
            text-align: center;
            opacity: 0;
            transition: opacity 0.4s ease;
            max-width: 100%;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        `;

        // Placement-specific adjustments
        if (placement === 'sidebar') {
            containerStyles += `
                max-width: 300px;
                position: sticky;
                top: 20px;
                margin: 20px 0;
            `;
        } else if (placement === 'success') {
            containerStyles += `
                margin: 60px auto;
                background: linear-gradient(45deg, rgba(0, 255, 136, 0.05), rgba(0, 212, 255, 0.05));
                border-color: rgba(0, 255, 136, 0.2);
            `;
        }

        adContainer.style.cssText = containerStyles;

        // Extra subtle label for e-commerce
        const label = document.createElement('div');
        label.className = 'damp-ad-label';
        label.textContent = 'Sponsored';
        label.style.cssText = `
            font-size: 0.7rem;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            font-weight: 400;
            opacity: 0.5;
        `;

        // Ad unit with subtle styling
        const adUnit = document.createElement('ins');
        adUnit.className = 'adsbygoogle damp-ad-unit';
        adUnit.style.display = 'block';
        adUnit.dataset.adClient = ADSENSE_CLIENT_ID;
        adUnit.dataset.fullWidthResponsive = 'true';

        // Format selection based on context and screen size
        if (format === 'mobile' || window.innerWidth < 768) {
            adUnit.dataset.adFormat = '320x50';
            adUnit.style.width = '320px';
            adUnit.style.height = '50px';
        } else if (format === 'banner') {
            adUnit.dataset.adFormat = '728x90';
            adUnit.style.width = '728px';
            adUnit.style.height = '90px';
        } else {
            adUnit.dataset.adFormat = '300x250';
            adUnit.style.width = '300px';
            adUnit.style.height = '250px';
        }

        adUnit.style.cssText += `
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 212, 255, 0.08);
            transition: all 0.3s ease;
        `;

        adContainer.appendChild(label);
        adContainer.appendChild(adUnit);

        // Delayed activation for better UX on e-commerce pages
        setTimeout(() => {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                adContainer.style.opacity = '1';
            } catch (error) {
                console.error('E-commerce ad activation failed:', error);
                adContainer.style.display = 'none';
            }
        }, 1500); // Longer delay for e-commerce

        return adContainer;
    }

    /**
     * Place ads on e-commerce pages
     */
    function placeEcommerceAds() {
        const currentPath = window.location.pathname.toLowerCase();

        // Cart page ads
        if (currentPath.includes('cart')) {
            placeCartAds();
        }
        // Success page ads
        else if (currentPath.includes('success')) {
            placeSuccessAds();
        }
        // Waitlist page ads
        else if (currentPath.includes('waitlist')) {
            placeWaitlistAds();
        }
        // Pre-order pages
        else if (currentPath.includes('pre-order') || currentPath.includes('pre-sale')) {
            placePreOrderAds();
        }

        // Track placement
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_placement', {
                event_category: 'AdSense',
                event_label: `E-commerce Page - ${currentPath}`,
                page_location: window.location.href
            });
        }
    }

    /**
     * Place ads on cart page
     */
    function placeCartAds() {
        // Look for cart sidebar or summary section
        const sidebarSelectors = [
            '.cart-sidebar',
            '.cart-summary',
            '.order-summary',
            '.checkout-sidebar'
        ];

        let sidebar = null;
        for (const selector of sidebarSelectors) {
            sidebar = document.querySelector(selector);
            if (sidebar) break;
        }

        if (sidebar) {
            const sidebarAd = createEcommerceAd('rectangle', 'damp-ad-cart-sidebar', 'sidebar');
            sidebar.appendChild(sidebarAd);
            console.log('📢 Cart sidebar ad placed');
        } else {
            // Fallback: place after main cart content
            const cartContent = document.querySelector('.cart-content, main, .container');
            if (cartContent) {
                const format = window.innerWidth < 768 ? 'mobile' : 'rectangle';
                const cartAd = createEcommerceAd(format, 'damp-ad-cart-content');
                cartContent.appendChild(cartAd);
                console.log('📢 Cart content ad placed');
            }
        }
    }

    /**
     * Place ads on success page
     */
    function placeSuccessAds() {
        const successSelectors = [
            '.success-message',
            '.order-confirmation',
            '.thank-you-section',
            'main .container'
        ];

        let successSection = null;
        for (const selector of successSelectors) {
            successSection = document.querySelector(selector);
            if (successSection) break;
        }

        if (successSection) {
            const format = window.innerWidth < 768 ? 'mobile' : 'rectangle';
            const successAd = createEcommerceAd(format, 'damp-ad-success-celebration', 'success');

            // Place after success content
            if (successSection.nextSibling) {
                successSection.parentNode.insertBefore(successAd, successSection.nextSibling);
            } else {
                successSection.parentNode.appendChild(successAd);
            }

            console.log('📢 Success page ad placed');
        }
    }

    /**
     * Place ads on waitlist page
     */
    function placeWaitlistAds() {
        const waitlistForm = document.querySelector('.waitlist-form, .newsletter-form, form');

        if (waitlistForm) {
            const format = window.innerWidth < 768 ? 'mobile' : 'rectangle';
            const waitlistAd = createEcommerceAd(format, 'damp-ad-waitlist');

            // Place after the form
            if (waitlistForm.nextSibling) {
                waitlistForm.parentNode.insertBefore(waitlistAd, waitlistForm.nextSibling);
            } else {
                waitlistForm.parentNode.appendChild(waitlistAd);
            }

            console.log('📢 Waitlist page ad placed');
        }
    }

    /**
     * Place ads on pre-order pages
     */
    function placePreOrderAds() {
        const sections = document.querySelectorAll('section, .section');

        if (sections.length >= 2) {
            const midSection = sections[Math.floor(sections.length / 2)];
            const format = window.innerWidth < 768 ? 'mobile' : 'rectangle';
            const preOrderAd = createEcommerceAd(format, 'damp-ad-pre-order');

            if (midSection.nextSibling) {
                midSection.parentNode.insertBefore(preOrderAd, midSection.nextSibling);
            } else {
                midSection.parentNode.appendChild(preOrderAd);
            }

            console.log('📢 Pre-order page ad placed');
        }
    }

    /**
     * Initialize e-commerce page AdSense
     */
    async function initEcommerceAdSense() {
        if (!isEcommercePage()) return;

        try {
            console.log('🔄 Initializing e-commerce AdSense...');

            loadAdSenseStyles();
            await loadAdSenseScript();

            // Longer delay for e-commerce pages to not interfere with checkout flow
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(placeEcommerceAds, 2000);
                });
            } else {
                setTimeout(placeEcommerceAds, 2000);
            }

            console.log('✅ E-commerce AdSense initialized');

        } catch (error) {
            console.error('❌ E-commerce AdSense failed:', error);
        }
    }

    // Initialize immediately
    initEcommerceAdSense();

})();