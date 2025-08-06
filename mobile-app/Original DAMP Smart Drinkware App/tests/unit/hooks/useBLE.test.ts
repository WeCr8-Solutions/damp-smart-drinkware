/**
 * DAMP Smart Drinkware - useBLE Hook Unit Tests
 * Testing BLE hook functionality and state management
 * Copyright 2025 WeCr8 Solutions LLC
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { BleManager, Device, BleError } from 'react-native-ble-plx';
import { useBLE } from '../../../hooks/useBLE';

// Mock the BLE library
jest.mock('react-native-ble-plx');

describe('useBLE Hook', () => {
  let mockBleManager: jest.Mocked<BleManager>;
  let mockDevice: jest.Mocked<Device>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock BLE manager
    mockBleManager = {
      state: jest.fn().mockResolvedValue('PoweredOn'),
      startDeviceScan: jest.fn(),
      stopDeviceScan: jest.fn(),
      connectToDevice: jest.fn(),
      discoverAllServicesAndCharacteristicsForDevice: jest.fn(),
      readCharacteristicForDevice: jest.fn(),
      writeCharacteristicWithResponseForDevice: jest.fn(),
      monitorCharacteristicForDevice: jest.fn(),
      cancelDeviceConnection: jest.fn(),
      destroy: jest.fn(),
      onStateChange: jest.fn(() => ({ remove: jest.fn() })),
    } as any;

    // Setup mock device
    mockDevice = {
      id: 'test-device-123',
      name: 'DAMP Test Device',
      rssi: -45,
      isConnectable: true,
      isConnected: jest.fn().mockResolvedValue(false),
    } as any;

    (BleManager as jest.Mock).mockImplementation(() => mockBleManager);
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useBLE());

      expect(result.current.isScanning).toBe(false);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectedDevice).toBeNull();
      expect(result.current.discoveredDevices).toEqual([]);
      expect(result.current.bluetoothState).toBe('Unknown');
      expect(result.current.error).toBeNull();
    });

    it('should check bluetooth state on initialization', async () => {
      renderHook(() => useBLE());

      await waitFor(() => {
        expect(mockBleManager.state).toHaveBeenCalled();
      });
    });

    it('should setup state change listener', () => {
      renderHook(() => useBLE());

      expect(mockBleManager.onStateChange).toHaveBeenCalled();
    });

    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useBLE());
      
      unmount();

      expect(mockBleManager.destroy).toHaveBeenCalled();
    });
  });

  describe('Device Scanning', () => {
    it('should start scanning with correct parameters', async () => {
      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.startScan();
      });

      expect(result.current.isScanning).toBe(true);
      expect(mockBleManager.startDeviceScan).toHaveBeenCalledWith(
        ['12345678-1234-1234-1234-123456789abc'], // DAMP service UUID
        { allowDuplicates: false },
        expect.any(Function)
      );
    });

    it('should discover devices during scan', async () => {
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.startScan();
      });

      // Simulate device discovery
      act(() => {
        scanCallback(null, mockDevice);
      });

      await waitFor(() => {
        expect(result.current.discoveredDevices).toHaveLength(1);
        expect(result.current.discoveredDevices[0]).toEqual(mockDevice);
      });
    });

    it('should filter duplicate devices', async () => {
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.startScan();
      });

      // Simulate discovering the same device twice
      act(() => {
        scanCallback(null, mockDevice);
        scanCallback(null, mockDevice);
      });

      await waitFor(() => {
        expect(result.current.discoveredDevices).toHaveLength(1);
      });
    });

    it('should update device RSSI when discovered again', async () => {
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.startScan();
      });

      // First discovery
      act(() => {
        scanCallback(null, mockDevice);
      });

      // Second discovery with different RSSI
      const updatedDevice = { ...mockDevice, rssi: -30 };
      act(() => {
        scanCallback(null, updatedDevice);
      });

      await waitFor(() => {
        expect(result.current.discoveredDevices[0].rssi).toBe(-30);
      });
    });

    it('should stop scanning correctly', async () => {
      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.startScan();
      });

      expect(result.current.isScanning).toBe(true);

      act(() => {
        result.current.stopScan();
      });

      expect(result.current.isScanning).toBe(false);
      expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
    });

    it('should handle scan errors', async () => {
      const scanError = new BleError('Bluetooth not available', 100);
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.startScan();
      });

      // Simulate scan error
      act(() => {
        scanCallback(scanError, null);
      });

      await waitFor(() => {
        expect(result.current.error).toBe(scanError.message);
        expect(result.current.isScanning).toBe(false);
      });
    });

    it('should auto-stop scan after timeout', async () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.startScan(5000); // 5 second timeout
      });

      expect(result.current.isScanning).toBe(true);

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.isScanning).toBe(false);
        expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('Device Connection', () => {
    beforeEach(() => {
      mockBleManager.connectToDevice.mockResolvedValue(mockDevice);
      mockBleManager.discoverAllServicesAndCharacteristicsForDevice.mockResolvedValue(mockDevice);
      mockDevice.isConnected.mockResolvedValue(true);
    });

    it('should connect to device successfully', async () => {
      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.connectedDevice).toEqual(mockDevice);
      expect(mockBleManager.connectToDevice).toHaveBeenCalledWith(mockDevice.id);
    });

    it('should discover services after connection', async () => {
      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      expect(mockBleManager.discoverAllServicesAndCharacteristicsForDevice).toHaveBeenCalledWith(mockDevice.id);
    });

    it('should handle connection timeout', async () => {
      jest.useFakeTimers();
      
      // Mock connection to never resolve
      mockBleManager.connectToDevice.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useBLE());

      const connectionPromise = act(async () => {
        await result.current.connectToDevice(mockDevice.id, 3000); // 3 second timeout
      });

      // Fast-forward time to trigger timeout
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(result.current.error).toMatch(/connection timeout/i);
        expect(result.current.isConnected).toBe(false);
      });

      jest.useRealTimers();
    });

    it('should handle connection errors', async () => {
      const connectionError = new BleError('Device not found', 200);
      mockBleManager.connectToDevice.mockRejectedValue(connectionError);

      const { result } = renderHook(() => useBLE());

      await act(async () => {
        try {
          await result.current.connectToDevice(mockDevice.id);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(connectionError.message);
      expect(result.current.isConnected).toBe(false);
    });

    it('should disconnect device correctly', async () => {
      const { result } = renderHook(() => useBLE());

      // First connect
      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      expect(result.current.isConnected).toBe(true);

      // Then disconnect
      await act(async () => {
        await result.current.disconnectDevice();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectedDevice).toBeNull();
      expect(mockBleManager.cancelDeviceConnection).toHaveBeenCalledWith(mockDevice.id);
    });

    it('should handle disconnect errors gracefully', async () => {
      const disconnectError = new BleError('Device already disconnected', 300);
      mockBleManager.cancelDeviceConnection.mockRejectedValue(disconnectError);

      const { result } = renderHook(() => useBLE());

      // First connect
      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      // Then try to disconnect
      await act(async () => {
        await result.current.disconnectDevice();
      });

      // Should still update state even if disconnect fails
      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectedDevice).toBeNull();
    });
  });

  describe('Data Communication', () => {
    const serviceUUID = '12345678-1234-1234-1234-123456789abc';
    const characteristicUUID = '87654321-4321-4321-4321-cba987654321';

    beforeEach(async () => {
      mockBleManager.connectToDevice.mockResolvedValue(mockDevice);
      mockBleManager.discoverAllServicesAndCharacteristicsForDevice.mockResolvedValue(mockDevice);
      mockDevice.isConnected.mockResolvedValue(true);
    });

    it('should read characteristic data', async () => {
      const mockData = { value: Buffer.from('test-sensor-data').toString('base64') };
      mockBleManager.readCharacteristicForDevice.mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useBLE());

      // Connect first
      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      // Read data
      let readData;
      await act(async () => {
        readData = await result.current.readCharacteristic(serviceUUID, characteristicUUID);
      });

      expect(mockBleManager.readCharacteristicForDevice).toHaveBeenCalledWith(
        mockDevice.id,
        serviceUUID,
        characteristicUUID
      );
      expect(readData).toBe('test-sensor-data');
    });

    it('should write characteristic data', async () => {
      mockBleManager.writeCharacteristicWithResponseForDevice.mockResolvedValue(mockDevice as any);

      const { result } = renderHook(() => useBLE());

      // Connect first
      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      // Write data
      const testData = 'test-command';
      await act(async () => {
        await result.current.writeCharacteristic(serviceUUID, characteristicUUID, testData);
      });

      expect(mockBleManager.writeCharacteristicWithResponseForDevice).toHaveBeenCalledWith(
        mockDevice.id,
        serviceUUID,
        characteristicUUID,
        Buffer.from(testData).toString('base64')
      );
    });

    it('should monitor characteristic changes', async () => {
      let monitorCallback: Function;
      const mockSubscription = { remove: jest.fn() };
      
      mockBleManager.monitorCharacteristicForDevice.mockImplementation((deviceId, serviceUUID, characteristicUUID, callback) => {
        monitorCallback = callback;
        return mockSubscription;
      });

      const onDataReceived = jest.fn();
      const { result } = renderHook(() => useBLE());

      // Connect first
      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      // Start monitoring
      await act(async () => {
        result.current.monitorCharacteristic(serviceUUID, characteristicUUID, onDataReceived);
      });

      // Simulate data change
      const mockCharacteristic = { value: Buffer.from('new-sensor-data').toString('base64') };
      act(() => {
        monitorCallback(null, mockCharacteristic);
      });

      expect(onDataReceived).toHaveBeenCalledWith('new-sensor-data');
    });

    it('should handle read errors', async () => {
      const readError = new BleError('Characteristic not found', 400);
      mockBleManager.readCharacteristicForDevice.mockRejectedValue(readError);

      const { result } = renderHook(() => useBLE());

      // Connect first
      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      // Attempt read
      await act(async () => {
        try {
          await result.current.readCharacteristic(serviceUUID, characteristicUUID);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(readError.message);
    });

    it('should handle write errors', async () => {
      const writeError = new BleError('Write failed', 500);
      mockBleManager.writeCharacteristicWithResponseForDevice.mockRejectedValue(writeError);

      const { result } = renderHook(() => useBLE());

      // Connect first
      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      // Attempt write
      await act(async () => {
        try {
          await result.current.writeCharacteristic(serviceUUID, characteristicUUID, 'test-data');
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(writeError.message);
    });

    it('should require connection for data operations', async () => {
      const { result } = renderHook(() => useBLE());

      // Attempt read without connection
      await act(async () => {
        try {
          await result.current.readCharacteristic(serviceUUID, characteristicUUID);
        } catch (error) {
          expect(error.message).toMatch(/not connected/i);
        }
      });

      // Attempt write without connection
      await act(async () => {
        try {
          await result.current.writeCharacteristic(serviceUUID, characteristicUUID, 'test');
        } catch (error) {
          expect(error.message).toMatch(/not connected/i);
        }
      });
    });
  });

  describe('State Management', () => {
    it('should clear error when starting new operation', async () => {
      const { result } = renderHook(() => useBLE());

      // Set an error
      act(() => {
        result.current.clearError();
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
    });

    it('should handle bluetooth state changes', () => {
      let stateChangeCallback: Function;
      mockBleManager.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return { remove: jest.fn() };
      });

      const { result } = renderHook(() => useBLE());

      // Simulate state change
      act(() => {
        stateChangeCallback('PoweredOff');
      });

      expect(result.current.bluetoothState).toBe('PoweredOff');
    });

    it('should disconnect when bluetooth is turned off', async () => {
      let stateChangeCallback: Function;
      mockBleManager.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return { remove: jest.fn() };
      });

      const { result } = renderHook(() => useBLE());

      // Connect to a device first
      await act(async () => {
        await result.current.connectToDevice(mockDevice.id);
      });

      expect(result.current.isConnected).toBe(true);

      // Turn bluetooth off
      act(() => {
        stateChangeCallback('PoweredOff');
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectedDevice).toBeNull();
    });

    it('should clear discovered devices when starting new scan', async () => {
      const { result } = renderHook(() => useBLE());

      // Add some discovered devices
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      await act(async () => {
        await result.current.startScan();
      });

      act(() => {
        scanCallback(null, mockDevice);
      });

      expect(result.current.discoveredDevices).toHaveLength(1);

      // Start new scan
      await act(async () => {
        await result.current.startScan();
      });

      // Previous devices should be cleared
      expect(result.current.discoveredDevices).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should debounce rapid scan requests', async () => {
      const { result } = renderHook(() => useBLE());

      // Make multiple rapid scan requests
      await act(async () => {
        result.current.startScan();
        result.current.startScan();
        result.current.startScan();
      });

      // Should only call startDeviceScan once
      expect(mockBleManager.startDeviceScan).toHaveBeenCalledTimes(1);
    });

    it('should handle large number of discovered devices efficiently', async () => {
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      const { result } = renderHook(() => useBLE());

      await act(async () => {
        await result.current.startScan();
      });

      // Simulate discovering many devices
      const startTime = performance.now();
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          const device = { ...mockDevice, id: `device-${i}`, name: `Device ${i}` };
          scanCallback(null, device);
        }
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should handle 100 devices quickly
      expect(processingTime).toBeLessThan(100); // Less than 100ms
      expect(result.current.discoveredDevices).toHaveLength(100);
    });
  });
});