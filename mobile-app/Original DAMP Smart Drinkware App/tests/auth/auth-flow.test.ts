/**
 * Authentication Flow Tests
 * Tests sign up and sign in functionality
 */

import { auth } from '@/services/auth';

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}@damptest.com`,
  password: 'TestPassword123!',
  weakPassword: '12345',
  invalidEmail: 'not-an-email',
};

describe('Auth Service - Sign Up', () => {
  afterAll(async () => {
    // Clean up: sign out after tests
    try {
      await auth.signOut();
    } catch (error) {
      console.log('Clean up: No user to sign out');
    }
  });

  test('should create a new user account with valid credentials', async () => {
    const result = await auth.signUpWithEmail(TEST_USER.email, TEST_USER.password);
    
    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(TEST_USER.email);
    
    console.log('✅ Sign up successful:', result.user.email);
    
    // Sign out for next tests
    await auth.signOut();
  }, 15000);

  test('should reject sign up with invalid email format', async () => {
    await expect(
      auth.signUpWithEmail(TEST_USER.invalidEmail, TEST_USER.password)
    ).rejects.toThrow();
  }, 10000);

  test('should reject sign up with weak password', async () => {
    await expect(
      auth.signUpWithEmail(`weak-${Date.now()}@damptest.com`, TEST_USER.weakPassword)
    ).rejects.toThrow();
  }, 10000);

  test('should reject duplicate email registration', async () => {
    // Use a unique email for this test
    const duplicateTestEmail = `duplicate-${Date.now()}@damptest.com`;
    
    // First registration should succeed
    await auth.signUpWithEmail(duplicateTestEmail, TEST_USER.password);
    await auth.signOut();
    
    // Second registration with same email should fail
    await expect(
      auth.signUpWithEmail(duplicateTestEmail, TEST_USER.password)
    ).rejects.toThrow();
  }, 15000);
});

describe('Auth Service - Sign In', () => {
  beforeAll(async () => {
    // Ensure test user exists
    try {
      await auth.signUpWithEmail(TEST_USER.email, TEST_USER.password);
      await auth.signOut();
    } catch (error) {
      // User might already exist from previous test run
      console.log('Test user already exists, continuing...');
    }
  });

  afterAll(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.log('Clean up: No user to sign out');
    }
  });

  test('should sign in with correct credentials', async () => {
    const result = await auth.signInWithEmail(TEST_USER.email, TEST_USER.password);
    
    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(TEST_USER.email);
    
    console.log('✅ Sign in successful:', result.user.email);
  }, 15000);

  test('should reject sign in with wrong password', async () => {
    await expect(
      auth.signInWithEmail(TEST_USER.email, 'WrongPassword123!')
    ).rejects.toThrow();
  }, 10000);

  test('should reject sign in with non-existent email', async () => {
    await expect(
      auth.signInWithEmail('nonexistent@damptest.com', TEST_USER.password)
    ).rejects.toThrow();
  }, 10000);

  test('should reject sign in with invalid email format', async () => {
    await expect(
      auth.signInWithEmail(TEST_USER.invalidEmail, TEST_USER.password)
    ).rejects.toThrow();
  }, 10000);
});

describe('Auth Service - User State', () => {
  beforeAll(async () => {
    // Sign in for these tests
    try {
      await auth.signInWithEmail(TEST_USER.email, TEST_USER.password);
    } catch (error) {
      console.log('User already signed in or does not exist');
    }
  });

  afterAll(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.log('Clean up: No user to sign out');
    }
  });

  test('should get current user when signed in', () => {
    const currentUser = auth.getCurrentUser();
    
    expect(currentUser).toBeDefined();
    expect(currentUser?.email).toBe(TEST_USER.email);
    
    console.log('✅ Current user retrieved:', currentUser?.email);
  });

  test('should sign out successfully', async () => {
    await auth.signOut();
    
    const currentUser = auth.getCurrentUser();
    expect(currentUser).toBeNull();
    
    console.log('✅ Sign out successful');
  }, 10000);

  test('should return null when no user is signed in', () => {
    const currentUser = auth.getCurrentUser();
    expect(currentUser).toBeNull();
  });
});

describe('Auth Service - Auth State Observer', () => {
  afterAll(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.log('Clean up: No user to sign out');
    }
  });

  test('should observe auth state changes', (done) => {
    let callCount = 0;
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      callCount++;
      
      if (callCount === 1) {
        // First call: no user (initial state)
        expect(user).toBeNull();
        
        // Sign in to trigger state change
        auth.signInWithEmail(TEST_USER.email, TEST_USER.password);
      } else if (callCount === 2) {
        // Second call: user signed in
        expect(user).toBeDefined();
        expect(user?.email).toBe(TEST_USER.email);
        
        console.log('✅ Auth state observer working correctly');
        unsubscribe();
        done();
      }
    });
  }, 20000);
});

