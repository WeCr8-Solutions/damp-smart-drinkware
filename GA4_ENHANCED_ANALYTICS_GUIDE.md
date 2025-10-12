# GA4 Enhanced Analytics Implementation Guide
## Complete Ecommerce, In-App Purchases & Ad Revenue Tracking

**Version:** 3.0.0  
**Last Updated:** October 12, 2025  
**Author:** WeCr8 Solutions LLC

---

## 📊 Overview

This comprehensive analytics implementation provides complete tracking for:

✅ **Enhanced Ecommerce** - All GA4 recommended events  
✅ **In-App Purchases** - iOS & Android purchase tracking  
✅ **Ad Revenue** - AdMob, AdSense, and other ad networks  
✅ **Subscriptions** - Trial, renewal, and cancellation tracking  
✅ **Mobile Analytics** - React Native Firebase integration  

---

## 🎯 What's Included

### New Modules

1. **`enhanced-ecommerce.js`** - Complete GA4 ecommerce event tracking
2. **`in-app-purchase-tracking.js`** - IAP and subscription tracking
3. **`ad-revenue-tracking.js`** - Ad monetization tracking
4. **`mobile-analytics.ts`** - React Native analytics service
5. **Updated `damp-analytics.js`** - Integrated all tracking modules
6. **Updated `cart.js`** - Enhanced ecommerce tracking in cart

---

## 🚀 Quick Start

### For Web Applications

```javascript
// Import the analytics service
import dampAnalytics from './assets/js/analytics/damp-analytics.js';

// Initialize (happens automatically on page load)
// Or manually:
await dampAnalytics.initialize();

// Access enhanced ecommerce tracking
dampAnalytics.ecommerce.trackViewItem({
  itemId: 'damp-handle-v1',
  itemName: 'DAMP Handle V1.0',
  price: 49.99,
  category: 'Smart Drinkware'
});

// Access in-app purchase tracking
dampAnalytics.iap.trackIAPCompleted({
  productId: 'premium_subscription',
  productName: 'Premium Subscription',
  price: 9.99,
  transactionId: 'txn_12345'
});

// Access ad revenue tracking
dampAnalytics.adRevenue.trackAdRevenue({
  adPlatform: 'AdMob',
  adFormat: 'banner',
  adUnitName: 'home_banner',
  value: 0.05
});
```

### For React Native Mobile Apps

```typescript
// Import the mobile analytics service
import { mobileAnalytics } from './services/mobile-analytics';

// Initialize (happens automatically)
// Track screen view
await mobileAnalytics.trackScreenView('Home');

// Track in-app purchase
await mobileAnalytics.trackIAPPurchase({
  productId: 'premium_monthly',
  productName: 'Premium Monthly',
  price: 9.99,
  transactionId: 'txn_12345',
  platform: 'ios'
});

// Track AdMob revenue
await mobileAnalytics.trackAdMobRevenue(
  adValue, // AdValue object from AdMob
  'home_banner',
  'banner'
);
```

---

## 📦 Enhanced Ecommerce Events

All GA4 recommended ecommerce events are implemented:

### Product Discovery

```javascript
import { 
  trackViewItemList, 
  trackViewItem, 
  trackSelectItem 
} from './assets/js/analytics/enhanced-ecommerce.js';

// Track product list view
trackViewItemList({
  listId: 'featured_products',
  listName: 'Featured Products',
  items: [
    {
      itemId: 'damp-handle-v1',
      itemName: 'DAMP Handle V1.0',
      price: 49.99,
      category: 'Smart Drinkware'
    }
  ]
});

// Track product view
trackViewItem({
  itemId: 'damp-handle-v1',
  itemName: 'DAMP Handle V1.0',
  price: 49.99,
  value: 49.99,
  category: 'Smart Drinkware'
});

// Track item selection from list
trackSelectItem({
  listId: 'featured_products',
  listName: 'Featured Products',
  item: {
    itemId: 'damp-handle-v1',
    itemName: 'DAMP Handle V1.0',
    price: 49.99
  }
});
```

