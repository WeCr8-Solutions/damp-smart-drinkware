/**
 * 🔄 DAMP Smart Drinkware - Circular Type System Entry Point
 * Central export hub ensuring no dead ends in type connectivity
 */

// Core type exports
export * from './global';
export * from './user';
export * from './settings';
// Supabase types removed - using Firebase only

// Re-export for circular connectivity (Firebase types)
export type { UserProfile, User } from './user';
export type { SettingsState, SettingsConfig } from './settings';

// Global type aliases for easier imports
export type {
  AppDatabase,
  AppUser,
  AppSettings,
  BLEDevice,
  DeviceReading,
  FirebaseConfig,
  // SupabaseConfig removed
  AnalyticsEvent,
  AppError,
  AppTheme,
  NavigationState,
  RouteConfig,
  BaseComponentProps,
  NavigationComponentProps,
  AuthRequiredProps,
} from './global';

// Environment and configuration types
export interface AppConfig {
  firebase: FirebaseConfig;
  // supabase removed - Firebase only
  features: FeatureFlags;
  theme: AppTheme;
}

export interface FeatureFlags {
  analytics: boolean;
  crashlytics: boolean;
  debugMode: boolean;
  betaFeatures: boolean;
  mockData: boolean;
}

// Cross-module type connections
export interface TypeConnections {
  // Components -> Contexts
  componentContexts: {
    auth: typeof import('@/contexts/AuthContext');
    theme: any; // Will be created
    settings: any; // Will be created
  };
  
  // Hooks -> Services
  hookServices: {
    firebase: typeof import('@/firebase/auth');
    // supabase removed - Firebase only
    ble: any; // Will be connected to BLE services
  };
  
  // Utils -> Types
  utilTypes: {
    deviceManager: DeviceReading[];
    validators: any;
    formatters: any;
  };
}

// Module system types for circular connectivity
export interface ModuleRegistry {
  '@/components': {
    types: BaseComponentProps;
    exports: Record<string, React.ComponentType<any>>;
  };
  '@/contexts': {
    types: React.Context<any>[];
    exports: Record<string, React.Provider<any>>;
  };
  '@/hooks': {
    types: Record<string, (...args: any[]) => any>;
    exports: Record<string, Function>;
  };
  '@/lib': {
    types: Record<string, any>;
    exports: Record<string, any>;
  };
  '@/utils': {
    types: Record<string, (...args: any[]) => any>;
    exports: Record<string, Function>;
  };
  '@/firebase': {
    types: FirebaseConfig;
    exports: Record<string, any>;
  };
  // '@/supabase' removed - Firebase only
}

// Testing type exports to ensure testing connectivity
export interface TestingTypes {
  mocks: {
    devices: BLEDevice[];
    users: AppUser[];
    readings: DeviceReading[];
  };
  fixtures: {
    authUser: AppUser;
    mockDevice: BLEDevice;
    mockReading: DeviceReading;
  };
  utilities: {
    renderWithProviders: Function;
    createMockNavigation: Function;
    createMockDevice: Function;
  };
}

// Type validation utilities
export interface TypeValidator<T> {
  validate: (input: unknown) => input is T;
  sanitize: (input: any) => T | null;
  schema: any; // JSON schema or validation schema
}

// Create validators for core types
export const typeValidators: {
  user: TypeValidator<AppUser>;
  device: TypeValidator<BLEDevice>;
  reading: TypeValidator<DeviceReading>;
  settings: TypeValidator<AppSettings>;
} = {} as any; // Will be implemented by utilities

// Export type utilities for runtime type checking
export interface RuntimeTypeChecker {
  isValidUser: (obj: any) => obj is AppUser;
  isValidDevice: (obj: any) => obj is BLEDevice;
  isValidReading: (obj: any) => obj is DeviceReading;
  isValidConfig: (obj: any) => obj is AppConfig;
}

// Circular dependency resolution types
export interface CircularResolver {
  resolveTypes: () => ModuleRegistry;
  validateConnections: () => boolean;
  getDeadEnds: () => string[];
  getCircularRefs: () => string[];
}

// Default exports for immediate use
export const defaultAppConfig: Partial<AppConfig> = {
  features: {
    analytics: true,
    crashlytics: true,
    debugMode: process.env.NODE_ENV === 'development',
    betaFeatures: false,
    mockData: process.env.NODE_ENV === 'test',
  },
};

export const defaultMockConfig: MockConfig = {
  enableMocks: process.env.NODE_ENV === 'test',
  mockDevices: true,
  mockFirebase: true,
      // mockSupabase removed - Firebase only
  mockBLE: true,
};

// Type guards for runtime validation
export function isAppUser(obj: any): obj is AppUser {
  return obj && typeof obj.id === 'string' && obj.email;
}

export function isBLEDevice(obj: any): obj is BLEDevice {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

export function isDeviceReading(obj: any): obj is DeviceReading {
  return obj && 
    typeof obj.deviceId === 'string' && 
    typeof obj.timestamp === 'number' &&
    typeof obj.temperature === 'number';
}

// Ensure all cross-references are maintained
export interface SystemHealth {
  typeConnectivity: boolean;
  circularReferences: string[];
  deadEnds: string[];
  moduleIntegrity: boolean;
  testingIntegration: boolean;
}

// Final re-exports to prevent any missing types
export type { MockConfig } from './global';