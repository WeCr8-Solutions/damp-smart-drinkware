/**
 * DAMP Smart Drinkware - Performance Test Setup
 * Configuration for performance testing with Reassure and custom benchmarks
 * Copyright 2025 WeCr8 Solutions LLC
 */

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import { configure } from 'reassure';

// Configure Reassure for performance testing
configure({
  testingLibrary: 'react-native',
  outputFile: 'tests/performance/results/performance-results.json',
  verbose: true,
  runs: 10,
  warmupRuns: 3,
  scenario: {
    writeBundle: true,
    writeConsoleReport: true,
    writeHTMLReport: true
  }
});

// Mock React Native Performance API
const mockPerformanceNow = jest.fn(() => Date.now());
const mockPerformanceMark = jest.fn();
const mockPerformanceMeasure = jest.fn();

Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
    mark: mockPerformanceMark,
    measure: mockPerformanceMeasure,
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn()
  },
  configurable: true
});

// Mock React Native modules for performance testing
jest.mock('react-native-reanimated', () => {
  const reanimatedMock = require('react-native-reanimated/mock');
  
  // Enhance mock with performance tracking
  reanimatedMock.runOnJS = jest.fn((fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`runOnJS execution time: ${end - start}ms`);
    return result;
  });
  
  return reanimatedMock;
});

// Mock Gesture Handler with performance tracking
jest.mock('react-native-gesture-handler', () => {
  const gestureHandler = require('react-native-gesture-handler/jestSetup');
  
  return {
    ...gestureHandler,
    GestureDetector: ({ children, gesture, ...props }: any) => {
      // Track gesture performance
      const handleGesture = jest.fn(() => {
        const start = performance.now();
        // Simulate gesture processing
        setTimeout(() => {
          const end = performance.now();
          console.log(`Gesture processing time: ${end - start}ms`);
        }, 0);
      });
      
      return children;
    }
  };
});

// Enhanced BLE mock with performance tracking
const mockBleManagerWithPerformance = {
  startDeviceScan: jest.fn(() => {
    const start = performance.now();
    return new Promise((resolve) => {
      setTimeout(() => {
        const end = performance.now();
        console.log(`BLE scan duration: ${end - start}ms`);
        resolve(undefined);
      }, 100);
    });
  }),
  
  connectToDevice: jest.fn((deviceId: string) => {
    const start = performance.now();
    return new Promise((resolve) => {
      setTimeout(() => {
        const end = performance.now();
        console.log(`BLE connection time for ${deviceId}: ${end - start}ms`);
        resolve({
          id: deviceId,
          name: 'DAMP Device',
          isConnected: true
        });
      }, 200);
    });
  }),
  
  readCharacteristicForDevice: jest.fn(() => {
    const start = performance.now();
    return new Promise((resolve) => {
      setTimeout(() => {
        const end = performance.now();
        console.log(`BLE characteristic read time: ${end - start}ms`);
        resolve({ value: 'test-data' });
      }, 50);
    });
  }),
  
  writeCharacteristicWithResponseForDevice: jest.fn(() => {
    const start = performance.now();
    return new Promise((resolve) => {
      setTimeout(() => {
        const end = performance.now();
        console.log(`BLE characteristic write time: ${end - start}ms`);
        resolve(undefined);
      }, 75);
    });
  })
};

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => mockBleManagerWithPerformance)
}));

// Mock Firebase with performance tracking
const createFirebaseMockWithPerformance = (operationType: string) => {
  return jest.fn((...args) => {
    const start = performance.now();
    return new Promise((resolve) => {
      // Simulate network latency
      const latency = Math.random() * 100 + 50; // 50-150ms
      setTimeout(() => {
        const end = performance.now();
        console.log(`Firebase ${operationType} time: ${end - start}ms`);
        resolve({ success: true, data: args });
      }, latency);
    });
  });
};

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: createFirebaseMockWithPerformance('getDoc'),
  getDocs: createFirebaseMockWithPerformance('getDocs'),
  setDoc: createFirebaseMockWithPerformance('setDoc'),
  updateDoc: createFirebaseMockWithPerformance('updateDoc'),
  deleteDoc: createFirebaseMockWithPerformance('deleteDoc'),
  onSnapshot: jest.fn((query, callback) => {
    // Simulate real-time updates with performance tracking
    const start = performance.now();
    setTimeout(() => {
      const end = performance.now();
      console.log(`Firebase snapshot listener setup time: ${end - start}ms`);
      callback({ docs: [] });
    }, 10);
    return () => {}; // unsubscribe function
  })
}));

