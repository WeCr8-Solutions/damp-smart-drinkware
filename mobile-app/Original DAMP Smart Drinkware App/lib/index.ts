/**
 * 📚 DAMP Smart Drinkware - Library Index
 * Central export hub for all libraries and services ensuring circular connectivity
 */

// Core library exports
export { supabase } from './supabase';
export * from './supabase';

// Notification system (will be created)
// export * from './notifications';

// Library connectivity map
export const libraryConnections = {
  // Libraries and their dependencies
  dependencies: {
    'supabase': ['@/types/supabase', '@/types/global'],
  },
  
  // Components and hooks that use these libraries
  consumers: {
    'supabase': [
      '@/contexts/AuthContext',
      '@/hooks/useBLE',
      '@/utils/deviceManager',
      '@/components/BLEManager'
    ],
  },
  
  // Cross-library dependencies
  crossReferences: {
    'supabase': [], // Could reference notifications, analytics, etc.
  }
};

// Library registry for dynamic access
export const libraryRegistry = {
  supabase,
};

// Library configuration interfaces
export interface LibraryConfig {
  supabase: {
    url: string;
    anonKey: string;
    enableRealtime: boolean;
    enableAuth: boolean;
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
  supabase: boolean;
  notifications: boolean;
  analytics: boolean;
  errors: string[];
}> {
  const results = {
    supabase: false,
    notifications: false,
    analytics: false,
    errors: [] as string[],
  };

  // Initialize Supabase
  try {
    // Supabase is already initialized in ./supabase.ts
    results.supabase = true;
  } catch (error) {
    results.errors.push(`Supabase initialization failed: ${error}`);
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
  
  // Supabase health check
  try {
    const start = Date.now();
    await supabase.from('user_profiles').select('id').limit(1);
    checks.push({
      serviceName: 'supabase',
      status: 'healthy',
      lastCheck: new Date(),
      responseTime: Date.now() - start,
    });
  } catch (error) {
    checks.push({
      serviceName: 'supabase',
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
  AppUser, 
  SupabaseConfig,
  Database 
} from '@/types/global';

// Library metadata for development
export const libraryMetadata = {
  totalLibraries: Object.keys(libraryRegistry).length,
  lastUpdated: new Date().toISOString(),
  dependencies: libraryConnections,
  healthStatus: 'initializing', // Will be updated by health checks
};