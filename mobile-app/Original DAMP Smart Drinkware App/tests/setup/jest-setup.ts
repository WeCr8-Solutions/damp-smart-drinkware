/**
 * DAMP Smart Drinkware - Main Jest Setup
 * Global test configuration and setup for all test types
 * Copyright 2025 WeCr8 Solutions LLC
 */

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import 'react-native-url-polyfill/auto';

// Global polyfills
import { TextEncoder, TextDecoder } from 'util';
(global as any).TextEncoder = TextEncoder as any;
(global as any).TextDecoder = TextDecoder as any;

// Mock console methods to reduce test noise unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };
}

// Global test utilities
global.testUtils = {
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  waitFor: async (condition: () => boolean, timeout = 5000, interval = 100) => {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await global.testUtils.wait(interval);
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },

  createMockUser: (overrides = {}) => ({
    id: 'test-user-123',
    email: 'test@dampdrinkware.com',
    displayName: 'Test User',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  createMockDevice: (overrides = {}) => ({
    id: 'device-123',
    name: 'DAMP Test Device',
    type: 'silicone-bottom',
    batteryLevel: 85,
    isConnected: false,
    lastSeen: new Date().toISOString(),
    firmwareVersion: '1.0.0',
    ...overrides
  }),

  createMockSensorData: (overrides = {}) => ({
    temperature: 72.5,
    humidity: 45,
    batteryLevel: 85,
    timestamp: Date.now(),
    deviceId: 'device-123',
    ...overrides
  })
};

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for all tests
jest.setTimeout(10000);

// Mock global fetch if needed
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock __DEV__ for React Native development checks
(global as any).__DEV__ = process.env.NODE_ENV !== 'production';

// Mock performance API for performance monitoring tests
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 10 * 1024 * 1024,
    totalJSHeapSize: 50 * 1024 * 1024,
    jsHeapSizeLimit: 100 * 1024 * 1024,
  }
};

// Mock crypto for security tests
(global as any).crypto = (global as any).crypto || {
  getRandomValues: jest.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear any timers
  jest.clearAllTimers();

  // Reset any global state if needed
  if (global.testUtils) {
    // Reset any test utilities state
  }
});

// Import TypeScript types for testing integration (commented until global types available)
// import type {
//   AppUser,
//   BLEDevice,
//   DeviceReading,
//   AppDatabase
// } from '@/types/global';

// Temporary type definitions for testing
interface AppUser {
  id: string;
  email: string;
  displayName: string;
  emailVerified?: boolean;
  createdAt?: string;
}

interface BLEDevice {
  id: string;
  name: string;
  type: string;
  batteryLevel: number;
  isConnected?: boolean;
  lastSeen?: string;
  firmwareVersion?: string;
}

interface DeviceReading {
  deviceId: string;
  timestamp: number;
  temperature: number;
  humidity?: number;
  batteryLevel?: number;
}

// Extend Jest matchers with DAMP-specific validators
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
      toHaveAccessibilityState(state: any): R;
      toBeOnTheScreen(): R;
      toHaveAnimatedStyle(style: any): R;
      toBeValidAppUser(): R;
      toBeValidBLEDevice(): R;
      toBeValidDeviceReading(): R;
      toMatchAppUserSchema(): R;
      toMatchDeviceReadingSchema(): R;
    }
  }

  interface Window {
    testUtils: typeof testUtils;
  }

  var testUtils: {
    wait: (ms: number) => Promise<void>;
    waitFor: (condition: () => boolean, timeout?: number, interval?: number) => Promise<void>;
    createMockUser: (overrides?: any) => AppUser;
    createMockDevice: (overrides?: any) => BLEDevice;
    createMockSensorData: (overrides?: any) => DeviceReading;
  };
}

