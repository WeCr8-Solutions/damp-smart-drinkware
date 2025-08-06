// DAMP Smart Drinkware - Universal User Data Schema
// Consistent user data structure across Web, iOS, and Android
// Copyright 2025 WeCr8 Solutions LLC

/**
 * Universal User Document Schema
 * Used consistently across all platforms (Web, iOS, Android)
 * Stored in Firestore: /users/{uid}
 */
export const USER_SCHEMA = {
  // Core Firebase Auth Fields
  uid: String, // Firebase Auth UID (primary key)
  email: String, // User's email address
  displayName: String || null, // User's display name
  photoURL: String || null, // Profile picture URL
  emailVerified: Boolean, // Email verification status
  phoneNumber: String || null, // Phone number (optional)
  
  // Platform & Session Info
  platform: String, // 'web', 'ios', 'android'
  createdAt: 'serverTimestamp', // Account creation timestamp
  updatedAt: 'serverTimestamp', // Last profile update
  lastSignIn: 'serverTimestamp', // Last sign in timestamp
  lastSeen: 'serverTimestamp', // Last activity timestamp
  isOnline: Boolean, // Current online status
  
  // User Preferences (synchronized across platforms)
  preferences: {
    // Notification Settings
    notifications: {
      push: Boolean, // Push notifications enabled
      email: Boolean, // Email notifications enabled
      sms: Boolean, // SMS notifications enabled
      marketing: Boolean, // Marketing communications
      productUpdates: Boolean, // Product update notifications
      orderUpdates: Boolean, // Order status notifications
      votingReminders: Boolean, // Voting reminder notifications
    },
    
    // App Settings
    app: {
      darkMode: Boolean, // Dark/light theme preference
      language: String, // Preferred language ('en', 'es', 'fr', etc.)
      currency: String, // Preferred currency ('USD', 'EUR', 'CAD', etc.)
      units: String, // Temperature units ('celsius', 'fahrenheit')
      autoSync: Boolean, // Auto-sync across devices
    },
    
    // Privacy Settings
    privacy: {
      shareAnalytics: Boolean, // Share usage analytics
      shareLocation: Boolean, // Share location data
      profileVisibility: String, // 'public', 'friends', 'private'
      activityVisibility: String, // 'public', 'friends', 'private'
    },
    
    // Device Settings (mobile only)
    device: {
      biometricEnabled: Boolean, // Biometric authentication
      autoLock: Number, // Auto-lock timeout (minutes)
      hapticFeedback: Boolean, // Haptic feedback enabled
      soundEffects: Boolean, // Sound effects enabled
    }
  },
  
  // User Statistics & Activity
  stats: {
    votesCount: Number, // Total votes cast
    ordersCount: Number, // Total orders placed
    reviewsCount: Number, // Total reviews written
    loyaltyPoints: Number, // Current loyalty points balance
    referralsCount: Number, // Successful referrals
    streakDays: Number, // Current voting streak
    totalSpent: Number, // Total amount spent (cents)
    
    // Platform-specific stats
    platformStats: {
      web: {
        sessionsCount: Number,
        totalTimeSpent: Number, // seconds
      },
      mobile: {
        appOpens: Number,
        pushNotificationClicks: Number,
      }
    }
  },
  
  // Social & Community
  social: {
    following: Array, // Array of user UIDs they follow
    followers: Array, // Array of user UIDs that follow them
    blockedUsers: Array, // Array of blocked user UIDs
    friendRequests: Array, // Pending friend requests
  },
  
  // Loyalty & Rewards
  loyalty: {
    tier: String, // 'bronze', 'silver', 'gold', 'platinum'
    points: Number, // Current points balance
    lifetimePoints: Number, // Total points earned
    nextTierRequirement: Number, // Points needed for next tier
    rewards: Array, // Array of earned rewards
    redemptions: Array, // Array of redeemed rewards
  },
  
  // Connected Devices (IoT integration)
  devices: Array, // Array of connected DAMP devices
  /*
  devices: [
    {
      deviceId: String,
      deviceType: String, // 'handle', 'bottom', 'sleeve', 'bottle'
      name: String, // User-defined device name
      macAddress: String,
      firmwareVersion: String,
      batteryLevel: Number,
      lastSeen: 'serverTimestamp',
      settings: Object, // Device-specific settings
      isActive: Boolean,
    }
  ]
  */
  
  // Subscription & Billing
  subscription: {
    plan: String || null, // 'free', 'premium', 'pro'
    status: String, // 'active', 'cancelled', 'past_due', 'trialing'
    startDate: 'serverTimestamp',
    endDate: 'serverTimestamp',
    stripeCustomerId: String || null,
    paymentMethods: Array, // Array of payment method IDs
    billingHistory: Array, // Array of billing records
  },
  
  // Address & Shipping
  addresses: Array,
  /*
  addresses: [
    {
      id: String,
      type: String, // 'home', 'work', 'other'
      name: String, // Address nickname
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      isDefault: Boolean,
    }
  ]
  */
  
  // Authentication Methods
  authMethods: Array, // Array of enabled auth methods
  /*
  authMethods: [
    'email', 'google', 'apple', 'facebook', 'biometric'
  ]
  */
  
  // Role & Permissions
  role: String, // 'user', 'beta_tester', 'moderator', 'admin'
  permissions: Array, // Array of special permissions
  
  // Marketing & Attribution
  marketing: {
    source: String || null, // How they found us
    campaign: String || null, // Marketing campaign
    referredBy: String || null, // Referrer UID
    utmSource: String || null,
    utmMedium: String || null,
    utmCampaign: String || null,
  },
  
  // Beta Testing & Feature Flags
  beta: {
    isBetaTester: Boolean,
    betaFeatures: Array, // Array of enabled beta features
    feedbackCount: Number, // Number of feedback submissions
  },
  
  // Security & Audit
  security: {
    lastPasswordChange: 'serverTimestamp',
    loginAttempts: Number, // Failed login attempts
    accountLocked: Boolean,
    twoFactorEnabled: Boolean,
    backupCodes: Array, // Encrypted backup codes
    ipAddress: String, // Last known IP
    userAgent: String, // Last known user agent
  }
};

