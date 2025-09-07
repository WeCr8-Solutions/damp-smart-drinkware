/**
 * 🛠️ DAMP Smart Drinkware - Utils Index
 * Central export hub for all utility functions ensuring circular connectivity
 */

// Import utilities for internal use
import { PerformanceMonitor, performanceMonitor, useRenderPerformance, BundleAnalyzer } from './performance';
import { SecurityUtils, useSecurityMonitoring } from './security';

// Core utility exports (check actual exports from these files)
// export { default as deviceManager } from './deviceManager';
// export { default as supabaseDeviceManager } from './supabaseDeviceManager';

// Performance monitoring
export { PerformanceMonitor, performanceMonitor, useRenderPerformance, BundleAnalyzer } from './performance';
export type { PerformanceSnapshot } from './performance';

// Security utilities
export { SecurityUtils, useSecurityMonitoring } from './security';
export type { SecurityThreatReport } from './security';

// Utility connectivity map
export const utilityConnections = {
  // Utilities and their dependencies
  dependencies: {
    // 'deviceManager': ['@/types/global', '@/lib/supabase'],
    // 'supabaseDeviceManager': ['@/lib/supabase', '@/types/supabase'],
    'performance': ['react', 'react-native'],
    'security': ['react', 'react-native', 'crypto-js'],
  },

  // Components and hooks that use these utilities
  consumers: {
    // 'deviceManager': [
    //   '@/hooks/useBLE',
    //   '@/components/BLEManager',
    // ],
    // 'supabaseDeviceManager': [
    //   '@/hooks/useBLE',
    //   '@/contexts/AuthContext',
    // ],
    'performance': [
      '@/app/_layout',
      '@/components/ErrorBoundary',
    ],
    'security': [
      '@/components/auth',
      '@/utils/performance',
    ],
  },

  // Cross-utility dependencies
  crossReferences: {
    // 'deviceManager': ['supabaseDeviceManager'],
    // 'supabaseDeviceManager': ['deviceManager'],
    'performance': ['security'],
    'security': [],
  } as Record<string, string[]>
};

// Utility registry for dynamic access
export const utilityRegistry = {
  // deviceManager,
  // supabaseDeviceManager,
  performance: { PerformanceMonitor, performanceMonitor, useRenderPerformance, BundleAnalyzer },
  security: { SecurityUtils, useSecurityMonitoring },
};

// Utility type definitions
export interface UtilityExports {
  // deviceManager: typeof deviceManager;
  // supabaseDeviceManager: typeof supabaseDeviceManager;
  performance: {
    PerformanceMonitor: typeof PerformanceMonitor;
    performanceMonitor: typeof performanceMonitor;
    useRenderPerformance: typeof useRenderPerformance;
    BundleAnalyzer: typeof BundleAnalyzer;
  };
  security: {
    SecurityUtils: typeof SecurityUtils;
    useSecurityMonitoring: typeof useSecurityMonitoring;
  };
}

// Common utility function types
export interface DeviceManagerInterface {
  scanForDevices: () => Promise<any[]>;
  connectToDevice: (deviceId: string) => Promise<boolean>;
  disconnectDevice: (deviceId: string) => Promise<void>;
  getDeviceStatus: (deviceId: string) => any;
  saveDeviceReading: (reading: any) => Promise<void>;
}

export interface ValidationUtils {
  validateEmail: (email: string) => boolean;
  validatePhoneNumber: (phone: string) => boolean;
  validateDeviceId: (id: string) => boolean;
  sanitizeInput: (input: string) => string;
}

export interface FormatUtils {
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  formatTemperature: (temp: number) => string;
  formatBatteryLevel: (level: number) => string;
}

export interface NetworkUtils {
  checkConnectivity: () => Promise<boolean>;
  retryRequest: <T>(fn: () => Promise<T>, retries: number) => Promise<T>;
  handleNetworkError: (error: any) => string;
}

