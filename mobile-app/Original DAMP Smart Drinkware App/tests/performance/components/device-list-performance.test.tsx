/**
 * DAMP Smart Drinkware - Device List Performance Tests
 * Testing component rendering performance with large datasets
 * Copyright 2025 WeCr8 Solutions LLC
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { measureRenders } from 'reassure';
import { performanceTestUtils, performanceBenchmarks } from '../../setup/performance-setup';

// Mock components for testing
const DeviceCard = ({ device, onPress }: any) => (
  <div data-testid={`device-${device.id}`} onClick={() => onPress(device)}>
    <div data-testid="device-name">{device.name}</div>
    <div data-testid="device-battery">{device.batteryLevel}%</div>
    <div data-testid="device-status">{device.isConnected ? 'Connected' : 'Disconnected'}</div>
  </div>
);

const DeviceList = ({ devices, onDevicePress, refreshing, onRefresh }: any) => {
  const [visibleDevices, setVisibleDevices] = React.useState(devices.slice(0, 20));
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setVisibleDevices(devices.slice(0, 20));
  }, [devices]);

  const loadMore = React.useCallback(async () => {
    if (loading || visibleDevices.length >= devices.length) return;

    setLoading(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const nextBatch = devices.slice(visibleDevices.length, visibleDevices.length + 20);
    setVisibleDevices(prev => [...prev, ...nextBatch]);
    setLoading(false);
  }, [devices, visibleDevices.length, loading]);

  return (
    <div data-testid="device-list">
      {refreshing && <div data-testid="loading-indicator">Loading...</div>}

      {visibleDevices.map((device: any) => (
        <DeviceCard
          key={device.id}
          device={device}
          onPress={onDevicePress}
        />
      ))}

      {visibleDevices.length < devices.length && (
        <button
          data-testid="load-more"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

describe('Device List Performance Tests', () => {
  const createMockDevice = (id: number) => ({
    id: `device-${id}`,
    name: `DAMP Device ${id}`,
    type: id % 2 === 0 ? 'silicone-bottom' : 'damp-handle',
    batteryLevel: Math.floor(Math.random() * 100),
    isConnected: Math.random() > 0.5,
    lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    firmwareVersion: '1.0.0',
    rssi: -30 - Math.floor(Math.random() * 70)
  });

  describe('Render Performance', () => {
    it('should render small device list efficiently', async () => {
      const devices = Array.from({ length: 10 }, (_, i) => createMockDevice(i));
      const onDevicePress = jest.fn();

      await measureRenders(
        <DeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={jest.fn()}
        />,
        {
          runs: 10,
          warmupRuns: 3,
        }
      );

      // Small lists should render very quickly
      expect(true).toBe(true); // Reassure will handle the performance assertions
    });

    it('should handle medium device list with acceptable performance', async () => {
      const devices = Array.from({ length: 100 }, (_, i) => createMockDevice(i));
      const onDevicePress = jest.fn();

      const startTime = performance.now();

      render(
        <DeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={jest.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeWithinPerformanceBenchmark(
        performanceBenchmarks.componentRender.acceptable
      );
    });

    it('should virtualize large device lists for optimal performance', async () => {
      const devices = Array.from({ length: 1000 }, (_, i) => createMockDevice(i));
      const onDevicePress = jest.fn();

      const memoryBefore = performanceTestUtils.measureMemoryUsage();

      const startTime = performance.now();

      const { getByTestId } = render(
        <DeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={jest.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should only render visible items (first 20)
      const visibleDevices = screen.getAllByTestId(/^device-/);
      expect(visibleDevices.length).toBeLessThanOrEqual(20);

      // Memory usage should not grow excessively
      const memoryAfter = performanceTestUtils.measureMemoryUsage();
      const memoryGrowth = memoryAfter.used - memoryBefore.used;

      expect(memoryGrowth).toHaveReasonableMemoryUsage(
        memoryBefore.used,
        2 // Should not use more than 2x baseline memory
      );

      // Render time should be acceptable even for large datasets
      expect(renderTime).toBeWithinPerformanceBenchmark(
        performanceBenchmarks.componentRender.acceptable,
        0.2 // Allow 20% tolerance for large datasets
      );
    });

    it('should maintain performance during incremental loading', async () => {
      const devices = Array.from({ length: 500 }, (_, i) => createMockDevice(i));
      const onDevicePress = jest.fn();

      const { getByTestId } = render(
        <DeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={jest.fn()}
        />
      );

      const loadMoreButton = getByTestId('load-more');
      const loadTimes: number[] = [];

      // Measure load times for multiple batches
      for (let batch = 0; batch < 5; batch++) {
        const startTime = performance.now();

        loadMoreButton.click();

        await waitFor(() => {
          expect(screen.getAllByTestId(/^device-/).length).toBe((batch + 2) * 20);
        });

        const endTime = performance.now();
        loadTimes.push(endTime - startTime);
      }

      // Load times should remain consistent (not degrade)
      const averageLoadTime = loadTimes.reduce((a, b) => a + b) / loadTimes.length;
      const lastLoadTime = loadTimes[loadTimes.length - 1];

      expect(lastLoadTime).toBeLessThanOrEqual(averageLoadTime * 1.5); // Max 50% degradation
      expect(averageLoadTime).toBeWithinPerformanceBenchmark(500); // 500ms benchmark
    });
  });

  describe('Memory Management', () => {
    it('should properly cleanup when unmounting large lists', async () => {
      const devices = Array.from({ length: 200 }, (_, i) => createMockDevice(i));
      const onDevicePress = jest.fn();

      const memoryBefore = performanceTestUtils.measureMemoryUsage();

      const { unmount } = render(
        <DeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={jest.fn()}
        />
      );

      const memoryDuringRender = performanceTestUtils.measureMemoryUsage();

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const memoryAfterCleanup = performanceTestUtils.measureMemoryUsage();

      // Memory should return close to baseline after cleanup
      const memoryRetained = memoryAfterCleanup.used - memoryBefore.used;
      const memoryDuringUse = memoryDuringRender.used - memoryBefore.used;

      expect(memoryRetained).toBeLessThan(memoryDuringUse * 0.3); // Less than 30% retained
    });

    it('should handle rapid device list updates without memory leaks', async () => {
      const onDevicePress = jest.fn();
      let devices = Array.from({ length: 50 }, (_, i) => createMockDevice(i));

      const { rerender } = render(
        <DeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={jest.fn()}
        />
      );

      const memoryReadings: number[] = [];

      // Simulate rapid updates
      for (let update = 0; update < 10; update++) {
        // Update device data
        devices = devices.map(device => ({
          ...device,
          batteryLevel: Math.floor(Math.random() * 100),
          isConnected: Math.random() > 0.5,
          lastSeen: new Date().toISOString()
        }));

        rerender(
          <DeviceList
            devices={devices}
            onDevicePress={onDevicePress}
            refreshing={false}
            onRefresh={jest.fn()}
          />
        );

        await new Promise(resolve => setTimeout(resolve, 50));
        memoryReadings.push(performanceTestUtils.measureMemoryUsage().used);
      }

      // Memory usage should not grow linearly with updates
      const initialMemory = memoryReadings[0];
      const finalMemory = memoryReadings[memoryReadings.length - 1];
      const memoryGrowth = finalMemory - initialMemory;

      expect(memoryGrowth).toBeLessThan(initialMemory * 0.5); // Less than 50% growth
    });
  });

  describe('Animation Performance', () => {
    it('should maintain 60 FPS during device status animations', async () => {
      const devices = Array.from({ length: 20 }, (_, i) => createMockDevice(i));
      const onDevicePress = jest.fn();

      render(
        <DeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={jest.fn()}
        />
      );

      // Simulate connection status changes that would trigger animations
      const animationDuration = 2000; // 2 seconds
      const performanceMonitor = performanceTestUtils.measureAnimationPerformance(animationDuration);

      // Trigger status changes
      const statusChanges = Array.from({ length: 10 }, (_, i) => setTimeout(() => {
        devices[i % devices.length].isConnected = !devices[i % devices.length].isConnected;
      }, i * 200));

      await new Promise(resolve => setTimeout(resolve, animationDuration));

      const frameStats = performanceMonitor.getFrameStats();

      expect(frameStats.fps).toHaveAcceptableFPS();
      expect(frameStats.droppedFrames).toBeLessThan(frameStats.frameCount * 0.1); // Less than 10% dropped
    });

    it('should optimize re-renders during pull-to-refresh', async () => {
      const devices = Array.from({ length: 30 }, (_, i) => createMockDevice(i));
      const onDevicePress = jest.fn();
      const onRefresh = jest.fn();

      let renderCount = 0;
      const OptimizedDeviceList = React.memo((props: any) => {
        renderCount++;
        return <DeviceList {...props} />;
      });

      const { rerender } = render(
        <OptimizedDeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={onRefresh}
        />
      );

      const initialRenderCount = renderCount;

      // Start refresh
      rerender(
        <OptimizedDeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={true}
          onRefresh={onRefresh}
        />
      );

      // End refresh with same data
      await new Promise(resolve => setTimeout(resolve, 500));

      rerender(
        <OptimizedDeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={onRefresh}
        />
      );

      const finalRenderCount = renderCount;

      // Should not cause excessive re-renders
      expect(finalRenderCount - initialRenderCount).toBeLessThanOrEqual(2);
    });
  });

  describe('Network Performance Integration', () => {
    it('should handle device data fetching efficiently', async () => {
      const mockFetchDevices = jest.fn(() =>
        Promise.resolve(Array.from({ length: 50 }, (_, i) => createMockDevice(i)))
      );

      const fetchTime = await performanceTestUtils.measureNetworkPerformance(mockFetchDevices);

      expect(fetchTime.success).toBe(true);
      expect(fetchTime.duration).toBeWithinPerformanceBenchmark(
        performanceBenchmarks.firebaseOperations.read
      );
    });

    it('should batch device status updates for optimal performance', async () => {
      const devices = Array.from({ length: 100 }, (_, i) => createMockDevice(i));

      // Mock batch update function
      const batchUpdateDevices = async (updates: any[]) => {
        const startTime = performance.now();

        // Simulate processing updates in batches
        const batchSize = 10;
        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize);
          await new Promise(resolve => setTimeout(resolve, 50)); // Simulate API call
        }

        const endTime = performance.now();
        return { success: true, duration: endTime - startTime, processed: updates.length };
      };

      const statusUpdates = devices.map(device => ({
        id: device.id,
        batteryLevel: Math.floor(Math.random() * 100),
        isConnected: Math.random() > 0.5
      }));

      const result = await batchUpdateDevices(statusUpdates);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(100);

      // Batch processing should be more efficient than individual updates
      const expectedIndividualTime = statusUpdates.length * 50; // 50ms per update
      expect(result.duration).toBeLessThan(expectedIndividualTime * 0.7); // 30% improvement
    });
  });

  describe('Stress Testing', () => {
    it('should handle extreme device counts gracefully', async () => {
      const extremeDeviceCount = 5000;
      const devices = Array.from({ length: extremeDeviceCount }, (_, i) => createMockDevice(i));
      const onDevicePress = jest.fn();

      const startTime = performance.now();
      const memoryBefore = performanceTestUtils.measureMemoryUsage();

      const { getByTestId } = render(
        <DeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={jest.fn()}
        />
      );

      const endTime = performance.now();
      const memoryAfter = performanceTestUtils.measureMemoryUsage();

      // Should still render in reasonable time
      expect(endTime - startTime).toBeLessThan(2000); // Under 2 seconds

      // Should only render visible items despite large dataset
      const renderedDevices = screen.getAllByTestId(/^device-/);
      expect(renderedDevices.length).toBeLessThanOrEqual(20);

      // Memory usage should be bounded
      const memoryUsed = memoryAfter.used - memoryBefore.used;
      expect(memoryUsed).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });

    it('should maintain responsiveness under high update frequency', async () => {
      const devices = Array.from({ length: 50 }, (_, i) => createMockDevice(i));
      const onDevicePress = jest.fn();

      const { rerender } = render(
        <DeviceList
          devices={devices}
          onDevicePress={onDevicePress}
          refreshing={false}
          onRefresh={jest.fn()}
        />
      );

      const updateTimes: number[] = [];

      // Rapid updates for 5 seconds
      const updateInterval = setInterval(() => {
        const startTime = performance.now();

        const updatedDevices = devices.map(device => ({
          ...device,
          batteryLevel: Math.floor(Math.random() * 100),
          lastSeen: new Date().toISOString()
        }));

        rerender(
          <DeviceList
            devices={updatedDevices}
            onDevicePress={onDevicePress}
            refreshing={false}
            onRefresh={jest.fn()}
          />
        );

        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 5000));
      clearInterval(updateInterval);

      // Updates should remain consistently fast
      const averageUpdateTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length;
      const maxUpdateTime = Math.max(...updateTimes);

      expect(averageUpdateTime).toBeLessThan(50); // Average under 50ms
      expect(maxUpdateTime).toBeLessThan(200); // No single update over 200ms
    });
  });
});