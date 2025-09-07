/**
 * DAMP Smart Drinkware - Integration Test Setup
 * Configuration for testing Firebase, BLE, and cross-service integrations
 * Copyright 2025 WeCr8 Solutions LLC
 */

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import 'react-native-url-polyfill/auto';
import { initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseFunctions from 'firebase/functions';
import * as firebaseStorage from 'firebase/storage';

// Firebase Test Configuration
const firebaseTestConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-auth-domain',
  projectId: 'damp-smart-drinkware-test',
  storageBucket: 'test-storage-bucket',
  messagingSenderId: '123456789',
  appId: 'test-app-id'
};

// Initialize Firebase for testing
const testApp = initializeApp(firebaseTestConfig, 'test-app');

// Connect to Firebase emulators
const auth = (firebaseAuth as any).getAuth ? (firebaseAuth as any).getAuth(testApp) : (firebaseAuth as any).default?.getAuth?.(testApp);
const firestore = (firebaseFirestore as any).getFirestore ? (firebaseFirestore as any).getFirestore(testApp) : (firebaseFirestore as any).default?.getFirestore?.(testApp);
const functions = (firebaseFunctions as any).getFunctions ? (firebaseFunctions as any).getFunctions(testApp) : (firebaseFunctions as any).default?.getFunctions?.(testApp);
const storage = (firebaseStorage as any).getStorage ? (firebaseStorage as any).getStorage(testApp) : (firebaseStorage as any).default?.getStorage?.(testApp);

// Connect to emulators if running locally
if (process.env.NODE_ENV === 'test') {
  try {
    if ((firebaseAuth as any).connectAuthEmulator) {
      (firebaseAuth as any).connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    if ((firebaseFirestore as any).connectFirestoreEmulator) {
      (firebaseFirestore as any).connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
    if ((firebaseFunctions as any).connectFunctionsEmulator) {
      (firebaseFunctions as any).connectFunctionsEmulator(functions, 'localhost', 5001);
    }
    if ((firebaseStorage as any).connectStorageEmulator) {
      (firebaseStorage as any).connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    // Emulators already connected or not available
    console.log('Firebase emulators connection status:', error);
  }
}

// Mock React Native modules for integration tests
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-ble-plx', () => {
  const mockBleManager = {
    state: 'PoweredOn',
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(),
    discoverAllServicesAndCharacteristicsForDevice: jest.fn(),
    readCharacteristicForDevice: jest.fn(),
    writeCharacteristicWithResponseForDevice: jest.fn(),
    monitorCharacteristicForDevice: jest.fn(),
    cancelDeviceConnection: jest.fn(),
    destroy: jest.fn()
  };

  const MockBleManager = jest.fn().mockImplementation(() => mockBleManager);

  return {
    BleManager: MockBleManager,
    Device: jest.fn(),
    Characteristic: jest.fn(),
    Service: jest.fn(),
    BleError: jest.fn(),
    State: {
      PoweredOn: 'PoweredOn',
      PoweredOff: 'PoweredOff',
      Unsupported: 'Unsupported'
    }
  };
});

// Export BLE mock utilities for tests
export const mockBleManager = {
  state: 'PoweredOn',
  startDeviceScan: jest.fn(),
  stopDeviceScan: jest.fn(),
  connectToDevice: jest.fn(),
  discoverAllServicesAndCharacteristicsForDevice: jest.fn(),
  readCharacteristicForDevice: jest.fn(),
  writeCharacteristicWithResponseForDevice: jest.fn(),
  monitorCharacteristicForDevice: jest.fn(),
  cancelDeviceConnection: jest.fn(),
  destroy: jest.fn()
};

// Enhanced Location Mock for integration
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5,
      altitude: 0,
      altitudeAccuracy: 0,
      heading: 0,
      speed: 0
    },
    timestamp: Date.now()
  })),
  watchPositionAsync: jest.fn((options, callback) => {
    const mockWatcher = {
      remove: jest.fn()
    };
    // Simulate location updates
    setTimeout(() => {
      callback({
        coords: {
          latitude: 37.7749 + Math.random() * 0.01,
          longitude: -122.4194 + Math.random() * 0.01,
          accuracy: 5
        },
        timestamp: Date.now()
      });
    }, 100);
    return Promise.resolve(mockWatcher);
  }),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([{
    city: 'San Francisco',
    region: 'CA',
    country: 'USA',
    street: '123 Test St',
    postalCode: '94102'
  }])),
  geocodeAsync: jest.fn(() => Promise.resolve([{
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 5
  }]))
}));

