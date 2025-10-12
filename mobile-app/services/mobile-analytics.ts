/**
 * Mobile Analytics Service for React Native
 * Google Engineering Standards Implementation
 * Complete GA4 tracking for iOS and Android apps
 *
 * @fileoverview Mobile analytics service with in-app purchase and ad revenue tracking
 * @author WeCr8 Solutions LLC
 * @version 3.0.0
 */

import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

/**
 * Analytics Event Types
 */
export const AnalyticsEventType = {
    // Ecommerce
    VIEW_ITEM: 'view_item',
    ADD_TO_CART: 'add_to_cart',
    BEGIN_CHECKOUT: 'begin_checkout',
    PURCHASE: 'purchase',
    
    // In-App Purchases
    IAP_INITIATED: 'iap_initiated',
    IAP_COMPLETED: 'iap_completed',
    IAP_FAILED: 'iap_failed',
    
    // Subscriptions
    SUBSCRIPTION_STARTED: 'subscription_started',
    SUBSCRIPTION_RENEWED: 'subscription_renewed',
    TRIAL_STARTED: 'trial_started',
    TRIAL_CONVERTED: 'trial_converted',
    
    // Ad Revenue
    AD_IMPRESSION: 'ad_impression',
    AD_CLICK: 'ad_click',
    REWARDED_AD_WATCHED: 'rewarded_ad_watched',
    
    // App Events
    APP_OPEN: 'app_open',
    SCREEN_VIEW: 'screen_view',
    USER_ENGAGEMENT: 'user_engagement'
};

/**
 * Mobile Analytics Class
 */
export class MobileAnalyticsService {
    private static instance: MobileAnalyticsService;
    private debug: boolean = false;
    private currency: string = 'USD';
    private userId: string | null = null;

    private constructor() {
        this.initialize();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): MobileAnalyticsService {
        if (!MobileAnalyticsService.instance) {
            MobileAnalyticsService.instance = new MobileAnalyticsService();
        }
        return MobileAnalyticsService.instance;
    }

    /**
     * Initialize analytics
     */
    private async initialize(): Promise<void> {
        try {
            // Enable analytics collection
            await analytics().setAnalyticsCollectionEnabled(true);
            
            // Set default event parameters
            await analytics().setDefaultEventParameters({
                platform: Platform.OS,
                app_version: '1.0.0', // Get from package.json or app config
            });

            console.log('✅ Mobile Analytics initialized');
        } catch (error) {
            console.error('❌ Failed to initialize analytics:', error);
        }
    }

    /**
     * Track screen view
     */
    public async trackScreenView(screenName: string, screenClass?: string): Promise<void> {
        try {
            await analytics().logScreenView({
                screen_name: screenName,
                screen_class: screenClass || screenName,
            });

            if (this.debug) {
                console.log('📊 Screen viewed:', screenName);
            }
        } catch (error) {
            console.error('Failed to track screen view:', error);
        }
    }

    /**
     * Track app open
     */
    public async trackAppOpen(): Promise<void> {
        try {
            await analytics().logAppOpen();
            
            if (this.debug) {
                console.log('📊 App opened');
            }
        } catch (error) {
            console.error('Failed to track app open:', error);
        }
    }

    /**
     * Track product view
     */
    public async trackViewItem(product: {
        itemId: string;
        itemName: string;
        price: number;
        category?: string;
        brand?: string;
    }): Promise<void> {
        try {
            await analytics().logViewItem({
                currency: this.currency,
                value: product.price,
                items: [
                    {
                        item_id: product.itemId,
                        item_name: product.itemName,
                        item_brand: product.brand || 'DAMP',
                        item_category: product.category || 'Smart Drinkware',
                        price: product.price,
                        quantity: 1,
                    },
                ],
            });

            if (this.debug) {
                console.log('📊 Item viewed:', product.itemName);
            }
        } catch (error) {
            console.error('Failed to track view item:', error);
        }
    }

    /**
     * Track add to cart
     */
    public async trackAddToCart(product: {
        itemId: string;
        itemName: string;
        price: number;
        quantity?: number;
        category?: string;
    }): Promise<void> {
        try {
            const quantity = product.quantity || 1;
            await analytics().logAddToCart({
                currency: this.currency,
                value: product.price * quantity,
                items: [
                    {
                        item_id: product.itemId,
                        item_name: product.itemName,
                        item_category: product.category || 'Smart Drinkware',
                        price: product.price,
                        quantity: quantity,
                    },
                ],
            });

            if (this.debug) {
                console.log('📊 Added to cart:', product.itemName);
            }
        } catch (error) {
            console.error('Failed to track add to cart:', error);
        }
    }

