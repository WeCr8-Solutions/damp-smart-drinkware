// DAMP Smart Drinkware - Universal Authentication Service
// Cross-platform authentication for Web, iOS, and Android
// Copyright 2025 WeCr8 Solutions LLC

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  reload
} from 'firebase/auth';

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';

import { getPlatform, isDevelopment } from '../config/firebase-config';

/**
 * Universal DAMP Authentication Service
 * Works consistently across Web, iOS, and Android platforms
 */
export class DAMPAuthService {
  constructor(firebaseAuth, firestore, analytics = null) {
    this.auth = firebaseAuth;
    this.db = firestore;
    this.analytics = analytics;
    this.platform = getPlatform();
    this.currentUser = null;
    this.authStateListeners = [];
    
    // Initialize authentication state monitoring
    this.initializeAuthState();
    
    // Setup OAuth providers
    this.setupOAuthProviders();
    
    // Setup biometric authentication (mobile only)
    if (this.platform !== 'web') {
      this.setupBiometricAuth();
    }
  }

  /**
   * Setup OAuth providers with platform-specific configurations
   */
  setupOAuthProviders() {
    // Google OAuth
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
    
    // Facebook OAuth  
    this.facebookProvider = new FacebookAuthProvider();
    this.facebookProvider.addScope('email');
    
    // Apple OAuth (iOS only)
    if (this.platform === 'ios') {
      this.appleProvider = new OAuthProvider('apple.com');
      this.appleProvider.addScope('email');
      this.appleProvider.addScope('name');
    }
  }

  /**
   * Setup biometric authentication (mobile only)
   */
  async setupBiometricAuth() {
    if (this.platform === 'web') return;
    
    try {
      // React Native Biometrics setup will go here
      // Import and initialize react-native-biometrics
      console.log('🔐 Biometric authentication available on', this.platform);
    } catch (error) {
      console.warn('⚠️ Biometric authentication not available:', error);
    }
  }

  /**
   * Initialize authentication state monitoring
   */
  initializeAuthState() {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        await this.handleUserSignIn(user);
        this.trackAnalytics('user_sign_in', { 
          method: 'state_change',
          platform: this.platform 
        });
      } else {
        this.handleUserSignOut();
      }
      
