/**
 * Enhanced Ecommerce Analytics Module for GA4
 * Google Engineering Standards Implementation
 * Complete GA4 Ecommerce Event Tracking
 *
 * @fileoverview Enhanced ecommerce tracking with all GA4 recommended events
 * @author WeCr8 Solutions LLC
 * @version 3.0.0
 */

import { Logger } from '../store/utils/logger.js';

/**
 * GA4 Ecommerce Event Types
 * https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 */
export const EcommerceEventType = {
    // Product Discovery
    VIEW_ITEM_LIST: 'view_item_list',
    VIEW_ITEM: 'view_item',
    SELECT_ITEM: 'select_item',
    VIEW_PROMOTION: 'view_promotion',
    SELECT_PROMOTION: 'select_promotion',

    // Cart Management
    ADD_TO_CART: 'add_to_cart',
    REMOVE_FROM_CART: 'remove_from_cart',
    VIEW_CART: 'view_cart',

    // Checkout Process
    BEGIN_CHECKOUT: 'begin_checkout',
    ADD_SHIPPING_INFO: 'add_shipping_info',
    ADD_PAYMENT_INFO: 'add_payment_info',

    // Purchase
    PURCHASE: 'purchase',
    REFUND: 'refund',

    // Wishlist & Comparison
    ADD_TO_WISHLIST: 'add_to_wishlist',

    // Product Reviews
    PRODUCT_REVIEW: 'product_review'
};

/**
 * Enhanced Ecommerce Analytics Class
 * Implements all GA4 recommended ecommerce events
 */
export class EnhancedEcommerceAnalytics {
    #logger = null;
    #debug = false;
    #currency = 'USD';
    #measurementId = null;

    constructor(config = {}) {
        this.#logger = new Logger('EnhancedEcommerce');
        this.#debug = config.debug || false;
        this.#currency = config.currency || 'USD';
        this.#measurementId = config.measurementId || 'G-YW2BN4SVPQ';
    }

    /**
     * Track when user views a list of products
     * @param {Object} data - View item list data
     */
    trackViewItemList(data) {
        const event = {
            item_list_id: data.listId || 'product_list',
            item_list_name: data.listName || 'Products',
            items: this.#formatItems(data.items || [])
        };

        this.#sendEvent(EcommerceEventType.VIEW_ITEM_LIST, event);
        this.#logger.info('Item list viewed', { listName: event.item_list_name, items: event.items.length });
    }

    /**
     * Track when user views a single product
     * @param {Object} data - View item data
     */
    trackViewItem(data) {
        const event = {
            currency: this.#currency,
            value: data.value || data.price || 0,
            items: this.#formatItems([data.item || data])
        };

        this.#sendEvent(EcommerceEventType.VIEW_ITEM, event);
        this.#logger.info('Item viewed', { item: event.items[0]?.item_name });
    }

    /**
     * Track when user selects an item from a list
     * @param {Object} data - Select item data
     */
    trackSelectItem(data) {
        const event = {
            item_list_id: data.listId || 'product_list',
            item_list_name: data.listName || 'Products',
            items: this.#formatItems([data.item || data])
        };

        this.#sendEvent(EcommerceEventType.SELECT_ITEM, event);
        this.#logger.info('Item selected', { item: event.items[0]?.item_name });
    }

    /**
     * Track when user views a promotion
     * @param {Object} data - View promotion data
     */
    trackViewPromotion(data) {
        const event = {
            creative_name: data.creativeName,
            creative_slot: data.creativeSlot,
            promotion_id: data.promotionId,
            promotion_name: data.promotionName,
            items: data.items ? this.#formatItems(data.items) : []
        };

        this.#sendEvent(EcommerceEventType.VIEW_PROMOTION, event);
        this.#logger.info('Promotion viewed', { promotion: event.promotion_name });
    }

    /**
     * Track when user selects a promotion
     * @param {Object} data - Select promotion data
     */
    trackSelectPromotion(data) {
        const event = {
            creative_name: data.creativeName,
            creative_slot: data.creativeSlot,
            promotion_id: data.promotionId,
            promotion_name: data.promotionName,
            items: data.items ? this.#formatItems(data.items) : []
        };

        this.#sendEvent(EcommerceEventType.SELECT_PROMOTION, event);
        this.#logger.info('Promotion selected', { promotion: event.promotion_name });
    }

