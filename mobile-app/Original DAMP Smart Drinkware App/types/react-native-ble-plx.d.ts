/// <reference types="jest" />

declare module 'react-native-ble-plx' {
  // Loosen BLE typings for the test environment so Jest mocks and
  // .mockResolvedValue/.mockImplementation are recognized by TS.

  export class BleError extends Error {
    constructor(message?: string, code?: any);
    code?: any;
  }

  export class Device {
    [key: string]: any;
  }

  // Prefer an interface for merging with other library augmentations.
  export interface Characteristic {
    // Tests treat characteristic.value as a string in most places.
    value: string;
    [key: string]: any;
  }

  // Make BleManager's commonly used methods Jest mocks so test files can call
  // .mockResolvedValue/.mockImplementation without type errors.
  export class BleManager {
    constructor();
    startDeviceScan: jest.Mock<any, any>;
    stopDeviceScan: jest.Mock<any, any>;
    connectToDevice: jest.Mock<any, any>;
    discoverAllServicesAndCharacteristicsForDevice: jest.Mock<any, any>;
    readCharacteristicForDevice: jest.Mock<any, any>;
    writeCharacteristicWithResponseForDevice: jest.Mock<any, any>;
    monitorCharacteristicForDevice: jest.Mock<any, any>;
    cancelDeviceConnection: jest.Mock<any, any>;
    destroy: jest.Mock<any, any>;
    onStateChange: jest.Mock<any, any>;
    [key: string]: any;
  }

  export default BleManager;
}
