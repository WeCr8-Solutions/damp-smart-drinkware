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
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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

// Clean up after all tests
afterAll(() => {
  // Final cleanup
  jest.clearAllTimers();
  jest.restoreAllMocks();
});