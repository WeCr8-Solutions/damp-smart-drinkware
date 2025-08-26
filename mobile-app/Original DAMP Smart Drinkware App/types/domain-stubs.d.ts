// Lightweight domain type stubs used to collapse cascading TypeScript errors.
interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  [key: string]: any;
}

interface AppUser {
  id?: string;
  email?: string;
  displayName?: string;
  phone?: string;
  [key: string]: any;
}

interface BLEDevice {
  id?: string;
  bluetoothId?: string;
  name?: string;
  batteryLevel?: number;
  status?: string;
  [key: string]: any;
}

interface DeviceReading {
  timestamp?: number;
  value?: any;
  type?: string;
  [key: string]: any;
}

interface AppSettings {
  featureFlags?: Record<string, boolean>;
  [key: string]: any;
}

export {};