/**
 * Default user data for new accounts
 */
export const DEFAULT_USER_DATA = {
  preferences: {
    notifications: {
      push: true,
      email: true,
      sms: false,
      marketing: true,
      productUpdates: true,
      orderUpdates: true,
      votingReminders: true,
    },
    app: {
      darkMode: false,
      language: 'en',
      currency: 'USD',
      units: 'fahrenheit',
      autoSync: true,
    },
    privacy: {
      shareAnalytics: true,
      shareLocation: false,
      profileVisibility: 'public',
      activityVisibility: 'friends',
    },
    device: {
      biometricEnabled: false,
      autoLock: 5,
      hapticFeedback: true,
      soundEffects: true,
    }
  },
  stats: {
    votesCount: 0,
    ordersCount: 0,
    reviewsCount: 0,
    loyaltyPoints: 100, // Welcome bonus
    referralsCount: 0,
    streakDays: 0,
    totalSpent: 0,
    platformStats: {
      web: { sessionsCount: 0, totalTimeSpent: 0 },
      mobile: { appOpens: 0, pushNotificationClicks: 0 }
    }
  },
  social: {
    following: [],
    followers: [],
    blockedUsers: [],
    friendRequests: [],
  },
  loyalty: {
    tier: 'bronze',
    points: 100,
    lifetimePoints: 100,
    nextTierRequirement: 500,
    rewards: [],
    redemptions: [],
  },
  devices: [],
  subscription: {
    plan: 'free',
    status: 'active',
    startDate: 'serverTimestamp',
    endDate: null,
    stripeCustomerId: null,
    paymentMethods: [],
    billingHistory: [],
  },
  addresses: [],
  authMethods: ['email'],
  role: 'user',
  permissions: [],
  marketing: {
    source: null,
    campaign: null,
    referredBy: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
  },
  beta: {
    isBetaTester: false,
    betaFeatures: [],
    feedbackCount: 0,
  },
  security: {
    lastPasswordChange: 'serverTimestamp',
    loginAttempts: 0,
    accountLocked: false,
    twoFactorEnabled: false,
    backupCodes: [],
    ipAddress: null,
    userAgent: null,
  }
};

/**
 * Validation helper functions
 */
export const validateUserData = (userData) => {
  const errors = [];
  
  // Required fields
  if (!userData.uid) errors.push('UID is required');
  if (!userData.email) errors.push('Email is required');
  if (!userData.platform) errors.push('Platform is required');
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (userData.email && !emailRegex.test(userData.email)) {
    errors.push('Invalid email format');
  }
  
  // Platform validation
  const validPlatforms = ['web', 'ios', 'android'];
  if (userData.platform && !validPlatforms.includes(userData.platform)) {
    errors.push('Invalid platform');
  }
  
  return errors.length === 0 ? null : errors;
};

/**
 * Helper function to merge user data with defaults
 */
export const mergeWithDefaults = (userData, platform) => {
  return {
    ...DEFAULT_USER_DATA,
    ...userData,
    platform,
    preferences: {
      ...DEFAULT_USER_DATA.preferences,
      ...userData.preferences,
    },
    stats: {
      ...DEFAULT_USER_DATA.stats,
      ...userData.stats,
    },
    // Merge other nested objects as needed
  };
};

export default USER_SCHEMA;