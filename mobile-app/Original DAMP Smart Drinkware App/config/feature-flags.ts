/**
 * Feature Flags Configuration
 * Allows disabling features that require missing API keys
 */

export const FeatureFlags = {
  // Core database and auth - Firebase only (Owner: zach@wecr8.info)
  FIREBASE: process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true',
  
  // Additional features
  STRIPE: process.env.EXPO_PUBLIC_STRIPE_ENABLED === 'true',
  BLE: process.env.EXPO_PUBLIC_BLE_ENABLED === 'true',
  ANALYTICS: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true',
  
  // Platform-specific features
  WEB_BUILD: process.env.EXPO_PUBLIC_PLATFORM === 'web' || typeof window !== 'undefined',
  MOBILE_BUILD: process.env.EXPO_PUBLIC_PLATFORM === 'mobile' || typeof window === 'undefined',
  
  // Development features
  DEBUG_MODE: process.env.EXPO_PUBLIC_ENVIRONMENT === 'development',
  MOCK_DATA: process.env.EXPO_PUBLIC_ENVIRONMENT === 'development',
  
  // Admin features
  IS_SUPER_ADMIN: process.env.EXPO_PUBLIC_ADMIN_EMAIL === 'zach@wecr8.info',
};

export const isFeatureEnabled = (feature: keyof typeof FeatureFlags): boolean => {
  return FeatureFlags[feature] === true;
};

export const getEnabledFeatures = (): string[] => {
  return Object.entries(FeatureFlags)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
};

export const getDisabledFeatures = (): string[] => {
  return Object.entries(FeatureFlags)
    .filter(([, enabled]) => !enabled)
    .map(([feature]) => feature);
};