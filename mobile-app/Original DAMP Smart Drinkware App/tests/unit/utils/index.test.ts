/**
 * 🧪 DAMP Smart Drinkware - Utils Index Tests
 * Tests for circular connectivity and utility registry system
 */

// Mock React Native before any imports
jest.mock('react-native', () => ({
  Platform: { OS: 'test', Version: '1.0.0' }
}));

// Mock React
jest.mock('react', () => ({
  default: {
    useState: jest.fn(() => ['low', jest.fn()]),
    useEffect: jest.fn(),
    useCallback: jest.fn(),
  },
  useState: jest.fn(() => ['low', jest.fn()]),
  useEffect: jest.fn(),
  useCallback: jest.fn(),
}));

// Mock crypto-js
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn((data) => ({ toString: () => `encrypted_${data}` })),
    decrypt: jest.fn((encrypted) => ({ toString: () => encrypted.replace('encrypted_', '') }))
  },
  enc: { Utf8: {} }
}));

import {
  PerformanceMonitor,
  performanceMonitor,
  useRenderPerformance,
  BundleAnalyzer,
  SecurityUtils,
  useSecurityMonitoring,
  utilityRegistry,
  utilityConnections,
  utilityPerformanceTracker,
  utilityMetadata,
  validateUtilityConnectivity
} from '@/utils/index';

