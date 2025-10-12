# GA4 Additional Tracking Features Guide

**Version:** 3.1.0  
**Date:** October 12, 2025  
**Author:** WeCr8 Solutions LLC

---

## 🎯 New Tracking Modules Added

### 1. Advanced Tracking Module
**File:** `website/assets/js/analytics/advanced-tracking.js`

Comprehensive tracking for user engagement, performance, and behavior:

#### **User Engagement Tracking**
- ✅ Engagement time measurement (with visibility tracking)
- ✅ Time on page tracking
- ✅ Page exit tracking with session metrics
- ✅ Periodic engagement pings (every 30 seconds)

#### **Form Analytics**
- ✅ Form start detection
- ✅ Form progress tracking (25%, 50%, 75%, 100%)
- ✅ Form abandonment tracking
- ✅ Form error tracking
- ✅ Field-level interaction tracking
- ✅ Form completion time measurement

#### **Scroll Depth**
- ✅ Automatic scroll tracking (25%, 50%, 75%, 90%, 100%)
- ✅ Maximum scroll depth tracking
- ✅ Page height measurement

#### **Core Web Vitals**
- ✅ Largest Contentful Paint (LCP)
- ✅ First Input Delay (FID)
- ✅ Cumulative Layout Shift (CLS)
- ✅ Performance ratings (good/needs improvement/poor)

#### **Performance Metrics**
- ✅ DNS time
- ✅ Connection time
- ✅ Request/response time
- ✅ DOM load time
- ✅ Total page load time

#### **Error Tracking**
- ✅ JavaScript errors
- ✅ Unhandled promise rejections
- ✅ Error stack traces
- ✅ Error location tracking

#### **PWA Events**
- ✅ Install prompt shown/dismissed
- ✅ App installed
- ✅ Online/offline mode changes

#### **User Behavior**
- ✅ Text copying
- ✅ Page printing
- ✅ File downloads
- ✅ Email link clicks
- ✅ Phone link clicks

#### **Video/Media Tracking**
- ✅ Video start
- ✅ Video progress (25%, 50%, 75%)
- ✅ Video completion
- ✅ Watch time measurement

#### **Site Search**
- ✅ Search query tracking
- ✅ Search location tracking

#### **Social Sharing**
- ✅ Social network clicks (Facebook, Twitter/X, LinkedIn, Instagram, etc.)
- ✅ Share button tracking
- ✅ Web Share API tracking

---

### 2. IoT Device Tracking Module
**File:** `website/assets/js/analytics/iot-device-tracking.js`

Complete tracking for DAMP Smart Drinkware IoT devices:

#### **Device Management**
- ✅ Device pairing (success/failure)
- ✅ Device unpairing
- ✅ Device connection/disconnection
- ✅ Pairing method tracking (Bluetooth, QR code, manual)
- ✅ Connection quality tracking

#### **Battery & Hardware**
- ✅ Battery level monitoring
- ✅ Low battery alerts (20%)
- ✅ Critical battery alerts (5%)
- ✅ Battery charging events
- ✅ Firmware update tracking (start/complete)
- ✅ Firmware version tracking

#### **Alerts & Notifications**
- ✅ Abandonment alert triggered
- ✅ Alert dismissal tracking
- ✅ Alert response time
- ✅ Zone-based alerts
- ✅ "Find My Device" activation

#### **Zone Management**
- ✅ Zone creation (Home, Office, Vehicle, Gym, Custom)
- ✅ Zone updates
- ✅ Zone deletion
- ✅ Zone entry/exit events
- ✅ WiFi network mapping
- ✅ Location method tracking
- ✅ Confidence score tracking

#### **Device Usage**
- ✅ Usage duration
- ✅ Alert statistics
- ✅ Zones visited
- ✅ Battery consumption
- ✅ Connection quality metrics

#### **Feature Usage**
- ✅ Feature activation tracking
- ✅ Settings changes
- ✅ User preferences

---

## 📊 Complete Tracking Coverage

### What You Can Now Track

#### **Ecommerce (Previously Added)**
- Product views, cart actions, checkout, purchases
- Promotions, refunds, wishlists

#### **In-App Purchases (Previously Added)**
- IAP lifecycle, subscriptions, trials
- iOS & Android purchases

#### **Ad Revenue (Previously Added)**
- AdMob, AdSense, multiple networks
- Rewarded ads, impressions, clicks

#### **User Engagement (NEW)**
- Time on page, session duration
- Scroll depth, page exits
- Engagement rate

#### **Forms (NEW)**
- Form starts, progress, completions
- Abandonment rates, error tracking
- Field-level analytics

#### **Performance (NEW)**
- Core Web Vitals (LCP, FID, CLS)
- Page load metrics
- Resource timing

#### **Errors (NEW)**
- JavaScript errors
- Promise rejections
- Error locations

#### **PWA (NEW)**
- Install prompts, installations
- Offline mode tracking

