/**
 * 🌐 DAMP Smart Drinkware - Global Type Definitions
 * Comprehensive global types ensuring circular loop system connectivity
 */

import { Database } from './supabase';
import { UserProfile } from './user';
import { SettingsState } from './settings';

// Global environment variables with strict typing
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Firebase Configuration
      FIREBASE_API_KEY: string;
      FIREBASE_AUTH_DOMAIN: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_STORAGE_BUCKET: string;
      FIREBASE_MESSAGING_SENDER_ID: string;
      FIREBASE_APP_ID: string;
      FIREBASE_MEASUREMENT_ID: string;
      
      // Supabase Configuration
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      
      // App Configuration
      NODE_ENV: 'development' | 'staging' | 'production' | 'test';
      EXPO_PUBLIC_API_URL: string;
      
      // Feature Flags
      EXPO_PUBLIC_ENABLE_ANALYTICS?: string;
      EXPO_PUBLIC_ENABLE_CRASHLYTICS?: string;
      EXPO_PUBLIC_ENABLE_DEBUG_MODE?: string;
    }
  }

  // React Native global extensions
  interface Console {
    tron?: any; // Flipper/Reactotron integration
  }

  // Expo Router global types
  namespace ExpoRouter {
    interface Routes {
      '/': void;
      '/(tabs)': void;
      '/(tabs)/devices': void;
      '/(tabs)/analytics': void;
      '/(tabs)/settings': void;
      '/(tabs)/profile': void;
      '/auth/login': void;
      '/auth/signup': void;
      '/add-device': void;
      '+not-found': void;
    }
  }

  // Testing globals for Jest
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
      toHaveAccessibilityState(state: any): R;
      toBeOnTheScreen(): R;
      toHaveAnimatedStyle(style: any): R;
    }
  }
}

// App-wide type utilities for circular system connectivity
export type AppDatabase = Database;
export type AppUser = UserProfile;
export type AppSettings = SettingsState;

// Navigation and routing types
export interface NavigationState {
  index: number;
  routeNames: string[];
  history?: any[];
  routes: RouteConfig[];
  type: string;
  stale: false;
}

export interface RouteConfig {
  key: string;
  name: string;
  params?: Record<string, any>;
  path?: string;
}

// Device and BLE types for comprehensive connectivity
export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  serviceUUIDs: string[];
  isConnectable: boolean;
  manufacturerData?: string;
}

export interface DeviceReading {
  deviceId: string;
  timestamp: number;
  temperature: number;
  batteryLevel: number;
  liquidLevel: number;
  isCharging: boolean;
}

// Firebase integration types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Supabase integration types
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Analytics and tracking types
export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp: number;
  userId?: string;
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  userId?: string;
  context?: string;
}

// Testing and mock types
export interface MockConfig {
  enableMocks: boolean;
  mockDevices: boolean;
  mockFirebase: boolean;
  mockSupabase: boolean;
  mockBLE: boolean;
}

// Cross-module connectivity types
export interface ModuleExports {
  '@/components': typeof import('../components');
  '@/contexts': typeof import('../contexts');
  '@/hooks': typeof import('../hooks');
  '@/lib': typeof import('../lib');
  '@/utils': typeof import('../utils');
  '@/firebase': typeof import('../firebase');
  '@/supabase': typeof import('../supabase');
  '@/types': typeof import('../types');
}

// Circular reference types for ensuring complete connectivity
export interface AppModule {
  name: string;
  exports: Record<string, any>;
  dependencies: string[];
  circularDependencies?: string[];
}

export interface SystemConnectivity {
  modules: Record<string, AppModule>;
  pathMappings: Record<string, string[]>;
  typeExports: Record<string, any>;
  globalTypes: Record<string, any>;
}

// Component prop types for type safety across the app
export interface BaseComponentProps {
  children?: React.ReactNode;
  style?: any;
  testID?: string;
}

export interface NavigationComponentProps extends BaseComponentProps {
  navigation?: any;
  route?: any;
}

export interface AuthRequiredProps extends BaseComponentProps {
  user: AppUser;
  session: any;
}

// Theme and styling types
export interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    success: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, number>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, number>;
  };
  borderRadius: Record<string, number>;
  shadows: Record<string, any>;
}

// Ensure this file is treated as a module
export {};