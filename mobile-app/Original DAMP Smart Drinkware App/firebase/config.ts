import { FeatureFlags } from '@/config/feature-flags';

// Simple Firebase configuration without complex imports
// Mock implementations for when Firebase is disabled or fails
const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase disabled')),
  createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase disabled')),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Call callback with null user immediately for mocks
    setTimeout(() => callback(null), 0);
    // Return unsubscribe function
    return () => {};
  },
  sendPasswordResetEmail: () => Promise.reject(new Error('Firebase disabled')),
};

const mockDb = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
    }),
    add: () => Promise.resolve({ id: 'mock_id' }),
    where: () => ({
      get: () => Promise.resolve({ docs: [] })
    })
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
let app: any = null;
let auth: any = mockAuth;
let db: any = mockDb;
let functions: any = mockFunctions;
let storage: any = mockStorage;

// Simple Firebase initialization for web
const initializeFirebaseForWeb = async () => {
  console.log('Firebase Feature Flag Debug:', {
    FIREBASE: FeatureFlags.FIREBASE,
    EXPO_PUBLIC_FIREBASE_ENABLED: process.env.EXPO_PUBLIC_FIREBASE_ENABLED,
    EXPO_PUBLIC_PLATFORM: process.env.EXPO_PUBLIC_PLATFORM,
    EXPO_PUBLIC_ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT
  });

  if (!FeatureFlags.FIREBASE) {
    console.info('Firebase disabled by feature flags - using mocks');
    return;
  }

  try {
    // Try to import Firebase modules
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getFunctions } = await import('firebase/functions');
    const { getStorage } = await import('firebase/storage');

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
      console.error('Firebase Config Debug:', {
        hasApiKey: !!firebaseConfig.apiKey,
        hasProjectId: !!firebaseConfig.projectId,
        firebaseEnabled: process.env.EXPO_PUBLIC_FIREBASE_ENABLED,
        platform: process.env.EXPO_PUBLIC_PLATFORM,
        environment: process.env.EXPO_PUBLIC_ENVIRONMENT
      });
      throw new Error(`Missing required Firebase configuration. API Key: ${!!firebaseConfig.apiKey}, Project ID: ${!!firebaseConfig.projectId}`);
    }

    // Prevent multiple initializations
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);
    storage = getStorage(app);

    console.info('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed - using mocks:', error);
    app = null;
    auth = mockAuth;
    db = mockDb;
    functions = mockFunctions;
    storage = mockStorage;
  }
};

// Initialize Firebase when module loads
if (typeof window !== 'undefined') {
  // Web environment
  initializeFirebaseForWeb();
} else {
  // Server-side or other environment - use mocks
  console.info('Non-web environment detected - using mocks');
}

// Export services with fallbacks
export const firebaseApp = app;
export const firebaseAuth = auth;
export const firebaseDb = db;
export const firebaseFunctions = functions;
export const firebaseStorage = storage;

// Also export with original names for compatibility
export {
  firebaseApp as app,
  firebaseAuth as auth,
  firebaseDb as db,
  firebaseFunctions as functions,
  firebaseStorage as storage
};

// Default export for convenience
export default {
  app: firebaseApp,
  auth: firebaseAuth,
  db: firebaseDb,
  functions: firebaseFunctions,
  storage: firebaseStorage,
};