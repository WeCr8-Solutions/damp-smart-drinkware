# 🚀 DAMP Mobile App - Quick Start Guide

## ✅ **Your App is Ready to Build and Test!**

### **Current Status**
- ✅ Expo 54.0.12 installed
- ✅ React Native 0.79.1 installed
- ✅ Firebase credentials configured
- ✅ Stripe keys configured
- ✅ Dependencies installed
- ✅ Environment variables set

---

## 🎯 **Start Testing NOW**

### **Option 1: Start Development Server** (Recommended)
```bash
npm run dev
```

This will:
1. Start Metro bundler
2. Generate QR code for Expo Go app
3. Open Expo DevTools in browser
4. Allow testing on physical device

### **Option 2: Test in Web Browser**
```bash
npx expo start --web
```

### **Option 3: iOS Simulator** (Mac only)
```bash
# Open iOS Simulator
open -a Simulator

# In another terminal, start the app
npm run ios:dev
```

### **Option 4: Android Emulator**
```bash
# Ensure Android emulator is running
# Then:
npm run android:dev
```

---

## 📱 **Test with Physical Device**

### **Using Expo Go (Easiest)**
1. Install **Expo Go** from App Store / Play Store
2. Run `npm run dev` on your computer
3. Scan QR code with Expo Go app
4. App loads instantly on your phone

### **Expo Go App Links**:
- **iOS**: https://apps.apple.com/app/expo-go/id982107779
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

---

## 🧪 **Test Your Products**

Once the app is running:

### **1. View Products**
```
Navigate to: Home → Store Tab
Expected: 4 products display
- DAMP Handle v1.0 ($39.99)
- Cup Sleeve ($24.99)
- Silicone Bottom ($29.99)
- Baby Bottle Adapter ($34.99)
```

### **2. Test Device Management**
```
Navigate to: Devices Tab → Add Device
Expected: 
- Bluetooth permission request
- Device type selection screen
- Pairing wizard
```

### **3. Test Voting System**
```
Navigate to: Voting Tab
Expected:
- 4 product cards
- Vote buttons
- Current vote counts
- Syncs with website voting
```

### **4. Test Authentication**
```
Navigate to: Settings → Sign In
Expected:
- Email/password login
- Google sign-in option
- Create account flow
```

---

## 🏗️ **Build for Production**

### **Web Build** (PWA)
```bash
npm run build:netlify:production
```
Output: `dist/` folder ready for deployment

### **iOS Build** (App Store)
```bash
# Login to Expo (first time)
npx eas login

# Build for iOS
npm run ios:build:production
```
This creates an IPA file for App Store submission

### **Android Build** (Google Play)
```bash
# Build APK/AAB
npm run android:build:production
```
This creates an APK or AAB file for Play Store

---

## ⚡ **Quick Commands**

```bash
# Development
npm run dev                  # Start dev server
npm start                    # Alternative start command

# Testing
npm run test                 # Run all tests
npm run test:unit            # Unit tests
npm run lint                 # Check code quality

# Building
npm run build:web            # Web build
npm run build:netlify:production  # Production web build

# Troubleshooting
npm install                  # Reinstall dependencies
npx expo start --clear       # Clear cache and start
```

---

## 🐛 **Troubleshooting**

### **Issue: "Cannot find module..."**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### **Issue: "Metro bundler not starting"**
```bash
# Clear cache
npx expo start --clear
```

### **Issue: "BLE not working"**
**iOS**: Requires Info.plist entries (already configured)
**Android**: Requires permissions in AndroidManifest.xml (already configured)

**Solution**: Build development client first
```bash
npx expo prebuild
npm run ios:dev
```

### **Issue: "Firebase not connecting"**
Check `.env` file has correct Firebase keys:
```bash
cat .env
```
Should show Firebase credentials starting with `AIzaSy...`

---

## 📊 **App Features Ready to Test**

### ✅ **Implemented**
- [x] Product catalog (4 products)
- [x] User authentication (Firebase)
- [x] Device management screens
- [x] Voting system
- [x] Stripe payment integration
- [x] Settings and preferences
- [x] Analytics tracking

### 🔄 **Requires Physical Device**
- [ ] BLE device pairing (requires real DAMP device)
- [ ] Location-based features
- [ ] Push notifications
- [ ] Camera features (if used for setup)

### 🚧 **Coming Soon**
- [ ] Hydration tracking charts
- [ ] Social sharing
- [ ] Subscription management
- [ ] Advanced device settings

---

## 🎨 **App Structure**

```
app/
├── (tabs)/              # Main app tabs
│   ├── index.tsx        # Home screen
│   ├── devices.tsx      # Device management
│   ├── voting.tsx       # Product voting
│   ├── settings.tsx     # User settings
│   └── subscription.tsx # Subscription/premium
├── auth/                # Authentication
│   ├── login.tsx
│   └── signup.tsx
├── setup/               # Device setup wizard
│   └── device-wizard.tsx
└── store/               # E-commerce
    └── success.tsx      # Purchase confirmation
```

---

## 🔗 **Integration with Website**

Your mobile app connects to:
- **Website**: https://dampdrink.com
- **Voting API**: `/.netlify/functions/submit-vote`
- **Email API**: `/.netlify/functions/save-email`
- **Sales Stats**: `/.netlify/functions/get-sales-stats`
- **Firebase**: `damp-smart-drinkware` project
- **Stripe**: Live mode keys configured

---

## 📞 **Next Steps**

1. **Start the app**: `npm run dev`
2. **Open on device**: Scan QR with Expo Go
3. **Test products**: Navigate through tabs
4. **Report issues**: zach@wecr8.info

---

## 🎉 **You're Ready to Go!**

Your DAMP mobile app is fully configured and ready for testing. Just run:

```bash
npm run dev
```

And start testing your products on any device!

---

**Questions?** Email: zach@wecr8.info  
**Website**: https://dampdrink.com  
**Project**: DAMP Smart Drinkware - WeCr8 Solutions LLC

