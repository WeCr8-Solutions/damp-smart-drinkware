/**
 * 🧪 DAMP Smart Drinkware - Performance Monitor Simple Tests
 * Basic unit tests for Google-level performance monitoring without React Native
 */

// Mock React Native Platform before any imports
jest.mock('react-native', () => ({
  Platform: {
    OS: 'test',
    Version: '1.0.0'
  }
}));

// Mock React
jest.mock('react', () => ({
  default: {
    useState: jest.fn(),
    useEffect: jest.fn(),
    useCallback: jest.fn(),
  }
}));

// Mock crypto-js for performance tests that might use security features
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn((data) => ({ toString: () => `encrypted_${data}` })),
    decrypt: jest.fn((encrypted) => ({ toString: () => encrypted.replace('encrypted_', '') }))
  },
  enc: { Utf8: {} }
}));

import { PerformanceMonitor, BundleAnalyzer } from '@/utils/performance';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 10 * 1024 * 1024, // 10MB
    totalJSHeapSize: 50 * 1024 * 1024, // 50MB
    jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
  }
};

global.performance = mockPerformance as any;
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));

describe('PerformanceMonitor - Basic Functionality', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance();
    mockPerformance.now.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset singleton instance for clean tests
    (PerformanceMonitor as any).instance = null;
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const monitor1 = PerformanceMonitor.getInstance();
      const monitor2 = PerformanceMonitor.getInstance();

      expect(monitor1).toBe(monitor2);
    });

    test('should be defined', () => {
      expect(monitor).toBeDefined();
      expect(typeof monitor.startTiming).toBe('function');
      expect(typeof monitor.endTiming).toBe('function');
    });
  });

  describe('Basic Timing Operations', () => {
    test('should start and end timing correctly', () => {
      const mockStartTime = 1000;
      const mockEndTime = 1500;

      mockPerformance.now
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      monitor.startTiming('test-operation');
      const duration = monitor.endTiming('test-operation');

      expect(duration).toBe(500);
      expect(mockPerformance.now).toHaveBeenCalledTimes(2);
    });

    test('should handle missing timer', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const duration = monitor.endTiming('non-existent-timer');

      expect(duration).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('⚠️  Timer not found for label: non-existent-timer');

      consoleSpy.mockRestore();
    });

    test('should log slow operations', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockStartTime = 1000;
      const mockEndTime = 1200; // 200ms - above 100ms threshold

      mockPerformance.now
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      monitor.startTiming('slow-operation');
      monitor.endTiming('slow-operation');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🐌 Slow operation detected: slow-operation took 200.00ms')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Memory Monitoring', () => {
    test('should have memory monitoring functionality', () => {
      // Test that the method exists
      expect(typeof monitor.captureMemorySnapshot).toBe('function');

      // Test that it runs without errors
      expect(() => {
        monitor.captureMemorySnapshot();
      }).not.toThrow();
    });

    test('should have memory leak detection capability', () => {
      // Test multiple snapshots don't cause errors
      expect(() => {
        for (let i = 0; i < 5; i++) {
          mockPerformance.memory.usedJSHeapSize = 10 * 1024 * 1024 * (1 + i * 0.1);
          monitor.captureMemorySnapshot();
        }
      }).not.toThrow();
    });
  });

  describe('Frame Rate Monitoring', () => {
    test('should monitor frame rate', () => {
      const mockRAF = jest.fn();
      global.requestAnimationFrame = mockRAF;

      monitor.monitorFrameRate();

      expect(mockRAF).toHaveBeenCalled();
    });
  });

  describe('Performance Snapshots', () => {
    test('should return performance snapshot', () => {
      monitor.startTiming('test1');
      monitor.startTiming('test2');

      const snapshot = monitor.getPerformanceSnapshot();

      expect(snapshot).toMatchObject({
        timestamp: expect.any(Number),
        platform: expect.any(String),
        activeTimers: 2,
        memorySnapshots: expect.any(Number),
      });

      // Memory usage might not be available in test environment
      if (snapshot.memoryUsage) {
        expect(typeof snapshot.memoryUsage.used).toBe('number');
      }
    });
  });
});

describe('BundleAnalyzer - Basic', () => {
  test('should log bundle info in development', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    (global as any).__BUNDLE_START_TIME__ = Date.now() - 1000;
    (global as any).__DEV__ = true;

    BundleAnalyzer.logBundleInfo();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('📦 Bundle loaded in')
    );

    consoleSpy.mockRestore();
    delete (global as any).__BUNDLE_START_TIME__;
    delete (global as any).__DEV__;
  });

  test('should measure code splitting', async () => {
    const mockModule = { default: 'test-chunk' };

    // Create a mock dynamic import
    const mockImport = jest.fn().mockResolvedValue(mockModule);
    (global as any).import = mockImport;

    const result = await BundleAnalyzer.measureCodeSplitting('test-chunk');

    expect(result).toBe(mockModule);
  });
});

describe('Performance Integration - Basic', () => {
  test('should work end-to-end', () => {
    const monitor = PerformanceMonitor.getInstance();

    monitor.startTiming('e2e-test');

    // Simulate some work with a mock
    mockPerformance.now.mockReturnValue(Date.now() + 50);

    const duration = monitor.endTiming('e2e-test');

    expect(duration).toBeGreaterThan(0);
  });

  test('should handle concurrent operations', () => {
    const monitor = PerformanceMonitor.getInstance();

    monitor.startTiming('operation-1');
    monitor.startTiming('operation-2');
    monitor.startTiming('operation-3');

    const duration1 = monitor.endTiming('operation-1');
    const duration2 = monitor.endTiming('operation-2');
    const duration3 = monitor.endTiming('operation-3');

    expect(duration1).toBeGreaterThanOrEqual(0);
    expect(duration2).toBeGreaterThanOrEqual(0);
    expect(duration3).toBeGreaterThanOrEqual(0);
  });

  test('should maintain consistency across operations', () => {
    const monitor = PerformanceMonitor.getInstance();

    // Test multiple cycles
    for (let i = 0; i < 5; i++) {
      monitor.startTiming(`test-cycle-${i}`);
      const duration = monitor.endTiming(`test-cycle-${i}`);
      expect(duration).toBeGreaterThanOrEqual(0);
    }

    const snapshot = monitor.getPerformanceSnapshot();
    expect(snapshot.activeTimers).toBe(0); // All should be completed
  });
});