#### **User Behavior (NEW)**
- Copy, print, download actions
- Email/phone clicks
- Video engagement

#### **Search (NEW)**
- Search queries, locations
- Search results

#### **Social (NEW)**
- Social media clicks
- Share actions

#### **IoT Devices (NEW)**
- Device pairing, connections
- Battery, firmware
- Alerts, zones
- Usage patterns

---

## 🚀 Implementation Examples

### Advanced Tracking (Automatic)

The advanced tracking module initializes automatically. All events are tracked without manual implementation:

```javascript
import dampAnalytics from './assets/js/analytics/damp-analytics.js';

// Advanced tracking is already active!
// Forms, scrolling, performance, errors, etc. are automatically tracked
```

### IoT Device Tracking

```javascript
import { 
  trackDevicePaired,
  trackDeviceConnection,
  trackBatteryEvent,
  trackAbandonAlert,
  trackZoneCreated
} from './assets/js/analytics/damp-analytics.js';

// Track device pairing
trackDevicePaired({
  deviceId: 'damp_12345',
  deviceType: 'handle',
  deviceModel: 'v1.0',
  pairingMethod: 'bluetooth',
  success: true,
  userId: 'user_12345'
});

// Track device connection
trackDeviceConnection('damp_12345', true, {
  connectionType: 'bluetooth',
  signalStrength: -60,
  connectionTime: 1500
});

// Track low battery
trackBatteryEvent('damp_12345', 15); // 15% battery

// Track abandonment alert
trackAbandonAlert('damp_12345', {
  alertType: 'distance',
  distance: 50, // meters
  timeAway: 120, // seconds
  zoneName: 'Office Desk',
  inSafeZone: false
});

// Track zone creation
trackZoneCreated({
  zoneId: 'zone_office_desk',
  zoneName: 'Office Desk',
  zoneType: 'office',
  locationMethod: 'wifi',
  wifiNetworksCount: 3,
  radius: 10,
  userId: 'user_12345'
});
```

### Accessing Modules Directly

```javascript
import dampAnalytics from './assets/js/analytics/damp-analytics.js';

// Access advanced tracking
dampAnalytics.advanced.setDebugMode(true);

// Access IoT tracking
const deviceSummary = dampAnalytics.iot.getActiveDevicesSummary();
console.log(`Total devices: ${deviceSummary.total_devices}`);
```

---

## 📈 GA4 Reports You Can Now Create

### 1. User Engagement Report
- Engagement time by page
- Scroll depth distribution
- Session quality score
- Time on page averages

### 2. Form Performance Report
- Form completion rates
- Abandonment analysis
- Error rate by form
- Time to complete

### 3. Performance Dashboard
- Core Web Vitals by page
- Performance rating distribution
- Load time trends
- Performance by device/connection

### 4. Device Usage Report (IoT)
- Active devices count
- Battery health distribution
- Connection quality
- Alert frequency

### 5. Zone Analytics
- Most used zones
- Zone entry/exit patterns
- Zone effectiveness
- User movement patterns

### 6. Alert Response Report
- Alert response time
- Dismissal rates
- Alert effectiveness
- User behavior patterns

### 7. Feature Adoption Report
- Feature usage frequency
- Popular features
- Feature success rates
- User preferences

---

## 🔧 Configuration

### Enable Debug Mode

```javascript
// For all modules
localStorage.setItem('dampDebug', 'true');

// For specific modules
dampAnalytics.advanced.setDebugMode(true);
dampAnalytics.iot.setDebugMode(true);
```

### Custom Configuration

```javascript
import { AdvancedTracking } from './assets/js/analytics/advanced-tracking.js';
import { IoTDeviceTracking } from './assets/js/analytics/iot-device-tracking.js';

// Custom advanced tracking
const advancedTracking = new AdvancedTracking({
  debug: true,
  measurementId: 'G-YOUR-ID'
});

// Custom IoT tracking
const iotTracking = new IoTDeviceTracking({
  debug: true,
  measurementId: 'G-YOUR-ID'
});
```

---

## 📊 GA4 Setup for New Events

### 1. Create Custom Events

In GA4 Console:
1. Go to Configure > Events
2. Create new events for IoT-specific events:
   - `device_paired`
   - `zone_created`
   - `abandon_alert`
   - `battery_low`

### 2. Mark as Conversions

Important events to mark as conversions:
- `device_paired` - Device activation
- `zone_created` - User engagement
- `abandon_alert_dismissed` - User responsiveness
- `firmware_update_complete` - Feature usage

### 3. Create Custom Dimensions

Recommended custom dimensions:
- `device_type` (handle, silicone_bottom, cup_sleeve, baby_bottle)
- `zone_type` (home, office, vehicle, gym, custom)
- `battery_level` (numeric)
- `connection_quality` (good, fair, poor)
- `firmware_version` (text)
- `engagement_rating` (high, medium, low)

### 4. Create Custom Metrics

