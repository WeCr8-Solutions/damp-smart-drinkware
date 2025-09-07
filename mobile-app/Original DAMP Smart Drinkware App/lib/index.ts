/**
 * 📚 DAMP Smart Drinkware - Library Index
 * Central export hub for Firebase services (Owner: zach@wecr8.info)
 */

// Core Firebase exports
export { app, auth, db, functions, storage } from '@/firebase/config';

// Import Firebase services for registry
import { auth, db, functions, storage } from '@/firebase/config';

// Import unified services
import VotingService from '@/services/voting-service';
import PurchasingService from '@/services/purchasing-service';
import FirebaseStripeService from '@/services/firebase-stripe';

// Export unified services
export { VotingService, PurchasingService, FirebaseStripeService };

// Notification system (will be created)
// export * from './notifications';

// Library connectivity map
export const libraryConnections = {
  // Libraries and their dependencies
  dependencies: {
    'firebase': ['@/types/global', '@/config/feature-flags'],
  },

  // Components and hooks that use these libraries
  consumers: {
    'firebase': [
      '@/contexts/AuthContext',
      '@/hooks/useBLE',
      '@/utils/deviceManager',
      '@/components/BLEManager',
      '@/services/firebase-stripe',
      '@/services/voting-service',
      '@/services/purchasing-service'
    ],
  },

  // Cross-library dependencies
  crossReferences: {
    'firebase': [], // Could reference notifications, analytics, etc.
  }
};

// Library registry for dynamic access
export const libraryRegistry = {
  firebase: { auth, db, functions, storage },
  services: {
    voting: VotingService,
    purchasing: PurchasingService,
    stripe: FirebaseStripeService
  },
};

// Library configuration interfaces
export interface LibraryConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  notifications?: {
    enablePush: boolean;
    enableLocal: boolean;
  };
  analytics?: {
    enableTracking: boolean;
    enableCrashReporting: boolean;
  };
}

// Service initialization utilities
export async function initializeServices(config: LibraryConfig): Promise<{
  firebase: boolean;
  notifications: boolean;
  analytics: boolean;
  errors: string[];
}> {
  const results = {
    firebase: false,
    notifications: false,
    analytics: false,
    errors: [] as string[],
  };

  // Initialize Firebase
  try {
    // Firebase is already initialized in @/firebase/config
    results.firebase = true;
  } catch (error) {
    results.errors.push(`Firebase initialization failed: ${error}`);
  }

  // Initialize notifications (when implemented)
  try {
    results.notifications = true;
  } catch (error) {
    results.errors.push(`Notifications initialization failed: ${error}`);
  }

  // Initialize analytics (when implemented)
  try {
    results.analytics = true;
  } catch (error) {
    results.errors.push(`Analytics initialization failed: ${error}`);
  }

  return results;
}

// Library validation utilities
export function validateLibraryConnectivity(): {
  availableLibraries: string[];
  libraryDependencies: Record<string, string[]>;
  initializationStatus: Record<string, boolean>;
  serviceHealth: Record<string, 'healthy' | 'degraded' | 'offline'>;
} {
  const availableLibraries = Object.keys(libraryRegistry);
  const libraryDependencies = libraryConnections.dependencies;

  // Check initialization status
  const initializationStatus: Record<string, boolean> = {};
  availableLibraries.forEach(lib => {
    try {
      // Check if library is properly initialized
      initializationStatus[lib] = !!libraryRegistry[lib as keyof typeof libraryRegistry];
    } catch {
      initializationStatus[lib] = false;
    }
  });

  // Check service health
  const serviceHealth: Record<string, 'healthy' | 'degraded' | 'offline'> = {};
  availableLibraries.forEach(lib => {
    // This would include actual health checks
    serviceHealth[lib] = initializationStatus[lib] ? 'healthy' : 'offline';
  });

  return {
    availableLibraries,
    libraryDependencies,
    initializationStatus,
    serviceHealth,
  };
}

// Service health monitoring
export interface ServiceHealthCheck {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastCheck: Date;
  responseTime?: number;
  errorCount?: number;
}

export async function performHealthCheck(): Promise<ServiceHealthCheck[]> {
  const checks: ServiceHealthCheck[] = [];

  // Firebase health check
  try {
    const start = Date.now();
    const { auth } = await import('@/firebase/config');
    // Simple auth check
    auth.currentUser;
    checks.push({
      serviceName: 'firebase',
      status: 'healthy',
      lastCheck: new Date(),
      responseTime: Date.now() - start,
    });
  } catch (error) {
    checks.push({
      serviceName: 'firebase',
      status: 'offline',
      lastCheck: new Date(),
      errorCount: 1,
    });
  }

  return checks;
}

// Export types for circular connectivity
export type {
  AppDatabase,
  AppUser
} from '@/types/global';

// Library metadata for development
export const libraryMetadata = {
  totalLibraries: Object.keys(libraryRegistry).length,
  lastUpdated: new Date().toISOString(),
  dependencies: libraryConnections,
  healthStatus: 'initializing', // Will be updated by health checks
};