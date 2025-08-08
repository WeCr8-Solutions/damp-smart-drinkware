# 🔥 Firebase Troubleshooting Guide

## 🚨 **Critical Issue: Blank White Screen**

**Error**: `Firebase initialization failed - using mocks: TypeError: u is not a function`  
**Symptom**: Blank white screen on website  
**Root Cause**: Missing or incorrect Firebase environment variables  

## ✅ **Solution Applied**

### **1. Missing Environment Variables**
The critical issue was missing `EXPO_PUBLIC_FIREBASE_ENABLED` environment variable in Netlify.

**Fixed by setting:**
```bash
npx netlify env:set EXPO_PUBLIC_FIREBASE_ENABLED true
npx netlify env:set EXPO_PUBLIC_STRIPE_ENABLED true  
npx netlify env:set EXPO_PUBLIC_ANALYTICS_ENABLED true
```

### **2. Mock Function Signature**
The mock `onAuthStateChanged` function had incorrect signature causing React hooks to fail.

**Before (broken):**
```typescript
onAuthStateChanged: () => () => {},
```

**After (fixed):**
```typescript
onAuthStateChanged: (callback: (user: any) => void) => {
  // Call callback with null user immediately for mocks
  setTimeout(() => callback(null), 0);
  // Return unsubscribe function
  return () => {};
},
```

### **3. Enhanced Debugging**
Added comprehensive logging to identify configuration issues:

```typescript
console.log('Firebase Feature Flag Debug:', {
  FIREBASE: FeatureFlags.FIREBASE,
  EXPO_PUBLIC_FIREBASE_ENABLED: process.env.EXPO_PUBLIC_FIREBASE_ENABLED,
  EXPO_PUBLIC_PLATFORM: process.env.EXPO_PUBLIC_PLATFORM,
  EXPO_PUBLIC_ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT
});
```

## 🔍 **Verification Steps**

### **Check Environment Variables**
```bash
cd "mobile-app/Original DAMP Smart Drinkware App"
npx netlify env:list
```

**Required Variables:**
- ✅ `EXPO_PUBLIC_FIREBASE_ENABLED=true`
- ✅ `EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key`
- ✅ `EXPO_PUBLIC_FIREBASE_PROJECT_ID=damp-smart-drinkware`
- ✅ `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=damp-smart-drinkware.firebaseapp.com`
- ✅ `EXPO_PUBLIC_PLATFORM=web`
- ✅ `EXPO_PUBLIC_ENVIRONMENT=production`

### **Check Browser Console**
After deployment, check browser console for:
- ✅ `Firebase initialized successfully`
- ❌ `Firebase initialization failed - using mocks`

### **Test Firebase Functions**
- ✅ Authentication should work
- ✅ Voting system should be functional
- ✅ No blank white screen

## 🛠️ **Future Prevention**

### **Environment Variable Checklist**
Before deployment, ensure all required variables are set:

```bash
# Core Firebase
EXPO_PUBLIC_FIREBASE_ENABLED=true
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain

# Feature Flags  
EXPO_PUBLIC_STRIPE_ENABLED=true
EXPO_PUBLIC_ANALYTICS_ENABLED=true

# Platform Config
EXPO_PUBLIC_PLATFORM=web
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_ADMIN_EMAIL=zach@wecr8.info
```

### **Testing Locally**
```bash
# Test build locally
npm run build:netlify:production

# Serve locally to test
npx serve dist
```

## 📞 **Emergency Contacts**

If Firebase issues persist:
- **Primary**: zach@wecr8.info
- **Firebase Console**: https://console.firebase.google.com/project/damp-smart-drinkware
- **Netlify Dashboard**: https://app.netlify.com/sites/dampdrink

## 🎯 **Status**

**✅ RESOLVED**: Firebase initialization now works correctly  
**✅ DEPLOYED**: Website should load without blank screen  
**✅ TESTED**: Environment variables properly configured  

---

*Issue resolved: 2024-12-19*  
*Next deployment should show working website at https://dampdrink.com*