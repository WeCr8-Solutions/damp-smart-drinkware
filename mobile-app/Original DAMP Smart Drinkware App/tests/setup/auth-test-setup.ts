/**
 * Auth Test Setup
 * Mocks Firebase Auth for testing environment
 */

// Shared current user state between mocks
let sharedCurrentUser: any = null;

// Mock Firebase Auth module before any tests run
jest.mock('firebase/auth', () => {
  const mockUsers = new Map<string, { email: string; password: string; uid: string }>();
  const authStateCallbacks: Array<(user: any) => void> = [];

  const generateUID = () => `test-uid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  class MockUser {
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

  const mockAuthInstance = {
    get currentUser() {
      return sharedCurrentUser;
    },
    app: {},
    name: 'mock-auth',
    config: {},
  };

  return {
    getAuth: jest.fn(() => mockAuthInstance),

    createUserWithEmailAndPassword: jest.fn(async (auth: any, email: string, password: string) => {
      console.log(`🧪 Mock: Creating user ${email}`);
      
      if (!email || !email.includes('@')) {
        const error: any = new Error('Invalid email address format');
        error.code = 'auth/invalid-email';
        throw error;
      }
      
      if (password.length < 6) {
        const error: any = new Error('Password should be at least 6 characters');
        error.code = 'auth/weak-password';
        throw error;
      }
      
      if (mockUsers.has(email)) {
        const error: any = new Error('The email address is already in use');
        error.code = 'auth/email-already-in-use';
        throw error;
      }
      
      const uid = generateUID();
      const user = new MockUser(email, uid);
      mockUsers.set(email, { email, password, uid });
      sharedCurrentUser = user;
      
      // Notify auth state observers
      authStateCallbacks.forEach(callback => callback(user));
      
      console.log(`✅ Mock: User created - ${email}`);
      
      return { user, operationType: 'signIn' };
    }),

    signInWithEmailAndPassword: jest.fn(async (auth: any, email: string, password: string) => {
      console.log(`🧪 Mock: Signing in user ${email}`);
      
      if (!email || !email.includes('@')) {
        const error: any = new Error('Invalid email address format');
        error.code = 'auth/invalid-email';
        throw error;
      }
      
      const existingUser = mockUsers.get(email);
      if (!existingUser) {
        const error: any = new Error('There is no user record');
        error.code = 'auth/user-not-found';
        throw error;
      }
      
      if (existingUser.password !== password) {
        const error: any = new Error('The password is invalid');
        error.code = 'auth/wrong-password';
        throw error;
      }
      
      const user = new MockUser(email, existingUser.uid);
      sharedCurrentUser = user;
      
      // Notify auth state observers
      authStateCallbacks.forEach(callback => callback(user));
      
      console.log(`✅ Mock: User signed in - ${email}`);
      
      return { user, operationType: 'signIn' };
    }),

    signOut: jest.fn(async (auth: any) => {
      console.log(`🧪 Mock: Signing out`);
      sharedCurrentUser = null;
      
      // Notify auth state observers
      authStateCallbacks.forEach(callback => callback(null));
      
      console.log(`✅ Mock: Signed out`);
    }),

    onAuthStateChanged: jest.fn((auth: any, callback: (user: any) => void) => {
      console.log(`🧪 Mock: Registering auth state observer`);
      authStateCallbacks.push(callback);
      
      // Call immediately with current user
      setTimeout(() => callback(sharedCurrentUser), 0);
      
      // Return unsubscribe function
      return () => {
        const index = authStateCallbacks.indexOf(callback);
        if (index > -1) {
          authStateCallbacks.splice(index, 1);
        }
        console.log(`🧪 Mock: Unsubscribed auth state observer`);
      };
    }),

    sendPasswordResetEmail: jest.fn(async (auth: any, email: string) => {
      console.log(`🧪 Mock: Sending password reset to ${email}`);
      
      if (!email || !email.includes('@')) {
        const error: any = new Error('Invalid email address format');
        error.code = 'auth/invalid-email';
        throw error;
      }
      
      console.log(`✅ Mock: Password reset email sent`);
    }),

    // Helper to access current user in tests
    getCurrentUser: () => sharedCurrentUser,
  };
});

// Mock the feature flags to enable Firebase
jest.mock('@/config/feature-flags', () => ({
  FeatureFlags: {
    FIREBASE: true,
    STRIPE: false,
    BLE: false,
    ANALYTICS: false,
  },
}));

// Mock the firebase config to return our mocked auth with all methods
jest.mock('@/firebase/config', () => {
  class MockUser {
    uid: string;
    email: string;
    emailVerified: boolean = false;
    
    constructor(email: string, uid: string) {
      this.email = email;
      this.uid = uid;
    }
  }
  
  const mockUsers = new Map<string, { email: string; password: string; uid: string }>();
  const authCallbacks: Array<(user: any) => void> = [];
  
  return {
    auth: {
      get currentUser() {
        return sharedCurrentUser;
      },
      
      async createUserWithEmailAndPassword(email: string, password: string) {
        console.log('📝 Mock Config Auth: Creating user', { email });
        
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
        sharedCurrentUser = new MockUser(email, uid);
        authCallbacks.forEach(cb => cb(sharedCurrentUser));
        
        console.log('✅ Mock Config Auth: User created', { email });
        return { user: sharedCurrentUser, operationType: 'signIn' };
      },
      
      async signInWithEmailAndPassword(email: string, password: string) {
        console.log('🔐 Mock Config Auth: Signing in', { email });
        
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
        
        sharedCurrentUser = new MockUser(email, user.uid);
        authCallbacks.forEach(cb => cb(sharedCurrentUser));
        
        console.log('✅ Mock Config Auth: Sign in successful', { email });
        return { user: sharedCurrentUser, operationType: 'signIn' };
      },
      
      async signOut() {
        console.log('👋 Mock Config Auth: Signing out');
        sharedCurrentUser = null;
        authCallbacks.forEach(cb => cb(null));
        return Promise.resolve();
      },
      
      onAuthStateChanged(callback: (user: any) => void) {
        console.log('👂 Mock Config Auth: Auth state observer registered');
        authCallbacks.push(callback);
        setTimeout(() => callback(sharedCurrentUser), 0);
        
        return () => {
          const index = authCallbacks.indexOf(callback);
          if (index > -1) authCallbacks.splice(index, 1);
        };
      },
      
      async sendPasswordResetEmail(email: string) {
        console.log('📧 Mock Config Auth: Password reset', { email });
        
        if (!email || !email.includes('@')) {
          const error: any = new Error('Invalid email format');
          error.code = 'auth/invalid-email';
          throw error;
        }
        
        return Promise.resolve();
      },
    },
    app: {},
    db: {},
    functions: {},
    storage: {},
  };
});

console.log('🧪 Auth test setup complete - Firebase Auth mocked');