    /**
     * Track purchase completion
     */
    public async trackPurchase(data: {
        transactionId: string;
        value: number;
        tax?: number;
        shipping?: number;
        items: Array<{
            itemId: string;
            itemName: string;
            price: number;
            quantity: number;
            category?: string;
        }>;
    }): Promise<void> {
        try {
            await analytics().logPurchase({
                transaction_id: data.transactionId,
                currency: this.currency,
                value: data.value,
                tax: data.tax || 0,
                shipping: data.shipping || 0,
                items: data.items.map(item => ({
                    item_id: item.itemId,
                    item_name: item.itemName,
                    item_category: item.category || 'Smart Drinkware',
                    price: item.price,
                    quantity: item.quantity,
                })),
            });

            if (this.debug) {
                console.log('📊 Purchase completed:', data.transactionId, data.value);
            }
        } catch (error) {
            console.error('Failed to track purchase:', error);
        }
    }

    /**
     * Track in-app purchase (iOS/Android)
     */
    public async trackIAPPurchase(data: {
        productId: string;
        productName: string;
        price: number;
        transactionId: string;
        receiptToken?: string;
        platform: 'ios' | 'android';
    }): Promise<void> {
        try {
            // Track as both custom event and purchase
            await analytics().logEvent('iap_completed', {
                transaction_id: data.transactionId,
                currency: this.currency,
                value: data.price,
                item_id: data.productId,
                item_name: data.productName,
                platform: data.platform,
                store: data.platform === 'ios' ? 'App Store' : 'Google Play',
            });

            // Also log as standard purchase
            await analytics().logPurchase({
                transaction_id: data.transactionId,
                currency: this.currency,
                value: data.price,
                items: [
                    {
                        item_id: data.productId,
                        item_name: data.productName,
                        item_category: 'in_app_purchase',
                        price: data.price,
                        quantity: 1,
                    },
                ],
            });

            if (this.debug) {
                console.log('📊 IAP completed:', data.productName, data.price);
            }
        } catch (error) {
            console.error('Failed to track IAP purchase:', error);
        }
    }

    /**
     * Track subscription started
     */
    public async trackSubscriptionStarted(data: {
        subscriptionId: string;
        subscriptionName: string;
        price: number;
        billingPeriod: string;
        trialPeriod?: number;
    }): Promise<void> {
        try {
            await analytics().logEvent('subscription_started', {
                subscription_id: data.subscriptionId,
                subscription_name: data.subscriptionName,
                currency: this.currency,
                value: data.price,
                billing_period: data.billingPeriod,
                trial_period: data.trialPeriod || 0,
            });

            if (this.debug) {
                console.log('📊 Subscription started:', data.subscriptionName);
            }
        } catch (error) {
            console.error('Failed to track subscription:', error);
        }
    }

    /**
     * Track ad revenue (AdMob)
     */
    public async trackAdRevenue(data: {
        adPlatform: string;
        adFormat: string;
        adUnitName: string;
        value: number;
        currency?: string;
        precisionType?: string;
    }): Promise<void> {
        try {
            await analytics().logAdImpression({
                ad_platform: data.adPlatform,
                ad_format: data.adFormat,
                ad_unit_name: data.adUnitName,
                currency: data.currency || this.currency,
                value: data.value,
                precision_type: data.precisionType || 'estimated',
            });

            if (this.debug) {
                console.log('📊 Ad revenue:', data.value, data.adFormat);
            }
        } catch (error) {
            console.error('Failed to track ad revenue:', error);
        }
    }

    /**
     * Track AdMob revenue (specific helper for AdMob)
     */
    public async trackAdMobRevenue(
        adValue: { value: number; currencyCode: string; precision: number },
        adUnitName: string,
        adFormat: string
    ): Promise<void> {
        const precisionMap: { [key: number]: string } = {
            0: 'unknown',
            1: 'estimated',
            2: 'publisher_defined',
            3: 'precise',
        };

        await this.trackAdRevenue({
            adPlatform: 'AdMob',
            adFormat: adFormat,
            adUnitName: adUnitName,
            value: adValue.value / 1000000, // AdMob returns micros
            currency: adValue.currencyCode,
            precisionType: precisionMap[adValue.precision] || 'estimated',
        });
    }