### Cart Management

```javascript
import { 
  trackAddToCart, 
  trackRemoveFromCart, 
  trackViewCart 
} from './assets/js/analytics/enhanced-ecommerce.js';

// Track add to cart
trackAddToCart({
  value: 49.99,
  item: {
    itemId: 'damp-handle-v1',
    itemName: 'DAMP Handle V1.0',
    price: 49.99,
    quantity: 1,
    category: 'Smart Drinkware'
  }
});

// Track remove from cart
trackRemoveFromCart({
  value: 49.99,
  item: {
    itemId: 'damp-handle-v1',
    itemName: 'DAMP Handle V1.0',
    price: 49.99,
    quantity: 1
  }
});

// Track cart view
trackViewCart({
  value: 149.97,
  items: [
    {
      itemId: 'damp-handle-v1',
      itemName: 'DAMP Handle V1.0',
      price: 49.99,
      quantity: 3
    }
  ]
});
```

### Checkout Process

```javascript
import { 
  trackBeginCheckout, 
  trackAddShippingInfo, 
  trackAddPaymentInfo,
  trackPurchase 
} from './assets/js/analytics/enhanced-ecommerce.js';

// Track checkout start
trackBeginCheckout({
  value: 149.97,
  items: [/* cart items */],
  coupon: 'EARLY20'
});

// Track shipping info added
trackAddShippingInfo({
  value: 149.97,
  items: [/* cart items */],
  shippingTier: 'Standard Shipping'
});

// Track payment info added
trackAddPaymentInfo({
  value: 149.97,
  items: [/* cart items */],
  paymentType: 'Credit Card'
});

// Track purchase
trackPurchase({
  transactionId: 'txn_12345',
  value: 149.97,
  tax: 11.99,
  shipping: 9.99,
  coupon: 'EARLY20',
  items: [
    {
      itemId: 'damp-handle-v1',
      itemName: 'DAMP Handle V1.0',
      price: 49.99,
      quantity: 3,
      category: 'Smart Drinkware'
    }
  ]
});
```

### Promotions

```javascript
import { 
  trackViewPromotion, 
  trackSelectPromotion 
} from './assets/js/analytics/enhanced-ecommerce.js';

// Track promotion view
trackViewPromotion({
  promotionId: 'early_bird_2025',
  promotionName: 'Early Bird Sale 2025',
  creativeName: 'banner_hero',
  creativeSlot: 'hero_section'
});

// Track promotion click
trackSelectPromotion({
  promotionId: 'early_bird_2025',
  promotionName: 'Early Bird Sale 2025',
  creativeName: 'banner_hero',
  creativeSlot: 'hero_section'
});
```

---

## 💰 In-App Purchase Tracking

### iOS & Android Purchases

```javascript
import { 
  trackIAPInitiated,
  trackIAPCompleted,
  trackIAPFailed,
  trackIAPCancelled
} from './assets/js/analytics/in-app-purchase-tracking.js';

// Track purchase initiation
trackIAPInitiated({
  productId: 'premium_monthly',
  productName: 'Premium Monthly Subscription',
  price: 9.99,
  category: 'subscription',
  userId: 'user_12345'
});

// Track successful purchase
trackIAPCompleted({
  productId: 'premium_monthly',
  productName: 'Premium Monthly Subscription',
  price: 9.99,
  transactionId: 'txn_12345',
  receiptToken: 'receipt_token_here',
  isSandbox: false,
  userId: 'user_12345'
});

// Track failed purchase
trackIAPFailed({
  productId: 'premium_monthly',
  productName: 'Premium Monthly Subscription',
  errorCode: 'E_PAYMENT_DECLINED',
  errorMessage: 'Payment method declined',
  failureReason: 'insufficient_funds'
});

// Track cancelled purchase
trackIAPCancelled({
  productId: 'premium_monthly',
  productName: 'Premium Monthly Subscription',
  cancellationStep: 'payment_confirmation'
});
```

### Subscription Tracking