// Performance measurement utilities
export const performanceTestUtils = {
  // Memory usage tracking
  measureMemoryUsage: () => {
    if (global.gc) {
      global.gc();
    }
    return {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal
    };
  },

  // Component render time measurement
  measureRenderTime: async (renderFunction: () => Promise<any>) => {
    const start = performance.now();
    await renderFunction();
    const end = performance.now();
    return end - start;
  },

  // Animation performance measurement
  measureAnimationPerformance: (animationDuration: number) => {
    const frames: number[] = [];
    let lastTimestamp = performance.now();
    
    const measureFrame = () => {
      const currentTimestamp = performance.now();
      const frameTime = currentTimestamp - lastTimestamp;
      frames.push(frameTime);
      lastTimestamp = currentTimestamp;
      
      if (frames.length * 16.67 < animationDuration) {
        requestAnimationFrame(measureFrame);
      }
    };
    
    requestAnimationFrame(measureFrame);
    
    return {
      getFrameStats: () => {
        const avgFrameTime = frames.reduce((a, b) => a + b, 0) / frames.length;
        const droppedFrames = frames.filter(time => time > 16.67).length;
        return {
          averageFrameTime: avgFrameTime,
          droppedFrames,
          frameCount: frames.length,
          fps: Math.round(1000 / avgFrameTime)
        };
      }
    };
  },

  // Network request performance
  measureNetworkPerformance: async (requestFunction: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await requestFunction();
      const end = performance.now();
      return {
        success: true,
        duration: end - start,
        result
      };
    } catch (error) {
      const end = performance.now();
      return {
        success: false,
        duration: end - start,
        error
      };
    }
  },

  // Bundle size analysis (mock)
  analyzeBundleSize: () => {
    return {
      totalSize: 2.5 * 1024 * 1024, // 2.5MB mock
      jsSize: 1.8 * 1024 * 1024,    // 1.8MB mock
      assetsSize: 0.7 * 1024 * 1024  // 0.7MB mock
    };
  }
};

// Performance benchmarks
export const performanceBenchmarks = {
  // Component rendering benchmarks
  componentRender: {
    fast: 16, // under 16ms (60fps)
    acceptable: 33, // under 33ms (30fps)
    slow: 100 // over 100ms is slow
  },

  // BLE operation benchmarks
  bleOperations: {
    scan: 500, // under 500ms
    connect: 1000, // under 1s
    read: 100, // under 100ms
    write: 150 // under 150ms
  },

  // Firebase operation benchmarks
  firebaseOperations: {
    read: 200, // under 200ms
    write: 300, // under 300ms
    auth: 500 // under 500ms
  },

  // Memory usage benchmarks
  memory: {
    initial: 50 * 1024 * 1024, // 50MB initial
    growth: 10 * 1024 * 1024, // max 10MB growth per hour
    peak: 200 * 1024 * 1024 // 200MB peak
  }
};

// Custom performance matchers
expect.extend({
  toBeWithinPerformanceBenchmark(received: number, benchmark: number, tolerance = 0.1) {
    const maxAllowed = benchmark * (1 + tolerance);
    const pass = received <= maxAllowed;
    
    return {
      message: () =>
        pass
          ? `expected ${received}ms to exceed performance benchmark of ${benchmark}ms (±${tolerance * 100}%)`
          : `expected ${received}ms to be within performance benchmark of ${benchmark}ms (±${tolerance * 100}%)`,
      pass,
    };
  },

  toHaveAcceptableFPS(received: number) {
    const pass = received >= 30; // At least 30 FPS
    
    return {
      message: () =>
        pass
          ? `expected ${received} FPS to be below acceptable threshold of 30 FPS`
          : `expected ${received} FPS to be at least 30 FPS`,
      pass,
    };
  },

  toHaveReasonableMemoryUsage(received: number, baseline: number, maxGrowthFactor = 2) {
    const maxAllowed = baseline * maxGrowthFactor;
    const pass = received <= maxAllowed;
    
    return {
      message: () =>
        pass
          ? `expected memory usage ${received}MB to exceed ${maxGrowthFactor}x baseline of ${baseline}MB`
          : `expected memory usage ${received}MB to be within ${maxGrowthFactor}x baseline of ${baseline}MB`,
      pass,
    };
  }
});

// Global setup for performance tests
beforeEach(() => {
  jest.clearAllMocks();
  performance.clearMarks();
  performance.clearMeasures();
});

// Performance test timeout (longer for benchmarks)
jest.setTimeout(60000);