// Permissive override to reduce TypeScript noise in tests.
// This file intentionally widens types from the real module so Jest mocks
// and test helpers can attach `.mockResolvedValue` / `.mockImplementation`.
declare module 'react-native-ble-plx' {
  // Make BleManager and other exports permissive in test environment
  // Exporting as `any` ensures test files can call Jest mock helpers freely.
  export const BleManager: any;
  export const Device: any;
  export const Characteristic: any;
  export const Service: any;
  export class BleError extends Error {
    constructor(message?: any, code?: any);
    code?: any;
  }
  export default BleManager;
}

export {};