describe('Utils Index - Circular Connectivity System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Utility Exports', () => {
    test('should export all performance utilities', () => {
      expect(PerformanceMonitor).toBeDefined();
      expect(typeof PerformanceMonitor).toBe('function'); // Class constructor
      expect(performanceMonitor).toBeDefined();
      expect(typeof performanceMonitor).toBe('function');
      expect(useRenderPerformance).toBeDefined();
      expect(typeof useRenderPerformance).toBe('function');
      expect(BundleAnalyzer).toBeDefined();
      expect(typeof BundleAnalyzer).toBe('function'); // Class constructor
    });

    test('should export all security utilities', () => {
      expect(SecurityUtils).toBeDefined();
      expect(typeof SecurityUtils).toBe('function'); // Class constructor
      expect(useSecurityMonitoring).toBeDefined();
      expect(typeof useSecurityMonitoring).toBe('function');
    });

    test('should export utility management functions', () => {
      expect(utilityRegistry).toBeDefined();
      expect(typeof utilityRegistry).toBe('object');
      expect(utilityConnections).toBeDefined();
      expect(typeof utilityConnections).toBe('object');
      expect(utilityPerformanceTracker).toBeDefined();
      expect(typeof utilityPerformanceTracker).toBe('object');
      expect(utilityMetadata).toBeDefined();
      expect(typeof utilityMetadata).toBe('object');
      expect(validateUtilityConnectivity).toBeDefined();
      expect(typeof validateUtilityConnectivity).toBe('function');
    });
  });

  describe('Utility Registry Structure', () => {
    test('should have correct performance utilities in registry', () => {
      expect(utilityRegistry.performance).toBeDefined();
      expect(utilityRegistry.performance.PerformanceMonitor).toBeDefined();
      expect(utilityRegistry.performance.performanceMonitor).toBeDefined();
      expect(utilityRegistry.performance.useRenderPerformance).toBeDefined();
      expect(utilityRegistry.performance.BundleAnalyzer).toBeDefined();
    });

    test('should have correct security utilities in registry', () => {
      expect(utilityRegistry.security).toBeDefined();
      expect(utilityRegistry.security.SecurityUtils).toBeDefined();
      expect(utilityRegistry.security.useSecurityMonitoring).toBeDefined();
    });

    test('should maintain consistent references', () => {
      expect(utilityRegistry.performance.PerformanceMonitor).toBe(PerformanceMonitor);
      expect(utilityRegistry.performance.performanceMonitor).toBe(performanceMonitor);
      expect(utilityRegistry.security.SecurityUtils).toBe(SecurityUtils);
    });
  });

  describe('Utility Connections', () => {
    test('should define dependency structure', () => {
      expect(utilityConnections.dependencies).toBeDefined();
      expect(utilityConnections.dependencies.performance).toEqual(['react', 'react-native']);
      expect(utilityConnections.dependencies.security).toEqual(['react', 'react-native', 'crypto-js']);
    });

    test('should define consumer structure', () => {
      expect(utilityConnections.consumers).toBeDefined();
      expect(utilityConnections.consumers.performance).toBeDefined();
      expect(utilityConnections.consumers.security).toBeDefined();
    });

    test('should define cross-references', () => {
      expect(utilityConnections.crossReferences).toBeDefined();
      expect(utilityConnections.crossReferences.performance).toEqual(['security']);
      expect(utilityConnections.crossReferences.security).toEqual([]);
    });
  });

  describe('Utility Performance Tracker', () => {
    test('should have tracking functionality', () => {
      expect(utilityPerformanceTracker.metrics).toBeDefined();
      expect(utilityPerformanceTracker.track).toBeDefined();
      expect(typeof utilityPerformanceTracker.track).toBe('function');
      expect(utilityPerformanceTracker.getMetrics).toBeDefined();
      expect(typeof utilityPerformanceTracker.getMetrics).toBe('function');
      expect(utilityPerformanceTracker.reset).toBeDefined();
      expect(typeof utilityPerformanceTracker.reset).toBe('function');
    });

    test('should track utility performance', () => {
      const testFunction = jest.fn(() => 'test result');
      const result = utilityPerformanceTracker.track('test-function', testFunction);
      
      expect(result).toBe('test result');
      expect(testFunction).toHaveBeenCalled();
      
      const metrics = utilityPerformanceTracker.getMetrics();
      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
    });

    test('should handle errors in tracked functions', () => {
      const errorFunction = jest.fn(() => {
        throw new Error('Test error');
      });
      
      expect(() => {
        utilityPerformanceTracker.track('error-function', errorFunction);
      }).toThrow('Test error');
      
      const metrics = utilityPerformanceTracker.getMetrics();
      expect(metrics.some(m => m.functionName === 'error-function')).toBe(true);
    });
  });

  describe('Utility Connectivity Validation', () => {
    test('should validate utility connectivity', () => {
      const validation = validateUtilityConnectivity();
      
      expect(validation).toBeDefined();
      expect(validation.availableUtils).toBeDefined();
      expect(Array.isArray(validation.availableUtils)).toBe(true);
      expect(validation.utilityDependencies).toBeDefined();
      expect(validation.circularReferences).toBeDefined();
      expect(Array.isArray(validation.circularReferences)).toBe(true);
      expect(validation.functionCoverage).toBeDefined();
      expect(typeof validation.functionCoverage).toBe('number');
    });

    test('should report available utilities', () => {
      const validation = validateUtilityConnectivity();
      
      expect(validation.availableUtils).toContain('performance');
      expect(validation.availableUtils).toContain('security');
    });

    test('should calculate function coverage', () => {
      const validation = validateUtilityConnectivity();
      
      expect(validation.functionCoverage).toBeGreaterThanOrEqual(0);
      expect(validation.functionCoverage).toBeLessThanOrEqual(100);
    });
  });

  describe('Utility Metadata', () => {
    test('should provide utility metadata', () => {
      expect(utilityMetadata.totalUtilities).toBeDefined();
      expect(typeof utilityMetadata.totalUtilities).toBe('number');
      expect(utilityMetadata.lastUpdated).toBeDefined();
      expect(typeof utilityMetadata.lastUpdated).toBe('string');
      expect(utilityMetadata.dependencies).toBeDefined();
      expect(utilityMetadata.performanceMetrics).toBeDefined();
    });

    test('should have correct utility count', () => {
      expect(utilityMetadata.totalUtilities).toBe(2); // performance + security
    });

    test('should have valid timestamp', () => {
      const timestamp = new Date(utilityMetadata.lastUpdated);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  describe('Circular System Integration', () => {
    test('should create PerformanceMonitor instance', () => {
      const monitor = PerformanceMonitor.getInstance();
      
      expect(monitor).toBeDefined();
      expect(typeof monitor.startTiming).toBe('function');
      expect(typeof monitor.endTiming).toBe('function');
      expect(typeof monitor.captureMemorySnapshot).toBe('function');
    });

    test('should create SecurityUtils methods', () => {
      expect(typeof SecurityUtils.sanitizeInput).toBe('function');
      expect(typeof SecurityUtils.validateEmail).toBe('function');
      expect(typeof SecurityUtils.generateSecureRandom).toBe('function');
    });

    test('should work with performance decorator', () => {
      expect(typeof performanceMonitor).toBe('function');
      
      // Test that it's callable (decorator function)
      const result = performanceMonitor('test-label');
      expect(result).toBeDefined();
    });

    test('should work with security monitoring hook', () => {
      expect(typeof useSecurityMonitoring).toBe('function');
      
      // The hook should be callable
      expect(() => useSecurityMonitoring()).not.toThrow();
    });
  });

  describe('No Dead Ends Verification', () => {
    test('should have no isolated utilities', () => {
      const availableUtils = Object.keys(utilityRegistry);
      const referencedUtils = new Set([
        ...Object.keys(utilityConnections.dependencies),
        ...Object.keys(utilityConnections.consumers),
        ...Object.keys(utilityConnections.crossReferences),
      ]);
      
      availableUtils.forEach(util => {
        expect(referencedUtils.has(util)).toBe(true);
      });
    });

    test('should have all utilities accessible through index', () => {
      // Performance utilities
      expect(() => PerformanceMonitor.getInstance()).not.toThrow();
      expect(() => BundleAnalyzer.logBundleInfo()).not.toThrow();
      
      // Security utilities
      expect(() => SecurityUtils.sanitizeInput('test')).not.toThrow();
      expect(() => SecurityUtils.generateSecureRandom(16)).not.toThrow();
    });
  });
});