/**
 * DAMP Smart Drinkware - Device Manager Utility Unit Tests
 * Testing device management utilities and data processing
 * Copyright 2025 WeCr8 Solutions LLC
 */

import { deviceManager } from '../../../utils/deviceManager';
import { Device, SensorData, DeviceStatus } from '../../../types/device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('deviceManager Utility', () => {
  const mockDevice: Device = {
    id: 'device-123',
    name: 'DAMP Test Device',
    type: 'silicone-bottom',
    batteryLevel: 85,
    isConnected: false,
    lastSeen: new Date('2025-01-01T10:00:00Z').toISOString(),
    firmwareVersion: '1.0.0',
    serialNumber: 'DAMP2025001',
    macAddress: '00:11:22:33:44:55',
    calibrationData: {
      temperatureOffset: 0.5,
      humidityOffset: -2.0,
      pressureOffset: 0.1
    }
  };

  const mockSensorData: SensorData = {
    temperature: 72.5,
    humidity: 45.2,
    pressure: 1013.25,
    batteryLevel: 85,
    timestamp: Date.now(),
    deviceId: 'device-123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAsyncStorage.getItem.mockResolvedValue(null);
    mockedAsyncStorage.setItem.mockResolvedValue();
    mockedAsyncStorage.removeItem.mockResolvedValue();
  });

  describe('Device Registration and Storage', () => {
    it('should register a new device', async () => {
      const result = await deviceManager.registerDevice(mockDevice);

      expect(result).toEqual(mockDevice);
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        `device_${mockDevice.id}`,
        JSON.stringify(mockDevice)
      );
    });

    it('should update existing device data', async () => {
      // Mock existing device
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      const updatedDevice: Device = {
        ...mockDevice,
        batteryLevel: 75,
        isConnected: true,
        lastSeen: new Date().toISOString()
      };

      const result = await deviceManager.updateDevice(mockDevice.id, {
        batteryLevel: 75,
        isConnected: true
      });

      expect(result.batteryLevel).toBe(75);
      expect(result.isConnected).toBe(true);
      expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should retrieve device by ID', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      const result = await deviceManager.getDevice(mockDevice.id);

      expect(result).toEqual(mockDevice);
      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(`device_${mockDevice.id}`);
    });

    it('should return null for non-existent device', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await deviceManager.getDevice('non-existent-id');

      expect(result).toBeNull();
    });

    it('should get all registered devices', async () => {
      const devices = [mockDevice, { ...mockDevice, id: 'device-456', name: 'Device 2' }];
      mockedAsyncStorage.getAllKeys.mockResolvedValue(['device_device-123', 'device_device-456', 'other_key']);
      mockedAsyncStorage.multiGet.mockResolvedValue([
        ['device_device-123', JSON.stringify(devices[0])],
        ['device_device-456', JSON.stringify(devices[1])],
        ['other_key', 'other_data']
      ]);

      const result = await deviceManager.getAllDevices();

      expect(result).toHaveLength(2);
      expect(result).toEqual(devices);
    });

    it('should remove device', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      const result = await deviceManager.removeDevice(mockDevice.id);

      expect(result).toBe(true);
      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(`device_${mockDevice.id}`);
    });

    it('should handle removal of non-existent device', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await deviceManager.removeDevice('non-existent-id');

      expect(result).toBe(false);
      expect(mockedAsyncStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Device Status Management', () => {
    it('should get device status', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      const status = await deviceManager.getDeviceStatus(mockDevice.id);

      expect(status).toEqual({
        isOnline: false,
        batteryLevel: 85,
        lastSeen: mockDevice.lastSeen,
        firmwareVersion: '1.0.0',
        connectionStatus: 'disconnected'
      });
    });

    it('should update connection status', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      await deviceManager.updateConnectionStatus(mockDevice.id, true);

      expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
      
      // Verify the device was updated with new connection status
      const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
      const updatedDevice = JSON.parse(setItemCall[1]);
      expect(updatedDevice.isConnected).toBe(true);
    });

    it('should update battery level', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      await deviceManager.updateBatteryLevel(mockDevice.id, 65);

      const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
      const updatedDevice = JSON.parse(setItemCall[1]);
      expect(updatedDevice.batteryLevel).toBe(65);
    });

    it('should update last seen timestamp', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      const newTimestamp = new Date().toISOString();
      await deviceManager.updateLastSeen(mockDevice.id, newTimestamp);

      const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
      const updatedDevice = JSON.parse(setItemCall[1]);
      expect(updatedDevice.lastSeen).toBe(newTimestamp);
    });
  });

  describe('Sensor Data Processing', () => {
    it('should process raw sensor data', () => {
      const rawData = {
        temp: 2350, // 23.50°C in hundredths
        humid: 4520, // 45.20% in hundredths
        press: 101325, // 1013.25 hPa in pascals
        batt: 85,
        timestamp: Date.now()
      };

      const processed = deviceManager.processSensorData(rawData, mockDevice.id);

      expect(processed).toEqual({
        temperature: 23.5,
        humidity: 45.2,
        pressure: 1013.25,
        batteryLevel: 85,
        timestamp: rawData.timestamp,
        deviceId: mockDevice.id
      });
    });

    it('should apply calibration data to sensor readings', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      const rawData = {
        temp: 2300, // 23.00°C
        humid: 4700, // 47.00%
        press: 101315, // 1013.15 hPa
        batt: 85,
        timestamp: Date.now()
      };

      const processed = await deviceManager.processCalibratedSensorData(rawData, mockDevice.id);

      expect(processed.temperature).toBe(23.5); // 23.0 + 0.5 offset
      expect(processed.humidity).toBe(45.0); // 47.0 - 2.0 offset
      expect(processed.pressure).toBe(1013.25); // 1013.15 + 0.1 offset
    });

    it('should validate sensor data ranges', () => {
      const validData = { ...mockSensorData };
      const invalidTempData = { ...mockSensorData, temperature: -50 }; // Too cold
      const invalidHumidityData = { ...mockSensorData, humidity: 150 }; // Over 100%
      const invalidBatteryData = { ...mockSensorData, batteryLevel: -10 }; // Negative battery

      expect(deviceManager.validateSensorData(validData)).toBe(true);
      expect(deviceManager.validateSensorData(invalidTempData)).toBe(false);
      expect(deviceManager.validateSensorData(invalidHumidityData)).toBe(false);
      expect(deviceManager.validateSensorData(invalidBatteryData)).toBe(false);
    });

    it('should store sensor data with timestamp', async () => {
      const result = await deviceManager.storeSensorData(mockSensorData);

      expect(result).toBe(true);
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        `sensor_${mockSensorData.deviceId}_${mockSensorData.timestamp}`,
        JSON.stringify(mockSensorData)
      );
    });

    it('should retrieve recent sensor data for device', async () => {
      const sensorDataEntries = [
        [`sensor_${mockDevice.id}_${Date.now() - 1000}`, JSON.stringify({ ...mockSensorData, timestamp: Date.now() - 1000 })],
        [`sensor_${mockDevice.id}_${Date.now() - 2000}`, JSON.stringify({ ...mockSensorData, timestamp: Date.now() - 2000 })],
        [`sensor_other-device_${Date.now()}`, JSON.stringify({ ...mockSensorData, deviceId: 'other-device' })]
      ];

      mockedAsyncStorage.getAllKeys.mockResolvedValue(sensorDataEntries.map(([key]) => key));
      mockedAsyncStorage.multiGet.mockResolvedValue(sensorDataEntries);

      const result = await deviceManager.getRecentSensorData(mockDevice.id, 24); // Last 24 hours

      expect(result).toHaveLength(2);
      expect(result.every(data => data.deviceId === mockDevice.id)).toBe(true);
    });
  });

  describe('Device Discovery and Identification', () => {
    it('should identify device type from advertisement data', () => {
      const dampSiliconeAd = {
        localName: 'DAMP-SB-001',
        serviceUUIDs: ['12345678-1234-1234-1234-123456789abc'],
        manufacturerData: Buffer.from([0x01, 0x02, 0x03]) // DAMP manufacturer ID
      };

      const deviceType = deviceManager.identifyDeviceType(dampSiliconeAd);
      expect(deviceType).toBe('silicone-bottom');
    });

    it('should parse device serial from advertisement', () => {
      const adData = {
        localName: 'DAMP-SB-001',
        manufacturerData: Buffer.from('DAMP2025001', 'utf8')
      };

      const serial = deviceManager.parseDeviceSerial(adData);
      expect(serial).toBe('DAMP2025001');
    });

    it('should check if device is compatible', () => {
      const compatibleDevice = {
        name: 'DAMP Smart Device',
        serviceUUIDs: ['12345678-1234-1234-1234-123456789abc']
      };

      const incompatibleDevice = {
        name: 'Other Device',
        serviceUUIDs: ['00000000-0000-0000-0000-000000000000']
      };

      expect(deviceManager.isCompatibleDevice(compatibleDevice)).toBe(true);
      expect(deviceManager.isCompatibleDevice(incompatibleDevice)).toBe(false);
    });

    it('should extract firmware version from device info', async () => {
      const deviceInfoCharacteristic = {
        value: Buffer.from('1.2.3').toString('base64')
      };

      const version = deviceManager.parseFirmwareVersion(deviceInfoCharacteristic);
      expect(version).toBe('1.2.3');
    });
  });

  describe('Data Synchronization', () => {
    it('should sync device data to cloud', async () => {
      const syncResult = await deviceManager.syncDeviceToCloud(mockDevice);
      
      expect(syncResult.success).toBe(true);
      expect(syncResult.syncedAt).toBeInstanceOf(Date);
    });

    it('should handle sync failures gracefully', async () => {
      // Mock network failure
      const deviceWithSyncError = { ...mockDevice, id: 'sync-error-device' };
      
      const syncResult = await deviceManager.syncDeviceToCloud(deviceWithSyncError);
      
      expect(syncResult.success).toBeDefined();
    });

    it('should batch sync multiple devices', async () => {
      const devices = [
        mockDevice,
        { ...mockDevice, id: 'device-456' },
        { ...mockDevice, id: 'device-789' }
      ];

      const results = await deviceManager.batchSyncDevices(devices);
      
      expect(results).toHaveLength(3);
      expect(results.every(result => typeof result.success === 'boolean')).toBe(true);
    });
  });

  describe('Device Analytics', () => {
    it('should calculate device usage statistics', async () => {
      const sensorHistory = [
        { ...mockSensorData, timestamp: Date.now() - 3600000 }, // 1 hour ago
        { ...mockSensorData, timestamp: Date.now() - 7200000 }, // 2 hours ago
        { ...mockSensorData, timestamp: Date.now() - 10800000 } // 3 hours ago
      ];

      // Mock the storage calls
      mockedAsyncStorage.getAllKeys.mockResolvedValue(
        sensorHistory.map((_, i) => `sensor_${mockDevice.id}_${Date.now() - (i + 1) * 3600000}`)
      );
      mockedAsyncStorage.multiGet.mockResolvedValue(
        sensorHistory.map((data, i) => [`sensor_${mockDevice.id}_${Date.now() - (i + 1) * 3600000}`, JSON.stringify(data)])
      );

      const stats = await deviceManager.getDeviceUsageStats(mockDevice.id);

      expect(stats).toHaveProperty('totalDataPoints', 3);
      expect(stats).toHaveProperty('averageTemperature');
      expect(stats).toHaveProperty('averageHumidity');
      expect(stats).toHaveProperty('dataFrequency');
    });

    it('should detect anomalies in sensor data', () => {
      const normalData = [
        { ...mockSensorData, temperature: 23.0 },
        { ...mockSensorData, temperature: 23.2 },
        { ...mockSensorData, temperature: 22.8 },
        { ...mockSensorData, temperature: 23.1 }
      ];

      const dataWithAnomaly = [
        ...normalData,
        { ...mockSensorData, temperature: 45.0 } // Anomaly
      ];

      expect(deviceManager.detectAnomalies(normalData)).toHaveLength(0);
      expect(deviceManager.detectAnomalies(dataWithAnomaly)).toHaveLength(1);
    });

    it('should calculate battery life prediction', () => {
      const batteryHistory = [
        { batteryLevel: 100, timestamp: Date.now() - 86400000 * 10 }, // 10 days ago
        { batteryLevel: 90, timestamp: Date.now() - 86400000 * 8 },   // 8 days ago
        { batteryLevel: 80, timestamp: Date.now() - 86400000 * 6 },   // 6 days ago
        { batteryLevel: 70, timestamp: Date.now() - 86400000 * 4 },   // 4 days ago
        { batteryLevel: 60, timestamp: Date.now() - 86400000 * 2 },   // 2 days ago
        { batteryLevel: 50, timestamp: Date.now() }                   // Now
      ];

      const prediction = deviceManager.predictBatteryLife(batteryHistory);

      expect(prediction.estimatedDaysRemaining).toBeGreaterThan(0);
      expect(prediction.drainRatePerDay).toBeGreaterThan(0);
      expect(prediction.confidence).toBeWithinRange(0, 1);
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await deviceManager.getDevice(mockDevice.id);

      expect(result).toBeNull();
    });

    it('should handle malformed device data', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await deviceManager.getDevice(mockDevice.id);

      expect(result).toBeNull();
    });

    it('should validate device data before storage', async () => {
      const invalidDevice = { ...mockDevice, id: '' }; // Missing required field

      const result = await deviceManager.registerDevice(invalidDevice as Device);

      expect(result).toBeNull();
      expect(mockedAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle concurrent device updates', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      // Simulate concurrent updates
      const promise1 = deviceManager.updateDevice(mockDevice.id, { batteryLevel: 70 });
      const promise2 = deviceManager.updateDevice(mockDevice.id, { batteryLevel: 75 });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both should succeed, last one wins
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle large device lists efficiently', async () => {
      const largeDeviceList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockDevice,
        id: `device-${i}`,
        name: `Device ${i}`
      }));

      const keys = largeDeviceList.map(d => `device_${d.id}`);
      const entries = largeDeviceList.map(d => [`device_${d.id}`, JSON.stringify(d)]);

      mockedAsyncStorage.getAllKeys.mockResolvedValue(keys);
      mockedAsyncStorage.multiGet.mockResolvedValue(entries);

      const startTime = performance.now();
      const devices = await deviceManager.getAllDevices();
      const endTime = performance.now();

      expect(devices).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should process in under 1 second
    });

    it('should cache frequently accessed devices', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDevice));

      // First access
      await deviceManager.getDevice(mockDevice.id);
      
      // Second access should use cache
      await deviceManager.getDevice(mockDevice.id);

      // AsyncStorage should only be called once due to caching
      expect(mockedAsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });
  });
});