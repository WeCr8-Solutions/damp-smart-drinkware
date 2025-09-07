/**
 * 📡 DAMP Smart Drinkware - BLE Functionality Integration Tests
 * Complete testing of Bluetooth Low Energy device interactions
 */

import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { useBLE } from '@/hooks/useBLE';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { deviceManager } from '@/utils/deviceManager';

// Mock react-native-ble-plx
const mockDevice: Partial<Device> = {
  id: 'test-device-123',
  name: 'DAMP Test Device',
  rssi: -45,
  serviceUUIDs: ['12345678-1234-1234-1234-123456789012'],
  isConnected: jest.fn().mockResolvedValue(false),
  connect: jest.fn(),
  discoverAllServicesAndCharacteristics: jest.fn(),
  readCharacteristicForService: jest.fn(),
  writeCharacteristicWithResponseForService: jest.fn(),
  monitorCharacteristicForService: jest.fn(),
  cancelConnection: jest.fn(),
};

const mockCharacteristic: Partial<Characteristic> = {
  uuid: 'abcd1234-5678-9012-3456-789012345678',
  value: 'dGVzdCBkYXRh', // Base64 encoded 'test data'
  serviceUUID: '12345678-1234-1234-1234-123456789012',
};

const mockBleManager = {
  onStateChange: jest.fn(),
  startDeviceScan: jest.fn(),
  stopDeviceScan: jest.fn(),
  connectToDevice: jest.fn(),
  isDeviceConnected: jest.fn(),
  cancelDeviceConnection: jest.fn(),
  requestMTUForDevice: jest.fn(),
  readRSSIForDevice: jest.fn(),
  destroy: jest.fn(),
  state: jest.fn(),
} as unknown as BleManager;

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => mockBleManager),
  State: {
    Unknown: 'Unknown',
    Resetting: 'Resetting',
    Unsupported: 'Unsupported',
    Unauthorized: 'Unauthorized',
    PoweredOff: 'PoweredOff',
    PoweredOn: 'PoweredOn',
  },
}));

// Mock device manager
jest.mock('@/utils/deviceManager', () => ({
  deviceManager: {
    scanForDevices: jest.fn(),
    connectToDevice: jest.fn(),
    disconnectDevice: jest.fn(),
    getDeviceStatus: jest.fn(),
    saveDeviceReading: jest.fn(),
  },
}));

// Mock permissions
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
  }),
}));

