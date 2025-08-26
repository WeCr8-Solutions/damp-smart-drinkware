// Compatibility shim: provide a supabase-like API surface backed by Firebase.
// This lets the existing codebase/tests import `supabase` / `createClient`
// while the app is actually using Firebase services.
// Keep types permissive (any) so this file is safe under strict TS.

/* eslint-disable @typescript-eslint/no-explicit-any */

export const supabase: any = {
  auth: {
    // Returns a shape similar to supabase.auth.getSession()
    getSession: async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const user = auth.currentUser;
        return { data: { session: user ? { user } : null }, error: null } as any;
      } catch (e) {
        return { data: { session: null }, error: e } as any;
      }
    },
    signOut: async () => {
      try {
        const { getAuth, signOut } = await import('firebase/auth');
        await signOut(getAuth());
        return { error: null } as any;
      } catch (e) {
        return { error: e } as any;
      }
    }
  },

  functions: {
    // supabase.functions.invoke(name, payload)
    invoke: async (name: string, payload?: any) => {
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        const fn = httpsCallable(functions, name);
        const res = await fn(payload);
        return { data: res.data, error: null } as any;
      } catch (e) {
        return { data: null, error: e } as any;
      }
    }
  },

  // Minimal table-like API to satisfy `supabase.from(table).select(...)` calls
  from: (table: string) => ({
    select: async (..._args: any[]) => {
      try {
        const { getFirestore, collection, getDocs } = await import('firebase/firestore');
        const db = getFirestore();
        const col = collection(db, table);
        const snap = await getDocs(col as any);
        const data = (snap.docs || []).map((d: any) => ({ id: d.id, ...(d.data ? d.data() : {}) }));
        return { data, error: null } as any;
      } catch (e) {
        return { data: null, error: e } as any;
      }
    },
    insert: async (row: any) => {
      try {
        const { getFirestore, collection, addDoc } = await import('firebase/firestore');
        const db = getFirestore();
        const col = collection(db, table);
        const docRef = await addDoc(col as any, row);
        return { data: { id: docRef.id }, error: null } as any;
      } catch (e) {
        return { data: null, error: e } as any;
      }
    },
    update: async (..._args: any[]) => {
      // Best-effort stub for update semantics. Tests should mock more specific behavior.
      return { data: null, error: null } as any;
    },
    delete: async (..._args: any[]) => {
      return { data: null, error: null } as any;
    }
  })
};

export function createClient(..._args: any[]) {
  // Return the same object to mimic supabase.createClient(...)
  return supabase;
}

export default supabase;