```javascript
import { 
  trackSubscriptionStarted,
  trackSubscriptionRenewed,
  trackSubscriptionCancelled,
  trackTrialStarted,
  trackTrialConverted
} from './assets/js/analytics/in-app-purchase-tracking.js';

// Track subscription start
trackSubscriptionStarted({
  subscriptionId: 'sub_12345',
  subscriptionName: 'Premium Monthly',
  subscriptionTier: 'premium',
  price: 9.99,
  billingPeriod: 'monthly',
  trialPeriod: 7,
  trialPeriodUnit: 'days'
});

// Track trial start
trackTrialStarted({
  subscriptionId: 'sub_12345',
  subscriptionName: 'Premium Monthly',
  trialPeriod: 7,
  trialPeriodUnit: 'days',
  regularPrice: 9.99
});

// Track trial conversion
trackTrialConverted({
  subscriptionId: 'sub_12345',
  subscriptionName: 'Premium Monthly',
  price: 9.99,
  trialDurationDays: 7,
  transactionId: 'txn_12345'
});

// Track subscription renewal
trackSubscriptionRenewed({
  subscriptionId: 'sub_12345',
  subscriptionName: 'Premium Monthly',
  price: 9.99,
  renewalCount: 3,
  billingPeriod: 'monthly',
  transactionId: 'txn_12346'
});

// Track subscription cancellation
trackSubscriptionCancelled({
  subscriptionId: 'sub_12345',
  subscriptionName: 'Premium Monthly',
  cancellationReason: 'too_expensive',
  wasTrial: false,
  daysActive: 90
});
```

---

## 📱 Ad Revenue Tracking

### AdMob Integration

```javascript
import { 
  trackAdMobRevenue,
  trackRewardedAdWatched
} from './assets/js/analytics/ad-revenue-tracking.js';

// Track AdMob revenue (automatically tracks ad_impression)
// AdValue object comes from AdMob SDK
trackAdMobRevenue(
  adValue, // { value: 50000, currencyCode: 'USD', precision: 2 }
  'home_banner',
  'banner'
);

// Track rewarded ad
trackRewardedAdWatched({
  adPlatform: 'AdMob',
  adUnitName: 'rewarded_video_1',
  rewardType: 'coins',
  rewardAmount: 100,
  value: 0.10
});
```

### AdSense Integration

```javascript
import { trackAdSenseRevenue } from './assets/js/analytics/ad-revenue-tracking.js';

// Track AdSense revenue
trackAdSenseRevenue({
  estimatedRevenue: 0.05,
  currency: 'USD',
  adUnitName: 'article_inline_1',
  adSlot: 'ca-pub-1234567890'
});
```

### Generic Ad Tracking

```javascript
import { 
  trackAdImpression,
  trackAdClick,
  trackAdRevenue
} from './assets/js/analytics/ad-revenue-tracking.js';

// Track ad impression
trackAdImpression({
  adPlatform: 'Facebook',
  adFormat: 'banner',
  adUnitName: 'footer_banner',
  value: 0.03
});

// Track ad click
trackAdClick({
  adPlatform: 'Facebook',
  adFormat: 'banner',
  adUnitName: 'footer_banner'
});

// Track ad revenue (custom network)
trackAdRevenue({
  adPlatform: 'Custom Network',
  adFormat: 'native',
  adUnitName: 'feed_native_1',
  value: 0.08,
  precisionType: 'estimated'
});
```

### Cumulative Revenue Tracking

```javascript
import { getCumulativeAdRevenue } from './assets/js/analytics/ad-revenue-tracking.js';

// Get total ad revenue tracked
const totalRevenue = getCumulativeAdRevenue();
console.log(`Total ad revenue: $${totalRevenue.toFixed(2)}`);
```

---

## 📱 React Native Mobile Implementation

### Setup

