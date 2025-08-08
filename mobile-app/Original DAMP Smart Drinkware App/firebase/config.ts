/**
 * 🔥 DAMP Smart Drinkware - Firebase Configuration
 * Firebase initialization with feature flag support
 */

import { FeatureFlags } from '../config/feature-flags';

// Type definitions for when Firebase is disabled
type MockFirebaseApp = null;
type MockAuth = {
  currentUser: null;
  signInWithEmailAndPassword: () => Promise<never>;
  createUserWithEmailAndPassword: () => Promise<never>;
  signOut: () => Promise<never>;
};
type MockDb = {
  collection: () => any;
};
type MockFunctions = {
  httpsCallable: () => () => Promise<never>;
};
type MockStorage = {
  ref: () => any;
};

// Initialize Firebase only if enabled
let app: any = null;
let auth: any = null;
let db: any = null;
let functions: any = null;
let storage: any = null;

if (FeatureFlags.FIREBASE) {
  try {
    const { initializeApp, getApps } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getFunctions } = require('firebase/functions');
    const { getStorage } = require('firebase/storage');
    
    // Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    // Prevent multiple initializations
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      functions = getFunctions(app);
      storage = getStorage(app);
    } else {
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
      functions = getFunctions(app);
      storage = getStorage(app);
    }
    
    console.info('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed - using mocks:', error);
    app = null;
    auth = null;
    db = null;
    functions = null;
    storage = null;
  }
} else {
  console.info('Firebase disabled via feature flags - using mocks');
}

// Mock implementations for when Firebase is disabled
const mockAuth: MockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase disabled')),
  createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase disabled')),
  signOut: () => Promise.reject(new Error('Firebase disabled')),
};

const mockDb: MockDb = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.reject(new Error('Firebase disabled')),
      set: () => Promise.reject(new Error('Firebase disabled')),
      update: () => Promise.reject(new Error('Firebase disabled')),
      delete: () => Promise.reject(new Error('Firebase disabled')),
    }),
    add: () => Promise.reject(new Error('Firebase disabled')),
    where: () => ({
      get: () => Promise.reject(new Error('Firebase disabled')),
    }),
  }),
};

const mockFunctions: MockFunctions = {
  httpsCallable: () => () => Promise.reject(new Error('Firebase disabled')),
};

const mockStorage: MockStorage = {
  ref: () => ({
    put: () => Promise.reject(new Error('Firebase disabled')),
    getDownloadURL: () => Promise.reject(new Error('Firebase disabled')),
  }),
};

// Export services with fallbacks
export const firebaseApp = app || null;
export const firebaseAuth = auth || mockAuth;
export const firebaseDb = db || mockDb;
export const firebaseFunctions = functions || mockFunctions;
export const firebaseStorage = storage || mockStorage;

// Also export with original names for compatibility
export { firebaseApp as app, firebaseAuth as auth, firebaseDb as db, firebaseFunctions as functions, firebaseStorage as storage };

export default app;