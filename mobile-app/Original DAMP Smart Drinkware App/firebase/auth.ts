/**
 * Auth wrappers for DAMP app
 * Provides a small, stable surface over either the real Firebase Auth instance
 * (modular SDK) or the mock auth exported by `firebase/config.ts`.
 */
import { firebaseAuth } from './config';

type Unsubscribe = () => void;

const signInWithEmail = async (email: string, password: string) => {
  try {
    // Mock or legacy object may provide a method directly
    if (typeof (firebaseAuth as any).signInWithEmailAndPassword === 'function') {
      return await (firebaseAuth as any).signInWithEmailAndPassword(email, password);
    }

    // Modular SDK (v9+) style
  const mod: any = await import('firebase/auth');
  return await mod.signInWithEmailAndPassword((firebaseAuth as any), email, password);
  } catch (error) {
    throw error;
  }
};

const signUpWithEmail = async (email: string, password: string) => {
  try {
    if (typeof (firebaseAuth as any).createUserWithEmailAndPassword === 'function') {
      return await (firebaseAuth as any).createUserWithEmailAndPassword(email, password);
    }

  const mod: any = await import('firebase/auth');
  return await mod.createUserWithEmailAndPassword((firebaseAuth as any), email, password);
  } catch (error) {
    throw error;
  }
};

const signOut = async () => {
  try {
    if (typeof (firebaseAuth as any).signOut === 'function') {
      return await (firebaseAuth as any).signOut();
    }

  const mod: any = await import('firebase/auth');
  return await mod.signOut((firebaseAuth as any));
  } catch (error) {
    throw error;
  }
};

const onAuthStateChanged = (callback: (user: any) => void): Unsubscribe => {
  // Mock provides a method that returns an unsubscribe function
  if (typeof (firebaseAuth as any).onAuthStateChanged === 'function') {
    try {
      // If the mock expects only a callback, call it directly and return noop unsubscribe
      const maybeUnsub = (firebaseAuth as any).onAuthStateChanged(callback);
      if (typeof maybeUnsub === 'function') return maybeUnsub as Unsubscribe;
      return () => {};
    } catch (e) {
      return () => {};
    }
  }

  // Modular SDK
  let unsub: Unsubscribe = () => {};
  (async () => {
    try {
  const mod: any = await import('firebase/auth');
  const u = mod.onAuthStateChanged((firebaseAuth as any), callback as any);
      if (typeof u === 'function') unsub = u as Unsubscribe;
    } catch (e) {
      // ignore
    }
  })();

  return () => unsub();
};

const getCurrentUser = () => {
  try {
    return (firebaseAuth as any).currentUser || null;
  } catch (e) {
    return null;
  }
};

const sendPasswordReset = async (email: string) => {
  try {
    if (typeof (firebaseAuth as any).sendPasswordResetEmail === 'function') {
      return await (firebaseAuth as any).sendPasswordResetEmail(email);
    }

  const mod: any = await import('firebase/auth');
  return await mod.sendPasswordResetEmail((firebaseAuth as any), email);
  } catch (error) {
    throw error;
  }
};

const updateProfile = async (profile: { displayName?: string; photoURL?: string }) => {
  try {
    if ((firebaseAuth as any).currentUser && typeof (firebaseAuth as any).currentUser.updateProfile === 'function') {
      return await (firebaseAuth as any).currentUser.updateProfile(profile);
    }

    const mod: any = await import('firebase/auth');
    if ((firebaseAuth as any).currentUser) {
      return await mod.updateProfile((firebaseAuth as any).currentUser, profile as any);
    }

    throw new Error('No current user');
  } catch (error) {
    throw error;
  }
};

export const authService = {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  onAuthStateChanged,
  getCurrentUser,
  sendPasswordReset,
  updateProfile,
};

export default authService;
