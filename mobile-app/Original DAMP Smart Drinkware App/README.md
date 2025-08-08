# 📱 DAMP Smart Drinkware - Mobile Application

[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49.0-black)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Ready-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

> Cross-platform mobile application for DAMP Smart Drinkware ecosystem, featuring IoT device management, hydration tracking, and seamless integration with web services.

## 🎯 **Application Overview**

The DAMP Smart Drinkware mobile app is the primary interface for users to:
- 🥤 Track hydration goals and monitor smart drinkware devices
- 📱 Manage connected IoT devices (handles, bases, sleeves)
- 🗳️ Vote on future product development
- 🛒 Purchase products and manage subscriptions
- 📊 View detailed analytics and health insights

## 🏗️ **Architecture**

```
mobile-app/Original DAMP Smart Drinkware App/
├── 📱 app/                    # Expo Router screens
│   ├── (tabs)/               # Tab navigation
│   ├── auth/                 # Authentication screens
│   ├── setup/                # Device setup wizard
│   └── store/                # E-commerce screens
├── 🧩 components/            # Reusable UI components
├── 🔧 services/              # Business logic & APIs
├── 🎨 styles/                # Theme & styling
├── 🔥 firebase/              # Firebase configuration
├── 📊 utils/                 # Helper functions
├── 🧪 tests/                 # Test suites
└── 📄 types/                 # TypeScript definitions
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm 10+
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- iOS Simulator (Mac) or Android Emulator

### **Installation**
```bash
# Clone and navigate
git clone https://github.com/WeCr8/damp-smart-drinkware.git
cd "mobile-app/Original DAMP Smart Drinkware App"

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Development Commands**
```bash
# Development
npm run dev                    # Start Expo development server
npm run ios                    # Run on iOS simulator
npm run android                # Run on Android emulator
npm run web                    # Run in web browser

# Building
npm run build:web              # Web build for testing
npm run build:netlify:production  # Production web build
eas build --platform all       # Native builds (iOS/Android)

# Testing
npm run test                   # Unit tests
npm run test:integration       # Integration tests
npm run test:e2e              # End-to-end tests
npm run test:coverage         # Coverage report

# Code Quality
npm run lint                  # ESLint
npm run lint:fix             # Fix lint issues
npm run type-check           # TypeScript checking
```

## 📱 **Platform Support**

| Platform | Status | Build Type | Deployment |
|----------|--------|------------|------------|
| **iOS** | ✅ Ready | Native (EAS) | App Store |
| **Android** | ✅ Ready | Native (EAS) | Google Play |
| **Web** | ✅ Live | Expo Web | Netlify |

