/**
 * DAMP Smart Drinkware - BLEManager Component Unit Tests
 * Testing Bluetooth Low Energy manager functionality
 * Copyright 2025 WeCr8 Solutions LLC
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { BleManager, Device, BleError } from 'react-native-ble-plx';
import { BLEManager } from '../../../components/BLEManager';
import { BLEProvider } from '../../../components/BLEProvider';

// Mock the BLE library
jest.mock('react-native-ble-plx');

describe('BLEManager', () => {
  let mockBleManager: jest.Mocked<BleManager>;
  let mockDevice: jest.Mocked<Device>;

  beforeEach(() => {
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
      onStateChange: jest.fn(),
    } as any;

    // Setup mock device
    mockDevice = {
      id: 'test-device-id',
      name: 'DAMP Test Device',
      rssi: -50,
      isConnectable: true,
      isConnected: jest.fn().mockResolvedValue(false),
      connect: jest.fn(),
      discoverAllServicesAndCharacteristics: jest.fn(),
      readCharacteristicForService: jest.fn(),
      writeCharacteristicWithResponseForService: jest.fn(),
    } as any;

    (BleManager as jest.Mock).mockImplementation(() => mockBleManager);
  });

  describe('Initialization', () => {
    it('should initialize BLE manager correctly', async () => {
      const { getByTestId } = render(
        <BLEProvider>
          <BLEManager testID="ble-manager" />
        </BLEProvider>
      );

      const bleManager = getByTestId('ble-manager');
      expect(bleManager).toBeTruthy();
    });

    it('should check bluetooth state on mount', async () => {
      render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      await waitFor(() => {
        expect(mockBleManager.state).toHaveBeenCalled();
      });
    });

    it('should handle bluetooth power state changes', async () => {
      const stateChangeCallback = jest.fn();
      mockBleManager.onStateChange.mockImplementation((callback) => {
        stateChangeCallback.mockImplementation(callback);
        return { remove: jest.fn() };
      });

      render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      // Simulate state change
      act(() => {
        stateChangeCallback('PoweredOff');
      });

      await waitFor(() => {
        expect(stateChangeCallback).toHaveBeenCalledWith('PoweredOff');
      });
    });
  });

  describe('Device Scanning', () => {
    it('should start device scan with correct parameters', async () => {
      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      const scanButton = getByText('Start Scan');
      act(() => {
        scanButton.props.onPress();
      });

      await waitFor(() => {
        expect(mockBleManager.startDeviceScan).toHaveBeenCalledWith(
          ['12345678-1234-1234-1234-123456789abc'], // DAMP service UUID
          { allowDuplicates: false },
          expect.any(Function)
        );
      });
    });

    it('should handle device discovery during scan', async () => {
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      const { getByText, queryByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      const scanButton = getByText('Start Scan');
      act(() => {
        scanButton.props.onPress();
      });

      // Simulate device discovery
      act(() => {
        scanCallback(null, mockDevice);
      });

      await waitFor(() => {
        expect(queryByText('DAMP Test Device')).toBeTruthy();
      });
    });

    it('should stop scan correctly', async () => {
      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      const stopButton = getByText('Stop Scan');
      act(() => {
        stopButton.props.onPress();
      });

      await waitFor(() => {
        expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
      });
    });

    it('should handle scan errors', async () => {
      const scanError = new BleError('Scan failed', 100);
      let scanCallback: Function;
      
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      const { getByText, queryByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      const scanButton = getByText('Start Scan');
      act(() => {
        scanButton.props.onPress();
      });

      // Simulate scan error
      act(() => {
        scanCallback(scanError, null);
      });

      await waitFor(() => {
        expect(queryByText(/error/i)).toBeTruthy();
      });
    });
  });

  describe('Device Connection', () => {
    beforeEach(() => {
      // Setup connected device mock
      mockDevice.isConnected.mockResolvedValue(true);
      mockBleManager.connectToDevice.mockResolvedValue(mockDevice);
    });

    it('should connect to device successfully', async () => {
      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      // First discover the device
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      act(() => {
        getByText('Start Scan').props.onPress();
        scanCallback(null, mockDevice);
      });

      await waitFor(() => {
        const connectButton = getByText('Connect');
        act(() => {
          connectButton.props.onPress();
        });
      });

      await waitFor(() => {
        expect(mockBleManager.connectToDevice).toHaveBeenCalledWith(mockDevice.id);
      });
    });

    it('should discover services after connection', async () => {
      mockBleManager.discoverAllServicesAndCharacteristicsForDevice.mockResolvedValue(mockDevice);

      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      // Simulate connection flow
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      act(() => {
        getByText('Start Scan').props.onPress();
        scanCallback(null, mockDevice);
      });

      await waitFor(() => {
        const connectButton = getByText('Connect');
        act(() => {
          connectButton.props.onPress();
        });
      });

      await waitFor(() => {
        expect(mockBleManager.discoverAllServicesAndCharacteristicsForDevice).toHaveBeenCalledWith(mockDevice.id);
      });
    });

    it('should handle connection errors', async () => {
      const connectionError = new BleError('Connection failed', 200);
      mockBleManager.connectToDevice.mockRejectedValue(connectionError);

      const { getByText, queryByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      // Simulate connection attempt
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      act(() => {
        getByText('Start Scan').props.onPress();
        scanCallback(null, mockDevice);
      });

      await waitFor(() => {
        const connectButton = getByText('Connect');
        act(() => {
          connectButton.props.onPress();
        });
      });

      await waitFor(() => {
        expect(queryByText(/connection failed/i)).toBeTruthy();
      });
    });

    it('should disconnect device correctly', async () => {
      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      // Simulate connected state
      mockDevice.isConnected.mockResolvedValue(true);

      const disconnectButton = getByText('Disconnect');
      act(() => {
        disconnectButton.props.onPress();
      });

      await waitFor(() => {
        expect(mockBleManager.cancelDeviceConnection).toHaveBeenCalledWith(mockDevice.id);
      });
    });
  });

  describe('Data Communication', () => {
    const mockServiceUUID = '12345678-1234-1234-1234-123456789abc';
    const mockCharacteristicUUID = '87654321-4321-4321-4321-cba987654321';

    beforeEach(() => {
      mockDevice.isConnected.mockResolvedValue(true);
      mockBleManager.connectToDevice.mockResolvedValue(mockDevice);
    });

    it('should read characteristic data correctly', async () => {
      const mockData = { value: Buffer.from('test-data').toString('base64') };
      mockBleManager.readCharacteristicForDevice.mockResolvedValue(mockData as any);

      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      const readButton = getByText('Read Data');
      act(() => {
        readButton.props.onPress();
      });

      await waitFor(() => {
        expect(mockBleManager.readCharacteristicForDevice).toHaveBeenCalledWith(
          mockDevice.id,
          mockServiceUUID,
          mockCharacteristicUUID
        );
      });
    });

    it('should write characteristic data correctly', async () => {
      const testData = 'test-write-data';
      mockBleManager.writeCharacteristicWithResponseForDevice.mockResolvedValue(mockDevice as any);

      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      const writeButton = getByText('Write Data');
      act(() => {
        writeButton.props.onPress();
      });

      await waitFor(() => {
        expect(mockBleManager.writeCharacteristicWithResponseForDevice).toHaveBeenCalledWith(
          mockDevice.id,
          mockServiceUUID,
          mockCharacteristicUUID,
          Buffer.from(testData).toString('base64')
        );
      });
    });

    it('should monitor characteristic changes', async () => {
      let monitorCallback: Function;
      mockBleManager.monitorCharacteristicForDevice.mockImplementation((deviceId, serviceUUID, characteristicUUID, callback) => {
        monitorCallback = callback;
        return { remove: jest.fn() };
      });

      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      const monitorButton = getByText('Start Monitor');
      act(() => {
        monitorButton.props.onPress();
      });

      await waitFor(() => {
        expect(mockBleManager.monitorCharacteristicForDevice).toHaveBeenCalled();
      });

      // Simulate characteristic change
      const mockCharacteristic = { value: Buffer.from('new-data').toString('base64') };
      act(() => {
        monitorCallback(null, mockCharacteristic);
      });

      await waitFor(() => {
        // Verify the new data is handled
        expect(monitorCallback).toHaveBeenCalledWith(null, mockCharacteristic);
      });
    });

    it('should handle read errors', async () => {
      const readError = new BleError('Read failed', 300);
      mockBleManager.readCharacteristicForDevice.mockRejectedValue(readError);

      const { getByText, queryByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      const readButton = getByText('Read Data');
      act(() => {
        readButton.props.onPress();
      });

      await waitFor(() => {
        expect(queryByText(/read failed/i)).toBeTruthy();
      });
    });

    it('should handle write errors', async () => {
      const writeError = new BleError('Write failed', 400);
      mockBleManager.writeCharacteristicWithResponseForDevice.mockRejectedValue(writeError);

      const { getByText, queryByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      const writeButton = getByText('Write Data');
      act(() => {
        writeButton.props.onPress();
      });

      await waitFor(() => {
        expect(queryByText(/write failed/i)).toBeTruthy();
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      unmount();

      expect(mockBleManager.destroy).toHaveBeenCalled();
    });

    it('should stop scanning on unmount', () => {
      const { unmount, getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      // Start scanning
      act(() => {
        getByText('Start Scan').props.onPress();
      });

      unmount();

      expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should scan for devices within acceptable time', async () => {
      const startTime = performance.now();
      
      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
        setTimeout(() => callback(null, mockDevice), 50); // Simulate quick discovery
      });

      act(() => {
        getByText('Start Scan').props.onPress();
      });

      await waitFor(() => {
        expect(scanCallback).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const scanTime = endTime - startTime;
      
      expect(scanTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should connect within acceptable time', async () => {
      const startTime = performance.now();
      
      mockBleManager.connectToDevice.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockDevice), 100); // Simulate connection time
        });
      });

      const { getByText } = render(
        <BLEProvider>
          <BLEManager />
        </BLEProvider>
      );

      // Simulate device discovery first
      let scanCallback: Function;
      mockBleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;
      });

      act(() => {
        getByText('Start Scan').props.onPress();
        scanCallback(null, mockDevice);
      });

      await waitFor(() => {
        const connectButton = getByText('Connect');
        act(() => {
          connectButton.props.onPress();
        });
      });

      await waitFor(() => {
        expect(mockBleManager.connectToDevice).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const connectionTime = endTime - startTime;
      
      expect(connectionTime).toBeLessThan(1000); // Should connect within 1s
    });
  });
});