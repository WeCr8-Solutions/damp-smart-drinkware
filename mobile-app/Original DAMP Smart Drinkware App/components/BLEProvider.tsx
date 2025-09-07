import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

// Platform-specific imports
let BleManager: any;
let Device: any;
let Subscription: any;

if (Platform.OS !== 'web') {
  const BLEModule = require('react-native-ble-plx');
  BleManager = BLEModule.BleManager;
  Device = BLEModule.Device;
  Subscription = BLEModule.Subscription;
}

type BLEContextType = {
  devices: any[];
  connectedDevice: any | null;
  discoveredDevices: any[];
  startScan: () => void;
  stopScan: () => void;
  connectToDevice: (deviceId: string, timeout?: number) => Promise<void>;
  disconnectFromDevice: () => Promise<void>;
  // alias expected by tests
  disconnectDevice: () => Promise<void>;
  isConnected: boolean;
  bluetoothState: string;
  error: string | null;
  clearError: () => void;
  isScanning: boolean;
  bleManager?: any;
  setConnectedDevice: (device: any | null) => void;
  updateDeviceBattery: (deviceId: string, batteryLevel: number) => void;
  updateDeviceRSSI: (deviceId: string, rssi: number) => void;
};

const BLEContext = createContext<BLEContextType | undefined>(undefined);

export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const managerRef = useRef<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<any | null>(null);
  const [bluetoothState, setBluetoothState] = useState<string>('Unknown');
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanSubscription = useRef<any | null>(null);
  const stateSubscription = useRef<any | null>(null);

  useEffect(() => {
    // Only initialize BLE manager on native platforms
    if (Platform.OS !== 'web' && BleManager) {
      managerRef.current = new BleManager();
      // initial state
      try {
        managerRef.current.state?.().then((s: string) => setBluetoothState(s));
      } catch (e) {
        // ignore
      }
      // subscribe to state changes
      try {
        stateSubscription.current = managerRef.current.onStateChange((s: string) => {
          setBluetoothState(s);
        });
      } catch (e) {
        // ignore
      }
    }

    return () => {
      if (managerRef.current && Platform.OS !== 'web') {
        managerRef.current.destroy();
      }
  stateSubscription.current?.remove?.();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      return false; // BLE not supported on web
    }

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return Object.values(granted).every(val => val === PermissionsAndroid.RESULTS.GRANTED);
    }
    return true;
  };

  const startScan = async (timeout?: number) => {
    if (Platform.OS === 'web' || !managerRef.current) {
      console.warn('BLE scanning not supported on web platform');
      return;
    }

    const granted = await requestPermissions();
    if (!granted) return;

    setIsScanning(true);
    setDevices([]);

    try {
      scanSubscription.current = managerRef.current.startDeviceScan(null, null, (error: any, device: any) => {
        if (error) {
          console.warn('Scan error:', error);
          setError((error as any)?.message || String(error));
          setIsScanning(false);
          return;
        }

        if (device && device.name && !devices.find(d => d.id === device.id)) {
          setDevices(prev => [...prev, device]);
        }
      });
    } catch (e) {
      console.warn('startDeviceScan failed', e);
      setError((e as any)?.message || String(e));
      setIsScanning(false);
      return;
    }

    const stopAfter = typeof timeout === 'number' ? timeout : 10000;
    setTimeout(() => {
      stopScan();
    }, stopAfter); // Stop after timeout
  };

  const stopScan = () => {
    if (Platform.OS === 'web' || !managerRef.current) {
      return;
    }

    scanSubscription.current?.remove?.();
    scanSubscription.current = null;
    try {
      managerRef.current.stopDeviceScan();
    } catch (e) {
      // ignore
    }
    setIsScanning(false);
  };

  const connectToDevice = async (deviceId: string, timeout?: number) => {
    if (Platform.OS === 'web' || !managerRef.current) {
      console.warn('BLE connection not supported on web platform');
      return;
    }

    try {
      const connectPromise = managerRef.current.connectToDevice(deviceId);

      let device;
      if (typeof timeout === 'number') {
        device = await Promise.race([
          connectPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('connection timeout')), timeout)),
        ]);
      } else {
        device = await connectPromise;
      }

      await device.discoverAllServicesAndCharacteristics();
      setConnectedDevice(device);
    } catch (error) {
      console.warn('Connection error:', error);
      setError(error?.message || String(error));
    }
  };

  const disconnectFromDevice = async () => {
    if (Platform.OS === 'web' || !managerRef.current || !connectedDevice) {
      return;
    }

    try {
      await managerRef.current.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    } catch (error) {
      console.warn('Disconnection error:', error);
      setError(error?.message || String(error));
    }
  };

  // Alias expected by tests
  const disconnectDevice = disconnectFromDevice;

  const clearError = () => setError(null);

  const updateDeviceBattery = (deviceId: string, batteryLevel: number) => {
    if (Platform.OS === 'web') return;

    setDevices(prev => prev.map(device =>
      device.id === deviceId ? { ...device, batteryLevel } : device
    ));
  };

  const updateDeviceRSSI = (deviceId: string, rssi: number) => {
    if (Platform.OS === 'web') return;

    setDevices(prev => prev.map(device =>
      device.id === deviceId ? { ...device, rssi } : device
    ));

    if (connectedDevice && connectedDevice.id === deviceId) {
      setConnectedDevice((prev: any) => prev ? { ...prev, rssi } : null);
    }
  };

  return (
    <BLEContext.Provider
      value={{
  devices,
  discoveredDevices: devices,
  connectedDevice,
  isConnected: !!connectedDevice,
  startScan,
  stopScan,
  connectToDevice,
  disconnectFromDevice,
  disconnectDevice,
  isScanning,
  bluetoothState,
  error,
  clearError,
  bleManager: managerRef.current,
  setConnectedDevice,
  updateDeviceBattery,
  updateDeviceRSSI,
      }}
    >
      {children}
    </BLEContext.Provider>
  );
};

export const useBLEContext = () => {
  const context = useContext(BLEContext);
  if (!context) throw new Error('useBLEContext must be used within BLEProvider');
  return context;
};