1. Install dependencies:
```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

2. Configure Firebase in your app (iOS & Android)

3. Import the mobile analytics service:
```typescript
import mobileAnalytics from './services/mobile-analytics';
```

### Usage Examples

```typescript
import { 
  trackScreenView,
  trackViewItem,
  trackAddToCart,
  trackPurchase,
  trackIAPPurchase,
  trackAdMobRevenue,
  setUserId
} from './services/mobile-analytics';

// Track screen navigation
await trackScreenView('ProductDetails', 'ProductDetailsScreen');

// Track product view
await trackViewItem({
  itemId: 'damp-handle-v1',
  itemName: 'DAMP Handle V1.0',
  price: 49.99,
  category: 'Smart Drinkware',
  brand: 'DAMP'
});

// Track add to cart
await trackAddToCart({
  itemId: 'damp-handle-v1',
  itemName: 'DAMP Handle V1.0',
  price: 49.99,
  quantity: 1
});

// Track in-app purchase
await trackIAPPurchase({
  productId: 'premium_monthly',
  productName: 'Premium Monthly',
  price: 9.99,
  transactionId: 'txn_12345',
  receiptToken: 'receipt_token',
  platform: Platform.OS === 'ios' ? 'ios' : 'android'
});

// Track AdMob revenue (in your AdMob callback)
rewardedAd.addAdEventListener(RewardedAdEventType.PAID, (event) => {
  trackAdMobRevenue(
    event.value, // AdValue object
    'rewarded_video_1',
    'rewarded'
  );
});

// Set user ID
await setUserId('user_12345');
```

---

## 🔧 Configuration

### Enable Debug Mode

```javascript
// Web
dampAnalytics.ecommerce.setDebugMode(true);
dampAnalytics.iap.setDebugMode(true);
dampAnalytics.adRevenue.setDebugMode(true);

// Or set in localStorage
localStorage.setItem('dampDebug', 'true');

// Mobile
mobileAnalytics.setDebugMode(true);
```

### Set Currency

```javascript
// Web
dampAnalytics.ecommerce.setCurrency('EUR');
dampAnalytics.iap.setCurrency('EUR');
dampAnalytics.adRevenue.setCurrency('EUR');

// Mobile
mobileAnalytics.setCurrency('EUR');
```

### Set Platform (for web IAP tracking)

```javascript
dampAnalytics.iap.setPlatform('ios'); // or 'android' or 'web'
```

---

## 📊 GA4 Setup

### 1. Enable Enhanced Measurement

In GA4 Property Settings:
- Enable Enhanced Measurement
- Enable Page views, Scrolls, Outbound clicks, Site search, Video engagement, File downloads

### 2. Enable Ecommerce

In GA4 Property Settings:
- Go to Admin > Data Streams > Web
- Enable Enhanced Measurement
- Enable Ecommerce

### 3. Configure Custom Dimensions (Optional)

Create custom dimensions for:
- `platform` (ios, android, web)
- `subscription_tier` (free, premium, enterprise)
- `ad_network` (AdMob, AdSense, etc.)
- `user_type` (new, returning, premium)

### 4. Set Up Conversions

Mark these events as conversions:
- `purchase`
- `iap_completed`
- `subscription_started`
- `trial_converted`

### 5. Enable Google Ads Linking (Optional)

For conversion tracking:
- Link GA4 to Google Ads
- Import conversions from GA4

---

## 📈 Viewing Your Data

### GA4 Reports

1. **Ecommerce Reports**
   - Monetization > Ecommerce purchases
   - Monetization > Item promotions
   - Monetization > Purchase journey

2. **In-App Purchase Reports**
   - Life Cycle > Monetization > Overview
   - Custom reports with IAP events

3. **Ad Revenue Reports**
   - Life Cycle > Monetization > Publisher ads (built-in)
   - Custom exploration with `ad_impression` events

4. **User Lifetime Value (LTV)**
   - Life Cycle > Monetization > User lifetime value
   - Shows combined ecommerce + IAP + ad revenue

### Custom Explorations

Create custom explorations for:
- Purchase funnel analysis
- Subscription cohort analysis
- Ad revenue by format/network
- Product performance analysis

---

## 🔍 Testing & Debugging

### Web Testing

1. Open Chrome DevTools > Network tab
2. Filter by `google-analytics.com` or `gtag`
3. Enable debug mode:
   ```javascript
   localStorage.setItem('dampDebug', 'true');
   ```
4. Check console for analytics events

### Mobile Testing

1. Use Firebase DebugView in GA4:
   ```bash
   # iOS
   adb shell setprop debug.firebase.analytics.app com.dampdrinkware
   
   # Android
   adb shell setprop debug.firebase.analytics.app com.dampdrinkware
   ```

2. Enable debug mode:
   ```typescript
   mobileAnalytics.setDebugMode(true);
   ```

3. Check Xcode/Android Studio console

---

## 🎯 Best Practices

### 1. Track All Steps of Purchase Funnel

```javascript
// Product page
trackViewItem(product);

