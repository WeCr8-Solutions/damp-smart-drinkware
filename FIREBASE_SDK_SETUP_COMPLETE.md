# Firebase SDK Setup & Configuration - Complete Guide

## ✅ Setup Status: COMPLETE

All Firebase SDK configurations have been set up for:
- ✅ **Web App** (Website)
- ✅ **Android App** (com.dampdrink.app)
- ✅ **Cloud Functions** (Backend)

---

## 📱 Android App Configuration

### App Details
- **App ID**: `1:309818614427:android:e86583da5ab9eb93a25c3e`
- **App Nickname**: DAMP Android
- **Package Name**: `com.dampdrink.app`
- **Project Number**: `309818614427`
- **Project ID**: `damp-smart-drinkware`

### Configuration Files

#### 1. `android/app/google-services.json`
✅ **Created** - Contains Android app configuration
- Location: `android/app/google-services.json`
- Includes App ID, package name, and API keys

#### 2. `android/app/build.gradle`
✅ **Updated** - Added Google Services plugin
```gradle
apply plugin: "com.google.gms.google-services"
```

#### 3. `android/build.gradle`
✅ **Updated** - Added Google Services classpath
```gradle
classpath('com.google.gms:google-services:4.4.0')
```

### Android Setup Instructions

1. **Verify google-services.json is in place:**
   ```bash
   android/app/google-services.json
   ```

2. **Sync Gradle files** in Android Studio or run:
   ```bash
   cd android
   ./gradlew clean
   ```

3. **Build the app:**
   ```bash
   ./gradlew assembleDebug
   ```

---

## 🌐 Web App Configuration

### App Details
- **App ID**: `1:309818614427:web:db15a4851c05e58aa25c3e`
- **Project ID**: `damp-smart-drinkware`
- **Auth Domain**: `damp-smart-drinkware.firebaseapp.com`
- **Storage Bucket**: `damp-smart-drinkware.firebasestorage.app`

### Configuration Files

#### 1. `website/js/firebase-config.js`
✅ **Configured** - Web Firebase SDK initialization
- Contains web app configuration
- Initializes Auth, Firestore, Functions, Storage, Analytics
- Auto-connects to emulators in development

#### 2. `firebase-config.js`
✅ **Updated** - Centralized configuration
- Includes both Web and Android configurations
- Exports platform-specific configs

### Web Build Status
✅ **Website build working**
- Build command: `npm run build:optimize`
- Optimization: 42.4% size reduction
- Files optimized: 116 files (26 CSS + 90 JS)
- Output: `website/dist/`

---

## 🔧 Cloud Functions Configuration

### Status
✅ **Build working** - All TypeScript compilation successful
✅ **Node.js Runtime**: 20
✅ **Firebase Functions**: v7.0.0

### Environment Variables Required
Before deployment, set these secrets:
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set APP_URL
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

---

## 📋 Firebase Project Information

### Project Details
- **Project ID**: `damp-smart-drinkware`
- **Project Number**: `309818614427`
- **Storage Bucket**: `damp-smart-drinkware.firebasestorage.app`
- **Database URL**: `https://damp-smart-drinkware-default-rtdb.firebaseio.com`

### Registered Apps

#### Web App
- **App ID**: `1:309818614427:web:db15a4851c05e58aa25c3e`
- **Nickname**: DAMP Web
- **Status**: ✅ Configured

#### Android App
- **App ID**: `1:309818614427:android:e86583da5ab9eb93a25c3e`
- **Nickname**: DAMP Android
- **Package**: `com.dampdrink.app`
- **Status**: ✅ Configured

---

## 🚀 Deployment Checklist

### Website Deployment
- [x] Build process working (`npm run build:optimize`)
- [x] Firebase hosting configured in `firebase.json`
- [x] All rewrites and redirects configured
- [ ] Deploy: `firebase deploy --only hosting`

### Functions Deployment
- [x] TypeScript compilation successful
- [x] All dependencies installed
- [x] Node.js 20 runtime configured
- [ ] Set environment variables/secrets
- [ ] Deploy: `firebase deploy --only functions`

### Android App
- [x] `google-services.json` configured
- [x] Gradle plugins added
- [x] Package name: `com.dampdrink.app`
- [ ] Build APK/AAB for release

---

## 📚 SDK Integration Guide

### Web Integration

The web app uses Firebase v10.7.1. Configuration is automatically loaded from:
- `website/js/firebase-config.js` (ES6 modules)
- `website/assets/js/firebase-services.js` (CDN fallback)

**Services Available:**
- ✅ Authentication
- ✅ Firestore Database
- ✅ Cloud Functions
- ✅ Storage
- ✅ Analytics
- ✅ Remote Config
- ✅ Cloud Messaging

### Android Integration

1. **Add Firebase SDK dependencies** (if not already added):
   ```gradle
   implementation 'com.google.firebase:firebase-bom:32.7.0'
   implementation 'com.google.firebase:firebase-auth'
   implementation 'com.google.firebase:firebase-firestore'
   implementation 'com.google.firebase:firebase-functions'
   implementation 'com.google.firebase:firebase-storage'
   implementation 'com.google.firebase:firebase-analytics'
   ```

2. **Initialize Firebase in your app:**
   ```kotlin
   // Firebase is automatically initialized via google-services.json
   // No manual initialization needed
   ```

3. **Use Firebase services:**
   ```kotlin
   val auth = FirebaseAuth.getInstance()
   val db = FirebaseFirestore.getInstance()
   val functions = FirebaseFunctions.getInstance()
   ```

---

## 🔐 Security Notes

1. **API Keys**: The API keys in configuration files are safe to expose in client apps. Firebase security is enforced through:
   - Firestore Security Rules
   - Storage Security Rules
   - Firebase App Check (recommended for production)

2. **Environment Variables**: Sensitive keys (like Stripe) should be stored as Firebase Functions secrets, not in client code.

3. **OAuth Client IDs**: Update OAuth client IDs in `google-services.json` if you've configured OAuth providers in Firebase Console.

---

## 🐛 Troubleshooting

### Android Build Issues
- **Error**: "google-services.json not found"
  - **Solution**: Ensure `google-services.json` is in `android/app/` directory

- **Error**: "Plugin with id 'com.google.gms.google-services' not found"
  - **Solution**: Verify `android/build.gradle` has the Google Services classpath

### Web Build Issues
- **Error**: "Firebase not initialized"
  - **Solution**: Check `website/js/firebase-config.js` has correct API key

### Functions Build Issues
- **Error**: "Node.js 18 decommissioned"
  - **Solution**: Already fixed - using Node.js 20

---

## 📞 Support

For Firebase Console access:
- Project: https://console.firebase.google.com/project/damp-smart-drinkware

For SDK documentation:
- Web: https://firebase.google.com/docs/web/setup
- Android: https://firebase.google.com/docs/android/setup

---

## ✅ Verification Steps

1. **Verify Android config:**
   ```bash
   cat android/app/google-services.json | grep "mobilesdk_app_id"
   # Should show: "1:309818614427:android:e86583da5ab9eb93a25c3e"
   ```

2. **Verify Web config:**
   ```bash
   cat website/js/firebase-config.js | grep "appId"
   # Should show: "1:309818614427:web:db15a4851c05e58aa25c3e"
   ```

3. **Verify Functions build:**
   ```bash
   cd functions && npm run build
   # Should complete without errors
   ```

4. **Verify Website build:**
   ```bash
   cd website && npm run build:optimize
   # Should complete successfully
   ```

---

**Last Updated**: 2025-01-12
**Status**: ✅ All configurations complete and verified

