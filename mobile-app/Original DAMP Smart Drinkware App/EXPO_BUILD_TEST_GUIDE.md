# 📱 DAMP Smart Drinkware - Expo App Build & Test Guide

## 🎯 **Quick Start Checklist**

### ✅ **Prerequisites**
- [x] Node.js 18+ installed
- [x] npm 10+ installed
- [ ] Expo CLI installed globally
- [ ] EAS CLI installed (for production builds)
- [ ] iOS Simulator (Mac) or Android Emulator

### **Install Required CLIs**
```bash
# Install Expo CLI globally
npm install -g expo-cli @expo/cli

# Install EAS CLI for production builds
npm install -g eas-cli

# Verify installations
expo --version
eas --version
```

---

## 🔧 **1. Environment Setup**

### **Step 1: Configure Firebase**

Your app needs Firebase credentials from the main DAMP project:

```bash
# Copy from main project
cp ../../firebase-config.js ./firebase/config.ts

# Or manually update .env with Firebase credentials
```

**Update `.env` file**:
```env
# From your Firebase project: damp-smart-drinkware
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=damp-smart-drinkware.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=damp-smart-drinkware
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=damp-smart-drinkware.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=309818614427
EXPO_PUBLIC_FIREBASE_APP_ID=1:309818614427:web:db15a4851c05e58aa25c3e
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YW2BN4SVPQ

# Feature Flags
EXPO_PUBLIC_FIREBASE_ENABLED=true
EXPO_PUBLIC_STRIPE_ENABLED=true
EXPO_PUBLIC_BLE_ENABLED=true
EXPO_PUBLIC_ANALYTICS_ENABLED=true

# Stripe (from main project)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ReW7yCcrIDahSGRjE5nEx9ENwPj8uzAfCJQtmVBkuEyeS7JNq0xscaAqdUFoKos7JO1cKbJXrIscBfUU4yNRQSy00lWo3F7p2

# App Configuration
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_ADMIN_EMAIL=zach@wecr8.info
```

---

## 🚀 **2. Development Testing**

### **Start Development Server**
```bash
# Navigate to app directory
cd "mobile-app/Original DAMP Smart Drinkware App"

# Install dependencies (if not done)
npm install

# Start Expo development server
npm run dev
# or
expo start
```

### **Test on Different Platforms**

**iOS Simulator (Mac only)**:
```bash
# Press 'i' in Expo terminal, or
npm run ios:dev
```

**Android Emulator**:
```bash
# Press 'a' in Expo terminal, or
npm run android:dev
```

**Web Browser**:
```bash
# Press 'w' in Expo terminal, or
expo start --web
```

**Physical Device**:
1. Install **Expo Go** app from App Store / Play Store
2. Scan QR code shown in terminal
3. App will load on your device

---

## 🧪 **3. Testing with Products**

### **A. Product Catalog Integration**

Your app should display the same products as the website:

**Products to Test**:
- ✅ **DAMP Handle v1.0** - Universal handle with BLE tracking
- ✅ **Cup Sleeve** - Slip-on sleeve for tumblers
- ✅ **Silicone Bottom** - Base tracker for bottles
- ✅ **Baby Bottle Adapter** - Pediatric tracking solution

**Test Flow**:
1. Open app → Navigate to "Store" tab
2. Verify all 4 products display correctly
3. Click product → Check details, pricing, images
4. Add to cart → Verify cart functionality
5. Test checkout flow (Stripe integration)

**Expected Behavior**:
- Products match website (`https://dampdrink.com/pages/products.html`)
- Images load from optimized sources
- Prices match Stripe product IDs
- Checkout redirects to Stripe hosted checkout

---

### **B. Device Management Testing**

**BLE Device Connection Flow**:
1. Navigate to "Devices" tab
2. Tap "Add Device" (+)
3. Select device type (Handle, Sleeve, Bottom, Baby Bottle)
4. Follow pairing wizard
5. Grant Bluetooth permissions when prompted

