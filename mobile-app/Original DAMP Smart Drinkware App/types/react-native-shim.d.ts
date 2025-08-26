// Minimal shim for react-native types to reduce noise during test-driven development.
// This intentionally keeps types permissive (any) so developers can iterate without strict library types.
declare module 'react-native' {
  import * as React from 'react';

  export const View: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const TouchableOpacity: React.ComponentType<any>;
  export const Button: React.ComponentType<any>;
  export const StyleSheet: any;
  export const Platform: any;
  export const Image: React.ComponentType<any>;
  export const ScrollView: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;
  export const FlatList: React.ComponentType<any>;
  export const SafeAreaView: React.ComponentType<any>;
  export type GestureResponderEvent = any;
  export const Alert: {
    alert: (...args: any[]) => void;
  };
  export const Switch: React.ComponentType<any>;
  export const PermissionsAndroid: any;
  export const ActivityIndicator: React.ComponentType<any>;
  export const Modal: React.ComponentType<any>;
  export const StatusBar: React.ComponentType<any>;
  export class NativeEventEmitter { constructor(...args: any[]); addListener(...args: any[]): any; removeAllListeners(...args: any[]): any }
  export const DeviceEventEmitter: any;
  export default {} as any;
}

export {};