// Add to cart
trackAddToCart(product);

// Cart page
trackViewCart(cartItems);

// Checkout start
trackBeginCheckout(cartItems);

// Shipping info
trackAddShippingInfo(cartItems);

// Payment info
trackAddPaymentInfo(cartItems);

// Purchase complete
trackPurchase(orderData);
```

### 2. Use Consistent Product IDs

Always use the same product ID across all events:
```javascript
const product = {
  itemId: 'damp-handle-v1', // Use consistently
  itemName: 'DAMP Handle V1.0',
  // ... other properties
};
```

### 3. Track Revenue Accurately

Always include:
- `value` (total value)
- `currency` (USD, EUR, etc.)
- `transaction_id` (unique per transaction)

### 4. Set User Properties

```javascript
// Web
setUserProperties({
  subscription_tier: 'premium',
  account_age_days: '30',
  preferred_category: 'Smart Drinkware'
});

// Mobile
setUserProperties({
  subscription_tier: 'premium',
  platform: Platform.OS
});
```

### 5. Handle Errors Gracefully

All tracking functions are wrapped in try-catch blocks, but you can add additional error handling:

```javascript
try {
  trackPurchase(orderData);
} catch (error) {
  console.error('Analytics error:', error);
  // Send to error tracking service
  trackError(error, { context: 'purchase_tracking' });
}
```

---

## 🚨 Common Issues & Solutions

### Issue: Events not showing in GA4

**Solution:**
1. Check GA4 Measurement ID is correct
2. Wait 24-48 hours for data to appear
3. Use DebugView for real-time testing
4. Verify consent is granted

### Issue: Revenue not showing in reports

**Solution:**
1. Ensure `value` and `currency` are included in all ecommerce events
2. Check that `purchase` event includes `transaction_id`
3. Verify Enhanced Ecommerce is enabled in GA4

### Issue: Mobile events not tracking

**Solution:**
1. Verify Firebase is configured correctly (google-services.json / GoogleService-Info.plist)
2. Check Firebase Analytics is enabled in Firebase Console
3. Use DebugView to verify events are being sent
4. Ensure proper permissions are set in app

---

## 📚 Additional Resources

- [GA4 Ecommerce Documentation](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [GA4 Mobile App Tracking](https://developers.google.com/analytics/devguides/collection/ga4/app)
- [AdMob Revenue Tracking](https://support.google.com/admob/answer/11322405)
- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)

---

## 🤝 Support

For issues or questions:
- Email: support@dampdrink.com
- Documentation: https://dampdrink.com/docs
- GitHub: https://github.com/dampdrink/analytics

---

## 📝 Changelog

### Version 3.0.0 (October 12, 2025)
- ✅ Added enhanced ecommerce tracking module
- ✅ Added in-app purchase tracking module
- ✅ Added ad revenue tracking module
- ✅ Added React Native mobile analytics service
- ✅ Updated cart.js with enhanced ecommerce events
- ✅ Integrated all modules into damp-analytics.js
- ✅ Added comprehensive documentation

### Version 2.0.0 (Previous)
- Basic GA4 integration
- Page view tracking
- User engagement tracking

---

**© 2025 WeCr8 Solutions LLC. All rights reserved.**

