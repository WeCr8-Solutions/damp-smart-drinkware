/**
 * 🔧 DAMP Smart Drinkware - Unified Configuration
 * Ensures consistency between web and mobile platforms
 * Owner: zach@wecr8.info
 */

import { FeatureFlags } from './feature-flags';

// Platform detection
export const PLATFORM = {
  isWeb: typeof window !== 'undefined',
  isMobile: typeof window === 'undefined',
  isIOS: false, // Will be set by React Native Platform
  isAndroid: false, // Will be set by React Native Platform
} as const;

// Database configuration (Firebase)
export const DATABASE_CONFIG = {
  // Firebase project configuration
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'damp-smart-drinkware',
  owner: process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'zach@wecr8.info',
  
  // Collection names (consistent across platforms)
  collections: {
    // User management
    users: 'users',
    userProfiles: 'userProfiles',
    userVotes: 'userVotes',
    userDevices: 'userDevices',
    
    // Product voting
    voting: 'voting',
    publicVotes: 'publicVotes',
    voteSubmissions: 'voteSubmissions',
    
    // E-commerce
    products: 'products',
    orders: 'orders',
    preOrders: 'preOrders',
    cart: 'cart',
    
    // Subscriptions
    subscriptions: 'subscriptions',
    subscriptionPlans: 'subscriptionPlans',
    
    // Device management
    devices: 'devices',
    deviceData: 'deviceData',
    deviceSessions: 'deviceSessions',
    
    // Analytics
    analytics: 'analytics',
    events: 'events',
    
    // Store configuration
    store: 'store',
    settings: 'settings'
  },
  
  // Document structure for voting
  votingDocuments: {
    authenticated: 'voting/products',
    public: 'voting/public'
  }
} as const;

// Authentication configuration
export const AUTH_CONFIG = {
  // Firebase Auth settings
  persistence: 'local',
  
  // User roles and permissions
  roles: {
    superAdmin: 'super_admin',
    admin: 'admin',
    user: 'user',
    guest: 'guest'
  },
  
  // Super admin configuration
  superAdmins: [
    'zach@wecr8.info'
  ],
  
  // Auth requirements
  requireAuth: {
    voting: true,
    purchasing: false, // Allow guest checkout
    deviceManagement: true,
    subscription: true
  }
} as const;

// Product configuration (consistent across platforms)
export const PRODUCT_CONFIG = {
  categories: {
    handle: {
      id: 'handle',
      name: 'DAMP Handle',
      description: 'Universal clip-on handle for any drinkware',
      basePrice: 49.99,
      estimatedShipping: 'Q2 2025'
    },
    siliconeBottom: {
      id: 'silicone-bottom',
      name: 'Silicone Bottom',
      description: 'Non-slip smart base for bottles and tumblers',
      basePrice: 34.99,
      estimatedShipping: 'Q3 2025'
    },
    cupSleeve: {
      id: 'cup-sleeve',
      name: 'Cup Sleeve',
      description: 'Adjustable smart sleeve with thermal insulation',
      basePrice: 39.99,
      estimatedShipping: 'Q4 2025'
    },
    babyBottle: {
      id: 'baby-bottle',
      name: 'Baby Bottle',
      description: 'Smart baby bottle with feeding tracking',
      basePrice: 59.99,
      estimatedShipping: 'Q1 2026'
    }
  },
  
  // Voting initial data
  initialVotingData: {
    handle: { votes: 0, percentage: 0 },
    siliconeBottom: { votes: 0, percentage: 0 },
    cupSleeve: { votes: 0, percentage: 0 },
    babyBottle: { votes: 0, percentage: 0 }
  },
  
  // E-commerce settings
  ecommerce: {
    taxRate: 0.08, // 8%
    freeShippingThreshold: 50.00,
    standardShippingCost: 9.99,
    currency: 'USD',
    allowGuestCheckout: true
  }
} as const;

