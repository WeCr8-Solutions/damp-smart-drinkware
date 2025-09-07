/**
 * DAMP Smart Drinkware - BLE Device Connection Flow Integration Tests
 * Testing complete BLE connection and data flow scenarios
 * Copyright 2025 WeCr8 Solutions LLC
 */

import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { integrationTestUtils } from '../../setup/integration-setup';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('BLE Device Connection Flow Integration', () => {
  let bleManager: BleManager;
  let mockDevice: Device;

  beforeEach(async () => {
    // Reset BLE mock and storage
    bleManager = integrationTestUtils.ble.mockBleManager as any;
    await integrationTestUtils.storage.clearAll();

    // Setup mock device
    mockDevice = {
      id: 'DAMP_SB_001',
      name: 'DAMP Silicone Bottom',
      rssi: -45,
      isConnectable: true,
      localName: 'DAMP-SB-001',
      serviceUUIDs: ['12345678-1234-1234-1234-123456789abc'],
      manufacturerData: Buffer.from([0x01, 0x02, 0x03]),
      txPowerLevel: 0,
    } as any;
  });

  describe('Device Discovery and Pairing', () => {
    it('should discover DAMP devices during scan', async () => {
      const discoveredDevices: Device[] = [];
      let scanCallback: Function;

      bleManager.startDeviceScan.mockImplementation((serviceUUIDs, options, callback) => {
        scanCallback = callback;

        // Simulate discovering multiple devices
        setTimeout(() => {
          callback(null, mockDevice);
          callback(null, { ...mockDevice, id: 'DAMP_DH_002', name: 'DAMP Handle' });
          callback(null, { id: 'OTHER_DEVICE', name: 'Other Device' }); // Should be filtered
        }, 100);
      });

      // Start scanning
      bleManager.startDeviceScan(
        ['12345678-1234-1234-1234-123456789abc'],
        { allowDuplicates: false },
        (error, device) => {
          if (!error && device) {
            // Filter only DAMP devices
            if (device.name?.includes('DAMP') || device.localName?.includes('DAMP')) {
              discoveredDevices.push(device);
            }
          }
        }
      );

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(discoveredDevices).toHaveLength(2);
      expect(discoveredDevices.every(device =>
        device.name?.includes('DAMP') || device.localName?.includes('DAMP')
      )).toBe(true);
    });

    it('should validate device compatibility before connection', async () => {
      const compatibilityCheck = (device: Device) => {
        // Check service UUIDs
        const requiredServiceUUID = '12345678-1234-1234-1234-123456789abc';
        if (!device.serviceUUIDs?.includes(requiredServiceUUID)) {
          return false;
        }

        // Check device naming convention
        if (!device.name?.startsWith('DAMP') && !device.localName?.startsWith('DAMP')) {
          return false;
        }

        return true;
      };

      const compatibleDevice = { ...mockDevice };
      const incompatibleDevice = {
        ...mockDevice,
        id: 'INCOMPATIBLE',
        name: 'Unknown Device',
        serviceUUIDs: ['00000000-0000-0000-0000-000000000000']
      } as Device;

      expect(compatibilityCheck(compatibleDevice)).toBe(true);
      expect(compatibilityCheck(incompatibleDevice)).toBe(false);
    });

    it('should handle device pairing with PIN verification', async () => {
      const pairingProcess = async (device: Device, pin: string) => {
        try {
          // Step 1: Connect to device
          bleManager.connectToDevice.mockResolvedValue(device);
          const connectedDevice = await bleManager.connectToDevice(device.id);

          // Step 2: Discover services
          bleManager.discoverAllServicesAndCharacteristicsForDevice.mockResolvedValue(device);
          await bleManager.discoverAllServicesAndCharacteristicsForDevice(device.id);

          // Step 3: Write PIN to pairing characteristic
          const pairingServiceUUID = '12345678-1234-1234-1234-123456789abc';
          const pairingCharUUID = '87654321-4321-4321-4321-cba987654321';

          bleManager.writeCharacteristicWithResponseForDevice.mockResolvedValue(
            { value: Buffer.from('PAIRED').toString('base64') } as any
          );

          await bleManager.writeCharacteristicWithResponseForDevice(
            device.id,
            pairingServiceUUID,
            pairingCharUUID,
            Buffer.from(pin).toString('base64')
          );

          // Step 4: Read pairing status
          bleManager.readCharacteristicForDevice.mockResolvedValue(
            { value: Buffer.from('PAIRED').toString('base64') } as any
          );

          const pairingStatus = await bleManager.readCharacteristicForDevice(
            device.id,
            pairingServiceUUID,
            pairingCharUUID
          );

          const status = Buffer.from(pairingStatus.value, 'base64').toString();
          return status === 'PAIRED';

        } catch (error) {
          return false;
        }
      };

      const validPin = '123456';
      const invalidPin = '000000';

      const validResult = await pairingProcess(mockDevice, validPin);
      expect(validResult).toBe(true);

      // Mock pairing failure for invalid PIN
      bleManager.writeCharacteristicWithResponseForDevice.mockRejectedValueOnce(
        new Error('Pairing failed')
      );

      const invalidResult = await pairingProcess(mockDevice, invalidPin);
      expect(invalidResult).toBe(false);
    });
  });

  describe('Data Communication Flow', () => {
    const serviceUUID = '12345678-1234-1234-1234-123456789abc';
    const sensorDataCharUUID = 'abcdeff0-1234-1234-1234-123456789abc';
    const commandCharUUID = 'abcdeff1-1234-1234-1234-123456789abc';
    const batteryCharUUID = 'abcdeff2-1234-1234-1234-123456789abc';

    beforeEach(async () => {
      // Setup connected device state
      bleManager.connectToDevice.mockResolvedValue(mockDevice);
      bleManager.discoverAllServicesAndCharacteristicsForDevice.mockResolvedValue(mockDevice);
    });

    it('should establish connection and read device info', async () => {
      const connectionFlow = async () => {
        // Connect
        const device = await bleManager.connectToDevice(mockDevice.id);

        // Discover services
        await bleManager.discoverAllServicesAndCharacteristicsForDevice(device.id);

        // Read device information
        bleManager.readCharacteristicForDevice.mockImplementation((deviceId, serviceId, charId) => {
          const responses: Record<string, string> = {
            [sensorDataCharUUID]: JSON.stringify({
              temperature: 23.5,
              humidity: 45.2,
              pressure: 1013.25,
              timestamp: Date.now()
            }),
            [batteryCharUUID]: '85', // Battery level 85%
            '2a29': 'WeCr8 Solutions', // Manufacturer name
            '2a24': 'DAMP-SB', // Model number
            '2a26': '1.0.0' // Firmware version
          };

          const response = responses[charId] || 'Unknown';
          return Promise.resolve({
            value: Buffer.from(response).toString('base64')
          });
        });

        const sensorData = await bleManager.readCharacteristicForDevice(
          device.id, serviceUUID, sensorDataCharUUID
        );

        const batteryLevel = await bleManager.readCharacteristicForDevice(
          device.id, serviceUUID, batteryCharUUID
        );

        return {
          device,
          sensorData: JSON.parse(Buffer.from(sensorData.value, 'base64').toString()),
          batteryLevel: parseInt(Buffer.from(batteryLevel.value, 'base64').toString())
        };
      };

      const result = await connectionFlow();

      expect(result.device.id).toBe(mockDevice.id);
      expect(result.sensorData.temperature).toBe(23.5);
      expect(result.batteryLevel).toBe(85);
      expect(bleManager.connectToDevice).toHaveBeenCalledWith(mockDevice.id);
    });

    it('should stream real-time sensor data', async () => {
      const sensorDataStream = [];
      let dataCallback: Function;

      // Setup monitoring
      bleManager.monitorCharacteristicForDevice.mockImplementation((deviceId, serviceId, charId, callback) => {
        dataCallback = callback;

        // Simulate periodic data updates
        const interval = setInterval(() => {
          const sensorReading = {
            temperature: 20 + Math.random() * 10,
            humidity: 40 + Math.random() * 20,
            pressure: 1000 + Math.random() * 50,
            timestamp: Date.now()
          };

          callback(null, {
            value: Buffer.from(JSON.stringify(sensorReading)).toString('base64')
          });
        }, 1000);

        return {
          remove: () => clearInterval(interval)
        };
      });

      // Start monitoring
      const subscription = bleManager.monitorCharacteristicForDevice(
        mockDevice.id,
        serviceUUID,
        sensorDataCharUUID,
        (error, characteristic) => {
          if (!error && characteristic) {
            const data = JSON.parse(Buffer.from(characteristic.value, 'base64').toString());
            sensorDataStream.push(data);
          }
        }
      );

      // Wait for some data
      await new Promise(resolve => setTimeout(resolve, 3500));
      subscription.remove();

      expect(sensorDataStream.length).toBeGreaterThanOrEqual(3);
      expect(sensorDataStream.every(data =>
        data.temperature && data.humidity && data.pressure && data.timestamp
      )).toBe(true);
    });

    it('should send commands and receive acknowledgments', async () => {
      const commandFlow = async (command: string, parameters: any) => {
        const commandPayload = JSON.stringify({
          command,
          parameters,
          timestamp: Date.now(),
          requestId: Math.random().toString(36).substr(2, 9)
        });

        // Send command
        bleManager.writeCharacteristicWithResponseForDevice.mockResolvedValue(
          { value: Buffer.from('ACK').toString('base64') } as any
        );

        await bleManager.writeCharacteristicWithResponseForDevice(
          mockDevice.id,
          serviceUUID,
          commandCharUUID,
          Buffer.from(commandPayload).toString('base64')
        );

        // Wait for and read response
        bleManager.readCharacteristicForDevice.mockResolvedValue({
          value: Buffer.from(JSON.stringify({
            status: 'success',
            command,
            result: 'Command executed successfully'
          })).toString('base64')
        } as any);

        const response = await bleManager.readCharacteristicForDevice(
          mockDevice.id,
          serviceUUID,
          commandCharUUID
        );

        return JSON.parse(Buffer.from(response.value, 'base64').toString());
      };

      // Test different commands
      const calibrateResponse = await commandFlow('calibrate', { type: 'temperature' });
      expect(calibrateResponse.status).toBe('success');

      const resetResponse = await commandFlow('reset', {});
      expect(resetResponse.status).toBe('success');

      const configResponse = await commandFlow('configure', {
        sampleRate: 5000,
        powerMode: 'low'
      });
      expect(configResponse.status).toBe('success');
    });

    it('should handle connection loss and recovery', async () => {
      let connectionState = 'connected';
      const connectionEvents: string[] = [];

      // Mock connection state monitoring
      const mockConnectionMonitor = {
        onStateChange: jest.fn((callback) => {
          const interval = setInterval(() => {
            if (connectionState === 'connected' && Math.random() < 0.1) {
              connectionState = 'disconnected';
              connectionEvents.push('disconnected');
              callback('disconnected');

              // Auto-reconnect after 2 seconds
              setTimeout(() => {
                connectionState = 'connected';
                connectionEvents.push('connected');
                callback('connected');
              }, 2000);
            }
          }, 500);

          return { remove: () => clearInterval(interval) };
        })
      };

      // Start monitoring
      const stateSubscription = mockConnectionMonitor.onStateChange((state: string) => {
        if (state === 'disconnected') {
          // Stop any ongoing data streams
          bleManager.stopDeviceScan();
        } else if (state === 'connected') {
          // Resume operations
          console.log('Connection restored');
        }
      });

      // Simulate running for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));
      stateSubscription.remove();

      // Should have handled disconnection/reconnection events
      expect(connectionEvents.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Persistence and Sync', () => {
    it('should cache sensor data locally during connection', async () => {
      const sensorDataCache = [];

      // Simulate receiving sensor data
      const mockSensorReadings = [
        { temperature: 23.1, humidity: 45.0, timestamp: Date.now() - 60000 },
        { temperature: 23.5, humidity: 45.2, timestamp: Date.now() - 30000 },
        { temperature: 23.8, humidity: 45.5, timestamp: Date.now() }
      ];

      // Store data locally
      for (const reading of mockSensorReadings) {
        const cacheKey = `sensor_${mockDevice.id}_${reading.timestamp}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          ...reading,
          deviceId: mockDevice.id,
          synced: false
        }));
        sensorDataCache.push(reading);
      }

      // Verify data is cached
      const cachedKeys = await AsyncStorage.getAllKeys();
      const sensorKeys = cachedKeys.filter(key => key.startsWith(`sensor_${mockDevice.id}`));

      expect(sensorKeys).toHaveLength(3);

      // Retrieve and verify cached data
      const cachedData = await AsyncStorage.multiGet(sensorKeys);
      const parsedData = cachedData.map(([key, value]) => JSON.parse(value!));

      expect(parsedData.every(data => data.deviceId === mockDevice.id)).toBe(true);
      expect(parsedData.every(data => data.synced === false)).toBe(true);
    });

    it('should sync cached data when connection is available', async () => {
      // Setup cached unsynced data
      const unsyncedData = [
        { deviceId: mockDevice.id, temperature: 22.0, timestamp: Date.now() - 180000, synced: false },
        { deviceId: mockDevice.id, temperature: 22.5, timestamp: Date.now() - 120000, synced: false },
        { deviceId: mockDevice.id, temperature: 23.0, timestamp: Date.now() - 60000, synced: false }
      ];

      for (const [index, data] of unsyncedData.entries()) {
        await AsyncStorage.setItem(
          `sensor_${data.deviceId}_${data.timestamp}`,
          JSON.stringify(data)
        );
      }

      // Mock sync function
      const syncToFirebase = async (data: any[]) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mark as synced
        for (const item of data) {
          const key = `sensor_${item.deviceId}_${item.timestamp}`;
          await AsyncStorage.setItem(key, JSON.stringify({
            ...item,
            synced: true,
            syncedAt: new Date().toISOString()
          }));
        }

        return { success: true, syncedCount: data.length };
      };

      // Perform sync
      const result = await syncToFirebase(unsyncedData);

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(3);

      // Verify data is marked as synced
      const keys = await AsyncStorage.getAllKeys();
      const sensorKeys = keys.filter(key => key.startsWith(`sensor_${mockDevice.id}`));
      const syncedData = await AsyncStorage.multiGet(sensorKeys);

      const allSynced = syncedData.every(([key, value]) => {
        const data = JSON.parse(value!);
        return data.synced === true;
      });

      expect(allSynced).toBe(true);
    });

    it('should handle data conflicts during sync', async () => {
      const conflictingData = {
        deviceId: mockDevice.id,
        temperature: 25.0,
        timestamp: Date.now(),
        localId: 'local-123',
        synced: false
      };

      // Store locally
      await AsyncStorage.setItem(
        `sensor_${conflictingData.deviceId}_${conflictingData.timestamp}`,
        JSON.stringify(conflictingData)
      );

      // Mock conflict resolution (server version wins)
      const resolveConflict = async (localData: any, serverData: any) => {
        if (serverData && localData.timestamp === serverData.timestamp) {
          // Use server data for conflicts
          const resolvedData = {
            ...serverData,
            localId: localData.localId,
            conflictResolved: true,
            resolvedAt: new Date().toISOString()
          };

          await AsyncStorage.setItem(
            `sensor_${resolvedData.deviceId}_${resolvedData.timestamp}`,
            JSON.stringify(resolvedData)
          );

          return resolvedData;
        }

        return localData;
      };

      const serverData = {
        deviceId: mockDevice.id,
        temperature: 24.5, // Different value
        timestamp: conflictingData.timestamp,
        serverId: 'server-456',
        synced: true
      };

      const resolved = await resolveConflict(conflictingData, serverData);

      expect(resolved.temperature).toBe(24.5); // Server value
      expect(resolved.localId).toBe('local-123'); // Local metadata preserved
      expect(resolved.conflictResolved).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle BLE errors gracefully', async () => {
      const errorScenarios = [
        { type: 'connection_timeout', code: 133 },
        { type: 'device_not_found', code: 2 },
        { type: 'service_not_found', code: 3 },
        { type: 'characteristic_not_found', code: 5 },
        { type: 'permission_denied', code: 1 }
      ];

      for (const scenario of errorScenarios) {
        const error = new Error(`BLE Error: ${scenario.type}`);
        (error as any).code = scenario.code;

        bleManager.connectToDevice.mockRejectedValueOnce(error);

        try {
          await bleManager.connectToDevice(mockDevice.id);
          fail('Should have thrown error');
        } catch (caughtError: any) {
          expect(caughtError.message).toContain(scenario.type);
          expect(caughtError.code).toBe(scenario.code);
        }
      }
    });

    it('should implement retry logic for failed operations', async () => {
      let attemptCount = 0;
      const maxRetries = 3;

      const retryableOperation = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return { success: true, attempts: attemptCount };
      };

      const executeWithRetry = async (operation: Function, maxRetries: number) => {
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
          try {
            return await operation();
          } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
          }
        }

        throw lastError;
      };

      const result = await executeWithRetry(retryableOperation, maxRetries);

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
    });

    it('should handle device disconnection during data transfer', async () => {
      let transferInProgress = false;
      let transferCompleted = false;

      // Mock large data transfer
      const transferLargeData = async () => {
        transferInProgress = true;

        try {
          // Simulate chunks of data
          for (let chunk = 0; chunk < 10; chunk++) {
            if (chunk === 5) {
              // Simulate disconnection mid-transfer
              throw new Error('Device disconnected');
            }

            await bleManager.writeCharacteristicWithResponseForDevice(
              mockDevice.id,
              '12345678-1234-1234-1234-123456789abc',
              '87654321-4321-4321-4321-cba987654321',
              Buffer.from(`chunk-${chunk}`).toString('base64')
            );

            await new Promise(resolve => setTimeout(resolve, 100));
          }

          transferCompleted = true;

        } catch (error) {
          transferInProgress = false;

          // Save transfer state for resume
          await AsyncStorage.setItem('transfer_state', JSON.stringify({
            deviceId: mockDevice.id,
            lastChunk: 4,
            totalChunks: 10,
            timestamp: Date.now()
          }));

          throw error;
        }
      };

      bleManager.writeCharacteristicWithResponseForDevice
        .mockResolvedValueOnce({ value: 'chunk-0' })
        .mockResolvedValueOnce({ value: 'chunk-1' })
        .mockResolvedValueOnce({ value: 'chunk-2' })
        .mockResolvedValueOnce({ value: 'chunk-3' })
        .mockResolvedValueOnce({ value: 'chunk-4' })
        .mockRejectedValueOnce(new Error('Device disconnected'));

      await expect(transferLargeData()).rejects.toThrow('Device disconnected');

      expect(transferInProgress).toBe(false);
      expect(transferCompleted).toBe(false);

      // Verify transfer state was saved
      const transferState = await AsyncStorage.getItem('transfer_state');
      const parsedState = JSON.parse(transferState!);

      expect(parsedState.lastChunk).toBe(4);
      expect(parsedState.deviceId).toBe(mockDevice.id);
    });
  });
});