**iOS BLE Permissions**:
- "Allow DAMP to use Bluetooth?" → **Allow**
- "Allow DAMP to use your location?" → **Allow While Using App**

**Android BLE Permissions**:
- Bluetooth → **Allow**
- Location (required for BLE scanning) → **Allow**

**Test Checklist**:
- [ ] App requests Bluetooth permission
- [ ] Device scanning starts
- [ ] Mock/test device appears in list
- [ ] Can pair with test device
- [ ] Device shows in "My Devices" list
- [ ] Can rename device
- [ ] Can set device as favorite

---

### **C. Voting System Integration**

Your app should sync with the website voting system:

**Test Flow**:
1. Navigate to "Voting" tab
2. View 4 product options (Handle, Sleeve, Bottom, Baby Bottle)
3. Cast vote for preferred product
4. Verify vote count updates

**Expected Behavior**:
- Votes sync with website (`https://dampdrink.com/pages/product-voting.html`)
- Authenticated users can vote once
- Public visitors can view results
- Vote counts persist in Netlify Blob storage

---

### **D. User Authentication**

**Sign Up Flow**:
```
1. Open app
2. Tap "Get Started" or "Sign Up"
3. Enter email + password
4. Tap "Create Account"
5. Verify email sent (check inbox)
6. Email verified → Redirected to app
```

**Sign In Flow**:
```
1. Tap "Sign In"
2. Enter credentials
3. Tap "Sign In"
4. Redirected to Home screen
```

**Google Sign-In** (if enabled):
```
1. Tap "Continue with Google"
2. Select Google account
3. Grant permissions
4. Signed in automatically
```

**Test Checklist**:
- [ ] Can create new account
- [ ] Can sign in with email/password
- [ ] Can sign in with Google
- [ ] Password reset works
- [ ] Session persists after app restart
- [ ] Can sign out

---

## 🏗️ **4. Production Builds**

### **Web Build (PWA)**
```bash
# Build for web/Netlify
npm run build:netlify:production

# Output: dist/ folder
# Deploy: Already configured in main Netlify
```

### **iOS Build (EAS)**
```bash
# Login to Expo
eas login

# Configure project (first time only)
eas build:configure

# Build for iOS
npm run ios:build:production
# or
eas build --platform ios --profile production-ios

# Submit to App Store
npm run ios:submit
```

### **Android Build (EAS)**
```bash
# Build for Android
npm run android:build:production
# or
eas build --platform android --profile production-android

# Submit to Google Play
npm run android:submit
```

---

## 🧪 **5. Automated Testing**

### **Run All Tests**
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Full test suite
npm run test:all

# With coverage report
npm run test:coverage
```

### **Key Test Files**:
```
tests/
├── unit/
│   ├── components/          # Component tests
│   ├── services/            # Service/API tests
│   └── utils/              # Utility function tests
├── integration/
│   ├── auth/               # Authentication flow tests
│   ├── ble/                # Bluetooth device tests
│   ├── firebase/           # Firebase integration tests
│   └── screens/            # Screen navigation tests
├── e2e/
│   └── user-journey.test.ts  # Full user flows
└── accessibility/
    └── a11y.test.ts          # Accessibility compliance
```

---

## 🔍 **6. Troubleshooting**

### **Common Issues**

#### **Issue: "Expo Go not connecting"**
```bash
# Solution 1: Ensure same network
# - Phone and computer on same WiFi
# - Disable VPN

# Solution 2: Use tunnel mode
expo start --tunnel

# Solution 3: Use LAN instead of localhost
expo start --lan
```

#### **Issue: "Firebase not initialized"**
```bash
# Check .env file exists and has correct values
cat .env

# Restart Expo server with --clear flag
expo start --clear
```

#### **Issue: "BLE permissions not working"**
```bash
# iOS: Check Info.plist has BLE descriptions
# Android: Check AndroidManifest.xml has permissions

