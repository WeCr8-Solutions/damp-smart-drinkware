/**
 * 🎣 DAMP Smart Drinkware - Hooks Index
 * Central export hub for all custom hooks ensuring circular connectivity
 */

// Core hooks exports
export { useBLE } from './useBLE';
export { useFrameworkReady } from './useFrameworkReady';

// Hook connectivity map
export const hookConnections = {
  // Hooks and their dependencies
  dependencies: {
    'useBLE': ['@/lib/supabase', '@/utils/deviceManager', '@/types/global'],
    'useFrameworkReady': ['@/contexts/AuthContext'],
  },
  
  // Components that use these hooks
  consumers: {
    'useBLE': ['@/components/BLEManager', '@/components/BLEProvider'],
    'useFrameworkReady': ['@/app/_layout'],
  },
  
  // Cross-hook dependencies
  crossReferences: {
    'useBLE': ['useFrameworkReady'], // useBLE might depend on framework being ready
    'useFrameworkReady': [], 
  }
};

// Hook registry for dynamic access and validation
export const hookRegistry = {
  useBLE,
  useFrameworkReady,
};

// Hook types for consistent interfaces
export interface HookExports {
  useBLE: typeof useBLE;
  useFrameworkReady: typeof useFrameworkReady;
}

// Common hook return types
export interface BLEHookReturn {
  devices: any[];
  isScanning: boolean;
  connectedDevice: any | null;
  scanForDevices: () => void;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnectDevice: () => void;
  error: string | null;
}

export interface FrameworkHookReturn {
  isReady: boolean;
  error: Error | null;
  initializationProgress: number;
}

// Hook validation utilities
export function validateHookConnectivity(): {
  availableHooks: string[];
  hookDependencies: Record<string, string[]>;
  circularDependencies: string[];
  unresolvedDependencies: string[];
} {
  const availableHooks = Object.keys(hookRegistry);
  const hookDependencies = hookConnections.dependencies;
  const circularDependencies: string[] = [];
  const unresolvedDependencies: string[] = [];
  
  // Check for circular dependencies
  Object.entries(hookConnections.crossReferences).forEach(([hook, refs]) => {
    refs.forEach(ref => {
      if (hookConnections.crossReferences[ref]?.includes(hook)) {
        circularDependencies.push(`${hook} <-> ${ref}`);
      }
    });
  });
  
  // Check for unresolved dependencies
  Object.entries(hookDependencies).forEach(([hook, deps]) => {
    deps.forEach(dep => {
      // This would check if the dependency is actually resolvable
      // Implementation depends on module resolution strategy
    });
  });
  
  return {
    availableHooks,
    hookDependencies,
    circularDependencies,
    unresolvedDependencies,
  };
}

// Hook composition utilities for complex scenarios
export function useAppState() {
  const ble = useBLE();
  const framework = useFrameworkReady();
  
  return {
    ble,
    framework,
    isAppReady: framework.isReady && !ble.error,
  };
}

// Export types for circular connectivity
export type { BLEDevice, DeviceReading, AppUser } from '@/types/global';

// Hook metadata for development
export const hookMetadata = {
  totalHooks: Object.keys(hookRegistry).length,
  lastUpdated: new Date().toISOString(),
  dependencies: hookConnections,
  performanceMetrics: {
    averageRenderTime: 0, // Would be measured in development
    memoryUsage: 0, // Would be measured in development
  },
};