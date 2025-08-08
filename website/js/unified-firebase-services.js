/**
 * 🔥 DAMP Smart Drinkware - Unified Firebase Services for Website
 * Ensures website uses same Firebase Functions as mobile app
 * Owner: zach@wecr8.info
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  setDoc,
  writeBatch
} from 'firebase/firestore';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

import { 
  getFunctions, 
  httpsCallable 
} from 'firebase/functions';

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

import { auth, db, storage, analytics } from './firebase-config.js';

// Initialize Firebase Functions
const functions = getFunctions();

// =============================================================================
// UNIFIED FIREBASE FUNCTIONS (Same as Mobile App)
// =============================================================================

// Subscription Management Functions (matches mobile app)
const createSubscriptionCheckoutFn = httpsCallable(functions, 'createSubscriptionCheckout');
const handleSubscriptionSuccessFn = httpsCallable(functions, 'handleSubscriptionSuccess');
const manageSubscriptionFn = httpsCallable(functions, 'manageSubscription');
const getSubscriptionStatusFn = httpsCallable(functions, 'getSubscriptionStatus');

// User Profile Management Functions
const updateUserProfileFn = httpsCallable(functions, 'updateUserProfile');
const uploadUserAvatarFn = httpsCallable(functions, 'uploadUserAvatar');
const getUserProfileFn = httpsCallable(functions, 'getUserProfile');
const updateNotificationPreferencesFn = httpsCallable(functions, 'updateNotificationPreferences');
const deleteUserAccountFn = httpsCallable(functions, 'deleteUserAccount');

// Device Management Functions (for future website integration)
const updateDeviceStatusFn = httpsCallable(functions, 'updateDeviceStatus');
const getDeviceDataFn = httpsCallable(functions, 'getDeviceData');
const registerDeviceFn = httpsCallable(functions, 'registerDevice');

// =============================================================================
// UNIFIED AUTHENTICATION SERVICE (Matches Mobile App)
// =============================================================================

export class UnifiedAuthService {
  constructor() {
    this.currentUser = null;
    this.loading = true;
    this.listeners = new Set();

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.loading = false;
      this.notifyListeners();
    });
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    this.listeners.add(callback);
    callback(this.currentUser, this.loading);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.currentUser, this.loading);
    });
  }

  // Sign in with email and password (matches mobile)
  async signIn(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Sign up with email and password (matches mobile)
  async signUp(email, password, userData = {}) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (userData.displayName) {
        await updateProfile(result.user, {
          displayName: userData.displayName
        });
      }

      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Sign out (matches mobile)
  async signOut() {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Reset password (matches mobile)
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Update user profile (uses Firebase Function like mobile)
  async updateProfile(updates) {
    if (!this.currentUser) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const result = await updateUserProfileFn(updates);
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// =============================================================================
// UNIFIED SUBSCRIPTION SERVICE (Uses Firebase Functions like Mobile)
// =============================================================================

export class UnifiedSubscriptionService {
  // Create subscription checkout (matches mobile app)
  async createCheckout(planId, successUrl, cancelUrl) {
    try {
      const result = await createSubscriptionCheckoutFn({
        planId,
        successUrl: successUrl || `${window.location.origin}/pages/subscription-success.html`,
        cancelUrl: cancelUrl || `${window.location.origin}/pages/subscription-cancel.html`,
        platform: 'web'
      });
      
      return { url: result.data.url, sessionId: result.data.sessionId, error: null };
    } catch (error) {
      console.error('Subscription checkout error:', error);
      return { url: null, sessionId: null, error };
    }
  }

  // Handle successful subscription (matches mobile app)
  async handleSuccess(sessionId) {
    try {
      const result = await handleSubscriptionSuccessFn({ sessionId });
      return { subscription: result.data, error: null };
    } catch (error) {
      return { subscription: null, error };
    }
  }

  // Manage subscription (matches mobile app)
  async manageSubscription(action, subscriptionId) {
    try {
      const result = await manageSubscriptionFn({ action, subscriptionId });
      return { subscription: result.data, error: null };
    } catch (error) {
      return { subscription: null, error };
    }
  }

  // Get subscription status (matches mobile app)
  async getStatus() {
    try {
      const result = await getSubscriptionStatusFn();
      return { subscription: result.data, error: null };
    } catch (error) {
      return { subscription: null, error };
    }
  }
}

// =============================================================================
// UNIFIED VOTING SERVICE (Direct Firestore - Same as Mobile)
// =============================================================================

export class UnifiedVotingService {
  constructor() {
    this.listeners = new Map();
  }

  // Get voting data (matches mobile app exactly)
  async getVotingData(type = 'authenticated') {
    try {
      const collection = type === 'authenticated' ? 'products' : 'public';
      const votingDoc = await getDoc(doc(db, 'voting', collection));
      
      if (votingDoc.exists()) {
        return { data: votingDoc.data(), error: null };
      }
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Submit authenticated vote (matches mobile app exactly)
  async submitAuthenticatedVote(productId) {
    if (!auth.currentUser) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Check if user has already voted
      const userVoteDoc = await getDoc(doc(db, 'userVotes', auth.currentUser.uid));
      if (userVoteDoc.exists()) {
        const userData = userVoteDoc.data();
        if (userData.votedProducts?.includes(productId)) {
          return { success: false, error: 'Already voted for this product' };
        }
      }

      // Get current voting data
      const votingDoc = await getDoc(doc(db, 'voting', 'products'));
      const votingData = votingDoc.data();
      
      if (!votingData.products[productId]) {
        return { success: false, error: 'Invalid product ID' };
      }

      // Update vote count
      const updatedProducts = { ...votingData.products };
      updatedProducts[productId].votes += 1;
      
      // Recalculate percentages
      const totalVotes = votingData.totalVotes + 1;
      Object.keys(updatedProducts).forEach(key => {
        updatedProducts[key].percentage = Number(((updatedProducts[key].votes / totalVotes) * 100).toFixed(1));
      });

      // Update voting document
      await updateDoc(doc(db, 'voting', 'products'), {
        products: updatedProducts,
        totalVotes: totalVotes,
        lastUpdated: serverTimestamp()
      });

      // Record user vote
      const userVotes = userVoteDoc.exists() ? userVoteDoc.data().votedProducts || [] : [];
      await setDoc(doc(db, 'userVotes', auth.currentUser.uid), {
        votedProducts: [...userVotes, productId],
        lastVote: serverTimestamp(),
        userId: auth.currentUser.uid,
        email: auth.currentUser.email
      }, { merge: true });

      // Record vote submission for analytics
      await setDoc(doc(db, 'voteSubmissions', `${auth.currentUser.uid}_${productId}_${Date.now()}`), {
        productId,
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        platform: 'web',
        type: 'authenticated'
      });

      return { success: true };
    } catch (error) {
      console.error('Submit authenticated vote error:', error);
      return { success: false, error: 'Failed to submit vote' };
    }
  }

  // Subscribe to voting updates (matches mobile app)
  subscribeToVotingUpdates(callback, type = 'authenticated') {
    const collection = type === 'authenticated' ? 'products' : 'public';
    const listenerId = `${type}_${Date.now()}`;

    try {
      const unsubscribe = onSnapshot(doc(db, 'voting', collection), (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        } else {
          callback(null);
        }
      });

      this.listeners.set(listenerId, unsubscribe);
      return () => {
        unsubscribe();
        this.listeners.delete(listenerId);
      };
    } catch (error) {
      console.error('Subscribe to voting updates error:', error);
      callback(null);
      return () => {};
    }
  }

  // Check if user has voted
  async hasUserVoted(productId) {
    if (!auth.currentUser) return false;

    try {
      const userVoteDoc = await getDoc(doc(db, 'userVotes', auth.currentUser.uid));
      if (userVoteDoc.exists()) {
        const userData = userVoteDoc.data();
        return userData.votedProducts?.includes(productId) || false;
      }
      return false;
    } catch (error) {
      console.error('Check user vote error:', error);
      return false;
    }
  }

  // Clean up listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

// =============================================================================
// UNIFIED E-COMMERCE SERVICE (Uses Firebase Functions like Mobile)
// =============================================================================

export class UnifiedEcommerceService {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('dampCart') || '[]');
  }

  // Add to cart (matches mobile app logic)
  addToCart(product, quantity = 1, options = {}) {
    const existingIndex = this.cart.findIndex(
      item => item.productId === product.id && 
              JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingIndex >= 0) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        productId: product.id,
        product: product,
        quantity: quantity,
        options: options,
        addedAt: new Date().toISOString()
      });
    }

    this.saveCart();
    return { success: true };
  }

  // Remove from cart
  removeFromCart(productId, options = {}) {
    this.cart = this.cart.filter(
      item => !(item.productId === productId && 
               JSON.stringify(item.options) === JSON.stringify(options))
    );
    this.saveCart();
    return { success: true };
  }

  // Get cart
  getCart() {
    return [...this.cart];
  }

  // Clear cart
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  // Calculate totals (matches mobile app)
  calculateTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem('dampCart', JSON.stringify(this.cart));
  }

  // Create checkout session (uses Firebase Function like mobile)
  async createCheckout(shippingAddress, billingAddress) {
    if (this.cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    try {
      // Convert cart to line items for Stripe
      const lineItems = this.cart.map(item => ({
        price: item.product.stripePriceId,
        quantity: item.quantity
      }));

      const totals = this.calculateTotals();

      // Use Firebase Function for checkout (matches mobile app)
      const createCheckoutFn = httpsCallable(functions, 'createStoreCheckout');
      const result = await createCheckoutFn({
        lineItems,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        totals,
        platform: 'web',
        successUrl: `${window.location.origin}/pages/order-success.html`,
        cancelUrl: `${window.location.origin}/pages/cart.html`
      });

      if (result.data.url) {
        this.clearCart(); // Clear cart on successful checkout initiation
        return { success: true, url: result.data.url, sessionId: result.data.sessionId };
      } else {
        return { success: false, error: 'Failed to create checkout session' };
      }
    } catch (error) {
      console.error('Create checkout error:', error);
      return { success: false, error: 'Failed to initiate checkout' };
    }
  }
}

// =============================================================================
// INITIALIZE AND EXPORT UNIFIED SERVICES
// =============================================================================

// Create service instances
export const unifiedAuth = new UnifiedAuthService();
export const unifiedSubscriptions = new UnifiedSubscriptionService();
export const unifiedVoting = new UnifiedVotingService();
export const unifiedEcommerce = new UnifiedEcommerceService();

// Global services object for compatibility with existing website code
window.dampServices = {
  auth: unifiedAuth,
  subscriptions: unifiedSubscriptions,
  voting: unifiedVoting,
  ecommerce: unifiedEcommerce,
  
  // Firebase instances
  firebaseAuth: auth,
  firestore: db,
  storage: storage,
  analytics: analytics,
  functions: functions
};

// Export for module usage
export default {
  auth: unifiedAuth,
  subscriptions: unifiedSubscriptions,
  voting: unifiedVoting,
  ecommerce: unifiedEcommerce,
  firebase: {
    auth,
    db,
    storage,
    analytics,
    functions
  }
};