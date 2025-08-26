// Minimal global type shims to reduce TypeScript cascade errors during triage
export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export type AppTheme = 'light' | 'dark' | string;

export interface BLEDevice {
  id: string;
  name?: string;
  rssi?: number;
  [key: string]: any;
}

export interface DeviceReading {
  deviceId: string;
  timestamp: number;
  temperature: number;
  humidity?: number;
  [key: string]: any;
}

export interface AppUser {
  id: string;
  email?: string | null;
  displayName?: string | null;
  [key: string]: any;
}

export interface AppSettings {
  notificationsEnabled?: boolean;
  theme?: AppTheme;
  [key: string]: any;
}

export interface BaseComponentProps {
  testID?: string;
  style?: any;
  children?: any;
  [key: string]: any;
}

export interface MockConfig {
  enableMocks?: boolean;
  mockDevices?: boolean;
  mockFirebase?: boolean;
  mockBLE?: boolean;
}

export interface AnalyticsEvent { name: string; payload?: any }
export interface AppError { code?: string | number; message: string }
export interface NavigationState { index: number; routes: any[] }
export interface RouteConfig { name: string; path?: string }
export interface NavigationComponentProps { navigation: any; route?: any }
export interface AuthRequiredProps { requiresAuth?: boolean }

export type AppDatabase = any;

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {};

// Minimal ambient module declarations for test-only dependencies to silence TypeScript
// errors during triage. These can be expanded with real types if those libs are used
// at runtime.
declare module '@supabase/supabase-js' {
  export function createClient(url: string, key: string): any;
}

declare module 'reassure' {
  export function measureRenders(component: any): any;
  export function configure(opts: any): void;
}

declare module '@axe-core/react-native' {
  export function configureAxe(opts?: any): void;
  export type RunOptions = any;
  export type Result = any;
  export type AxeResults = any;
}