# Rebuild app with prebuild
npm run app:prebuild
```

#### **Issue: "Module not found" errors**
```bash
# Clear caches and reinstall
npm run test:clear-cache
rm -rf node_modules
npm install
expo start --clear
```

---

## 📊 **7. Product Integration Checklist**

### **Verify App <-> Website Sync**

| Feature | Website | Mobile App | Status |
|---------|---------|------------|--------|
| **Products** | ✅ 4 Products | Test: 4 Products | ⏳ Pending |
| **Pricing** | ✅ Stripe Live | Test: Stripe Keys | ⏳ Pending |
| **Auth** | ✅ Firebase | Test: Firebase Auth | ⏳ Pending |
| **Voting** | ✅ Netlify Blob | Test: API Endpoint | ⏳ Pending |
| **Analytics** | ✅ GA4 | Test: Firebase Analytics | ⏳ Pending |

### **Product Data Sync**

Ensure mobile app uses same product IDs as website:

```typescript
// Expected product IDs (from Stripe)
const PRODUCTS = {
  HANDLE: 'prod_handle_id',
  SLEEVE: 'prod_sleeve_id', 
  BOTTOM: 'prod_bottom_id',
  BABY: 'prod_baby_id'
};

// Expected prices
const PRICES = {
  HANDLE: '$39.99',
  SLEEVE: '$24.99',
  BOTTOM: '$29.99',
  BABY: '$34.99'
};
```

---

## 🎯 **8. Pre-Launch Checklist**

### **Before Releasing to Stores**

#### **App Store (iOS)**
- [ ] Apple Developer account ($99/year)
- [ ] App icons (all sizes)
- [ ] Screenshots (all device sizes)
- [ ] Privacy policy URL
- [ ] App Store description
- [ ] Bundle ID: `com.damp.smartdrinkware`
- [ ] Version: 1.0.0

#### **Google Play (Android)**
- [ ] Google Play Console account ($25 one-time)
- [ ] App icons (all sizes)
- [ ] Screenshots (phone + tablet)
- [ ] Privacy policy URL
- [ ] Play Store listing
- [ ] Package name: `com.damp.smartdrinkware`
- [ ] Version code: 1

#### **App Features to Highlight**
- 🥤 **Universal Compatibility** - Works with YETI, Stanley, Hydro Flask
- 📍 **Drink Location Tracking** - Never lose your bottle again
- 💧 **Hydration Reminders** - Smart notifications
- 🔋 **6-Month Battery Life** - Long-lasting CR2032 coin cell
- 🛡️ **IP67 Waterproof** - Dishwasher safe
- 📊 **Detailed Analytics** - Track hydration goals

---

## 🚀 **9. Quick Commands Reference**

```bash
# Development
npm run dev                          # Start Expo dev server
npm run ios:dev                      # iOS simulator
npm run android:dev                  # Android emulator

# Testing
npm run test                         # Run all tests
npm run test:unit                    # Unit tests only
npm run test:watch                   # Watch mode

# Building
npm run build:netlify:production     # Web build
npm run ios:build:production         # iOS production build
npm run android:build:production     # Android production build

# Code Quality
npm run lint                         # ESLint check
npm run lint:fix                     # Auto-fix lint issues
npm run typescript:check             # TypeScript validation

# Utilities
npm run app:doctor                   # Diagnose Expo issues
npm run app:info                     # Show app package info
expo start --clear                   # Clear cache and start
```

---

## 📞 **Support & Resources**

**Documentation**:
- Expo Docs: https://docs.expo.dev/
- React Native: https://reactnative.dev/
- Firebase: https://firebase.google.com/docs
- Stripe: https://stripe.com/docs/mobile

**DAMP Resources**:
- Website: https://dampdrink.com
- Press Kit: https://dampdrink.com/pages/press.html
- Support: zach@wecr8.info

---

**Last Updated**: January 2026  
**Maintainer**: Zach Goodbody (zach@wecr8.info)  
**Project**: DAMP Smart Drinkware - WeCr8 Solutions LLC

