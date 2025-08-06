// DAMP Smart Drinkware - Universal Firebase Configuration
// Cross-platform configuration for Web, iOS, and Android
// Copyright 2025 WeCr8 Solutions LLC

export const FIREBASE_CONFIG = {
  // Core Firebase Project Settings
  projectId: "damp-smart-drinkware",
  authDomain: "damp-smart-drinkware.firebaseapp.com", 
  storageBucket: "damp-smart-drinkware.firebasestorage.app",
  messagingSenderId: "309818614427",
  appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
  measurementId: "G-YW2BN4SVPQ",
  databaseURL: "https://damp-smart-drinkware-default-rtdb.firebaseio.com",
  
  // Platform-specific API Keys (set via environment variables)
  apiKey: {
    web: process.env.FIREBASE_WEB_API_KEY || "your_web_api_key_here",
    ios: process.env.FIREBASE_IOS_API_KEY || "your_ios_api_key_here", 
    android: process.env.FIREBASE_ANDROID_API_KEY || "your_android_api_key_here"
  },
  
  // OAuth Configuration (same across all platforms)
  oauth: {
    googleClientId: {
      web: "309818614427-your_web_client_id.apps.googleusercontent.com",
      ios: "309818614427-your_ios_client_id.apps.googleusercontent.com",
      android: "309818614427-your_android_client_id.apps.googleusercontent.com"
    },
    facebookAppId: "your_facebook_app_id_here",
    appleClientId: "your_apple_client_id_here" // iOS only
  },
  
  // Emulator Configuration (development only)
  emulator: {
    auth: {
      host: "127.0.0.1",
      port: 9099
    },
    firestore: {
      host: "127.0.0.1", 
      port: 8080
    },
    functions: {
      host: "127.0.0.1",
      port: 5001
    },
    storage: {
      host: "127.0.0.1",
      port: 9199
    }
  },
  
  // Remote Config Defaults (consistent across platforms)
  remoteConfigDefaults: {
    alert_distance_threshold: 10,
    battery_warning_threshold: 20,
    notification_cooldown_minutes: 15,
    app_maintenance_mode: false,
    support_contact_email: "support@dampdrink.com",
    feature_flags: {
      enable_biometric_auth: true,
      enable_social_login: true,
      enable_offline_mode: true,
      enable_analytics: true
    }
  },
  
  // Push Notification Configuration
  messaging: {
    vapidKey: "your_vapid_key_here", // Web only
    apnsKeyId: "your_apns_key_id", // iOS only  
    fcmServerKey: "your_fcm_server_key" // Android only
  }
};

// Platform Detection Helper
export const getPlatform = () => {
  if (typeof window !== 'undefined') {
    return 'web';
  } else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return Platform.OS; // 'ios' or 'android' 
  }
  return 'unknown';
};

// Get Platform-Specific Config
export const getPlatformConfig = () => {
  const platform = getPlatform();
  
  return {
    ...FIREBASE_CONFIG,
    apiKey: FIREBASE_CONFIG.apiKey[platform] || FIREBASE_CONFIG.apiKey.web,
    googleClientId: FIREBASE_CONFIG.oauth.googleClientId[platform] || FIREBASE_CONFIG.oauth.googleClientId.web
  };
};

// Environment Detection
export const isDevelopment = () => {
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__; // React Native
  }
  return process.env.NODE_ENV === 'development' || 
         (typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1'));
};

export default FIREBASE_CONFIG;