    /**
     * Track when user adds item to cart
     * @param {Object} data - Add to cart data
     */
    trackAddToCart(data) {
        const event = {
            currency: this.#currency,
            value: data.value || (data.item?.price * data.item?.quantity) || 0,
            items: this.#formatItems([data.item || data])
        };

        this.#sendEvent(EcommerceEventType.ADD_TO_CART, event);
        this.#logger.info('Item added to cart', { 
            item: event.items[0]?.item_name, 
            value: event.value 
        });
    }

    /**
     * Track when user removes item from cart
     * @param {Object} data - Remove from cart data
     */
    trackRemoveFromCart(data) {
        const event = {
            currency: this.#currency,
            value: data.value || (data.item?.price * data.item?.quantity) || 0,
            items: this.#formatItems([data.item || data])
        };

        this.#sendEvent(EcommerceEventType.REMOVE_FROM_CART, event);
        this.#logger.info('Item removed from cart', { 
            item: event.items[0]?.item_name 
        });
    }

    /**
     * Track when user views their cart
     * @param {Object} data - View cart data
     */
    trackViewCart(data) {
        const event = {
            currency: this.#currency,
            value: data.value || this.#calculateCartValue(data.items),
            items: this.#formatItems(data.items || [])
        };

        this.#sendEvent(EcommerceEventType.VIEW_CART, event);
        this.#logger.info('Cart viewed', { 
            itemCount: event.items.length, 
            value: event.value 
        });
    }

    /**
     * Track when user begins checkout
     * @param {Object} data - Begin checkout data
     */
    trackBeginCheckout(data) {
        const event = {
            currency: this.#currency,
            value: data.value || this.#calculateCartValue(data.items),
            coupon: data.coupon,
            items: this.#formatItems(data.items || [])
        };

        this.#sendEvent(EcommerceEventType.BEGIN_CHECKOUT, event);
        this.#logger.info('Checkout began', { 
            itemCount: event.items.length, 
            value: event.value 
        });
    }

    /**
     * Track when user adds shipping information
     * @param {Object} data - Shipping info data
     */
    trackAddShippingInfo(data) {
        const event = {
            currency: this.#currency,
            value: data.value || this.#calculateCartValue(data.items),
            coupon: data.coupon,
            shipping_tier: data.shippingTier,
            items: this.#formatItems(data.items || [])
        };

        this.#sendEvent(EcommerceEventType.ADD_SHIPPING_INFO, event);
        this.#logger.info('Shipping info added', { 
            shippingTier: event.shipping_tier 
        });
    }

    /**
     * Track when user adds payment information
     * @param {Object} data - Payment info data
     */
    trackAddPaymentInfo(data) {
        const event = {
            currency: this.#currency,
            value: data.value || this.#calculateCartValue(data.items),
            coupon: data.coupon,
            payment_type: data.paymentType,
            items: this.#formatItems(data.items || [])
        };

        this.#sendEvent(EcommerceEventType.ADD_PAYMENT_INFO, event);
        this.#logger.info('Payment info added', { 
            paymentType: event.payment_type 
        });
    }

    /**
     * Track purchase completion
     * @param {Object} data - Purchase data
     */
    trackPurchase(data) {
        const event = {
            transaction_id: data.transactionId || this.#generateTransactionId(),
            affiliation: data.affiliation || 'DAMP Smart Drinkware',
            currency: this.#currency,
            value: data.value || this.#calculateCartValue(data.items),
            tax: data.tax || 0,
            shipping: data.shipping || 0,
            coupon: data.coupon,
            items: this.#formatItems(data.items || [])
        };

        this.#sendEvent(EcommerceEventType.PURCHASE, event);
        this.#logger.info('Purchase completed', { 
            transactionId: event.transaction_id,
            value: event.value,
            itemCount: event.items.length
        });

        // Track conversion value
        this.#trackConversionValue(event.value);
    }

    /**
     * Track refund
     * @param {Object} data - Refund data
     */
    trackRefund(data) {
        const event = {
            transaction_id: data.transactionId,
            currency: this.#currency,
            value: data.value,
            affiliation: data.affiliation || 'DAMP Smart Drinkware',
            items: data.items ? this.#formatItems(data.items) : []
        };

        this.#sendEvent(EcommerceEventType.REFUND, event);
        this.#logger.info('Refund processed', { 
            transactionId: event.transaction_id,
            value: event.value 
        });
    }

    /**
     * Track add to wishlist
     * @param {Object} data - Wishlist data
     */
    trackAddToWishlist(data) {
        const event = {
            currency: this.#currency,
            value: data.value || data.item?.price || 0,
            items: this.#formatItems([data.item || data])
        };

        this.#sendEvent(EcommerceEventType.ADD_TO_WISHLIST, event);
        this.#logger.info('Item added to wishlist', { 
            item: event.items[0]?.item_name 
        });
    }

    /**
     * Track product review
     * @param {Object} data - Review data
     */
    trackProductReview(data) {
        const event = {
            item_id: data.itemId,
            item_name: data.itemName,
            rating: data.rating,
            review_text: data.reviewText?.substring(0, 100), // Truncate for privacy
            verified_purchase: data.verifiedPurchase || false
        };

        this.#sendEvent(EcommerceEventType.PRODUCT_REVIEW, event);
        this.#logger.info('Product review submitted', { 
            item: event.item_name,
            rating: event.rating 
        });
    }

    // Private methods

    /**
     * Format items array according to GA4 spec
     * @private
     */
    #formatItems(items) {
        return items.map((item, index) => ({
            item_id: item.itemId || item.id || item.sku || `item_${index}`,
            item_name: item.itemName || item.name || item.title || 'Unknown Product',
            affiliation: item.affiliation || 'DAMP Smart Drinkware',
            coupon: item.coupon,
            currency: this.#currency,
            discount: item.discount || 0,
            index: item.index ?? index,
            item_brand: item.itemBrand || item.brand || 'DAMP',
            item_category: item.itemCategory || item.category || 'Smart Drinkware',
            item_category2: item.itemCategory2 || item.subcategory,
            item_category3: item.itemCategory3,
            item_category4: item.itemCategory4,
            item_category5: item.itemCategory5,
            item_list_id: item.itemListId || item.listId,
            item_list_name: item.itemListName || item.listName,
            item_variant: item.itemVariant || item.variant || item.color || item.size,
            location_id: item.locationId,
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1
        }));
    }

    /**
     * Calculate total cart value
     * @private
     */
    #calculateCartValue(items) {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            const discount = parseFloat(item.discount) || 0;
            return total + ((price * quantity) - discount);
        }, 0);
    }

    /**
     * Generate unique transaction ID
     * @private
     */
    #generateTransactionId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
            // Send to GA4
            window.gtag('event', eventType, eventData);

            // Debug logging
            if (this.#debug) {
                this.#logger.debug('Ecommerce event sent', {
                    type: eventType,
                    data: eventData
                });
            }
        } catch (error) {
            this.#logger.error('Failed to send ecommerce event', error);
        }
    }

    /**
     * Track conversion value for ads
     * @private
     */
    #trackConversionValue(value) {
        if (typeof window === 'undefined' || !window.gtag) return;

        try {
            // Track conversion for Google Ads
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
     * Enable debug mode
     */
    setDebugMode(enabled = true) {
        this.#debug = enabled;
        this.#logger.info('Enhanced ecommerce debug mode', { enabled });
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
const enhancedEcommerce = new EnhancedEcommerceAnalytics();
export default enhancedEcommerce;

// Export convenience functions
export const trackViewItemList = (data) => enhancedEcommerce.trackViewItemList(data);
export const trackViewItem = (data) => enhancedEcommerce.trackViewItem(data);
export const trackSelectItem = (data) => enhancedEcommerce.trackSelectItem(data);
export const trackAddToCart = (data) => enhancedEcommerce.trackAddToCart(data);
export const trackRemoveFromCart = (data) => enhancedEcommerce.trackRemoveFromCart(data);
export const trackViewCart = (data) => enhancedEcommerce.trackViewCart(data);
export const trackBeginCheckout = (data) => enhancedEcommerce.trackBeginCheckout(data);
export const trackAddShippingInfo = (data) => enhancedEcommerce.trackAddShippingInfo(data);
export const trackAddPaymentInfo = (data) => enhancedEcommerce.trackAddPaymentInfo(data);
export const trackPurchase = (data) => enhancedEcommerce.trackPurchase(data);
export const trackRefund = (data) => enhancedEcommerce.trackRefund(data);
export const trackAddToWishlist = (data) => enhancedEcommerce.trackAddToWishlist(data);
export const trackViewPromotion = (data) => enhancedEcommerce.trackViewPromotion(data);
export const trackSelectPromotion = (data) => enhancedEcommerce.trackSelectPromotion(data);

