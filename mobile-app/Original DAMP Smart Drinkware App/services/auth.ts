/**
 * Simple Auth Service Wrapper
 * Provides consistent auth methods for the mobile app
 * Uses the auth object from firebase/config directly
 */

import { auth as firebaseAuth } from '@/firebase/config';

export const auth = {
  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string) {
    console.log('🔐 Auth Service: Attempting sign in', { email });
    
    if (typeof (firebaseAuth as any).signInWithEmailAndPassword !== 'function') {
      const error: any = new Error('Firebase Auth not initialized. Please check your .env configuration.');
      error.code = 'auth/not-initialized';
      console.error('❌ Firebase Auth method not available');
      throw error;
    }
    
    return await (firebaseAuth as any).signInWithEmailAndPassword(email, password);
  },

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string) {
    console.log('📝 Auth Service: Attempting sign up', { email });
    
    if (typeof (firebaseAuth as any).createUserWithEmailAndPassword !== 'function') {
      const error: any = new Error('Firebase Auth not initialized. Please check your .env configuration.');
      error.code = 'auth/not-initialized';
      console.error('❌ Firebase Auth method not available');
      throw error;
    }
    
    return await (firebaseAuth as any).createUserWithEmailAndPassword(email, password);
  },

  /**
   * Sign out current user
   */
  async signOut() {
    console.log('👋 Auth Service: Signing out');
    
    if (typeof (firebaseAuth as any).signOut === 'function') {
      return await (firebaseAuth as any).signOut();
    }
    
    return Promise.resolve();
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: any) => void) {
    if (typeof (firebaseAuth as any).onAuthStateChanged === 'function') {
      return (firebaseAuth as any).onAuthStateChanged(callback);
    }
    
    // Fallback: call callback with null immediately
    setTimeout(() => callback(null), 0);
    return () => {};
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    return firebaseAuth.currentUser;
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string) {
    console.log('📧 Auth Service: Sending password reset', { email });
    
    if (typeof (firebaseAuth as any).sendPasswordResetEmail !== 'function') {
      const error: any = new Error('Firebase Auth not initialized. Please check your .env configuration.');
      error.code = 'auth/not-initialized';
      console.error('❌ Firebase Auth method not available');
      throw error;
    }
    
    return await (firebaseAuth as any).sendPasswordResetEmail(email);
  }
};

export default auth;

