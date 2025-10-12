/**
 * Ad Revenue Analytics Module for GA4
 * Google Engineering Standards Implementation
 * Complete tracking for ad monetization
 *
 * @fileoverview Ad revenue tracking for AdMob, AdSense, and other platforms
 * @author WeCr8 Solutions LLC
 * @version 3.0.0
 */

import { Logger } from '../store/utils/logger.js';

/**
 * Ad Revenue Event Types
 */
export const AdRevenueEventType = {
    // Ad Impression
    AD_IMPRESSION: 'ad_impression',
    
    // Ad Clicks
    AD_CLICK: 'ad_click',
    
    // Ad Revenue (required for LTV calculations)
    AD_REVENUE: 'ad_revenue',
    
    // Ad Load Events
    AD_LOAD_SUCCESS: 'ad_load_success',
    AD_LOAD_FAILED: 'ad_load_failed',
    
    // Ad Display Events
    AD_OPENED: 'ad_opened',
    AD_CLOSED: 'ad_closed',
    AD_LEFT_APPLICATION: 'ad_left_application',
    
    // Rewarded Ads
    REWARDED_AD_WATCHED: 'rewarded_ad_watched',
    REWARDED_AD_EARNED: 'rewarded_ad_earned',
    REWARDED_AD_SKIPPED: 'rewarded_ad_skipped'
};

/**
 * Ad Network Types
 */
export const AdNetworkType = {
    ADMOB: 'AdMob',
    ADSENSE: 'AdSense',
    FACEBOOK: 'Facebook Audience Network',
    UNITY: 'Unity Ads',
    APPLOVIN: 'AppLovin',
    IRONSOURCE: 'ironSource',
    VUNGLE: 'Vungle',
    CHARTBOOST: 'Chartboost',
    MOPUB: 'MoPub',
    CUSTOM: 'Custom'
};

/**
 * Ad Format Types
 */
export const AdFormatType = {
    BANNER: 'banner',
    INTERSTITIAL: 'interstitial',
    REWARDED: 'rewarded',
    REWARDED_INTERSTITIAL: 'rewarded_interstitial',
    NATIVE: 'native',
    APP_OPEN: 'app_open',
    VIDEO: 'video',
    INLINE: 'inline'
};

/**
 * Ad Revenue Analytics Class
 */
export class AdRevenueAnalytics {
    #logger = null;
    #debug = false;
    #currency = 'USD';
    #measurementId = null;
    #defaultAdNetwork = AdNetworkType.ADMOB;

    constructor(config = {}) {
        this.#logger = new Logger('AdRevenue');
        this.#debug = config.debug || false;
        this.#currency = config.currency || 'USD';
        this.#measurementId = config.measurementId || 'G-YW2BN4SVPQ';
        this.#defaultAdNetwork = config.defaultAdNetwork || AdNetworkType.ADMOB;
    }