describe('BLE Functionality Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBleManager.onStateChange.mockImplementation((callback) => {
      callback('PoweredOn', null);
      return { remove: jest.fn() };
    });
  });

  describe('BLE Initialization', () => {
    it('should initialize BLE manager successfully', async () => {
      const { result } = renderHook(() => useBLE());

      expect(result.current.isReady).toBe(false);

      await waitFor(() => {
        expect(mockBleManager.onStateChange).toHaveBeenCalled();
      });
    });

    it('should handle BLE state changes correctly', async () => {
      const { result } = renderHook(() => useBLE());

      // Mock state change to powered on
      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });

    it('should handle BLE powered off state', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOff', null);
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(false);
        expect(result.current.error).toContain('Bluetooth is turned off');
      });
    });

    it('should handle unauthorized BLE state', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('Unauthorized', null);
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Bluetooth permission denied');
      });
    });
  });

  describe('Device Scanning', () => {
    beforeEach(() => {
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        // Simulate finding a device
        setTimeout(() => {
          callback(null, mockDevice);
        }, 100);
      });
    });

    it('should start device scanning successfully', async () => {
      const { result } = renderHook(() => useBLE());

      // Initialize BLE first
      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.scanForDevices();
      });

      expect(mockBleManager.startDeviceScan).toHaveBeenCalled();
      expect(result.current.isScanning).toBe(true);
    });

    it('should discover DAMP devices during scan', async () => {
      const { result } = renderHook(() => useBLE());

      // Initialize BLE
      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.scanForDevices();
      });

      // Wait for device to be found
      await waitFor(() => {
        expect(result.current.devices).toHaveLength(1);
        expect(result.current.devices[0].name).toBe('DAMP Test Device');
      });
    });

    it('should filter devices by service UUID', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.scanForDevices();
      });

      expect(mockBleManager.startDeviceScan).toHaveBeenCalledWith(
        ['12345678-1234-1234-1234-123456789012'], // DAMP service UUID
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should stop scanning after timeout', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.scanForDevices();
      });

      // Wait for scan timeout
      await waitFor(() => {
        expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
        expect(result.current.isScanning).toBe(false);
      }, { timeout: 15000 });
    });

    it('should handle scan errors gracefully', async () => {
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        callback(new Error('Scan failed'), null);
      });

      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.scanForDevices();
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Scan failed');
        expect(result.current.isScanning).toBe(false);
      });
    });
  });

  describe('Device Connection', () => {
    beforeEach(() => {
      mockDevice.connect = jest.fn().mockResolvedValue(mockDevice);
      mockDevice.discoverAllServicesAndCharacteristics = jest.fn().mockResolvedValue(mockDevice);
      mockBleManager.connectToDevice = jest.fn().mockResolvedValue(mockDevice);
    });

    it('should connect to device successfully', async () => {
      const { result } = renderHook(() => useBLE());

      // Initialize and add device
      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      expect(mockBleManager.connectToDevice).toHaveBeenCalledWith('test-device-123');
    });

    it('should discover services after connection', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await waitFor(() => {
        expect(mockDevice.discoverAllServicesAndCharacteristics).toHaveBeenCalled();
      });
    });

    it('should update connected device state', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await waitFor(() => {
        expect(result.current.connectedDevice).toBeTruthy();
        expect(result.current.connectedDevice?.id).toBe('test-device-123');
      });
    });

    it('should handle connection failures', async () => {
      mockBleManager.connectToDevice = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Connection failed');
        expect(result.current.connectedDevice).toBeNull();
      });
    });

    it('should handle connection timeout', async () => {
      mockBleManager.connectToDevice = jest.fn().mockImplementation(() =>
        new Promise((resolve) => {
          // Never resolve to simulate timeout
        })
      );

      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      // Should timeout after reasonable time
      await waitFor(() => {
        expect(result.current.error).toContain('timeout');
      }, { timeout: 35000 });
    });
  });

  describe('Data Communication', () => {
    beforeEach(() => {
      mockDevice.readCharacteristicForService = jest.fn().mockResolvedValue(mockCharacteristic);
      mockDevice.writeCharacteristicWithResponseForService = jest.fn().mockResolvedValue(mockCharacteristic);
      mockDevice.monitorCharacteristicForService = jest.fn().mockImplementation((serviceUUID, characteristicUUID, callback) => {
        // Simulate data updates
        setTimeout(() => {
          callback(null, mockCharacteristic);
        }, 100);
        return { remove: jest.fn() };
      });
    });

    it('should read device characteristics', async () => {
      const { result } = renderHook(() => useBLE());

      // Setup connected state
      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      // Mock connected device
      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await waitFor(() => {
        expect(result.current.connectedDevice).toBeTruthy();
      });

      // Read characteristic
      await act(async () => {
        result.current.readDeviceData();
      });

      expect(mockDevice.readCharacteristicForService).toHaveBeenCalled();
    });

    it('should write data to device', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await waitFor(() => {
        expect(result.current.connectedDevice).toBeTruthy();
      });

      // Write data
      await act(async () => {
        result.current.writeDeviceData('test-command');
      });

      expect(mockDevice.writeCharacteristicWithResponseForService).toHaveBeenCalled();
    });

    it('should monitor characteristic changes', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await waitFor(() => {
        expect(result.current.connectedDevice).toBeTruthy();
      });

      // Start monitoring
      await act(async () => {
        result.current.startMonitoring();
      });

      expect(mockDevice.monitorCharacteristicForService).toHaveBeenCalled();

      // Wait for monitored data
      await waitFor(() => {
        expect(result.current.deviceData).toBeTruthy();
      });
    });

    it('should handle data parsing correctly', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await act(async () => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        // Should decode base64 data correctly
        expect(result.current.deviceData).toEqual(
          expect.objectContaining({
            rawData: 'dGVzdCBkYXRh',
            decodedData: 'test data',
          })
        );
      });
    });
  });

  describe('Device Disconnection', () => {
    it('should disconnect device successfully', async () => {
      const { result } = renderHook(() => useBLE());

      // Setup connection
      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await waitFor(() => {
        expect(result.current.connectedDevice).toBeTruthy();
      });

      // Disconnect
      await act(async () => {
        result.current.disconnectDevice();
      });

      expect(mockBleManager.cancelDeviceConnection).toHaveBeenCalledWith('test-device-123');

      await waitFor(() => {
        expect(result.current.connectedDevice).toBeNull();
      });
    });

    it('should handle unexpected disconnections', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      // Simulate unexpected disconnection
      act(() => {
        result.current.handleDeviceDisconnection('test-device-123');
      });

      await waitFor(() => {
        expect(result.current.connectedDevice).toBeNull();
        expect(result.current.error).toContain('disconnected unexpectedly');
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle BLE manager errors gracefully', async () => {
      mockBleManager.startDeviceScan.mockImplementation(() => {
        throw new Error('BLE Manager error');
      });

      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.scanForDevices();
      });

      expect(result.current.error).toContain('BLE Manager error');
    });

    it('should retry failed operations', async () => {
      let callCount = 0;
      mockBleManager.connectToDevice = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Connection failed');
        }
        return Promise.resolve(mockDevice);
      });

      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      // First attempt should fail
      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      expect(result.current.error).toContain('Connection failed');

      // Retry should succeed
      await act(async () => {
        result.current.retryConnection();
      });

      await waitFor(() => {
        expect(result.current.connectedDevice).toBeTruthy();
        expect(result.current.error).toBe('');
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('should cleanup resources on unmount', () => {
      const { unmount } = renderHook(() => useBLE());

      unmount();

      expect(mockBleManager.destroy).toHaveBeenCalled();
    });

    it('should handle multiple rapid scan requests', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      // Multiple rapid scan requests
      await act(async () => {
        result.current.scanForDevices();
        result.current.scanForDevices();
        result.current.scanForDevices();
      });

      // Should only start one scan
      expect(mockBleManager.startDeviceScan).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with Device Manager', () => {
    it('should save device readings to database', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await act(async () => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(deviceManager.saveDeviceReading).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceId: 'test-device-123',
            timestamp: expect.any(Number),
            data: expect.any(Object),
          })
        );
      });
    });

    it('should update device status in database', async () => {
      const { result } = renderHook(() => useBLE());

      const stateChangeCallback = mockBleManager.onStateChange.mock.calls[0][0];
      act(() => {
        stateChangeCallback('PoweredOn', null);
      });

      await act(async () => {
        result.current.connectToDevice('test-device-123');
      });

      await waitFor(() => {
        expect(deviceManager.getDeviceStatus).toHaveBeenCalledWith('test-device-123');
      });
    });
  });
});