      // Notify all listeners
      this.authStateListeners.forEach(callback => callback(user));
    });
  }

  /**
   * Register for authentication state changes
   */
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Create account with email and password
   */
  async createAccount(email, password, displayName = null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create user profile in Firestore
      await this.createUserProfile(user, { displayName });
      
      this.trackAnalytics('sign_up', { 
        method: 'email', 
        platform: this.platform 
      });
      
      return { success: true, user };
      
    } catch (error) {
      console.error('Account creation error:', error);
      return { success: false, error: this.formatError(error) };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      this.trackAnalytics('login', { 
        method: 'email', 
        platform: this.platform 
      });
      
      return { success: true, user: userCredential.user };
      
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: this.formatError(error) };
    }
  }

  /**
   * Sign in with Google
   * Platform-specific implementation
   */
  async signInWithGoogle() {
    try {
      let userCredential;
      
      if (this.platform === 'web') {
        // Web: Use popup or redirect
        userCredential = await signInWithPopup(this.auth, this.googleProvider);
      } else {
        // Mobile: Use React Native Google Sign-In
        // Implementation will depend on @react-native-google-signin/google-signin
        throw new Error('Mobile Google Sign-In not yet implemented');
      }
      
      this.trackAnalytics('login', { 
        method: 'google', 
        platform: this.platform 
      });
      
      return { success: true, user: userCredential.user };
      
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: this.formatError(error) };
    }
  }

  /**
   * Sign in with Apple (iOS only)
   */
  async signInWithApple() {
    if (this.platform !== 'ios') {
      return { success: false, error: 'Apple Sign-In only available on iOS' };
    }
    
    try {
      // Implementation will depend on @react-native-apple-authentication
      throw new Error('Apple Sign-In not yet implemented');
      
    } catch (error) {
      console.error('Apple sign in error:', error);
      return { success: false, error: this.formatError(error) };
    }
  }

  /**
   * Sign in with biometric authentication (mobile only)
   */
  async signInWithBiometric() {
    if (this.platform === 'web') {
      return { success: false, error: 'Biometric authentication not available on web' };
    }
    
    try {
      // Implementation will depend on react-native-biometrics
      // This would validate biometric and then use stored credentials
      throw new Error('Biometric authentication not yet implemented');
      
    } catch (error) {
      console.error('Biometric sign in error:', error);
      return { success: false, error: this.formatError(error) };
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      await signOut(this.auth);
      
      this.trackAnalytics('logout', { 
        platform: this.platform 
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: this.formatError(error) };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      
      this.trackAnalytics('password_reset_request', { 
        platform: this.platform 
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: this.formatError(error) };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    if (!this.currentUser) {
      return { success: false, error: 'No user signed in' };
    }
    
    try {
      // Update Firebase Auth profile
      if (updates.displayName || updates.photoURL) {
        await updateProfile(this.currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoURL
        });
      }
      
      // Update Firestore user document
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      this.trackAnalytics('profile_update', { 
        platform: this.platform 
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: this.formatError(error) };
    }
  }

  /**
   * Create user profile in Firestore
   */
  async createUserProfile(user, additionalData = {}) {
    try {
      const userRef = doc(this.db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || additionalData.displayName || null,
          photoURL: user.photoURL || null,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber || null,
          platform: this.platform,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastSignIn: serverTimestamp(),
          isOnline: true,
          preferences: {
            notifications: true,
            emailUpdates: true,
            darkMode: false,
            language: 'en'
          },
          stats: {
            votesCount: 0,
            ordersCount: 0,
            reviewsCount: 0,
            loyaltyPoints: 100 // Welcome bonus
          },
          ...additionalData
        };
        
        await setDoc(userRef, userData);
        
        // Update global stats
        await this.updateGlobalStats('userSignUp');
      }
      
    } catch (error) {
      console.error('User profile creation error:', error);
      throw error;
    }
  }

  /**
   * Handle user sign in
   */
  async handleUserSignIn(user) {
    try {
      const userRef = doc(this.db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await this.createUserProfile(user);
      } else {
        // Update last sign in and online status
        await updateDoc(userRef, {
          lastSignIn: serverTimestamp(),
          isOnline: true,
          platform: this.platform
        });
      }
      
      await this.updateGlobalStats('userSignIn');
      
    } catch (error) {
      console.error('Handle user sign in error:', error);
    }
  }

  /**
   * Handle user sign out
   */
  handleUserSignOut() {
    if (this.currentUser) {
      // Update online status
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      updateDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp()
      }).catch(error => {
        console.error('Update offline status error:', error);
      });
    }
  }

  /**
   * Update global statistics
   */
  async updateGlobalStats(action) {
    try {
      const statsRef = doc(this.db, 'stats', 'global');
      const updates = {};
      
      switch (action) {
        case 'userSignUp':
          updates.totalUsers = increment(1);
          updates.platformStats = {
            [`${this.platform}Users`]: increment(1)
          };
          break;
        case 'userSignIn':
          updates.totalSignIns = increment(1);
          updates.dailyActiveUsers = increment(1);
          break;
      }
      
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = serverTimestamp();
        await updateDoc(statsRef, updates);
      }
      
    } catch (error) {
      console.error('Global stats update error:', error);
    }
  }

  /**
   * Track analytics events
   */
  trackAnalytics(eventName, parameters = {}) {
    if (this.analytics && !isDevelopment()) {
      try {
        // Add platform information to all events
        const eventData = {
          ...parameters,
          platform: this.platform,
          timestamp: new Date().toISOString()
        };
        
        // Platform-specific analytics tracking
        if (this.platform === 'web') {
          // Firebase Analytics for web
          // logEvent(this.analytics, eventName, eventData);
        } else {
          // React Native Firebase Analytics
          // analytics().logEvent(eventName, eventData);
        }
        
      } catch (error) {
        console.warn('Analytics tracking error:', error);
      }
    }
  }

  /**
   * Format Firebase auth errors for user display
   */
  formatError(error) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };
    
    return errorMessages[error.code] || error.message || 'An unexpected error occurred.';
  }

  /**
   * Get current user data from Firestore
   */
  async getCurrentUserData() {
    if (!this.currentUser) return null;
    
    try {
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      
      return null;
      
    } catch (error) {
      console.error('Get current user data error:', error);
      return null;
    }
  }

  /**
   * Check if user has specific role/permission
   */
  async hasPermission(permission) {
    const userData = await this.getCurrentUserData();
    return userData?.permissions?.includes(permission) || 
           userData?.role === 'admin' || 
           false;
  }

  /**
   * Check if current user is admin
   */
  async isAdmin() {
    const userData = await this.getCurrentUserData();
    return userData?.role === 'admin' || false;
  }
}

export default DAMPAuthService;