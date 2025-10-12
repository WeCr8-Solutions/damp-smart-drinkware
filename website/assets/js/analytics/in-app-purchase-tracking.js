/**
 * In-App Purchase Analytics Module for GA4
 * Google Engineering Standards Implementation
 * Complete tracking for mobile in-app purchases
 *
 * @fileoverview In-app purchase tracking for iOS and Android apps
 * @author WeCr8 Solutions LLC
 * @version 3.0.0
 */

import { Logger } from '../store/utils/logger.js';

/**
 * In-App Purchase Event Types
 */
export const IAPEventType = {
    // Purchase Flow
    IAP_INITIATED: 'iap_initiated',
    IAP_PENDING: 'iap_pending',
    IAP_COMPLETED: 'iap_completed',
    IAP_FAILED: 'iap_failed',
    IAP_CANCELLED: 'iap_cancelled',
    IAP_RESTORED: 'iap_restored',

    // Subscription Events
    SUBSCRIPTION_STARTED: 'subscription_started',
    SUBSCRIPTION_RENEWED: 'subscription_renewed',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
    SUBSCRIPTION_EXPIRED: 'subscription_expired',
    SUBSCRIPTION_PAUSED: 'subscription_paused',
    SUBSCRIPTION_REACTIVATED: 'subscription_reactivated',

    // Trial Events
    TRIAL_STARTED: 'trial_started',
    TRIAL_CONVERTED: 'trial_converted',
    TRIAL_CANCELLED: 'trial_cancelled',

    // Product Events
    PRODUCT_VIEWED: 'iap_product_viewed',
    PRODUCT_DETAILS_OPENED: 'iap_product_details_opened'
};

/**
 * Platform Types
 */
export const PlatformType = {
    IOS: 'ios',
    ANDROID: 'android',
    WEB: 'web'
};

/**
 * In-App Purchase Analytics Class
 */
export class InAppPurchaseAnalytics {
    #logger = null;
    #debug = false;
    #currency = 'USD';
    #platform = PlatformType.WEB;
    #measurementId = null;

    constructor(config = {}) {
        this.#logger = new Logger('InAppPurchase');
        this.#debug = config.debug || false;
        this.#currency = config.currency || 'USD';
        this.#platform = config.platform || this.#detectPlatform();
        this.#measurementId = config.measurementId || 'G-YW2BN4SVPQ';
    }

