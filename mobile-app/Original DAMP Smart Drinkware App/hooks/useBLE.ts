import { useBLEContext } from '../components/BLEProvider';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Platform-specific imports
let BleError: any;
let Device: any;

if (Platform.OS !== 'web') {
  const BLEModule = require('react-native-ble-plx');
  BleError = BLEModule.BleError;
  Device = BLEModule.Device;
}

export function useBLE() {
  const {
    devices,
    connectedDevice,
    isScanning,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    disconnectDevice,
    bleManager,
    setConnectedDevice,
    updateDeviceBattery,
    updateDeviceRSSI,
    bluetoothState,
    error,
    clearError,
    isConnected,
  } = useBLEContext();

  // 🔁 Poll RSSI every 3 seconds (only on native platforms)
  useEffect(() => {
    if (Platform.OS === 'web') return;

  let rssiInterval: ReturnType<typeof setInterval> | null = null;

  if (connectedDevice && bleManager) {
      rssiInterval = setInterval(async () => {
        try {
          const updatedDevice = await bleManager.readRSSIForDevice(connectedDevice.id);
          if (updatedDevice?.rssi !== null && updatedDevice?.rssi !== undefined) {
            updateDeviceRSSI(connectedDevice.id, updatedDevice.rssi);
          }
        } catch (err) {
          console.warn('RSSI read failed', err);
        }
      }, 3000);
    }

    return () => {
      if (rssiInterval) clearInterval(rssiInterval);
    };
  }, [connectedDevice, bleManager, updateDeviceRSSI]);

  // 🔋 Read battery level after connecting (only on native platforms)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const fetchBatteryLevel = async () => {
      if (!connectedDevice) return;
      try {
        await connectedDevice.discoverAllServicesAndCharacteristics();
        const services = await connectedDevice.services();
        for (const service of services) {
          if (service.uuid.toLowerCase().includes('180f')) {
            const characteristics = await service.characteristics();
            for (const char of characteristics) {
              if (char.uuid.toLowerCase().includes('2a19')) {
                const batteryData = await char.read();
                const g: any = (globalThis as any) || {};
                const batteryLevel = batteryData.value
                  ? (typeof g.Buffer !== 'undefined'
                      ? g.Buffer.from(batteryData.value, 'base64')[0]
                      : 0)
                  : 0;
                updateDeviceBattery(connectedDevice.id, batteryLevel);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Battery read failed', err);
      }
    };

    fetchBatteryLevel();
  }, [connectedDevice, updateDeviceBattery]);

  // 🔌 Handle real-time disconnection (only on native platforms)
  useEffect(() => {
    if (Platform.OS === 'web' || !connectedDevice || !bleManager) return;

    const subscription = bleManager.onDeviceDisconnected(
      connectedDevice.id,
      (error: any, device: any) => {
        if (error) {
          console.warn('Disconnection error:', (error && (error as any).message) || error);
        }
        setConnectedDevice(null);
      }
    );

    return () => subscription?.remove();
  }, [connectedDevice, bleManager, setConnectedDevice]);

  return {
    // Expose properties/tests expect
    discoveredDevices: devices,
    devices,
    connectedDevice,
    isScanning,
    isConnected,
    bluetoothState,
    error,
    clearError,
    startScan,
    stopScan,
    // connectToDevice supports optional timeout param in provider
    connectToDevice,
    // Provide both names for disconnect
    disconnectFromDevice,
    disconnectDevice,
    // Characteristic wrappers used by BLEManager component
    async readCharacteristic(serviceUUID: string, characteristicUUID: string) {
      if (!connectedDevice || !bleManager) throw new Error('not connected');
      return bleManager.readCharacteristicForDevice(connectedDevice.id, serviceUUID, characteristicUUID);
    },
    async writeCharacteristic(serviceUUID: string, characteristicUUID: string, base64Value: string) {
      if (!connectedDevice || !bleManager) throw new Error('not connected');
      return bleManager.writeCharacteristicWithResponseForDevice(connectedDevice.id, serviceUUID, characteristicUUID, base64Value);
    },
    monitorCharacteristic(serviceUUID: string, characteristicUUID: string, listener: (error: any, characteristic: any) => void) {
      if (!connectedDevice || !bleManager) throw new Error('not connected');
      return bleManager.monitorCharacteristicForDevice(connectedDevice.id, serviceUUID, characteristicUUID, listener);
    }
  };
}