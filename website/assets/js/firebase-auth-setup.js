/**
 * DAMP Smart Drinkware - Simple Firebase Auth Setup
 * 
 * Simplified Firebase authentication setup for website
 * Compatible with mobile app via shared Firebase project
 */

// Import Firebase CDN (loaded via script tags)
// This file assumes Firebase is loaded via CDN in HTML

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGXLp2Xm1UtPZmjFBKjQDLNGz8J3tZQxs",
  authDomain: "damp-smart-drinkware.firebaseapp.com",
  projectId: "damp-smart-drinkware",
  storageBucket: "damp-smart-drinkware.firebasestorage.app",
  messagingSenderId: "309818614427",
  appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
  measurementId: "G-YW2BN4SVPQ"
};

// Initialize Firebase
let app, auth, db, analytics;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  
  // Initialize Analytics if available
  if (typeof gtag !== 'undefined') {
    analytics = firebase.analytics();
  }
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

// Simple Auth Service for website
class WebAuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    
    // Set up auth state listener
    if (auth) {
      auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.listeners.forEach(callback => callback(user));
      });
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email, password, userData = {}) {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      const user = result.user;
      
      // Update user profile
      if (userData.displayName) {
        await user.updateProfile({
          displayName: userData.displayName
        });
      }
      
      // Save additional user data to Firestore
      if (db) {
        await db.collection('users').doc(user.uid).set({
          email: user.email,
          displayName: userData.displayName || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          newsletter: userData.newsletter || false,
          source: userData.source || 'website',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      // Send verification email
      await user.sendEmailVerification();
      
      return {
        success: true,
        user: user,
        message: 'Account created successfully! Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      const user = result.user;
      
      // Update last login time
      if (db) {
        await db.collection('users').doc(user.uid).update({
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return {
        success: true,
        user: user,
        message: 'Welcome back!'
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      
      // Save user data to Firestore
      if (db) {
        await db.collection('users').doc(user.uid).set({
          email: user.email,
          displayName: user.displayName || '',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          photoURL: user.photoURL || '',
          source: 'google',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
      
      return {
        success: true,
        user: user,
        message: 'Welcome!'
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Send password reset email
  async sendPasswordReset(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await auth.signOut();
      return {
        success: true,
        message: 'Signed out successfully'
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        message: 'Error signing out'
      };
    }
  }

  // Add auth state change listener
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    // Call immediately with current user
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get user-friendly error messages
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

// Initialize and make globally available
window.firebaseServices = {
  auth: auth,
  db: db,
  analytics: analytics,
  authService: new WebAuthService()
};

console.log('✅ Firebase auth services initialized and available globally');
