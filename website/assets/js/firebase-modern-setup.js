/**
 * DAMP Smart Drinkware - Modern Firebase Setup
 * 
 * Modern Firebase v10+ setup using ES6 modules from CDN
 * Compatible with mobile app via shared Firebase project
 */

// Import Firebase v10 modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getMessaging, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

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
console.log('🔄 Initializing modern Firebase...');

let app, auth, db, analytics, messaging;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');
  
  db = getFirestore(app);
  console.log('✅ Firebase Firestore initialized');
  
  // Initialize Analytics (only in production)
  if (window.location.hostname !== 'localhost') {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  }
  
  // Initialize Messaging (if supported)
  if ('serviceWorker' in navigator) {
    try {
      messaging = getMessaging(app);
      console.log('✅ Firebase Messaging initialized');
    } catch (error) {
      console.log('ℹ️ Firebase Messaging not available:', error.message);
    }
  }
  
  console.log('✅ Modern Firebase initialization complete');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

// Modern Auth Service using Firebase v10
class ModernFirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    
    // Set up auth state listener
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        this.listeners.forEach(callback => callback(user));
      });
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email, password, userData = {}) {
    try {
      console.log('🔄 Starting modern sign up process...', { email, userData });
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ User created successfully:', user.uid);
      
      // Update user profile
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
        console.log('✅ User profile updated');
      }
      
      // Save additional user data to Firestore
      if (db) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: user.email,
          displayName: userData.displayName || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          newsletter: userData.newsletter || false,
          source: userData.source || 'website',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
        console.log('✅ User data saved to Firestore');
      }
      
      // Send verification email
      await sendEmailVerification(user);
      console.log('✅ Verification email sent');
      
      // Log analytics event
      if (analytics) {
        logEvent(analytics, 'sign_up', {
          method: 'email',
          source: userData.source || 'website'
        });
      }
      
      return {
        success: true,
        user: user,
        message: 'Account created successfully! Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      console.log('🔄 Starting sign in process...', { email });
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ User signed in successfully:', user.uid);
      
      // Update last login time
      if (db) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
        console.log('✅ Last login time updated');
      }
      
      // Log analytics event
      if (analytics) {
        logEvent(analytics, 'login', {
          method: 'email'
        });
      }
      
      return {
        success: true,
        user: user,
        message: 'Welcome back!'
      };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      console.log('🔄 Starting Google sign in...');
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('✅ Google sign in successful:', user.uid);
      
      // Save user data to Firestore
      if (db) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || '',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          photoURL: user.photoURL || '',
          source: 'google',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        }, { merge: true });
        console.log('✅ Google user data saved to Firestore');
      }
      
      // Log analytics event
      if (analytics) {
        logEvent(analytics, 'login', {
          method: 'google'
        });
      }
      
      return {
        success: true,
        user: user,
        message: 'Welcome!'
      };
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Send password reset email
  async sendPasswordReset(email) {
    try {
      console.log('🔄 Sending password reset email...', { email });
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
      
      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      console.log('🔄 Signing out...');
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      await signOut(auth);
      console.log('✅ User signed out');
      
      return {
        success: true,
        message: 'Signed out successfully'
      };
    } catch (error) {
      console.error('❌ Sign out error:', error);
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
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

// Initialize and make globally available
window.firebaseServices = {
  app: app,
  auth: auth,
  db: db,
  analytics: analytics,
  messaging: messaging,
  authService: new ModernFirebaseAuthService()
};

// Register service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(error => {
    console.log('ℹ️ Service Worker registration failed:', error);
  });
  
  navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(error => {
    console.log('ℹ️ Firebase Messaging SW registration failed:', error);
  });
}

console.log('✅ Modern Firebase services initialized and available globally');
