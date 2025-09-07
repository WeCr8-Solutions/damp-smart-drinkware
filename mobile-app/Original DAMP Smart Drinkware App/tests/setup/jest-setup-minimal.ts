/**
 * DAMP Smart Drinkware - Minimal Jest Setup
 * Essential setup for testing Google engineering optimizations
 */

// Global polyfills for React Native environment
(global as any).TextEncoder = (global as any).TextEncoder || require('util').TextEncoder;
(global as any).TextDecoder = (global as any).TextDecoder || require('util').TextDecoder;

// Mock performance API for testing
global.performance = global.performance || {
  now: () => Date.now(),
  memory: {
    usedJSHeapSize: 10 * 1024 * 1024,
    totalJSHeapSize: 50 * 1024 * 1024,
    jsHeapSizeLimit: 100 * 1024 * 1024,
  }
};

// Mock crypto for security tests
(global as any).crypto = (global as any).crypto || {
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
};

// Mock requestAnimationFrame
global.requestAnimationFrame = global.requestAnimationFrame || ((cb: FrameRequestCallback) => setTimeout(cb, 16)) as any;

// Mock __DEV__ for development checks
(global as any).__DEV__ = process.env.NODE_ENV !== 'production';

// Mock console methods unless DEBUG is set
if (!process.env.DEBUG) {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Simple test utilities
(global as any).testUtils = {
  wait: (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)),

  waitFor: async (condition: () => boolean, timeout = 5000, interval = 100) => {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await (global as any).testUtils.wait(interval);
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },

  createMockUser: (overrides: any = {}) => ({
    id: 'test-user-123',
    email: 'test@dampdrinkware.com',
    displayName: 'Test User',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  createMockDevice: (overrides: any = {}) => ({
    id: 'device-123',
    name: 'DAMP Test Device',
    type: 'silicone-bottom',
    batteryLevel: 85,
    isConnected: false,
    lastSeen: new Date().toISOString(),
    firmwareVersion: '1.0.0',
    ...overrides
  }),

  createMockSensorData: (overrides: any = {}) => ({
    temperature: 72.5,
    humidity: 45,
    batteryLevel: 85,
    timestamp: Date.now(),
    deviceId: 'device-123',
    ...overrides
  }),
};