/**
 * Firebase Auth Mock for Testing
 * Provides mock implementations of Firebase auth functions
 */

// Mock user database (in-memory for tests)
const mockUsers = new Map<string, { email: string; password: string; uid: string }>();
let currentUser: any = null;

// Generate a mock UID
const generateUID = () => `test-uid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock User object
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

// Mock UserCredential
interface MockUserCredential {
  user: MockUser;
  operationType: string;
}

// Mock createUserWithEmailAndPassword
export const createUserWithEmailAndPassword = jest.fn(
  async (auth: any, email: string, password: string): Promise<MockUserCredential> => {
    console.log(`🧪 Mock: Creating user ${email}`);
    
    // Validate email
    if (!email || !email.includes('@')) {
      throw { code: 'auth/invalid-email', message: 'Invalid email address format' };
    }
    
    // Validate password
    if (password.length < 6) {
      throw { code: 'auth/weak-password', message: 'Password should be at least 6 characters' };
    }
    
    // Check if user already exists
    if (mockUsers.has(email)) {
      throw { code: 'auth/email-already-in-use', message: 'The email address is already in use' };
    }
    
    // Create new user
    const uid = generateUID();
    const user = new MockUser(email, uid);
    mockUsers.set(email, { email, password, uid });
    currentUser = user;
    
    console.log(`✅ Mock: User created successfully - ${email}`);
    
    return {
      user,
      operationType: 'signIn'
    };
  }
);

// Mock signInWithEmailAndPassword
export const signInWithEmailAndPassword = jest.fn(
  async (auth: any, email: string, password: string): Promise<MockUserCredential> => {
    console.log(`🧪 Mock: Signing in user ${email}`);
    
    // Validate email
    if (!email || !email.includes('@')) {
      throw { code: 'auth/invalid-email', message: 'Invalid email address format' };
    }
    
    // Check if user exists
    const existingUser = mockUsers.get(email);
    if (!existingUser) {
      throw { code: 'auth/user-not-found', message: 'There is no user record corresponding to this identifier' };
    }
    
    // Check password
    if (existingUser.password !== password) {
      throw { code: 'auth/wrong-password', message: 'The password is invalid' };
    }
    
    // Sign in successful
    const user = new MockUser(email, existingUser.uid);
    currentUser = user;
    
    console.log(`✅ Mock: User signed in successfully - ${email}`);
    
    return {
      user,
      operationType: 'signIn'
    };
  }
);

// Mock signOut
export const signOut = jest.fn(async (auth: any): Promise<void> => {
  console.log(`🧪 Mock: Signing out user`);
  currentUser = null;
  console.log(`✅ Mock: User signed out successfully`);
});

// Mock onAuthStateChanged
export const onAuthStateChanged = jest.fn((auth: any, callback: (user: any) => void) => {
  console.log(`🧪 Mock: Registering auth state observer`);
  
  // Call callback immediately with current user
  setTimeout(() => callback(currentUser), 0);
  
  // Return unsubscribe function
  return () => {
    console.log(`🧪 Mock: Unsubscribing auth state observer`);
  };
});

// Mock sendPasswordResetEmail
export const sendPasswordResetEmail = jest.fn(
  async (auth: any, email: string): Promise<void> => {
    console.log(`🧪 Mock: Sending password reset email to ${email}`);
    
    // Validate email
    if (!email || !email.includes('@')) {
      throw { code: 'auth/invalid-email', message: 'Invalid email address format' };
    }
    
    // Check if user exists
    if (!mockUsers.has(email)) {
      // Firebase doesn't reveal if email exists for security
      console.log(`✅ Mock: Password reset email sent (user may not exist)`);
      return;
    }
    
    console.log(`✅ Mock: Password reset email sent to ${email}`);
  }
);

// Mock Auth instance
export const mockAuth = {
  currentUser,
  app: {},
  name: 'mock-auth',
  config: {},
};

// Mock getAuth
export const getAuth = jest.fn(() => mockAuth);

// Helper to get current user
export const getCurrentMockUser = () => currentUser;

// Helper to clear all mock users (for test cleanup)
export const clearMockUsers = () => {
  mockUsers.clear();
  currentUser = null;
  console.log(`🧹 Mock: Cleared all mock users`);
};

// Helper to set current user (for testing)
export const setCurrentMockUser = (user: any) => {
  currentUser = user;
};

