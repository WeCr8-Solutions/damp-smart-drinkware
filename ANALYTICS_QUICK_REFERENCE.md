# GA4 Analytics Quick Reference

## 🚀 Quick Import Guide

### Web (ES6 Modules)
```javascript
// Main analytics service
import dampAnalytics from './assets/js/analytics/damp-analytics.js';

// Enhanced Ecommerce
import { 
  trackViewItemList, 
  trackViewItem, 
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase
} from './assets/js/analytics/enhanced-ecommerce.js';

// In-App Purchases
import { 
  trackIAPCompleted,
  trackSubscriptionStarted,
  trackTrialConverted
} from './assets/js/analytics/in-app-purchase-tracking.js';

// Ad Revenue
import { 
  trackAdRevenue,
  trackAdMobRevenue,
  trackRewardedAdWatched
} from './assets/js/analytics/ad-revenue-tracking.js';
```

### React Native
```typescript
import { 
  trackScreenView,
  trackViewItem,
  trackPurchase,
  trackIAPPurchase,
  trackAdMobRevenue
} from './services/mobile-analytics';
```

---

## 📦 Common Tracking Scenarios

### 1. Product Page View
```javascript
trackViewItem({
  itemId: 'product-123',
  itemName: 'DAMP Handle V1.0',
  price: 49.99,
  category: 'Smart Drinkware'
});
```

### 2. Add to Cart
```javascript
trackAddToCart({
  value: 49.99,
  item: {
    itemId: 'product-123',
    itemName: 'DAMP Handle V1.0',
    price: 49.99,
    quantity: 1
  }
});
```

### 3. Purchase
```javascript
trackPurchase({
  transactionId: 'txn_12345',
  value: 149.97,
  tax: 11.99,
  shipping: 9.99,
  items: [
    {
      itemId: 'product-123',
      itemName: 'DAMP Handle V1.0',
      price: 49.99,
      quantity: 3
    }
  ]
});
```

### 4. In-App Purchase
```javascript
trackIAPCompleted({
  productId: 'premium_monthly',
  productName: 'Premium Subscription',
  price: 9.99,
  transactionId: 'txn_12345'
});
```

### 5. Subscription
```javascript
trackSubscriptionStarted({
  subscriptionId: 'sub_12345',
  subscriptionName: 'Premium Monthly',
  price: 9.99,
  billingPeriod: 'monthly',
  trialPeriod: 7
});
```

### 6. Ad Revenue (AdMob)
```javascript
trackAdMobRevenue(
  adValue, // { value: 50000, currencyCode: 'USD', precision: 2 }
  'home_banner',
  'banner'
);
```

### 7. Rewarded Ad
```javascript
trackRewardedAdWatched({
  adPlatform: 'AdMob',
  adUnitName: 'rewarded_video_1',
  rewardType: 'coins',
  rewardAmount: 100,
  value: 0.10
});
```

---

## 🔧 Configuration

### Enable Debug Mode
```javascript
// Web
localStorage.setItem('dampDebug', 'true');
// or
dampAnalytics.ecommerce.setDebugMode(true);

// Mobile
mobileAnalytics.setDebugMode(true);
```

### Set Currency
```javascript
// Web
dampAnalytics.ecommerce.setCurrency('EUR');

// Mobile
mobileAnalytics.setCurrency('EUR');
```

### Set User ID
```javascript
// Web
dampAnalytics.setUserId('user_12345');

// Mobile
await setUserId('user_12345');
```

---

## 📊 Event Types Reference

### Ecommerce Events
- `view_item_list` - Product list viewed
- `view_item` - Product details viewed
- `select_item` - Product selected from list
- `add_to_cart` - Item added to cart
- `remove_from_cart` - Item removed from cart
- `view_cart` - Cart viewed
- `begin_checkout` - Checkout started
- `add_shipping_info` - Shipping info added
- `add_payment_info` - Payment info added
- `purchase` - Purchase completed
- `refund` - Order refunded

### IAP Events
- `iap_initiated` - Purchase flow started
- `iap_completed` - Purchase successful
- `iap_failed` - Purchase failed
- `iap_cancelled` - Purchase cancelled
- `subscription_started` - Subscription begun
- `subscription_renewed` - Subscription renewed
- `trial_started` - Trial begun
- `trial_converted` - Trial converted to paid

### Ad Revenue Events
- `ad_impression` - Ad displayed (with revenue)
- `ad_click` - Ad clicked
- `rewarded_ad_watched` - Rewarded ad completed

---

## 🎯 Required Parameters

### Ecommerce Item Object
```javascript
{
  itemId: 'product-123',      // Required
  itemName: 'Product Name',    // Required
  price: 49.99,                // Required
  quantity: 1,                 // Required
  category: 'Category',        // Recommended
  brand: 'DAMP'                // Recommended
}
```

### Purchase Event
```javascript
{
  transactionId: 'txn_12345',  // Required (unique)
  value: 149.97,               // Required (total)
  currency: 'USD',             // Required
  items: [/* item objects */]  // Required
}
```

### IAP Event
```javascript
{
  productId: 'premium_monthly', // Required
  productName: 'Premium',       // Required
  price: 9.99,                  // Required
  transactionId: 'txn_12345'    // Required (unique)
}
```

### Ad Revenue Event
```javascript
{
  adPlatform: 'AdMob',         // Required
  adFormat: 'banner',          // Required
  adUnitName: 'home_banner',   // Required
  value: 0.05,                 // Required
  currency: 'USD'              // Required
}
```

---

## 🐛 Debugging

### Check if gtag is loaded (Web)
```javascript
console.log(typeof window.gtag); // should be 'function'
```

### Check events in console (Web)
```javascript
localStorage.setItem('dampDebug', 'true');
// Refresh page and check console
```

### View events in GA4 DebugView
1. Enable debug mode
2. Go to GA4 > Configure > DebugView
3. Perform actions on your site/app
4. See events appear in real-time

### Mobile Debug Commands
```bash
# iOS
adb shell setprop debug.firebase.analytics.app com.dampdrinkware

# Android  
adb shell setprop debug.firebase.analytics.app com.dampdrinkware
```

---

## 📈 GA4 Reports to Check

1. **Realtime** - See live events
2. **Engagement > Events** - All events
3. **Monetization > Ecommerce purchases** - Purchase data
4. **Monetization > Publisher ads** - Ad revenue
5. **Life Cycle > Monetization** - Combined revenue

---

## 💡 Pro Tips

1. **Always include transaction IDs** - Makes debugging easier
2. **Use consistent product IDs** - Ensures accurate reporting
3. **Track the full funnel** - Don't skip steps
4. **Test in debug mode first** - Catch issues early
5. **Wait 24-48 hours** - For data to appear in standard reports
6. **Use DebugView** - For real-time testing

---

## 🔗 File Locations

- Enhanced Ecommerce: `website/assets/js/analytics/enhanced-ecommerce.js`
- In-App Purchases: `website/assets/js/analytics/in-app-purchase-tracking.js`
- Ad Revenue: `website/assets/js/analytics/ad-revenue-tracking.js`
- Main Analytics: `website/assets/js/analytics/damp-analytics.js`
- Mobile Analytics: `mobile-app/services/mobile-analytics.ts`
- Cart Implementation: `website/assets/js/cart.js`

---

## 📚 Full Documentation

See `GA4_ENHANCED_ANALYTICS_GUIDE.md` for complete documentation.

---

**Need Help?** support@dampdrink.com