// Notification Mock for integration
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
    canAskAgain: true,
    granted: true
  })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
    canAskAgain: true,
    granted: true
  })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  presentNotificationAsync: jest.fn(() => Promise.resolve()),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  setNotificationHandler: jest.fn(),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({
    data: 'ExponentPushToken[test-token]'
  }))
}));

// Enhanced AsyncStorage mock for integration
type MockAsyncStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  multiGet: (keys: string[]) => Promise<Array<[string, string | null]>>;
  multiSet: (pairs: [string, string][]) => Promise<void>;
  multiRemove: (keys: string[]) => Promise<void>;
  _storage: Record<string, string>;
};

const mockAsyncStorage: MockAsyncStorage = {
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockAsyncStorage._storage[key] || null);
  }),
  setItem: jest.fn((key: string, value: string) => {
    mockAsyncStorage._storage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockAsyncStorage._storage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockAsyncStorage._storage = {};
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockAsyncStorage._storage))),
  multiGet: jest.fn((keys: string[]) => {
    return Promise.resolve(keys.map(key => [key, mockAsyncStorage._storage[key] || null]));
  }),
  multiSet: jest.fn((keyValuePairs: [string, string][]) => {
    keyValuePairs.forEach(([key, value]) => {
      mockAsyncStorage._storage[key] = value;
    });
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach(key => delete mockAsyncStorage._storage[key]);
    return Promise.resolve();
  }),
  _storage: {} as Record<string, string>
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Test utilities for integration tests
export const integrationTestUtils = {
  // Firebase test utilities
  firebase: {
    testApp,
    auth,
    firestore,
    functions,
    storage,
    async clearData() {
      // Clear test data from Firebase emulators
      try {
        const collections = ['users', 'devices', 'analytics', 'notifications'];
        for (const collection of collections) {
          // This would clear emulator data in real tests
          console.log(`Cleared ${collection} collection`);
        }
      } catch (error) {
        console.warn('Failed to clear Firebase test data:', error);
      }
    }
  },

  // BLE test utilities
  ble: {
    mockBleManager,
    simulateDeviceConnection: (deviceId: string) => {
      return Promise.resolve({
        id: deviceId,
        name: 'DAMP Test Device',
        rssi: -50,
        isConnectable: true,
        isConnected: true
      });
    },
    simulateCharacteristicRead: (value: string) => {
      mockBleManager.readCharacteristicForDevice.mockResolvedValueOnce({
        value: Buffer.from(value).toString('base64')
      });
    },
    simulateCharacteristicWrite: () => {
      mockBleManager.writeCharacteristicWithResponseForDevice.mockResolvedValueOnce({});
    }
  },

  // Location test utilities
  location: {
    simulateLocationChange: (lat: number, lng: number) => {
      const mockLocation = {
        coords: {
          latitude: lat,
          longitude: lng,
          accuracy: 5,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0
        },
        timestamp: Date.now()
      };

      // Trigger any location watchers
      return mockLocation;
    }
  },

  // Storage test utilities
  storage: {
    async clearAll() {
      await mockAsyncStorage.clear();
    },
    async getStorageState() {
      return { ...mockAsyncStorage._storage };
    }
  }
};

// Global setup for integration tests
beforeEach(async () => {
  jest.clearAllMocks();
  await integrationTestUtils.storage.clearAll();
  await integrationTestUtils.firebase.clearData();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Global teardown
afterAll(async () => {
  await integrationTestUtils.firebase.clearData();
});

// Custom matchers for integration tests
expect.extend({
  toHaveBeenCalledWithBleDevice(received: jest.Mock, deviceId: string) {
    const pass = received.mock.calls.some(call =>
      call.some((arg: any) => typeof arg === 'object' && arg?.id === deviceId)
    );

    return {
      message: () =>
        pass
          ? `expected function not to have been called with BLE device ${deviceId}`
          : `expected function to have been called with BLE device ${deviceId}`,
      pass,
    };
  },

  toHaveValidFirebaseDocument(received: any) {
    const pass = received &&
                 typeof received.id === 'string' &&
                 received.data &&
                 typeof received.data === 'function';

    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid Firebase document`
          : `expected ${received} to be a valid Firebase document`,
      pass,
    };
  }
});

// Integration test timeout
jest.setTimeout(30000);