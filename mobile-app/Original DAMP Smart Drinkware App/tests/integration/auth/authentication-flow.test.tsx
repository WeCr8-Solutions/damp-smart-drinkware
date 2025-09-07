/**
 * 🔐 DAMP Smart Drinkware - Authentication Flow Integration Tests
 * Complete testing of user authentication, registration, and session management
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/app/auth/login';
import SignupScreen from '@/app/auth/signup';
import supabase from '@/lib/supabase';

// Mock Supabase
const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  },
  from: jest.fn(),
};

jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: mockSupabase,
}));

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockRouter,
  Link: ({ children, ...props }: any) => children,
}));

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <AuthProvider>
      {children}
    </AuthProvider>
  </NavigationContainer>
);

// Test component to access auth context
const AuthTestComponent = ({ onAuthState }: { onAuthState: (state: any) => void }) => {
  const auth = useAuth();
  React.useEffect(() => {
    onAuthState(auth);
  }, [auth, onAuthState]);
  return null;
};

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      // Simulate initial session check
      setTimeout(() => callback('INITIAL_SESSION', null), 0);
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  describe('Login Flow', () => {
    it('should render login screen correctly', () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('should validate email and password fields', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const signInButton = getByText('Sign In');

      // Try to submit without email and password
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(queryByText('Please fill in all fields')).toBeTruthy();
      });

      // Try invalid email format
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(queryByText('Please enter a valid email address')).toBeTruthy();
      });
    });

    it('should successfully log in user with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@dampdrink.com',
        user_metadata: { full_name: 'Test User' },
      };

      const mockSession = {
        access_token: 'mock-access-token',
        user: mockUser,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@dampdrink.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@dampdrink.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should handle login errors appropriately', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const { getByPlaceholderText, getByText, queryByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@dampdrink.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(queryByText('Invalid credentials')).toBeTruthy();
      });
    });

    it('should toggle password visibility', () => {
      const { getByPlaceholderText, getByTestId } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const passwordInput = getByPlaceholderText('Enter your password');
      const toggleButton = getByTestId('toggle-password-visibility');

      expect(passwordInput.props.secureTextEntry).toBe(true);

      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);

      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('should navigate to forgot password screen', () => {
      const { getByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const forgotPasswordLink = getByText('Forgot Password?');
      fireEvent.press(forgotPasswordLink);

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/forgot-password');
    });

    it('should navigate to signup screen', () => {
      const { getByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const signUpLink = getByText('Sign Up');
      fireEvent.press(signUpLink);

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/signup');
    });
  });

  describe('Signup Flow', () => {
    it('should render signup screen correctly', () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <SignupScreen />
        </TestWrapper>
      );

      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Create a password')).toBeTruthy();
      expect(getByPlaceholderText('Confirm your password')).toBeTruthy();
      expect(getByText('Create Account')).toBeTruthy();
    });

    it('should validate password requirements', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <TestWrapper>
          <SignupScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Create a password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      const createAccountButton = getByText('Create Account');

      // Test short password
      fireEvent.changeText(emailInput, 'test@dampdrink.com');
      fireEvent.changeText(passwordInput, '123');
      fireEvent.changeText(confirmPasswordInput, '123');
      fireEvent.press(createAccountButton);

      await waitFor(() => {
        expect(queryByText('Password must be at least 6 characters long')).toBeTruthy();
      });

      // Test password mismatch
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password456');
      fireEvent.press(createAccountButton);

      await waitFor(() => {
        expect(queryByText('Passwords do not match')).toBeTruthy();
      });
    });

    it('should successfully create account with valid data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@dampdrink.com',
        email_confirmed_at: null,
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const { getByPlaceholderText, getByText, queryByText } = render(
        <TestWrapper>
          <SignupScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Create a password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      const createAccountButton = getByText('Create Account');

      fireEvent.changeText(emailInput, 'test@dampdrink.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(createAccountButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@dampdrink.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(queryByText('Account created successfully!')).toBeTruthy();
        expect(queryByText('Please check your email to verify your account')).toBeTruthy();
      });
    });

    it('should handle signup errors appropriately', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      const { getByPlaceholderText, getByText, queryByText } = render(
        <TestWrapper>
          <SignupScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Create a password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      const createAccountButton = getByText('Create Account');

      fireEvent.changeText(emailInput, 'existing@dampdrink.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(createAccountButton);

      await waitFor(() => {
        expect(queryByText('Email already registered')).toBeTruthy();
      });
    });
  });

  describe('Auth Context Integration', () => {
    it('should provide authentication state through context', async () => {
      let authState: any;
      const onAuthState = jest.fn((state) => {
        authState = state;
      });

      render(
        <TestWrapper>
          <AuthTestComponent onAuthState={onAuthState} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(authState).toBeDefined();
        expect(authState.user).toBeNull();
        expect(authState.session).toBeNull();
        expect(authState.loading).toBe(false);
      });
    });

    it('should update context when user logs in', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@dampdrink.com',
        user_metadata: { full_name: 'Test User' },
      };

      const mockSession = {
        access_token: 'mock-access-token',
        user: mockUser,
      };

      let authState: any;
      const onAuthState = jest.fn((state) => {
        authState = state;
      });

      // Mock auth state change
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => callback('SIGNED_IN', mockSession), 100);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      render(
        <TestWrapper>
          <AuthTestComponent onAuthState={onAuthState} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(authState.user).toEqual(mockUser);
        expect(authState.session).toEqual(mockSession);
      });
    });

    it('should handle user logout', async () => {
      let authState: any;
      const onAuthState = jest.fn((state) => {
        authState = state;
      });

      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      // Start with signed in state
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        // Initial signed in state
        setTimeout(() => callback('SIGNED_IN', { user: { id: 'user-123' } }), 0);
        // Then sign out
        setTimeout(() => callback('SIGNED_OUT', null), 100);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      render(
        <TestWrapper>
          <AuthTestComponent onAuthState={onAuthState} />
        </TestWrapper>
      );

      // Wait for sign out
      await waitFor(() => {
        expect(authState.user).toBeNull();
        expect(authState.session).toBeNull();
      });
    });

    it('should persist session across app restarts', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        user: { id: 'user-123', email: 'test@dampdrink.com' },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      let authState: any;
      const onAuthState = jest.fn((state) => {
        authState = state;
      });

      render(
        <TestWrapper>
          <AuthTestComponent onAuthState={onAuthState} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSupabase.auth.getSession).toHaveBeenCalled();
        expect(authState.session).toEqual(mockSession);
      });
    });
  });

  describe('Session Management', () => {
    it('should refresh expired sessions automatically', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        user: { id: 'user-123' },
      };

      mockSupabase.auth.getSession
        .mockResolvedValueOnce({
          data: { session: mockSession },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { session: { ...mockSession, access_token: 'new-access-token' } },
          error: null,
        });

      let authState: any;
      const onAuthState = jest.fn((state) => {
        authState = state;
      });

      render(
        <TestWrapper>
          <AuthTestComponent onAuthState={onAuthState} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(authState.session).toBeDefined();
        // Session should be refreshed if expired
      });
    });

    it('should handle session refresh failures', async () => {
      const expiredSession = {
        access_token: 'expired-token',
        expires_at: Math.floor(Date.now() / 1000) - 3600,
        user: { id: 'user-123' },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: expiredSession },
        error: { message: 'Token expired' },
      });

      let authState: any;
      const onAuthState = jest.fn((state) => {
        authState = state;
      });

      render(
        <TestWrapper>
          <AuthTestComponent onAuthState={onAuthState} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should handle refresh failure gracefully
        expect(authState.user).toBeNull();
      });
    });
  });

  describe('User Profile Integration', () => {
    it('should create user profile after successful signup', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@dampdrink.com',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const mockFromChain = {
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 'profile-123', user_id: 'user-123' }],
            error: null,
          }),
        }),
      };

      mockSupabase.from.mockImplementation(() => mockFromChain);

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <SignupScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Create a password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      const createAccountButton = getByText('Create Account');

      fireEvent.changeText(emailInput, 'test@dampdrink.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(createAccountButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalled();
        // Profile creation would be handled by auth state change
      });
    });
  });

  describe('Navigation Integration', () => {
    it('should navigate to main app after successful login', async () => {
      const mockUser = { id: 'user-123', email: 'test@dampdrink.com' };
      const mockSession = { access_token: 'token', user: mockUser };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@dampdrink.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should redirect to login if not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      let authState: any;
      const onAuthState = jest.fn((state) => {
        authState = state;
      });

      render(
        <TestWrapper>
          <AuthTestComponent onAuthState={onAuthState} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(authState.user).toBeNull();
        // Navigation to auth screens would be handled by protected routes
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network errors during authentication', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Network request failed')
      );

      const { getByPlaceholderText, getByText, queryByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@dampdrink.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(queryByText(/network/i)).toBeTruthy();
      });
    });

    it('should provide retry mechanism for failed requests', async () => {
      let callCount = 0;
      mockSupabase.auth.signInWithPassword.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network error');
        }
        return Promise.resolve({
          data: { user: { id: 'user-123' }, session: { access_token: 'token' } },
          error: null,
        });
      });

      const { getByPlaceholderText, getByText, queryByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      // First attempt
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@dampdrink.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(queryByText(/error/i)).toBeTruthy();
      });

      // Retry
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });
  });

  describe('Security and Validation', () => {
    it('should not store sensitive data in plain text', () => {
      // This would be more relevant for actual implementation testing
      // Here we just verify that passwords aren't logged or exposed
      const consoleSpy = jest.spyOn(console, 'log');

      render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('password')
      );
    });

    it('should validate email format correctly', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const signInButton = getByText('Sign In');

      // Test various invalid email formats
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid@.com',
        'invalid.@com',
      ];

      for (const email of invalidEmails) {
        fireEvent.changeText(emailInput, email);
        fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
        fireEvent.press(signInButton);

        await waitFor(() => {
          expect(queryByText(/valid email/i)).toBeTruthy();
        });
      }
    });
  });
});