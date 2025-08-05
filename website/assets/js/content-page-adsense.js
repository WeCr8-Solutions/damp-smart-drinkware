/**
 * Universal AdSense Integration for DAMP Content Pages
 * Handles about, support, privacy, terms, and other content pages
 */

(function() {
    'use strict';

    // Configuration
    const ADSENSE_CLIENT_ID = 'ca-pub-3639153716376265';
    const CONTENT_PAGE_PATTERNS = [
        '/pages/about',
        '/pages/support',
        '/pages/privacy',
        '/pages/terms',
        '/pages/cookie-policy',
        '/pages/how-it-works'
    ];

    /**
     * Check if current page is a content page
     */
    function isContentPage() {
        const currentPath = window.location.pathname.toLowerCase();
        return CONTENT_PAGE_PATTERNS.some(pattern => currentPath.includes(pattern)) ||
               (currentPath.includes('/pages/') && !currentPath.includes('cart') && 
                !currentPath.includes('checkout') && !currentPath.includes('-v1.0'));
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
     * Create content page ad unit
     */
    function createContentAd(format = 'rectangle', className = '', position = 'center') {
        const adContainer = document.createElement('div');
        adContainer.className = `damp-ad-container ${className}`;
        
        const baseStyles = `
            margin: 60px auto;
            text-align: center;
            opacity: 0;
            transition: opacity 0.4s ease;
            max-width: 100%;
            clear: both;
        `;

        // Position-specific styles
        let positionStyles = '';
        if (position === 'sidebar') {
            positionStyles = `
                float: right;
                margin: 30px 0 30px 30px;
                max-width: 300px;
                position: sticky;
                top: 100px;
            `;
        } else if (position === 'inline') {
            positionStyles = `
                margin: 40px auto;
                max-width: 300px;
            `;
        }

        adContainer.style.cssText = baseStyles + positionStyles;

        // Responsive adjustments
        if (window.innerWidth < 768) {
            adContainer.style.float = 'none';
            adContainer.style.margin = '30px auto';
            adContainer.style.maxWidth = '320px';
        }

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
        adUnit.dataset.fullWidthResponsive = 'true';
        
        // Format-specific settings
        if (format === 'banner' && window.innerWidth >= 768) {
            adUnit.dataset.adFormat = '728x90';
            adUnit.style.width = '728px';
            adUnit.style.height = '90px';
        } else if (format === 'mobile' || window.innerWidth < 768) {
            adUnit.dataset.adFormat = '320x50';
            adUnit.style.width = '320px';
            adUnit.style.height = '50px';
        } else {
            adUnit.dataset.adFormat = '300x250';
            adUnit.style.width = '300px';
            adUnit.style.height = '250px';
        }

        adUnit.style.cssText += `
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 212, 255, 0.1);
            transition: all 0.3s ease;
        `;

        adContainer.appendChild(label);
        adContainer.appendChild(adUnit);

        // Activate ad
        setTimeout(() => {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                adContainer.style.opacity = '1';
            } catch (error) {
                console.error('Content ad activation failed:', error);
                adContainer.style.display = 'none';
            }
        }, 1200);

        return adContainer;
    }

    /**
     * Place ads on content pages
     */
    function placeContentAds() {
        const contentArea = document.querySelector('main, .content, .container');
        if (!contentArea) return;

        const sections = contentArea.querySelectorAll('section, .section');
        
        if (sections.length >= 2) {
            // Place ad after second section (mid-content)
            const midSection = sections[1];
            const format = window.innerWidth < 768 ? 'mobile' : 'rectangle';
            const midAd = createContentAd(format, 'damp-ad-mid-content', 'inline');
            
            if (midSection.nextSibling) {
                midSection.parentNode.insertBefore(midAd, midSection.nextSibling);
            } else {
                midSection.parentNode.appendChild(midAd);
            }
            
            console.log('📢 Content page mid-content ad placed');
        }

        if (sections.length >= 3) {
            // Place banner ad before footer
            const lastSection = sections[sections.length - 1];
            const bannerFormat = window.innerWidth < 768 ? 'mobile' : 'banner';
            const footerAd = createContentAd(bannerFormat, 'damp-ad-before-footer', 'center');
            
            if (lastSection.nextSibling) {
                lastSection.parentNode.insertBefore(footerAd, lastSection.nextSibling);
            } else {
                lastSection.parentNode.appendChild(footerAd);
            }
            
            console.log('📢 Content page footer ad placed');
        }

        // Track placement
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_placement', {
                event_category: 'AdSense',
                event_label: 'Content Page Auto-Placement',
                page_location: window.location.href
            });
        }
    }

    /**
     * Initialize content page AdSense
     */
    async function initContentAdSense() {
        if (!isContentPage()) return;

        try {
            console.log('🔄 Initializing content page AdSense...');
            
            loadAdSenseStyles();
            await loadAdSenseScript();
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(placeContentAds, 800);
                });
            } else {
                setTimeout(placeContentAds, 800);
            }
            
            console.log('✅ Content page AdSense initialized');
            
        } catch (error) {
            console.error('❌ Content page AdSense failed:', error);
        }
    }

    // Initialize immediately
    initContentAdSense();

})();