// Custom Jest matchers for TypeScript type validation
expect.extend({
  toBeValidAppUser(received) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.email === 'string' &&
      received.email.includes('@') &&
      typeof received.displayName === 'string';

    return {
      message: () =>
        pass ?
        `Expected ${JSON.stringify(received)} not to be a valid AppUser` :
        `Expected ${JSON.stringify(received)} to be a valid AppUser with id, email, and displayName`,
      pass,
    };
  },

  toBeValidBLEDevice(received) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      typeof received.type === 'string' &&
      typeof received.batteryLevel === 'number';

    return {
      message: () =>
        pass ?
        `Expected ${JSON.stringify(received)} not to be a valid BLEDevice` :
        `Expected ${JSON.stringify(received)} to be a valid BLEDevice with id, name, type, and batteryLevel`,
      pass,
    };
  },

  toBeValidDeviceReading(received) {
    const pass = received &&
      typeof received.deviceId === 'string' &&
      typeof received.timestamp === 'number' &&
      typeof received.temperature === 'number';

    return {
      message: () =>
        pass ?
        `Expected ${JSON.stringify(received)} not to be a valid DeviceReading` :
        `Expected ${JSON.stringify(received)} to be a valid DeviceReading with deviceId, timestamp, and temperature`,
      pass,
    };
  },

  toMatchAppUserSchema(received) {
    const requiredFields = ['id', 'email', 'displayName', 'emailVerified', 'createdAt'];
    const hasAllFields = requiredFields.every(field => received && received.hasOwnProperty(field));
    const hasValidTypes = received &&
      typeof received.id === 'string' &&
      typeof received.email === 'string' &&
      typeof received.displayName === 'string' &&
      typeof received.emailVerified === 'boolean' &&
      typeof received.createdAt === 'string';

    const pass = hasAllFields && hasValidTypes;

    return {
      message: () =>
        pass ?
        `Expected ${JSON.stringify(received)} not to match AppUser schema` :
        `Expected ${JSON.stringify(received)} to match AppUser schema with all required fields and correct types`,
      pass,
    };
  },

  toMatchDeviceReadingSchema(received) {
    const requiredFields = ['temperature', 'timestamp', 'deviceId'];
    const hasAllFields = requiredFields.every(field => received && received.hasOwnProperty(field));
    const hasValidTypes = received &&
      typeof received.temperature === 'number' &&
      typeof received.timestamp === 'number' &&
      typeof received.deviceId === 'string';

    const pass = hasAllFields && hasValidTypes;

    return {
      message: () =>
        pass ?
        `Expected ${JSON.stringify(received)} not to match DeviceReading schema` :
        `Expected ${JSON.stringify(received)} to match DeviceReading schema with all required fields and correct types`,
      pass,
    };
  },
});

// TypeScript integration test utilities
(global as any).typeValidationUtils = {
  validateCircularReferences: () => {
    // Test that all major types can be imported without circular dependency issues
    try {
      require('@/types');
      require('@/types/global');
      require('@/components');
      require('@/contexts');
      require('@/hooks');
      require('@/lib');
      require('@/utils');
      return true;
    } catch (error) {
      console.error('Circular reference validation failed:', error);
      return false;
    }
  },

  validatePathMappings: () => {
    const paths = [
      '@/types',
      '@/components',
      '@/contexts',
      '@/hooks',
      '@/lib',
      '@/utils'
    ];

    return paths.every(path => {
      try {
        require.resolve(path);
        return true;
      } catch {
        return false;
      }
    });
  },

  testTypeConnectivity: () => {
    return (global as any).typeValidationUtils.validateCircularReferences() &&
           (global as any).typeValidationUtils.validatePathMappings();
  }
} as any;

// Clean up after all tests
afterAll(() => {
  // Final cleanup
  jest.clearAllTimers();
  jest.restoreAllMocks();

  // Run final type connectivity validation
  if (process.env.NODE_ENV === 'test') {
    console.log('🔍 Final TypeScript connectivity check...');
    const isConnected = global.typeValidationUtils.testTypeConnectivity();
    if (!isConnected) {
      console.warn('⚠️  TypeScript connectivity issues detected during test cleanup');
    } else {
      console.log('✅ TypeScript circular loop system verified');
    }
  }
});