    /**
     * Track ad impression (when ad is shown)
     * @param {Object} data - Ad impression data
     */
    trackAdImpression(data) {
        const event = {
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_source: data.adSource || data.adNetwork,
            ad_format: data.adFormat || AdFormatType.BANNER,
            ad_unit_name: data.adUnitName,
            currency: data.currency || this.#currency,
            value: parseFloat(data.value) || 0,
            ad_unit_id: data.adUnitId,
            placement_id: data.placementId,
            impression_id: data.impressionId || this.#generateImpressionId()
        };

        this.#sendEvent(AdRevenueEventType.AD_IMPRESSION, event);
        
        // Also track as ad_revenue if value is provided
        if (event.value > 0) {
            this.trackAdRevenue({
                ...data,
                eventType: 'impression'
            });
        }

        this.#logger.debug('Ad impression tracked', { 
            format: event.ad_format,
            value: event.value 
        });
    }

    /**
     * Track ad click
     * @param {Object} data - Ad click data
     */
    trackAdClick(data) {
        const event = {
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_source: data.adSource || data.adNetwork,
            ad_format: data.adFormat || AdFormatType.BANNER,
            ad_unit_name: data.adUnitName,
            ad_unit_id: data.adUnitId,
            placement_id: data.placementId,
            click_id: data.clickId || this.#generateClickId()
        };

        this.#sendEvent(AdRevenueEventType.AD_CLICK, event);
        this.#logger.info('Ad clicked', { 
            format: event.ad_format,
            platform: event.ad_platform 
        });
    }

    /**
     * Track ad revenue (CRITICAL for LTV and monetization tracking)
     * @param {Object} data - Ad revenue data
     */
    trackAdRevenue(data) {
        const event = {
            // Required parameters for GA4 ad_impression
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_source: data.adSource || data.adNetwork || 'unknown',
            ad_format: data.adFormat || AdFormatType.BANNER,
            ad_unit_name: data.adUnitName || 'unknown',
            currency: data.currency || this.#currency,
            value: parseFloat(data.value) || 0,

            // Additional parameters
            precision_type: data.precisionType || 'estimated', // estimated, publisher_defined, precise
            ad_unit_id: data.adUnitId,
            placement_id: data.placementId,
            mediation_platform: data.mediationPlatform, // e.g., 'AdMob mediation'
            network_placement_id: data.networkPlacementId,
            
            // Event context
            event_type: data.eventType || 'impression', // impression, click, etc.
            impression_id: data.impressionId || this.#generateImpressionId()
        };

        // Send as ad_impression event (GA4 recommended for ad revenue)
        this.#sendEvent(AdRevenueEventType.AD_IMPRESSION, event);

        // Also log total revenue for reporting
        this.#logger.info('Ad revenue tracked', { 
            value: event.value,
            platform: event.ad_platform,
            format: event.ad_format,
            precision: event.precision_type
        });

        // Track cumulative revenue
        this.#trackCumulativeRevenue(event.value);
    }

    /**
     * Track rewarded ad watched
     * @param {Object} data - Rewarded ad data
     */
    trackRewardedAdWatched(data) {
        const event = {
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_source: data.adSource || data.adNetwork,
            ad_format: AdFormatType.REWARDED,
            ad_unit_name: data.adUnitName,
            ad_unit_id: data.adUnitId,
            reward_type: data.rewardType, // e.g., 'coins', 'lives', 'premium_content'
            reward_amount: data.rewardAmount || 0,
            watch_percentage: data.watchPercentage || 100,
            currency: data.currency || this.#currency,
            value: parseFloat(data.value) || 0
        };

        this.#sendEvent(AdRevenueEventType.REWARDED_AD_WATCHED, event);
        this.#logger.info('Rewarded ad watched', { 
            rewardType: event.reward_type,
            rewardAmount: event.reward_amount 
        });

        // Track revenue if provided
        if (event.value > 0) {
            this.trackAdRevenue({
                ...data,
                adFormat: AdFormatType.REWARDED,
                eventType: 'rewarded_watched'
            });
        }
    }

    /**
     * Track rewarded ad reward earned
     * @param {Object} data - Reward data
     */
    trackRewardedAdEarned(data) {
        const event = {
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_unit_name: data.adUnitName,
            reward_type: data.rewardType,
            reward_amount: data.rewardAmount || 0,
            currency: data.currency || this.#currency,
            value: parseFloat(data.value) || 0
        };

        this.#sendEvent(AdRevenueEventType.REWARDED_AD_EARNED, event);
        this.#logger.info('Rewarded ad reward earned', { 
            rewardType: event.reward_type,
            amount: event.reward_amount 
        });
    }

    /**
     * Track rewarded ad skipped
     * @param {Object} data - Skip data
     */
    trackRewardedAdSkipped(data) {
        const event = {
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_unit_name: data.adUnitName,
            watch_percentage: data.watchPercentage || 0,
            skip_reason: data.skipReason
        };

        this.#sendEvent(AdRevenueEventType.REWARDED_AD_SKIPPED, event);
        this.#logger.info('Rewarded ad skipped', { 
            watchPercentage: event.watch_percentage 
        });
    }

    /**
     * Track ad load success
     * @param {Object} data - Load success data
     */
    trackAdLoadSuccess(data) {
        const event = {
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_format: data.adFormat || AdFormatType.BANNER,
            ad_unit_name: data.adUnitName,
            ad_unit_id: data.adUnitId,
            load_time_ms: data.loadTimeMs || 0
        };

        this.#sendEvent(AdRevenueEventType.AD_LOAD_SUCCESS, event);
        this.#logger.debug('Ad loaded successfully', { 
            format: event.ad_format,
            loadTime: event.load_time_ms 
        });
    }

    /**
     * Track ad load failure
     * @param {Object} data - Load failure data
     */
    trackAdLoadFailed(data) {
        const event = {
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_format: data.adFormat || AdFormatType.BANNER,
            ad_unit_name: data.adUnitName,
            ad_unit_id: data.adUnitId,
            error_code: data.errorCode,
            error_message: data.errorMessage,
            load_time_ms: data.loadTimeMs || 0
        };

        this.#sendEvent(AdRevenueEventType.AD_LOAD_FAILED, event);
        this.#logger.warn('Ad load failed', { 
            format: event.ad_format,
            error: event.error_message 
        });
    }

    /**
     * Track ad opened (full screen)
     * @param {Object} data - Ad opened data
     */
    trackAdOpened(data) {
        const event = {
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_format: data.adFormat || AdFormatType.INTERSTITIAL,
            ad_unit_name: data.adUnitName
        };

        this.#sendEvent(AdRevenueEventType.AD_OPENED, event);
        this.#logger.debug('Ad opened', { format: event.ad_format });
    }

    /**
     * Track ad closed
     * @param {Object} data - Ad closed data
     */
    trackAdClosed(data) {
        const event = {
            ad_platform: data.adPlatform || this.#defaultAdNetwork,
            ad_format: data.adFormat || AdFormatType.INTERSTITIAL,
            ad_unit_name: data.adUnitName,
            display_duration_ms: data.displayDurationMs || 0
        };

        this.#sendEvent(AdRevenueEventType.AD_CLOSED, event);
        this.#logger.debug('Ad closed', { 
            format: event.ad_format,
            duration: event.display_duration_ms 
        });
    }

    /**
     * Track AdMob revenue (specific for AdMob)
     * @param {Object} adValue - AdMob AdValue object
     * @param {Object} adData - Additional ad data
     */
    trackAdMobRevenue(adValue, adData = {}) {
        this.trackAdRevenue({
            adPlatform: AdNetworkType.ADMOB,
            value: adValue.value / 1000000, // AdMob returns micros
            currency: adValue.currencyCode,
            precisionType: this.#mapAdMobPrecision(adValue.precision),
            adFormat: adData.adFormat,
            adUnitName: adData.adUnitName,
            adUnitId: adData.adUnitId,
            adSource: adData.adSource || 'AdMob'
        });
    }

    /**
     * Track AdSense revenue (specific for AdSense)
     * @param {Object} data - AdSense data
     */
    trackAdSenseRevenue(data) {
        this.trackAdRevenue({
            adPlatform: AdNetworkType.ADSENSE,
            value: data.estimatedRevenue || 0,
            currency: data.currency || this.#currency,
            adFormat: AdFormatType.INLINE,
            adUnitName: data.adUnitName || data.adSlot,
            adUnitId: data.adUnitId || data.adSlot,
            adSource: 'AdSense',
            precisionType: 'estimated'
        });
    }

    // Private methods

    /**
     * Map AdMob precision to string
     * @private
     */
    #mapAdMobPrecision(precision) {
        // AdMob precision constants: 0=UNKNOWN, 1=ESTIMATED, 2=PUBLISHER_PROVIDED, 3=PRECISE
        const precisionMap = {
            0: 'unknown',
            1: 'estimated',
            2: 'publisher_defined',
            3: 'precise'
        };
        return precisionMap[precision] || 'estimated';
    }

    /**
     * Generate unique impression ID
     * @private
     */
    #generateImpressionId() {
        return `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate unique click ID
     * @private
     */
    #generateClickId() {
        return `clk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Send event to GA4
     * @private
     */
    #sendEvent(eventType, eventData) {
        if (typeof window === 'undefined' || !window.gtag) {
            this.#logger.warn('GA4 not available, event not sent', { eventType });
            return;
        }

        try {
            // Add timestamp
            const enrichedData = {
                ...eventData,
                timestamp: Date.now()
            };

            // Send to GA4
            window.gtag('event', eventType, enrichedData);

            // Debug logging
            if (this.#debug) {
                this.#logger.debug('Ad revenue event sent', {
                    type: eventType,
                    data: enrichedData
                });
            }
        } catch (error) {
            this.#logger.error('Failed to send ad revenue event', error);
        }
    }

    /**
     * Track cumulative revenue for reporting
     * @private
     */
    #trackCumulativeRevenue(value) {
        try {
            const storageKey = 'damp_cumulative_ad_revenue';
            const currentRevenue = parseFloat(localStorage.getItem(storageKey)) || 0;
            const newRevenue = currentRevenue + value;
            localStorage.setItem(storageKey, newRevenue.toString());

            if (this.#debug) {
                this.#logger.debug('Cumulative ad revenue updated', { 
                    total: newRevenue,
                    added: value 
                });
            }
        } catch (error) {
            this.#logger.warn('Could not update cumulative revenue', error);
        }
    }

    /**
     * Get cumulative ad revenue
     */
    getCumulativeRevenue() {
        try {
            return parseFloat(localStorage.getItem('damp_cumulative_ad_revenue')) || 0;
        } catch {
            return 0;
        }
    }

    /**
     * Reset cumulative revenue
     */
    resetCumulativeRevenue() {
        try {
            localStorage.removeItem('damp_cumulative_ad_revenue');
            this.#logger.info('Cumulative ad revenue reset');
        } catch (error) {
            this.#logger.warn('Could not reset cumulative revenue', error);
        }
    }

    /**
     * Set default ad network
     */
    setDefaultAdNetwork(network) {
        if (Object.values(AdNetworkType).includes(network)) {
            this.#defaultAdNetwork = network;
            this.#logger.info('Default ad network updated', { network });
        }
    }

    /**
     * Enable debug mode
     */
    setDebugMode(enabled = true) {
        this.#debug = enabled;
        this.#logger.info('Ad revenue debug mode', { enabled });
    }

    /**
     * Set currency
     */
    setCurrency(currency) {
        this.#currency = currency;
        this.#logger.info('Currency updated', { currency });
    }
}

// Export singleton instance
const adRevenueAnalytics = new AdRevenueAnalytics();
export default adRevenueAnalytics;

// Export convenience functions
export const trackAdImpression = (data) => adRevenueAnalytics.trackAdImpression(data);
export const trackAdClick = (data) => adRevenueAnalytics.trackAdClick(data);
export const trackAdRevenue = (data) => adRevenueAnalytics.trackAdRevenue(data);
export const trackRewardedAdWatched = (data) => adRevenueAnalytics.trackRewardedAdWatched(data);
export const trackRewardedAdEarned = (data) => adRevenueAnalytics.trackRewardedAdEarned(data);
export const trackAdMobRevenue = (adValue, adData) => adRevenueAnalytics.trackAdMobRevenue(adValue, adData);
export const trackAdSenseRevenue = (data) => adRevenueAnalytics.trackAdSenseRevenue(data);
export const getCumulativeAdRevenue = () => adRevenueAnalytics.getCumulativeRevenue();

