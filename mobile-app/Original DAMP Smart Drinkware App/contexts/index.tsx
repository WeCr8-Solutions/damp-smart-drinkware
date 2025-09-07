/**
 * 🌐 DAMP Smart Drinkware - Contexts Index
 * Central export hub for all React contexts ensuring circular connectivity
 */

// Core context exports
export { AuthProvider, useAuth, AuthContext } from './AuthContext';
export type { AuthContextType, AuthState } from './AuthContext';

// Context connectivity map
export const contextConnections = {
  // Contexts and their dependencies
  dependencies: {
    'AuthContext': ['@/lib/supabase', '@/firebase/auth', '@/types/global'],
  },

  // Contexts that provide to components
  providers: {
    'AuthContext': ['@/components/BLEManager', '@/app/_layout'],
  },

  // Cross-context dependencies
  crossReferences: {
    'AuthContext': [], // Add other contexts that depend on Auth
  }
};

// Context registry for dynamic access
export const contextRegistry = {
  AuthContext,
};

// Combined provider wrapper for easy app-wide context provisioning
export interface AppContextProviders {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppContextProviders) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

// Context validation utilities
export function validateContextConnectivity(): {
  activeContexts: string[];
  providerChain: string[];
  missingProviders: string[];
} {
  const activeContexts = Object.keys(contextRegistry);
  const providerChain = Object.keys(contextConnections.providers);
  const missingProviders: string[] = [];

  // Validate that all required providers are available
  activeContexts.forEach(context => {
    if (!contextRegistry[context as keyof typeof contextRegistry]) {
      missingProviders.push(context);
    }
  });

  return {
    activeContexts,
    providerChain,
    missingProviders,
  };
}

// Export types for circular connectivity
export type { AppUser, AppSettings, AuthRequiredProps } from '@/types/global';

// Context metadata for development
export const contextMetadata = {
  totalContexts: Object.keys(contextRegistry).length,
  lastUpdated: new Date().toISOString(),
  dependencies: contextConnections,
};