// Create utility instances (will be implemented)
export const validationUtils: ValidationUtils = {
  validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  validatePhoneNumber: (phone: string) => /^\+?[\d\s\-\(\)]+$/.test(phone),
  validateDeviceId: (id: string) => /^[a-zA-Z0-9\-_]+$/.test(id),
  sanitizeInput: (input: string) => input.trim().replace(/<[^>]*>/g, ''),
};

export const formatUtils: FormatUtils = {
  formatDate: (date: Date) => date.toLocaleDateString(),
  formatTime: (date: Date) => date.toLocaleTimeString(),
  formatTemperature: (temp: number) => `${temp.toFixed(1)}°C`,
  formatBatteryLevel: (level: number) => `${level}%`,
};

export const networkUtils: NetworkUtils = {
  checkConnectivity: async () => {
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch {
      return false;
    }
  },
  retryRequest: async <T>(fn: () => Promise<T>, retries: number): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return networkUtils.retryRequest(fn, retries - 1);
      }
      throw error;
    }
  },
  handleNetworkError: (error: any): string => {
    if (!navigator.onLine) {
      return 'No internet connection';
    }
    return error.message || 'Network error occurred';
  },
};

// Utility validation function
export function validateUtilityConnectivity(): {
  availableUtils: string[];
  utilityDependencies: Record<string, string[]>;
  circularReferences: string[];
  functionCoverage: number;
} {
  const availableUtils = Object.keys(utilityRegistry);
  const utilityDependencies = utilityConnections.dependencies;
  const circularReferences: string[] = [];

  // Check for circular dependencies
  Object.entries(utilityConnections.crossReferences).forEach(([util, refs]) => {
    refs.forEach(ref => {
      const crossRefs = utilityConnections.crossReferences as Record<string, string[]>;
      if (crossRefs[ref]?.includes(util)) {
        circularReferences.push(`${util} <-> ${ref}`);
      }
    });
  });

  // Calculate function coverage
  const totalExpectedFunctions = Object.keys(utilityConnections.dependencies).length;
  const availableFunctions = availableUtils.length;
  const functionCoverage = (availableFunctions / totalExpectedFunctions) * 100;

  return {
    availableUtils,
    utilityDependencies,
    circularReferences,
    functionCoverage,
  };
}

// Performance monitoring for utilities
export interface UtilityPerformance {
  functionName: string;
  executionTime: number;
  memoryUsage: number;
  callCount: number;
  errorRate: number;
}

export const utilityPerformanceTracker = {
  metrics: new Map<string, UtilityPerformance>(),

  track: <T>(name: string, fn: () => T): T => {
    const start = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    try {
      const result = fn();

      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const existing = utilityPerformanceTracker.metrics.get(name) || {
        functionName: name,
        executionTime: 0,
        memoryUsage: 0,
        callCount: 0,
        errorRate: 0,
      };

      utilityPerformanceTracker.metrics.set(name, {
        ...existing,
        executionTime: (existing.executionTime + (endTime - start)) / (existing.callCount + 1),
        memoryUsage: endMemory - startMemory,
        callCount: existing.callCount + 1,
      });

      return result;
    } catch (error) {
      const existing = utilityPerformanceTracker.metrics.get(name) || {
        functionName: name,
        executionTime: 0,
        memoryUsage: 0,
        callCount: 0,
        errorRate: 0,
      };

      utilityPerformanceTracker.metrics.set(name, {
        ...existing,
        errorRate: (existing.errorRate * existing.callCount + 1) / (existing.callCount + 1),
        callCount: existing.callCount + 1,
      });

      throw error;
    }
  },

  getMetrics: () => Array.from(utilityPerformanceTracker.metrics.values()),

  reset: () => utilityPerformanceTracker.metrics.clear(),
};

// Export types for circular connectivity (commented out until types are available)
// export type {
//   BLEDevice,
//   DeviceReading,
//   AppUser,
//   AppDatabase
// } from '@/types/global';

// Utility metadata for development
export const utilityMetadata = {
  totalUtilities: Object.keys(utilityRegistry).length,
  lastUpdated: new Date().toISOString(),
  dependencies: utilityConnections,
  performanceMetrics: utilityPerformanceTracker.getMetrics(),
};