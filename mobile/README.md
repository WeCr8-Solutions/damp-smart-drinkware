# DAMP Mobile Apps - iOS & Android

**React Native mobile applications for DAMP Smart Drinkware**
*iOS and Android apps with unified Firebase authentication*

---

## 🎯 Quick Reference

### Authentication System
- **✅ Unified with Web**: Same Firebase project and user data
- **✅ Platform Features**: Biometric auth, Apple Sign-In, Google Sign-In
- **✅ Offline Support**: Local credential caching
- **✅ Real-time Sync**: Cross-device data synchronization

### Key Files
| File | Purpose |
|------|---------|
| `config/firebase-config.js` | Universal Firebase configuration |
| `services/AuthService.js` | Cross-platform authentication service |
| `schemas/user-schema.js` | Unified user data structure |
| `package.json` | React Native dependencies |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React Native CLI
- Xcode (iOS development)
- Android Studio (Android development)
- Firebase project access

### Installation
```bash
# Install dependencies
cd mobile/
npm install

# iOS setup
cd ios/
pod install

# Android setup (if needed)
cd android/
./gradlew clean
```

### Configuration
1. **Download Firebase config files**:
   - iOS: `GoogleService-Info.plist` → `mobile/ios/`
   - Android: `google-services.json` → `mobile/android/app/`

2. **Update environment variables**:
   ```bash
   # Add to your .env file
   FIREBASE_IOS_API_KEY="your_ios_api_key"
   FIREBASE_ANDROID_API_KEY="your_android_api_key"
   GOOGLE_IOS_CLIENT_ID="your_ios_client_id"
   GOOGLE_ANDROID_CLIENT_ID="your_android_client_id"
   ```

3. **Test authentication**:
   ```bash
   # Run on iOS simulator
   npm run ios

   # Run on Android emulator
   npm run android
   ```

---

## 🔐 Authentication Features

### Universal (All Platforms)
- ✅ Email/Password registration and login
- ✅ Google OAuth Sign-In
- ✅ Password reset via email
- ✅ Profile management
- ✅ Real-time auth state sync

### Mobile-Specific
- ✅ **Biometric Authentication** (Touch ID, Face ID, Fingerprint)
- ✅ **Apple Sign-In** (iOS only, required for App Store)
- ✅ **Secure Credential Storage** (Keychain/Keystore)
- ✅ **Background Auth Refresh**
- ✅ **Offline Authentication** (cached credentials)

### Usage Example
```javascript
import { DAMPAuthService } from './services/AuthService';

// Initialize
const authService = new DAMPAuthService(auth, firestore);

// Sign up new user
const result = await authService.createAccount(
  'user@example.com',
  'password123',
  'John Doe'
);

// Sign in with Google
const googleResult = await authService.signInWithGoogle();

// Enable biometric authentication
const biometricResult = await authService.signInWithBiometric();
```

---

## 📱 Platform-Specific Setup

### iOS Setup
1. **Apple Sign-In Configuration**:
   ```xml
   <!-- ios/Runner/Info.plist -->
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLName</key>
       <string>com.dampdrink.smartdrinkware</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.dampdrink.smartdrinkware</string>
       </array>
     </dict>
   </array>
   ```

2. **Enable capabilities**:
   - Sign In with Apple
   - Keychain Sharing
   - Background App Refresh

### Android Setup
1. **SHA-1 Certificate**:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
   ```
   Add the SHA-1 to Firebase Console

2. **Permissions**:
   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <uses-permission android:name="android.permission.USE_FINGERPRINT" />
   <uses-permission android:name="android.permission.USE_BIOMETRIC" />
   ```

---

## 🗄️ User Data Synchronization

### Shared User Schema
All platforms use the **same Firestore user document**:

```javascript
// /users/{uid} - Synchronized across Web, iOS, Android
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  displayName: "John Doe",
  platform: "ios", // Tracks last login platform

  // Preferences sync across devices
  preferences: {
    notifications: { push: true, email: true },
    app: { darkMode: false, language: "en" }
  },

  // Activity stats
  stats: {
    votesCount: 5,
    ordersCount: 2,
    loyaltyPoints: 250
  },

  // Connected DAMP devices
  devices: [
    {
      deviceId: "DAMP_001",
      type: "handle",
      name: "My Coffee Mug",
      batteryLevel: 85
    }
  ]
}
```

### Real-Time Sync
- User signs in on phone → preferences update on web
- Order placed on web → stats update on mobile
- Device connected via mobile → visible on all platforms
- Vote cast anywhere → counts update everywhere

---

## 🔧 Development Workflow

### Testing Authentication
```bash
# Run unit tests
npm test

# Test on iOS simulator
npm run ios

# Test on Android emulator
npm run android

# Test web integration
cd ../website/ && npm start
```

### Debugging
- **Firebase Console**: Monitor users and authentication
- **Flipper**: React Native debugging
- **Firebase Emulator**: Local development
- **Platform DevTools**: Xcode/Android Studio debuggers

### Build for Production
```bash
# iOS build
npm run build:ios

# Android build
npm run build:android
```

---

## 🚨 Troubleshooting

### Common Issues

#### iOS
- **Apple Sign-In fails**: Check Team ID and Bundle ID in Firebase
- **Google Sign-In errors**: Verify URL schemes in Info.plist
- **Keychain access denied**: Enable Keychain Sharing capability

#### Android
- **Google Sign-In failing**: Check SHA-1 certificate in Firebase Console
- **Biometric not working**: Test on real device (not emulator)
- **Build fails**: Clean and rebuild (`npm run clean`)

#### Cross-Platform
- **User data not syncing**: Check Firestore security rules
- **Auth state inconsistent**: Verify Firebase config matches
- **Offline auth fails**: Check credential caching implementation

### Debug Commands
```bash
# Clear React Native cache
npm run clean

# Reset iOS simulator
npx react-native run-ios --reset-cache

# Clean Android build
cd android && ./gradlew clean
```

---

## 📋 Production Checklist

### Pre-Launch
- [ ] Firebase project configured for production
- [ ] OAuth credentials updated for production
- [ ] App Store / Play Store metadata ready
- [ ] Push notification certificates configured
- [ ] Security audit completed
- [ ] Cross-platform testing completed

### Launch
- [ ] Apps submitted to stores
- [ ] Firebase Analytics enabled
- [ ] Crashlytics monitoring active
- [ ] User support channels ready
- [ ] Marketing campaigns activated

### Post-Launch
- [ ] Monitor authentication success rates
- [ ] Track cross-platform user journeys
- [ ] Analyze crash reports
- [ ] Gather user feedback
- [ ] Plan feature updates

---

## 📞 Support

### Documentation
- [Cross-Platform Auth Guide](../docs/CROSS_PLATFORM_AUTH.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)

### Team
- **Mobile Lead**: [Contact Info]
- **Firebase Admin**: [Contact Info]
- **QA Lead**: [Contact Info]

---

*Ready to build the future of smart drinkware! 🥤✨*