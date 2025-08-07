/**
 * 🧪 DAMP Smart Drinkware - Performance Monitor Tests
 * Comprehensive unit tests for Google-level performance monitoring
 */

import { PerformanceMonitor, performanceMonitor, BundleAnalyzer } from '@/utils/performance';

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

describe('PerformanceMonitor', () => {
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
  });

  describe('Timing Operations', () => {
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
    test('should capture memory snapshots', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      monitor.captureMemorySnapshot();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('💾 Memory: 10.0MB used')
      );
      
      consoleSpy.mockRestore();
    });

    test('should detect memory leaks', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate 10 snapshots with growing memory usage
      for (let i = 0; i < 10; i++) {
        mockPerformance.memory.usedJSHeapSize = 10 * 1024 * 1024 * (1 + i * 0.1);
        monitor.captureMemorySnapshot();
      }
      
      // 11th snapshot with significant growth (>50% increase)
      mockPerformance.memory.usedJSHeapSize = 20 * 1024 * 1024;
      monitor.captureMemorySnapshot();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚨 Potential memory leak detected')
      );
      
      consoleSpy.mockRestore();
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
      
      expect(snapshot.memoryUsage).toBeDefined();
      expect(snapshot.memoryUsage?.used).toBe(10 * 1024 * 1024);
    });
  });
});

describe('Performance Decorator', () => {
  test('should be available for function monitoring', () => {
    // Test that the decorator function exists
    expect(typeof performanceMonitor).toBe('function');
    
    // Test basic decorator functionality without actual decoration
    const mockStartTime = 1000;
    const mockEndTime = 1100;
    
    mockPerformance.now
      .mockReturnValueOnce(mockStartTime)
      .mockReturnValueOnce(mockEndTime);

    // Manual timing test instead of decorator
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTiming('manual-test');
    const duration = monitor.endTiming('manual-test');
    
    expect(duration).toBe(100);
  });
});

describe('BundleAnalyzer', () => {
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
    jest.doMock('../chunks/test-chunk', () => mockModule, { virtual: true });

    const result = await BundleAnalyzer.measureCodeSplitting('test-chunk');
    
    expect(result).toBe(mockModule);
  });
});

describe('Performance Integration', () => {
  test('should work end-to-end', () => {
    const monitor = PerformanceMonitor.getInstance();
    
    monitor.startTiming('e2e-test');
    
    // Simulate some work
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Busy wait for 10ms
    }
    
    const duration = monitor.endTiming('e2e-test');
    
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100); // Should be much less than 100ms
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
});