// Subscription configuration
export const SUBSCRIPTION_CONFIG = {
  plans: {
    basic: {
      id: 'damp_basic',
      name: 'DAMP Basic',
      price: 2.99,
      interval: 'month',
      features: [
        'Basic device connectivity',
        'Temperature monitoring',
        'Mobile app access',
        'Email support'
      ]
    },
    premium: {
      id: 'damp_premium',
      name: 'DAMP Premium',
      price: 9.99,
      interval: 'month',
      features: [
        'All Basic features',
        'Advanced analytics',
        'Custom notifications',
        'Priority support',
        'Early access to new features'
      ]
    },
    family: {
      id: 'damp_family',
      name: 'DAMP Family',
      price: 19.99,
      interval: 'month',
      features: [
        'All Premium features',
        'Up to 6 family members',
        'Shared device management',
        'Family health insights',
        'Premium support'
      ]
    }
  }
} as const;

// API endpoints (consistent across platforms)
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://dampdrink.com/api',
  
  endpoints: {
    // Authentication
    auth: '/auth',
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    
    // Voting
    voting: '/voting',
    vote: '/voting/vote',
    
    // Products
    products: '/products',
    preorder: '/products/preorder',
    
    // Orders
    orders: '/orders',
    checkout: '/checkout',
    
    // Subscriptions
    subscriptions: '/subscriptions',
    
    // Devices
    devices: '/devices',
    
    // Analytics
    analytics: '/analytics'
  },
  
  // Timeouts
  timeout: 10000, // 10 seconds
  retryAttempts: 3
} as const;

// Feature flags for cross-platform consistency
export const UNIFIED_FEATURES = {
  // Core features
  authentication: FeatureFlags.FIREBASE,
  voting: FeatureFlags.FIREBASE,
  purchasing: FeatureFlags.FIREBASE && FeatureFlags.STRIPE,
  deviceManagement: FeatureFlags.FIREBASE && FeatureFlags.BLE,
  subscriptions: FeatureFlags.FIREBASE && FeatureFlags.STRIPE,
  analytics: FeatureFlags.FIREBASE && FeatureFlags.ANALYTICS,
  
  // Platform-specific features
  webFeatures: {
    pwa: false, // Disabled as requested
    pushNotifications: true,
    offlineMode: true
  },
  
  mobileFeatures: {
    bluetooth: FeatureFlags.BLE,
    pushNotifications: true,
    backgroundSync: true,
    biometricAuth: true
  }
} as const;

// URL configuration
export const URL_CONFIG = {
  website: 'https://dampdrink.com',
  admin: 'https://app.netlify.com/projects/damp-smart-drinkware',
  support: 'mailto:zach@wecr8.info',
  privacy: 'https://dampdrink.com/privacy',
  terms: 'https://dampdrink.com/terms',
  
  // Deep linking (mobile)
  scheme: 'dampapp',
  universalLinks: 'https://dampdrink.com/app'
} as const;

// Error messages (consistent across platforms)
export const ERROR_MESSAGES = {
  // Authentication
  authRequired: 'Please log in to continue',
  invalidCredentials: 'Invalid email or password',
  accountExists: 'An account with this email already exists',
  
  // Voting
  alreadyVoted: 'You have already voted for this product',
  votingFailed: 'Unable to submit your vote. Please try again.',
  
  // Purchasing
  emptyCart: 'Your cart is empty',
  paymentFailed: 'Payment failed. Please try again.',
  orderFailed: 'Unable to create order. Please try again.',
  
  // General
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',
  unknownError: 'An unexpected error occurred'
} as const;

// Success messages (consistent across platforms)
export const SUCCESS_MESSAGES = {
  // Authentication
  loginSuccess: 'Successfully logged in',
  signupSuccess: 'Account created successfully',
  logoutSuccess: 'Successfully logged out',
  
  // Voting
  voteSubmitted: 'Thank you for voting! Your voice helps us prioritize development.',
  
  // Purchasing
  orderCreated: 'Order created successfully',
  paymentSuccess: 'Payment completed successfully',
  preOrderSubmitted: 'Pre-order submitted successfully',
  
  // General
  dataUpdated: 'Data updated successfully',
  settingsSaved: 'Settings saved successfully'
} as const;

// Export unified configuration object
export const UnifiedConfig = {
  platform: PLATFORM,
  database: DATABASE_CONFIG,
  auth: AUTH_CONFIG,
  products: PRODUCT_CONFIG,
  subscriptions: SUBSCRIPTION_CONFIG,
  api: API_CONFIG,
  features: UNIFIED_FEATURES,
  urls: URL_CONFIG,
  errors: ERROR_MESSAGES,
  success: SUCCESS_MESSAGES
} as const;

export default UnifiedConfig;