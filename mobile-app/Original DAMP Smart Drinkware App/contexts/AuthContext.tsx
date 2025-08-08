import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth } from '@/firebase/config';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { FeatureFlags } from '@/config/feature-flags';

// Types
export interface AuthUser extends User {
  full_name?: string;
  avatar_url?: string;
  subscription_status?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status?: string;
  created_at: string;
  last_sign_in_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  refreshSession: () => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    if (!FeatureFlags.FIREBASE) {
      setLoading(false);
      return;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted.current) return;

      if (firebaseUser) {
        // Convert Firebase user to AuthUser
        const authUser: AuthUser = {
          ...firebaseUser,
          full_name: firebaseUser.displayName || undefined,
          avatar_url: firebaseUser.photoURL || undefined,
        };
        setUser(authUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    if (!FeatureFlags.FIREBASE) {
      return { error: new Error('Firebase disabled') };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const handleSignUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    if (!FeatureFlags.FIREBASE) {
      return { error: new Error('Firebase disabled') };
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // TODO: Create user profile in Firestore if needed
      if (userData?.full_name && result.user) {
        // Update display name
        await result.user.updateProfile({
          displayName: userData.full_name
        });
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const handleSignOut = async () => {
    if (!FeatureFlags.FIREBASE) {
      return { error: new Error('Firebase disabled') };
    }

    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!FeatureFlags.FIREBASE || !auth.currentUser) {
      return { error: new Error('Firebase disabled or no user') };
    }

    try {
      // Update Firebase Auth profile
      if (updates.full_name !== undefined) {
        await auth.currentUser.updateProfile({
          displayName: updates.full_name || null
        });
      }

      // TODO: Update Firestore user profile document
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!FeatureFlags.FIREBASE) {
      return { error: new Error('Firebase disabled') };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const handleRefreshSession = async () => {
    if (!FeatureFlags.FIREBASE || !auth.currentUser) {
      return { error: new Error('Firebase disabled or no user') };
    }

    try {
      // Firebase automatically handles token refresh
      await auth.currentUser.getIdToken(true);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    resetPassword: handleResetPassword,
    refreshSession: handleRefreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;