    /**
     * Track rewarded ad watched
     */
    public async trackRewardedAdWatched(data: {
        adPlatform: string;
        adUnitName: string;
        rewardType: string;
        rewardAmount: number;
        value?: number;
    }): Promise<void> {
        try {
            await analytics().logEvent('rewarded_ad_watched', {
                ad_platform: data.adPlatform,
                ad_unit_name: data.adUnitName,
                reward_type: data.rewardType,
                reward_amount: data.rewardAmount,
                currency: this.currency,
                value: data.value || 0,
            });

            if (this.debug) {
                console.log('📊 Rewarded ad watched:', data.rewardType, data.rewardAmount);
            }
        } catch (error) {
            console.error('Failed to track rewarded ad:', error);
        }
    }

    /**
     * Track custom event
     */
    public async trackCustomEvent(
        eventName: string,
        parameters?: { [key: string]: any }
    ): Promise<void> {
        try {
            await analytics().logEvent(eventName, parameters);

            if (this.debug) {
                console.log('📊 Custom event:', eventName, parameters);
            }
        } catch (error) {
            console.error('Failed to track custom event:', error);
        }
    }

    /**
     * Set user ID
     */
    public async setUserId(userId: string | null): Promise<void> {
        try {
            await analytics().setUserId(userId);
            this.userId = userId;

            if (this.debug) {
                console.log('📊 User ID set:', userId);
            }
        } catch (error) {
            console.error('Failed to set user ID:', error);
        }
    }

    /**
     * Set user properties
     */
    public async setUserProperties(properties: { [key: string]: string }): Promise<void> {
        try {
            for (const [key, value] of Object.entries(properties)) {
                await analytics().setUserProperty(key, value);
            }

            if (this.debug) {
                console.log('📊 User properties set:', properties);
            }
        } catch (error) {
            console.error('Failed to set user properties:', error);
        }
    }

    /**
     * Enable debug mode
     */
    public setDebugMode(enabled: boolean): void {
        this.debug = enabled;
        console.log('📊 Analytics debug mode:', enabled);
    }

    /**
     * Set currency
     */
    public setCurrency(currency: string): void {
        this.currency = currency;
        console.log('📊 Currency set:', currency);
    }

    /**
     * Reset analytics data
     */
    public async resetAnalyticsData(): Promise<void> {
        try {
            await analytics().resetAnalyticsData();
            console.log('📊 Analytics data reset');
        } catch (error) {
            console.error('Failed to reset analytics data:', error);
        }
    }
}

// Export singleton instance
export const mobileAnalytics = MobileAnalyticsService.getInstance();

// Export convenience functions
export const trackScreenView = (screenName: string, screenClass?: string) =>
    mobileAnalytics.trackScreenView(screenName, screenClass);

export const trackAppOpen = () => mobileAnalytics.trackAppOpen();

export const trackViewItem = (product: any) => mobileAnalytics.trackViewItem(product);

export const trackAddToCart = (product: any) => mobileAnalytics.trackAddToCart(product);

export const trackPurchase = (data: any) => mobileAnalytics.trackPurchase(data);

export const trackIAPPurchase = (data: any) => mobileAnalytics.trackIAPPurchase(data);

export const trackSubscriptionStarted = (data: any) =>
    mobileAnalytics.trackSubscriptionStarted(data);

export const trackAdRevenue = (data: any) => mobileAnalytics.trackAdRevenue(data);

export const trackAdMobRevenue = (adValue: any, adUnitName: string, adFormat: string) =>
    mobileAnalytics.trackAdMobRevenue(adValue, adUnitName, adFormat);

export const trackRewardedAdWatched = (data: any) => mobileAnalytics.trackRewardedAdWatched(data);

export const trackCustomEvent = (eventName: string, parameters?: any) =>
    mobileAnalytics.trackCustomEvent(eventName, parameters);

export const setUserId = (userId: string | null) => mobileAnalytics.setUserId(userId);

export const setUserProperties = (properties: { [key: string]: string }) =>
    mobileAnalytics.setUserProperties(properties);

export default mobileAnalytics;

