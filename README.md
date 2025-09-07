# 🥤 DAMP Smart Drinkware - Complete IoT Ecosystem

[![Netlify Status](https://api.netlify.com/api/v1/badges/b498fd04-120f-47e0-8971-0f076976e08d/deploy-status)](https://app.netlify.com/sites/dampdrink/deploys)
[![Firebase](https://img.shields.io/badge/Firebase-Ready-orange)](https://console.firebase.google.com/project/damp-smart-drinkware)
[![Mobile App](https://img.shields.io/badge/Mobile-React%20Native-blue)](./mobile-app/Original%20DAMP%20Smart%20Drinkware%20App/)
[![Website](https://img.shields.io/badge/Website-Live-green)](https://dampdrink.com)

> Revolutionary smart drinkware ecosystem combining IoT hardware, mobile applications, and web platforms for intelligent hydration tracking and user engagement.

## 🏗️ **Project Architecture**

```
damp-smart-drinkware/
├── 📱 mobile-app/Original DAMP Smart Drinkware App/  # React Native/Expo Mobile App
├── 🌐 website/                                      # Web Application & Landing
├── 🔧 backend/                                      # API Services & Functions
├── 🛠️ firmware/                                     # IoT Device Firmware
├── 📊 hardware/                                     # PCB & CAD Designs
├── 📚 docs/                                         # Documentation Hub
├── 🧪 testing/                                      # Test Suites
└── 📈 analytics/                                    # Data & Jupyter Notebooks
```

## 🎯 **Live Deployments**

| Platform | URL | Status | Purpose |
|----------|-----|--------|---------|
| **Website** | [dampdrink.com](https://dampdrink.com) | 🟢 Live | Product showcase, e-commerce, voting |
| **Mobile App** | iOS/Android Stores | 🟡 Staging | Cup tracking, device management |
| **Firebase** | [Console](https://console.firebase.google.com/project/damp-smart-drinkware) | 🟢 Active | Backend services, auth, database |
| **Netlify** | [Dashboard](https://app.netlify.com/sites/dampdrink) | 🟢 Deployed | Web hosting & CI/CD |

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm 10+
- Firebase CLI (`npm install -g firebase-tools`)
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)

### **1. Clone & Setup**
```bash
git clone https://github.com/WeCr8/damp-smart-drinkware.git
cd damp-smart-drinkware
```

### **2. Mobile App Development**
```bash
cd "mobile-app/Original DAMP Smart Drinkware App"
npm install
npm run dev                    # Start Expo development server
npm run build:web              # Build for web
npm run test                   # Run test suite
```

### **3. Website Development**
```bash
cd website
# Website uses vanilla JS/HTML - open index.html or deploy to Netlify
```

### **4. Firebase Setup**
```bash
firebase login
firebase use damp-smart-drinkware
firebase deploy --only functions  # Deploy cloud functions
```

## 📱 **Mobile Application**

**Location**: `mobile-app/Original DAMP Smart Drinkware App/`
**Framework**: React Native with Expo
**Deployment**: iOS/Android via EAS Build

### **Key Features**
- 🔐 Firebase Authentication
- 📱 Cross-platform (iOS/Android/Web)
- 🥤 Smart cup tracking & hydration monitoring
- 📊 Real-time device data sync
- 🗳️ Product voting system
- 💳 Stripe payment integration
- 🔔 Push notifications
- 📴 Offline mode support

### **Mobile Commands**
```bash
# Development
npm run dev                           # Start development server
npm run ios                          # Run on iOS simulator
npm run android                      # Run on Android emulator

# Building
npm run build:web                    # Web build
npm run build:netlify:production     # Production web build
eas build --platform all            # Native builds

# Testing
npm run test                         # Unit tests
npm run test:integration             # Integration tests
npm run test:e2e                     # End-to-end tests
```

## 🌐 **Website**

**Location**: `website/`
**Framework**: Vanilla HTML/CSS/JavaScript
**Deployment**: Netlify with Firebase integration

### **Key Features**
- 🏠 Product showcase & landing pages
- 🛒 E-commerce with Stripe checkout
- 🗳️ Real-time product voting
- 📱 Mobile app promotion
- 🔐 Firebase authentication
- 📊 Analytics & SEO optimization
- 📱 Responsive design

### **Website Structure**
```
website/
├── index.html              # Main landing page
├── pages/                  # Product & info pages
├── js/                     # JavaScript modules
│   ├── firebase-services.js
│   ├── unified-firebase-services.js
│   └── components/
├── assets/                 # Images, fonts, icons
└── api/                    # Serverless functions
```

## 🔧 **Backend Services**

**Firebase Project**: `damp-smart-drinkware`
**Services**: Authentication, Firestore, Cloud Functions, Storage

### **Firebase Functions**
- **Authentication**: User management & profiles
- **Voting System**: Real-time product preference tracking
- **E-commerce**: Stripe payment processing
- **Device Management**: IoT device registration & data
- **Analytics**: User behavior & product metrics

### **Database Schema**
```javascript
// Firestore Collections
users/              # User profiles & preferences
devices/            # Smart drinkware devices
voting/             # Product voting data
orders/             # E-commerce transactions
analytics/          # Usage metrics
```

## 🛠️ **Hardware & Firmware**

### **Smart Drinkware Products**
1. **DAMP Handle Universal** - Clip-on temperature & hydration tracking
2. **Silicone Bottom v1.0** - Smart base with wireless charging
3. **Cup Sleeve Adjustable** - Thermal insulation with spill detection
4. **Smart Baby Bottle** - Feeding time & volume tracking

### **Firmware Architecture**
```
firmware/
├── common/                 # Shared libraries
│   ├── ble/               # Bluetooth Low Energy
│   ├── sensors/           # Temperature, volume, motion
│   └── power/             # Battery management
├── damp-handle/           # Handle-specific code
├── silicone-bottom/       # Base-specific code
├── cup-sleeve/            # Sleeve-specific code
└── baby-bottle/           # Bottle-specific code
```

## 📊 **Analytics & Data Science**

### **Jupyter Notebooks** (Coming Soon)
- `analytics/user-behavior-analysis.ipynb` - User engagement patterns
- `analytics/product-performance.ipynb` - Product usage metrics
- `analytics/voting-trends.ipynb` - Community preference analysis
- `analytics/device-health-monitoring.ipynb` - IoT device diagnostics

### **Key Metrics**
- 📈 User engagement & retention
- 🗳️ Product voting trends
- 📱 Cross-platform usage patterns
- 🥤 Hydration tracking effectiveness
- 💰 E-commerce conversion rates

## 🔒 **Security & Privacy**

### **Security Measures**
- 🔐 Firebase Authentication with secure tokens
- 🛡️ Content Security Policy (CSP) headers
- 🔒 HTTPS/TLS encryption for all communications
- 🚫 No sensitive data in client-side code
- 🔑 Environment variables for API keys
- 📱 App Transport Security (ATS) compliance

### **Privacy Protection**
- 🙈 Minimal data collection principle
- 📝 Transparent privacy policy
- 🗑️ User data deletion capabilities
- 🔐 Encrypted data storage
- 🚫 No third-party data sharing

### **Environment Variables** (Secure Setup Required)
```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=damp-smart-drinkware
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=damp-smart-drinkware.firebaseapp.com

# Platform Configuration
EXPO_PUBLIC_PLATFORM=web|mobile
EXPO_PUBLIC_ENVIRONMENT=development|staging|production
EXPO_PUBLIC_ADMIN_EMAIL=your_admin_email

# Never commit actual values - use .env files locally and secure CI/CD variables
```

## 🧪 **Testing Strategy**

### **Test Coverage**
- ✅ Unit Tests (Jest)
- ✅ Integration Tests (Firebase, Stripe)
- ✅ End-to-End Tests (Detox)
- ✅ Performance Tests (Reassure)
- ✅ Accessibility Tests (React Native Testing Library)

### **Test Commands**
```bash
npm run test                    # All tests
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests
npm run test:e2e              # End-to-end tests
npm run test:performance      # Performance tests
npm run test:coverage         # Coverage report
```

## 🚀 **Deployment**

### **Automated Deployments**
- **Website**: Auto-deploy to Netlify on `main` branch push
- **Mobile**: Manual EAS builds for iOS/Android
- **Firebase**: Manual function deployments

### **Deployment Commands**
```bash
# Website (Automatic via Git push)
git push origin main

# Mobile App
eas build --platform all              # Build for iOS/Android
eas submit --platform all             # Submit to app stores

# Firebase Functions
firebase deploy --only functions      # Deploy cloud functions
firebase deploy --only firestore      # Deploy Firestore rules
```

## 📚 **Documentation**

| Document | Purpose | Location |
|----------|---------|----------|
| [Mobile App Docs](./mobile-app/Original%20DAMP%20Smart%20Drinkware%20App/README.md) | Mobile development guide | `/mobile-app/` |
| [Website Docs](./website/README.md) | Web development guide | `/website/` |
| [API Documentation](./docs/api/) | Firebase functions & endpoints | `/docs/api/` |
| [Hardware Specs](./docs/hardware/) | Device specifications | `/docs/hardware/` |
| [Security Guide](./docs/SECURITY.md) | Security best practices | `/docs/` |
| [Deployment Guide](./docs/DEPLOYMENT.md) | Complete deployment instructions | `/docs/` |

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow Google Engineering Standards
- Maintain test coverage >80%
- Use TypeScript for type safety
- Follow security best practices
- Document all public APIs

## 📞 **Support & Contact**

- **Website**: [dampdrink.com](https://dampdrink.com)
- **Email**: [support@wecr8.info](mailto:support@wecr8.info)
- **Company**: WeCr8 Solutions LLC
- **Admin**: [zach@wecr8.info](mailto:zach@wecr8.info)

## 📄 **License**

This project is proprietary software owned by WeCr8 Solutions LLC. All rights reserved.

---

**Built with ❤️ by WeCr8 Solutions LLC**
*Revolutionizing hydration through smart technology*

## 🔄 **Recent Updates**

- ✅ **Firebase Integration**: Complete Firebase setup with authentication
- ✅ **Cross-Platform Services**: Unified voting and purchasing systems
- ✅ **Netlify Deployment**: Automated web deployment with security headers
- ✅ **Mobile App Architecture**: React Native with Expo Router
- ✅ **Security Hardening**: CSP headers, secure environment variables
- ✅ **Testing Infrastructure**: Comprehensive test suites across platforms

---

*Last Updated: $(date +'%Y-%m-%d') - Version 1.0.0*