/**
 * 🚀 DAMP Smart Drinkware - Performance Monitoring Utilities
 * Google-level performance monitoring and optimization tools
 */

import React from 'react';
import { Platform } from 'react-native';

// Safe check for development mode
const isDev = (): boolean => {
  try {
    return typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
  } catch {
    return process.env.NODE_ENV !== 'production';
  }
};

/**
 * Singleton performance monitor following Google engineering standards
 * Tracks app performance metrics and reports to analytics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private memorySnapshots: Array<{ timestamp: number; used: number }> = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   * @param label - Unique identifier for the operation
   */
  startTiming(label: string): void {
    if (isDev()) {
      console.log(`⏱️  Starting timer: ${label}`);
    }
    this.metrics.set(label, performance.now());
  }

  /**
   * End timing and optionally log slow operations
   * @param label - The operation label to end timing for
   * @returns Duration in milliseconds
   */
  endTiming(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      console.warn(`⚠️  Timer not found for label: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(label);

    // Log slow operations (Google's 100ms threshold)
    if (duration > 100) {
      console.warn(`🐌 Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);

      // Report to analytics in production
      if (!isDev()) {
        this.reportMetric('performance_slow_operation', {
          operation: label,
          duration_ms: Math.round(duration),
          platform: Platform.OS,
          timestamp: Date.now(),
        });
      }
    }

    if (isDev()) {
      console.log(`✅ ${label} completed in ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure memory usage and detect potential leaks
   */
  captureMemorySnapshot(): void {
    if (Platform.OS === 'web' && (performance as any).memory) {
      const memory = (performance as any).memory;
      const snapshot = {
        timestamp: Date.now(),
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };

      this.memorySnapshots.push(snapshot);

      // Keep only last 50 snapshots
      if (this.memorySnapshots.length > 50) {
        this.memorySnapshots.shift();
      }

      // Check for memory leak patterns (>50% growth)
      if (this.memorySnapshots.length >= 10) {
        const oldSnapshot = this.memorySnapshots[this.memorySnapshots.length - 10];
        const growthRatio = snapshot.used / oldSnapshot.used;

        if (growthRatio > 1.5) {
          console.warn(`🚨 Potential memory leak detected: ${((growthRatio - 1) * 100).toFixed(1)}% growth`);
          this.reportMetric('memory_leak_warning', {
            growth_ratio: growthRatio,
            current_used: snapshot.used,
            previous_used: oldSnapshot.used,
          });
        }
      }

      if (isDev()) {
        console.log(`💾 Memory: ${(snapshot.used / 1024 / 1024).toFixed(1)}MB used`);
      }
    }
  }

  /**
   * Monitor frame rate and detect jank
   */
  monitorFrameRate(): void {
    if (typeof requestAnimationFrame !== 'undefined') {
      let lastFrameTime = performance.now();
      let frameCount = 0;
      let jankyFrames = 0;

      const measureFrame = (currentTime: number) => {
        const frameDuration = currentTime - lastFrameTime;
        frameCount++;

        // 60fps = 16.67ms per frame, jank threshold = 32ms (2 frames)
        if (frameDuration > 32) {
          jankyFrames++;
          if (isDev()) {
            console.warn(`🎭 Jank detected: Frame took ${frameDuration.toFixed(2)}ms`);
          }
        }

        // Report every 60 frames (~1 second at 60fps)
        if (frameCount >= 60) {
          const jankPercentage = (jankyFrames / frameCount) * 100;

          if (jankPercentage > 5) { // >5% janky frames is concerning
            this.reportMetric('frame_rate_jank', {
              jank_percentage: Math.round(jankPercentage * 100) / 100,
              total_frames: frameCount,
              janky_frames: jankyFrames,
            });
          }

          frameCount = 0;
          jankyFrames = 0;
        }

        lastFrameTime = currentTime;
        requestAnimationFrame(measureFrame);
      };

      requestAnimationFrame(measureFrame);
    }
  }

  /**
   * Report performance metrics to analytics
   */
  public reportMetric(eventName: string, parameters: Record<string, any>): void {
    try {
      // In a real app, send to Firebase Analytics, Crashlytics, etc.
      if (isDev()) {
        console.log(`📊 Analytics: ${eventName}`, parameters);
      }

      // Example Firebase Analytics call:
      // firebase.analytics().logEvent(eventName, parameters);
    } catch (error) {
      console.error('Failed to report performance metric:', error);
    }
  }

  /**
   * Get current performance snapshot
   */
  getPerformanceSnapshot(): PerformanceSnapshot {
    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      platform: Platform.OS,
      activeTimers: this.metrics.size,
      memorySnapshots: this.memorySnapshots.length,
    };

    if (Platform.OS === 'web' && (performance as any).memory) {
      const memory = (performance as any).memory;
      snapshot.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }

    return snapshot;
  }
}

/**
 * Performance monitoring decorator for functions
 */
export function performanceMonitor(label?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const monitorLabel = label || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      monitor.startTiming(monitorLabel);

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        monitor.endTiming(monitorLabel);
      }
    };

    return descriptor;
  };
}

/**
 * React Hook for component render performance
 */
export function useRenderPerformance(componentName: string): void {
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    monitor.startTiming(`render_${componentName}`);
    return () => {
      monitor.endTiming(`render_${componentName}`);
    };
  });
}

/**
 * Bundle analysis utilities
 */
export class BundleAnalyzer {
  static logBundleInfo(): void {
    if (isDev() && typeof (global as any).__BUNDLE_START_TIME__ !== 'undefined') {
      const loadTime = Date.now() - (global as any).__BUNDLE_START_TIME__;
      console.log(`📦 Bundle loaded in ${loadTime}ms`);

      PerformanceMonitor.getInstance().reportMetric('bundle_load_time', {
        load_time_ms: loadTime,
        platform: Platform.OS,
      });
    }
  }

  static measureCodeSplitting(chunkName: string): Promise<any> {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTiming(`chunk_load_${chunkName}`);

    // Use a mockable import function for testing
    const importFn = (global as any).import || ((path: string) => import(path));

    return importFn(`../chunks/${chunkName}`).then((module: any) => {
      monitor.endTiming(`chunk_load_${chunkName}`);
      return module;
    }).catch((error: any) => {
      monitor.endTiming(`chunk_load_${chunkName}`);
      throw error;
    });
  }
}

// Types
export interface PerformanceSnapshot {
  timestamp: number;
  platform: string;
  activeTimers: number;
  memorySnapshots: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

// Global performance monitoring setup
if (!isDev() && typeof jest === 'undefined') {
  const monitor = PerformanceMonitor.getInstance();

  // Monitor memory every 30 seconds in production
  setInterval(() => {
    monitor.captureMemorySnapshot();
  }, 30000);

  // Start frame rate monitoring
  monitor.monitorFrameRate();
}

export default PerformanceMonitor;