Recommended custom metrics:
- `battery_level` - Current battery percentage
- `signal_strength` - Connection signal strength
- `zones_visited` - Number of zones visited
- `alerts_received` - Number of alerts
- `engagement_time_msec` - Engagement time in milliseconds

---

## 🎯 Key Metrics to Track

### Engagement Metrics
- Average engagement time per session
- Scroll depth completion rate
- Form completion rate
- Video completion rate

### Performance Metrics
- % of pages with "Good" LCP (<2.5s)
- % of pages with "Good" FID (<100ms)
- % of pages with "Good" CLS (<0.1)
- Average page load time

### IoT Metrics
- Device pairing success rate
- Average battery life
- Alert response rate
- Zone usage frequency
- Connection quality distribution

### User Behavior Metrics
- Form abandonment rate
- Error rate by form
- Social share rate
- Download rate
- PWA install rate

---

## 🔍 Debugging & Testing

### Check Events in Console

```javascript
// Enable debug mode
localStorage.setItem('dampDebug', 'true');

// Check if modules loaded
console.log('Advanced tracking:', dampAnalytics.advanced);
console.log('IoT tracking:', dampAnalytics.iot);

// Test an IoT event
dampAnalytics.iot.trackDevicePaired({
  deviceId: 'test_device',
  deviceType: 'handle',
  success: true
});
```

### View in GA4 DebugView

1. Enable debug mode (see above)
2. Go to GA4 > Configure > DebugView
3. Perform actions on your site/app
4. See events appear in real-time

### Test Specific Events

```javascript
// Test form tracking
// Fill out a form and abandon it - check for form_abandon event

// Test scroll tracking
// Scroll to 50% of page - check for scroll_depth event

// Test IoT device
// Trigger device event - check for device_paired event

// Test performance
// Check console for web_vitals events
```

---

## 📚 Complete Event List

### Advanced Events
- `user_engagement` - User engagement time
- `scroll` - Scroll depth milestones
- `form_start` - Form interaction started
- `form_progress` - Form progress updates
- `form_abandon` - Form abandoned
- `form_error` - Form validation error
- `web_vitals` - Core Web Vitals (LCP, FID, CLS)
- `page_load_timing` - Page load performance
- `exception` - JavaScript errors
- `pwa_install_prompt` - PWA install prompt
- `pwa_installed` - PWA installed successfully
- `pwa_offline_mode` - Online/offline status change
- `text_copied` - Text copied by user
- `page_printed` - Page printed
- `file_download` - File downloaded
- `email_click` - Email link clicked
- `phone_click` - Phone link clicked
- `video_start` - Video started
- `video_progress` - Video milestone reached
- `video_complete` - Video completed
- `search` - Site search performed
- `share` - Content shared
- `social_click` - Social media link clicked

### IoT Device Events
- `device_paired` - Device paired to account
- `device_unpaired` - Device removed
- `device_connected` - Device connected
- `device_disconnected` - Device disconnected
- `battery_low` - Low battery (20%)
- `battery_critical` - Critical battery (5%)
- `battery_charging` - Device charging
- `firmware_update_start` - Firmware update started
- `firmware_update_complete` - Firmware update completed
- `abandon_alert` - Abandonment alert triggered
- `abandon_alert_dismissed` - Alert dismissed
- `zone_alert` - Zone-based alert
- `find_device_activated` - Find My Device used
- `zone_created` - Safe zone created
- `zone_updated` - Safe zone updated
- `zone_deleted` - Safe zone deleted
- `zone_entered` - Entered safe zone
- `zone_exited` - Exited safe zone
- `device_usage` - Device usage summary
- `feature_used` - Feature activated
- `settings_changed` - Settings updated

---

## 🎉 Summary

Your GA4 implementation now includes:

### Previously Added (v3.0)
- ✅ Enhanced Ecommerce (13 events)
- ✅ In-App Purchases (12 events)
- ✅ Ad Revenue (8 events)
- ✅ Mobile Analytics (React Native)

### Newly Added (v3.1)
- ✅ **Advanced Tracking** (24 events)
  - User engagement
  - Form analytics
  - Performance monitoring
  - Error tracking
  - PWA events
  - User behavior
  - Video tracking
  - Search tracking
  - Social sharing

- ✅ **IoT Device Tracking** (23 events)
  - Device management
  - Battery & hardware
  - Alerts & notifications
  - Zone management
  - Device usage
  - Feature tracking

### Total Coverage
- **80+ unique GA4 events**
- **5 major tracking modules**
- **Complete customer journey tracking**
- **IoT-specific analytics**
- **Performance & engagement monitoring**

---

## 📞 Support

For questions or issues:
- 📖 Full Guide: `GA4_ENHANCED_ANALYTICS_GUIDE.md`
- 📝 Quick Reference: `ANALYTICS_QUICK_REFERENCE.md`
- 📧 Email: support@dampdrink.com

---

**© 2025 WeCr8 Solutions LLC. All rights reserved.**