    /**
     * Track when user initiates an in-app purchase
     * @param {Object} data - Purchase initiation data
     */
    trackIAPInitiated(data) {
        const event = {
            currency: data.currency || this.#currency,
            value: parseFloat(data.price) || 0,
            item_id: data.productId,
            item_name: data.productName,
            item_category: data.category || 'in_app_purchase',
            platform: this.#platform,
            payment_method: data.paymentMethod,
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.IAP_INITIATED, event);
        this.#logger.info('IAP initiated', { 
            product: event.item_name, 
            value: event.value 
        });
    }

    /**
     * Track when purchase is pending (waiting for payment confirmation)
     * @param {Object} data - Pending purchase data
     */
    trackIAPPending(data) {
        const event = {
            currency: data.currency || this.#currency,
            value: parseFloat(data.price) || 0,
            transaction_id: data.transactionId,
            item_id: data.productId,
            item_name: data.productName,
            platform: this.#platform
        };

        this.#sendEvent(IAPEventType.IAP_PENDING, event);
        this.#logger.info('IAP pending', { 
            transactionId: event.transaction_id 
        });
    }

    /**
     * Track successful in-app purchase
     * @param {Object} data - Purchase completion data
     */
    trackIAPCompleted(data) {
        const event = {
            transaction_id: data.transactionId || this.#generateTransactionId(),
            currency: data.currency || this.#currency,
            value: parseFloat(data.price) || 0,
            tax: parseFloat(data.tax) || 0,
            item_id: data.productId,
            item_name: data.productName,
            item_category: data.category || 'in_app_purchase',
            platform: this.#platform,
            store: this.#getStoreName(),
            receipt_token: data.receiptToken,
            is_sandbox: data.isSandbox || false,
            user_id: data.userId
        };

        // Send as both IAP event and purchase event for GA4 ecommerce
        this.#sendEvent(IAPEventType.IAP_COMPLETED, event);
        
        // Also send as standard GA4 purchase event
        this.#sendPurchaseEvent(event);

        this.#logger.info('IAP completed', { 
            transactionId: event.transaction_id,
            product: event.item_name,
            value: event.value 
        });

        // Track conversion
        this.#trackConversion(event.value);
    }

    /**
     * Track failed in-app purchase
     * @param {Object} data - Purchase failure data
     */
    trackIAPFailed(data) {
        const event = {
            item_id: data.productId,
            item_name: data.productName,
            error_code: data.errorCode,
            error_message: data.errorMessage,
            platform: this.#platform,
            failure_reason: data.failureReason,
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.IAP_FAILED, event);
        this.#logger.warn('IAP failed', { 
            product: event.item_name,
            reason: event.failure_reason 
        });
    }

    /**
     * Track cancelled in-app purchase
     * @param {Object} data - Purchase cancellation data
     */
    trackIAPCancelled(data) {
        const event = {
            item_id: data.productId,
            item_name: data.productName,
            platform: this.#platform,
            cancellation_step: data.cancellationStep,
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.IAP_CANCELLED, event);
        this.#logger.info('IAP cancelled', { 
            product: event.item_name,
            step: event.cancellation_step 
        });
    }

    /**
     * Track restored purchase (for iOS)
     * @param {Object} data - Restored purchase data
     */
    trackIAPRestored(data) {
        const event = {
            transaction_id: data.originalTransactionId,
            item_id: data.productId,
            item_name: data.productName,
            platform: this.#platform,
            restored_count: data.restoredCount || 1,
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.IAP_RESTORED, event);
        this.#logger.info('IAP restored', { 
            product: event.item_name 
        });
    }

    /**
     * Track subscription started
     * @param {Object} data - Subscription start data
     */
    trackSubscriptionStarted(data) {
        const event = {
            transaction_id: data.transactionId || this.#generateTransactionId(),
            currency: data.currency || this.#currency,
            value: parseFloat(data.price) || 0,
            subscription_id: data.subscriptionId,
            subscription_name: data.subscriptionName,
            subscription_tier: data.subscriptionTier,
            billing_period: data.billingPeriod, // monthly, yearly, etc.
            trial_period: data.trialPeriod || 0,
            trial_period_unit: data.trialPeriodUnit, // days, months
            platform: this.#platform,
            store: this.#getStoreName(),
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.SUBSCRIPTION_STARTED, event);
        
        // Also send as GA4 subscription event
        this.#sendGA4SubscriptionEvent('start_trial', event);

        this.#logger.info('Subscription started', { 
            subscription: event.subscription_name,
            value: event.value 
        });
    }

    /**
     * Track subscription renewal
     * @param {Object} data - Subscription renewal data
     */
    trackSubscriptionRenewed(data) {
        const event = {
            transaction_id: data.transactionId || this.#generateTransactionId(),
            currency: data.currency || this.#currency,
            value: parseFloat(data.price) || 0,
            subscription_id: data.subscriptionId,
            subscription_name: data.subscriptionName,
            renewal_count: data.renewalCount || 1,
            billing_period: data.billingPeriod,
            platform: this.#platform,
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.SUBSCRIPTION_RENEWED, event);
        this.#logger.info('Subscription renewed', { 
            subscription: event.subscription_name,
            renewalCount: event.renewal_count 
        });
    }

    /**
     * Track subscription cancellation
     * @param {Object} data - Subscription cancellation data
     */
    trackSubscriptionCancelled(data) {
        const event = {
            subscription_id: data.subscriptionId,
            subscription_name: data.subscriptionName,
            cancellation_reason: data.cancellationReason,
            cancellation_date: data.cancellationDate || new Date().toISOString(),
            was_trial: data.wasTrial || false,
            days_active: data.daysActive,
            platform: this.#platform,
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.SUBSCRIPTION_CANCELLED, event);
        this.#logger.info('Subscription cancelled', { 
            subscription: event.subscription_name,
            reason: event.cancellation_reason 
        });
    }

    /**
     * Track trial started
     * @param {Object} data - Trial start data
     */
    trackTrialStarted(data) {
        const event = {
            subscription_id: data.subscriptionId,
            subscription_name: data.subscriptionName,
            subscription_tier: data.subscriptionTier,
            trial_period: data.trialPeriod,
            trial_period_unit: data.trialPeriodUnit,
            regular_price: parseFloat(data.regularPrice) || 0,
            currency: data.currency || this.#currency,
            platform: this.#platform,
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.TRIAL_STARTED, event);
        this.#logger.info('Trial started', { 
            subscription: event.subscription_name,
            trialPeriod: `${event.trial_period} ${event.trial_period_unit}`
        });
    }

    /**
     * Track trial converted to paid
     * @param {Object} data - Trial conversion data
     */
    trackTrialConverted(data) {
        const event = {
            transaction_id: data.transactionId || this.#generateTransactionId(),
            currency: data.currency || this.#currency,
            value: parseFloat(data.price) || 0,
            subscription_id: data.subscriptionId,
            subscription_name: data.subscriptionName,
            trial_duration_days: data.trialDurationDays,
            platform: this.#platform,
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.TRIAL_CONVERTED, event);
        
        // Track as conversion for ads
        this.#trackConversion(event.value);

        this.#logger.info('Trial converted', { 
            subscription: event.subscription_name,
            value: event.value 
        });
    }

    /**
     * Track IAP product viewed
     * @param {Object} data - Product view data
     */
    trackProductViewed(data) {
        const event = {
            item_id: data.productId,
            item_name: data.productName,
            item_category: data.category || 'in_app_purchase',
            price: parseFloat(data.price) || 0,
            currency: data.currency || this.#currency,
            platform: this.#platform,
            user_id: data.userId
        };

        this.#sendEvent(IAPEventType.PRODUCT_VIEWED, event);
        this.#logger.debug('IAP product viewed', { 
            product: event.item_name 
        });
    }

    // Private methods

    /**
     * Detect platform
     * @private
     */
    #detectPlatform() {
        if (typeof navigator === 'undefined') return PlatformType.WEB;
        
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return PlatformType.IOS;
        } else if (/android/i.test(userAgent)) {
            return PlatformType.ANDROID;
        }
        
        return PlatformType.WEB;
    }

    /**
     * Get store name based on platform
     * @private
     */
    #getStoreName() {
        switch (this.#platform) {
            case PlatformType.IOS:
                return 'App Store';
            case PlatformType.ANDROID:
                return 'Google Play';
            default:
                return 'Web Store';
        }
    }

    /**
     * Generate unique transaction ID
     * @private
     */
    #generateTransactionId() {
        return `iap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
                timestamp: Date.now(),
                event_platform: this.#platform
            };

            // Send to GA4
            window.gtag('event', eventType, enrichedData);

            // Debug logging
            if (this.#debug) {
                this.#logger.debug('IAP event sent', {
                    type: eventType,
                    data: enrichedData
                });
            }
        } catch (error) {
            this.#logger.error('Failed to send IAP event', error);
        }
    }

    /**
     * Send as standard GA4 purchase event
     * @private
     */
    #sendPurchaseEvent(data) {
        if (typeof window === 'undefined' || !window.gtag) return;

        try {
            window.gtag('event', 'purchase', {
                transaction_id: data.transaction_id,
                currency: data.currency,
                value: data.value,
                tax: data.tax,
                items: [{
                    item_id: data.item_id,
                    item_name: data.item_name,
                    item_category: data.item_category,
                    price: data.value,
                    quantity: 1
                }]
            });
        } catch (error) {
            this.#logger.error('Failed to send purchase event', error);
        }
    }

    /**
     * Send GA4 subscription event
     * @private
     */
    #sendGA4SubscriptionEvent(eventType, data) {
        if (typeof window === 'undefined' || !window.gtag) return;

        try {
            window.gtag('event', eventType, {
                currency: data.currency,
                value: data.value,
                items: [{
                    item_id: data.subscription_id,
                    item_name: data.subscription_name,
                    item_category: 'subscription',
                    price: data.value,
                    quantity: 1
                }]
            });
        } catch (error) {
            this.#logger.error('Failed to send subscription event', error);
        }
    }

    /**
     * Track conversion for ads
     * @private
     */
    #trackConversion(value) {
        if (typeof window === 'undefined' || !window.gtag) return;

        try {
            window.gtag('event', 'conversion', {
                send_to: this.#measurementId,
                value: value,
                currency: this.#currency,
                transaction_id: this.#generateTransactionId()
            });
        } catch (error) {
            this.#logger.error('Failed to track conversion', error);
        }
    }

    /**
     * Set platform
     */
    setPlatform(platform) {
        if (Object.values(PlatformType).includes(platform)) {
            this.#platform = platform;
            this.#logger.info('Platform updated', { platform });
        }
    }

    /**
     * Enable debug mode
     */
    setDebugMode(enabled = true) {
        this.#debug = enabled;
        this.#logger.info('IAP debug mode', { enabled });
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
const inAppPurchaseAnalytics = new InAppPurchaseAnalytics();
export default inAppPurchaseAnalytics;

// Export convenience functions
export const trackIAPInitiated = (data) => inAppPurchaseAnalytics.trackIAPInitiated(data);
export const trackIAPCompleted = (data) => inAppPurchaseAnalytics.trackIAPCompleted(data);
export const trackIAPFailed = (data) => inAppPurchaseAnalytics.trackIAPFailed(data);
export const trackIAPCancelled = (data) => inAppPurchaseAnalytics.trackIAPCancelled(data);
export const trackSubscriptionStarted = (data) => inAppPurchaseAnalytics.trackSubscriptionStarted(data);
export const trackSubscriptionRenewed = (data) => inAppPurchaseAnalytics.trackSubscriptionRenewed(data);
export const trackSubscriptionCancelled = (data) => inAppPurchaseAnalytics.trackSubscriptionCancelled(data);
export const trackTrialStarted = (data) => inAppPurchaseAnalytics.trackTrialStarted(data);
export const trackTrialConverted = (data) => inAppPurchaseAnalytics.trackTrialConverted(data);

