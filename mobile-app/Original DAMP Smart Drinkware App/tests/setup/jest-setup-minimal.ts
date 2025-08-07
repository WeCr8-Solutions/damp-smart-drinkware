/**
 * DAMP Smart Drinkware - Minimal Jest Setup
 * Essential setup for testing Google engineering optimizations
 */

// Global polyfills for React Native environment
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

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
global.crypto = global.crypto || {
  getRandomValues: (arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
};

// Mock requestAnimationFrame
global.requestAnimationFrame = global.requestAnimationFrame || ((cb) => setTimeout(cb, 16));

// Mock __DEV__ for development checks
(global as any).__DEV__ = process.env.NODE_ENV !== 'production';

// Mock console methods unless DEBUG is set
if (!process.env.DEBUG) {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Simple test utilities
global.testUtils = {
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  waitFor: async (condition, timeout = 5000, interval = 100) => {
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
};