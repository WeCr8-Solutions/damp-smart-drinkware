import { FeatureFlags } from '@/config/feature-flags';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Mock implementations for when Firebase is disabled
const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase disabled')),
  createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase disabled')),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: () => () => {},
  sendPasswordResetEmail: () => Promise.reject(new Error('Firebase disabled')),
};

const mockDb = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
    }),
  }),
};

const mockFunctions = {
  httpsCallable: () => () => Promise.reject(new Error('Firebase disabled')),
};

const mockStorage = {
  ref: () => ({
    put: () => Promise.reject(new Error('Firebase disabled')),
    getDownloadURL: () => Promise.reject(new Error('Firebase disabled')),
  }),
};

// Initialize Firebase services
let app: FirebaseApp | null = null;
let auth: Auth | any = null;
let db: Firestore | any = null;
let functions: Functions | any = null;
let storage: FirebaseStorage | any = null;

if (FeatureFlags.FIREBASE) {
  try {
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

    // Validate required config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Missing required Firebase configuration');
    }

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
    auth = mockAuth;
    db = mockDb;
    functions = mockFunctions;
    storage = mockStorage;
  }
} else {
  console.info('Firebase disabled by feature flags - using mocks');
  app = null;
  auth = mockAuth;
  db = mockDb;
  functions = mockFunctions;
  storage = mockStorage;
}

// Export individual services with proper typing
export const firebaseApp = app || null;
export const firebaseAuth = auth || mockAuth;
export const firebaseDb = db || mockDb;
export const firebaseFunctions = functions || mockFunctions;
export const firebaseStorage = storage || mockStorage;

// Also export with original names for compatibility
export { 
  firebaseApp as app, 
  firebaseAuth as auth, 
  firebaseDb as db, 
  firebaseFunctions as functions, 
  firebaseStorage as storage 
};

// Export types for better TypeScript support
export type { FirebaseApp, Auth, Firestore, Functions, FirebaseStorage };

// Default export for convenience
export default {
  app: firebaseApp,
  auth: firebaseAuth,
  db: firebaseDb,
  functions: firebaseFunctions,
  storage: firebaseStorage,
};