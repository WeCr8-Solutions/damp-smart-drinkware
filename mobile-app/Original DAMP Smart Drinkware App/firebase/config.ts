import { FeatureFlags } from '@/config/feature-flags';

// Import Firebase modules statically (required for Expo)
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Simple Firebase configuration without complex imports
// Mock implementations for when Firebase is disabled or fails
// This provides a working auth system for development/testing
const mockUsers = new Map<string, { email: string; password: string; uid: string }>();
let mockCurrentUser: any = null;
const mockAuthCallbacks: Array<(user: any) => void> = [];

class MockFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean = false;
  displayName: string | null = null;
  photoURL: string | null = null;
  
  constructor(email: string, uid: string) {
    this.email = email;
    this.uid = uid;
  }
}

const mockAuth = {
  get currentUser() {
    return mockCurrentUser;
  },
  
  signInWithEmailAndPassword: async (email: string, password: string) => {
    console.log('🔐 Mock Auth: Attempting sign in', { email });
    
    if (!email || !email.includes('@')) {
      const error: any = new Error('Invalid email format');
      error.code = 'auth/invalid-email';
      throw error;
    }
    
    const user = mockUsers.get(email);
    if (!user) {
      const error: any = new Error('User not found');
      error.code = 'auth/user-not-found';
      throw error;
    }
    
    if (user.password !== password) {
      const error: any = new Error('Wrong password');
      error.code = 'auth/wrong-password';
      throw error;
    }
    
    mockCurrentUser = new MockFirebaseUser(email, user.uid);
    mockAuthCallbacks.forEach(cb => cb(mockCurrentUser));
    
    console.log('✅ Mock Auth: Sign in successful', { email });
    return { user: mockCurrentUser, operationType: 'signIn' };
  },
  
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    console.log('📝 Mock Auth: Creating user', { email });
    
    if (!email || !email.includes('@')) {
      const error: any = new Error('Invalid email format');
      error.code = 'auth/invalid-email';
      throw error;
    }
    
    if (password.length < 6) {
      const error: any = new Error('Password too weak');
      error.code = 'auth/weak-password';
      throw error;
    }
    
    if (mockUsers.has(email)) {
      const error: any = new Error('Email already in use');
      error.code = 'auth/email-already-in-use';
      throw error;
    }
    
    const uid = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    mockUsers.set(email, { email, password, uid });
    mockCurrentUser = new MockFirebaseUser(email, uid);
    mockAuthCallbacks.forEach(cb => cb(mockCurrentUser));
    
    console.log('✅ Mock Auth: User created successfully', { email, uid });
    return { user: mockCurrentUser, operationType: 'signIn' };
  },
  
  signOut: async () => {
    console.log('👋 Mock Auth: Signing out');
    mockCurrentUser = null;
    mockAuthCallbacks.forEach(cb => cb(null));
    return Promise.resolve();
  },
  
  onAuthStateChanged: (callback: (user: any) => void) => {
    console.log('👂 Mock Auth: Registering auth state observer');
    mockAuthCallbacks.push(callback);
    setTimeout(() => callback(mockCurrentUser), 0);
    
    return () => {
      const index = mockAuthCallbacks.indexOf(callback);
      if (index > -1) mockAuthCallbacks.splice(index, 1);
    };
  },
  
  sendPasswordResetEmail: async (email: string) => {
    console.log('📧 Mock Auth: Sending password reset', { email });
    
    if (!email || !email.includes('@')) {
      const error: any = new Error('Invalid email format');
      error.code = 'auth/invalid-email';
      throw error;
    }
    
    console.log('✅ Mock Auth: Password reset email sent');
    return Promise.resolve();
  },
};

const mockDb = {
  collection: (collectionPath: string) => ({
    doc: (docId?: string) => ({
      get: () => Promise.resolve({ 
        exists: false,
        data: () => null,
        id: docId || 'mock-doc-id'
      }),
      set: (data: any) => {
        console.log(`📝 Mock DB: Set document in ${collectionPath}/${docId}`, data);
        return Promise.resolve();
      },
      update: (data: any) => {
        console.log(`✏️ Mock DB: Update document in ${collectionPath}/${docId}`, data);
        return Promise.resolve();
      },
      delete: () => {
        console.log(`🗑️ Mock DB: Delete document in ${collectionPath}/${docId}`);
        return Promise.resolve();
      },
    }),
    add: (data: any) => {
      console.log(`➕ Mock DB: Add document to ${collectionPath}`, data);
      return Promise.resolve({ id: `mock-${Date.now()}` });
    },
    where: (field: string, op: string, value: any) => ({
      get: () => {
        console.log(`🔍 Mock DB: Query ${collectionPath} where ${field} ${op} ${value}`);
        return Promise.resolve({ docs: [], empty: true });
      }
    }),
    get: () => {
      console.log(`📋 Mock DB: Get all documents from ${collectionPath}`);
      return Promise.resolve({ docs: [], empty: true });
    }
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
const initializeFirebaseForWeb = () => {
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
    // Use statically imported modules

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
    auth = getAuth(app!);
    db = getFirestore(app!);
    functions = getFunctions(app!);
    storage = getStorage(app!);

    console.info('✅ Firebase initialized successfully');
    console.log('Firebase Auth:', { hasAuth: !!auth, authType: typeof auth });
  } catch (error) {
    console.error('❌ Firebase initialization failed - using mocks:', error);
    app = null;
    auth = mockAuth;
    db = mockDb;
    functions = mockFunctions;
    storage = mockStorage;
  }
};

// Initialize Firebase immediately
console.log('🔥 Starting Firebase initialization...');
initializeFirebaseForWeb();

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