### **Web Deployment**
The mobile app also builds as a Progressive Web App (PWA) and is deployed to:
- **Production**: [dampdrink.com](https://dampdrink.com)
- **Build Command**: `npm run build:netlify:production`
- **Auto-deploy**: Triggered on `main` branch commits

## 🔥 **Firebase Integration**

### **Services Used**
- **Authentication**: User accounts, social login
- **Firestore**: Real-time database for user data, devices, votes
- **Cloud Functions**: Backend business logic
- **Cloud Storage**: User avatars, device images
- **Analytics**: User behavior tracking

### **Configuration**
```typescript
// firebase/config.ts
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'damp-smart-drinkware.firebaseapp.com',
  projectId: 'damp-smart-drinkware',
  // ... other config
};
```

### **Environment Variables**
```bash
# Required Firebase Variables
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=damp-smart-drinkware
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=damp-smart-drinkware.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=damp-smart-drinkware.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=309818614427
EXPO_PUBLIC_FIREBASE_APP_ID=1:309818614427:web:db15a4851c05e58aa25c3e
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YW2BN4SVPQ

# Platform Configuration
EXPO_PUBLIC_PLATFORM=mobile
EXPO_PUBLIC_ENVIRONMENT=development|staging|production
EXPO_PUBLIC_ADMIN_EMAIL=zach@wecr8.info
```

## 🎨 **Key Features**

### **🔐 Authentication System**
- Firebase Authentication with email/password
- Social login (Google, Apple)
- Secure token management
- Profile management

```typescript
// Example: Authentication usage
import { useAuth } from '@/contexts/AuthContext';

const { user, signIn, signOut, loading } = useAuth();
```

### **🥤 Device Management**
- Bluetooth Low Energy (BLE) connectivity
- Device pairing and setup wizard
- Real-time data synchronization
- Device health monitoring

```typescript
// Example: Device connection
import { useBLE } from '@/hooks/useBLE';

const { devices, connectToDevice, isConnected } = useBLE();
```

### **💧 Hydration Tracking**
- Daily intake goals and progress
- Smart notifications and reminders
- Historical data and analytics
- Achievement system

### **🗳️ Product Voting**
- Real-time community voting
- Product preference tracking
- Vote history and analytics
- Cross-platform synchronization

### **🛒 E-commerce Integration**
- Stripe payment processing
- Product catalog and cart
- Order history and tracking
- Subscription management

## 🧩 **Component Library**

### **Core Components**
```typescript
// Navigation
<TabNavigator />
<StackNavigator />

// UI Elements
<Button variant="primary" onPress={handlePress} />
<Card title="Device Status" />
<Modal isVisible={showModal} />

// Device Components
<DeviceCard device={device} />
<DeviceSetupWizard />
<BLEConnectionStatus />

// Data Visualization
<HydrationChart data={hydrationData} />
<VotingResults products={products} />
<AnalyticsDashboard />
```

### **Custom Hooks**
```typescript
// Authentication
const { user, signIn, signOut } = useAuth();

// Bluetooth Low Energy
const { devices, connect, disconnect } = useBLE();

// Data Management
const { data, loading, error, refetch } = useFirestore('users');

// Hydration Tracking
const { todayIntake, goal, addIntake } = useHydration();
```

## 🧪 **Testing Strategy**

### **Test Types & Coverage**
- ✅ **Unit Tests**: Component logic, utilities (Jest)
- ✅ **Integration Tests**: Firebase, Stripe, BLE (Jest)
- ✅ **Component Tests**: UI behavior (React Native Testing Library)
- ✅ **E2E Tests**: User flows (Detox)
- ✅ **Performance Tests**: Memory, CPU usage (Reassure)

### **Test Configuration**
```json
// jest.config.js
{
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### **Running Tests**
```bash
# All tests
npm run test

# Specific test types
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests
npm run test:e2e              # End-to-end tests
npm run test:performance      # Performance tests

# Coverage and watch modes
npm run test:coverage         # Generate coverage report
npm run test:watch           # Watch mode for development
```

## 🚀 **Deployment**

### **Native App Builds**
```bash
# Build for all platforms
eas build --platform all

# Platform-specific builds
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit --platform all
```

### **EAS Configuration**
```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "zach@wecr8.info",
        "ascAppId": "your_app_store_connect_id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

### **Web Deployment (Netlify)**
- **Automatic**: Deploys on push to `main` branch
- **Build Command**: `npm run build:netlify:production`
- **Publish Directory**: `dist/`
- **Domain**: [dampdrink.com](https://dampdrink.com)

## 🔒 **Security**

### **Security Features**
- 🔐 Firebase Authentication with JWT tokens
- 🛡️ Secure storage for sensitive data
- 🔒 Certificate pinning for API calls
- 🚫 No sensitive data in client-side code
- 📱 App Transport Security (ATS) compliance

### **Data Protection**
- 🙈 Minimal data collection principle
- 🔐 Encrypted data storage and transmission
- 📝 Transparent privacy policy
- 🗑️ User data deletion capabilities

## 📊 **Analytics & Monitoring**

### **Tracking Events**
```typescript
// Example: Analytics tracking
import { analytics } from '@/firebase/config';

// Track user actions
analytics.logEvent('device_connected', {
  device_type: 'damp-handle',
  connection_method: 'bluetooth'
});

// Track screen views
analytics.logScreenView({
  screen_name: 'HydrationDashboard',
  screen_class: 'HydrationScreen'
});
```

### **Performance Monitoring**
- 📈 Firebase Performance Monitoring
- 🐛 Crash reporting and error tracking
- 📱 App startup time and memory usage
- 🔄 API response times and success rates

## 🔧 **Development Tools**

### **Code Quality**
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety and IntelliSense
- **Husky**: Git hooks for pre-commit checks

### **Debugging**
- **React Native Debugger**: Component inspection
- **Flipper**: Network monitoring and device logs
- **Firebase Emulator**: Local backend testing
- **Expo Dev Tools**: Real-time development

## 📚 **Documentation**

### **Key Documentation Files**
- [`DEPLOYMENT.md`](../../docs/DEPLOYMENT.md) - Complete deployment guide
- [`SECURITY.md`](../../docs/SECURITY.md) - Security best practices
- [`TESTING_OVERVIEW.md`](./TESTING_OVERVIEW.md) - Testing documentation
- [`TYPESCRIPT_CONFIGURATION_SUMMARY.md`](./TYPESCRIPT_CONFIGURATION_SUMMARY.md) - TypeScript setup

### **API Documentation**
- [Firebase Functions](../../docs/api/) - Backend API endpoints
- [Component Library](./components/README.md) - Reusable components
- [Services Documentation](./services/README.md) - Business logic modules

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and add tests
4. Run quality checks (`npm run lint && npm run test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Standards**
- Follow Google Engineering Standards
- Maintain >80% test coverage
- Use TypeScript for all new code
- Document public APIs and components
- Follow React Native best practices

## 🐛 **Troubleshooting**

### **Common Issues**

| Issue | Cause | Solution |
|-------|-------|----------|
| Metro bundler fails | Cache issues | `npx expo start --clear` |
| iOS build fails | Provisioning profile | Update certificates in EAS |
| Android build fails | Gradle configuration | Clean and rebuild |
| Firebase connection fails | Environment variables | Check `.env` configuration |
| BLE connection issues | Permissions | Enable Bluetooth permissions |

### **Getting Help**
- 📧 **Email**: support@wecr8.info
- 📱 **Admin**: zach@wecr8.info
- 📚 **Documentation**: [DAMP Docs](../../docs/)
- 🐛 **Issues**: GitHub Issues

## 📄 **License**

This project is proprietary software owned by WeCr8 Solutions LLC. All rights reserved.

---

**Built with ❤️ by WeCr8 Solutions LLC**  
*Revolutionizing hydration through smart technology*

## 🔄 **Recent Updates**

- ✅ **Firebase Integration**: Complete migration from Supabase
- ✅ **Cross-Platform Services**: Unified voting and purchasing
- ✅ **Web Deployment**: Netlify integration with security headers
- ✅ **Testing Infrastructure**: Comprehensive test suites
- ✅ **Security Hardening**: Enhanced authentication and data protection
- ✅ **Performance Optimization**: Improved app startup and responsiveness

---

*Last Updated: 2024-12-19 - Mobile App v1.0.0*