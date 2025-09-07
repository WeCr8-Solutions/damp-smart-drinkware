/**
 * DAMP Smart Drinkware - AdSense Configuration
 * Professional AdSense integration with error handling
 */

window.DAMP_CONFIG = window.DAMP_CONFIG || {};

window.DAMP_CONFIG.adsense = {
    enabled: true,
    clientId: 'ca-pub-3639153716376265',

    // Ad unit configurations
    adUnits: {
        // Header banner (responsive)
        header: {
            slot: '1234567890', // Replace with actual slot ID from AdSense
            format: 'auto',
            fullWidthResponsive: true,
            enabled: true
        },

        // Sidebar ads
        sidebar: {
            slot: '2345678901', // Replace with actual slot ID
            format: 'rectangle',
            enabled: true
        },

        // In-content ads
        content: {
            slot: '3456789012', // Replace with actual slot ID
            format: 'fluid',
            enabled: true
        },

        // Footer banner
        footer: {
            slot: '4567890123', // Replace with actual slot ID
            format: 'auto',
            fullWidthResponsive: true,
            enabled: false // Disabled by default for better UX
        }
    },

    // Performance settings
    performance: {
        lazyLoad: true,
        lazyLoadMargin: '200px',
        maxAdsPerPage: 3,
        respectDoNotTrack: true
    },

    // Debugging
    debug: window.location.hostname === 'localhost' || window.location.search.includes('debug=true')
};

// AdSense initialization and management
class AdSenseIntegration {
    constructor() {
        this.config = window.DAMP_CONFIG.adsense;
        this.initialized = false;
        this.adQueue = [];
        this.loadedAds = new Set();

        if (this.config.enabled) {
            this.init();
        }
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Check if AdSense script is already loaded
            if (typeof adsbygoogle !== 'undefined') {
                console.log('✅ AdSense script already loaded');
                this.initialized = true;
                this.processAdQueue();
                return;
            }

            // Wait for script to load (it's loaded in HTML head)
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds

            while (typeof adsbygoogle === 'undefined' && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (typeof adsbygoogle !== 'undefined') {
                console.log('✅ AdSense initialized successfully');
                this.initialized = true;
                this.processAdQueue();
            } else {
                console.warn('⚠️ AdSense script failed to load');
                this.config.enabled = false;
            }

        } catch (error) {
            console.error('❌ AdSense initialization failed:', error);
            this.config.enabled = false;
        }
    }

    // Process queued ads
    processAdQueue() {
        if (!this.initialized || typeof adsbygoogle === 'undefined') {
            return;
        }

        this.adQueue.forEach(adElement => {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                this.loadedAds.add(adElement.dataset.adSlot);

                if (this.config.debug) {
                    console.log('📊 AdSense ad pushed:', adElement.dataset.adSlot);
                }
            } catch (error) {
                console.error('❌ Failed to push ad:', error);
            }
        });

        this.adQueue = [];
    }

    // Create ad element
    createAdElement(unitConfig, containerId) {
        if (!this.config.enabled || !unitConfig.enabled) {
            return null;
        }

        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.style.display = 'block';
        adElement.dataset.adClient = this.config.clientId;
        adElement.dataset.adSlot = unitConfig.slot;
        adElement.dataset.adFormat = unitConfig.format;

        if (unitConfig.fullWidthResponsive) {
            adElement.dataset.fullWidthResponsive = 'true';
        }

        // Add to container if specified
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.appendChild(adElement);
            }
        }

        // Queue for processing
        if (this.initialized) {
            this.processAdQueue();
        } else {
            this.adQueue.push(adElement);
        }

        return adElement;
    }

    // Respect user preferences
    shouldShowAds() {
        // Check Do Not Track
        if (this.config.performance.respectDoNotTrack && navigator.doNotTrack === '1') {
            return false;
        }

        // Check if user has ad blocker
        if (this.isAdBlockerDetected()) {
            return false;
        }

        return this.config.enabled;
    }

    // Simple ad blocker detection
    isAdBlockerDetected() {
        try {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            testAd.style.position = 'absolute';
            testAd.style.left = '-999px';
            document.body.appendChild(testAd);

            const isBlocked = testAd.offsetHeight === 0;
            document.body.removeChild(testAd);

            return isBlocked;
        } catch (error) {
            return false;
        }
    }

    // Get status for debugging
    getStatus() {
        return {
            enabled: this.config.enabled,
            initialized: this.initialized,
            scriptLoaded: typeof adsbygoogle !== 'undefined',
            queuedAds: this.adQueue.length,
            loadedAds: this.loadedAds.size,
            adBlockerDetected: this.isAdBlockerDetected()
        };
    }
}

// Initialize AdSense integration
window.dampAdSense = new AdSenseIntegration();

// Export for debugging
window.debugAdSense = () => {
    console.log('AdSense Status:', window.dampAdSense.getStatus());
    console.log('AdSense Config:', window.DAMP_CONFIG.adsense);
};

// Log initialization
if (window.DAMP_CONFIG.adsense.debug) {
    console.log('🔧 AdSense Debug Mode Enabled');
    console.log('📊 AdSense Config:', window.DAMP_CONFIG.adsense);

    // Auto-debug in 3 seconds
    setTimeout(() => {
        window.debugAdSense();
    }, 3000);
}
