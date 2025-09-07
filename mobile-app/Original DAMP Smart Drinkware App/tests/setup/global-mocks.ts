/**
 * DAMP Smart Drinkware - Global Mocks Setup
 * Centralized mock configuration for all testing
 * Copyright 2025 WeCr8 Solutions LLC
 */

import { jest } from '@jest/globals';

/**
 * Setup all global mocks for testing environment
 */
export function setupGlobalMocks() {
  // Mock React Native modules
  setupReactNativeMocks();

  // Mock Expo modules
  setupExpoMocks();

  // Mock Third-party libraries
  setupThirdPartyMocks();

  // Mock Platform-specific APIs
  setupPlatformMocks();

  // Mock Performance APIs
  setupPerformanceMocks();
}

/**
 * Setup React Native core mocks
 */
function setupReactNativeMocks() {
  // Mock Dimensions
  jest.doMock('react-native/Libraries/Utilities/Dimensions', () => ({
    get: jest.fn(() => ({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  // Mock Platform
  jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
    OS: 'ios',
    Version: '14.0',
    isPad: false,
    isTesting: true,
    select: jest.fn((config: any) => config.ios || config.default),
  }));

  // Mock AppState
  jest.doMock('react-native/Libraries/AppState/AppState', () => ({
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  // Mock Keyboard
  jest.doMock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    dismiss: jest.fn(),
  }));

  // Mock Animated
  jest.doMock('react-native/Libraries/Animated/Animated', () => ({
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(() => 'listener_id'),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      interpolate: jest.fn(() => ({
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((callback?: ((result: { finished: boolean }) => void) | undefined) => {
        if (typeof callback === 'function') callback({ finished: true });
      }),
      stop: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback?: ((result: { finished: boolean }) => void) | undefined) => {
        if (typeof callback === 'function') callback({ finished: true });
      }),
      stop: jest.fn(),
    })),
    sequence: jest.fn(() => ({
      start: jest.fn((callback?: ((result: { finished: boolean }) => void) | undefined) => {
        if (typeof callback === 'function') callback({ finished: true });
      }),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn((callback?: ((result: { finished: boolean }) => void) | undefined) => {
        if (typeof callback === 'function') callback({ finished: true });
      }),
    })),
    decay: jest.fn(() => ({
      start: jest.fn((callback?: ((result: { finished: boolean }) => void) | undefined) => {
        if (typeof callback === 'function') callback({ finished: true });
      }),
    })),
    loop: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
    })),
    createAnimatedComponent: jest.fn((component) => component),
    __PropsOnlyForTests: jest.fn(),
  }));

  // Mock NetInfo
  jest.doMock('@react-native-community/netinfo', () => ({
    fetch: jest.fn(() => Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    })),
    addEventListener: jest.fn(() => jest.fn()),
  }));
}

/**
 * Setup Expo module mocks
 */
function setupExpoMocks() {
  // Mock Expo Constants
  jest.doMock('expo-constants', () => ({
    default: {
      expoConfig: {
        extra: {
          firebaseApiKey: 'mock-api-key',
          firebaseAuthDomain: 'mock-auth-domain',
          firebaseProjectId: 'mock-project-id',
        }
      },
      platform: {
        ios: {
          platform: 'ios',
          model: 'iPhone',
        }
      },
      isDevice: false,
      appOwnership: 'standalone',
    },
    ExecutionEnvironment: {
      Standalone: 'standalone',
      StoreClient: 'storeClient',
      Bare: 'bare',
    }
  }));

  // Mock Expo StatusBar
  jest.doMock('expo-status-bar', () => ({
    StatusBar: 'StatusBar',
    setStatusBarStyle: jest.fn(),
    setStatusBarBackgroundColor: jest.fn(),
  }));

  // Mock Expo Font
  jest.doMock('expo-font', () => ({
    loadAsync: jest.fn(() => Promise.resolve()),
    isLoaded: jest.fn(() => true),
    isLoading: jest.fn(() => false),
  }));

  // Mock Expo Asset
  jest.doMock('expo-asset', () => ({
    Asset: {
      loadAsync: jest.fn(() => Promise.resolve()),
      fromModule: jest.fn(() => ({
        downloadAsync: jest.fn(() => Promise.resolve()),
      })),
    },
  }));

  // Mock Expo SplashScreen
  jest.doMock('expo-splash-screen', () => ({
    preventAutoHideAsync: jest.fn(() => Promise.resolve()),
    hideAsync: jest.fn(() => Promise.resolve()),
  }));
}

/**
 * Setup third-party library mocks
 */
function setupThirdPartyMocks() {
  // Mock Reanimated
  jest.doMock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
  });

  // Mock Gesture Handler
  jest.doMock('react-native-gesture-handler', () => {
    const View = require('react-native/Libraries/Components/View/View');
    return {
      Swipeable: View,
      DrawerLayout: View,
      State: {},
      ScrollView: View,
      Slider: View,
      Switch: View,
      TextInput: View,
      ToolbarAndroid: View,
      ViewPagerAndroid: View,
      DrawerLayoutAndroid: View,
      WebView: View,
      NativeViewGestureHandler: View,
      TapGestureHandler: View,
      FlingGestureHandler: View,
      ForceTouchGestureHandler: View,
      LongPressGestureHandler: View,
      PanGestureHandler: View,
      PinchGestureHandler: View,
      RotationGestureHandler: View,
      RawButton: View,
      BaseButton: View,
      RectButton: View,
      BorderlessButton: View,
      FlatList: View,
      gestureHandlerRootHOC: jest.fn((component) => component),
      Directions: {},
    };
  });

  // Mock SVG
  jest.doMock('react-native-svg', () => ({
    Svg: 'Svg',
    Circle: 'Circle',
    Ellipse: 'Ellipse',
    G: 'G',
    Text: 'Text',
    TSpan: 'TSpan',
    TextPath: 'TextPath',
    Path: 'Path',
    Polygon: 'Polygon',
    Polyline: 'Polyline',
    Line: 'Line',
    Rect: 'Rect',
    Use: 'Use',
    Image: 'Image',
    Symbol: 'Symbol',
    Defs: 'Defs',
    LinearGradient: 'LinearGradient',
    RadialGradient: 'RadialGradient',
    Stop: 'Stop',
    ClipPath: 'ClipPath',
    Pattern: 'Pattern',
    Mask: 'Mask',
  }));

  // Mock AsyncStorage
  jest.doMock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn((key: string) => Promise.resolve(null)),
    setItem: jest.fn((key: string, value: string) => Promise.resolve()),
    removeItem: jest.fn((key: string) => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  }));
}

/**
 * Setup platform-specific API mocks
 */
function setupPlatformMocks() {
  // Mock global fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      headers: new Headers(),
      url: 'https://example.com',
      type: 'basic',
      redirected: false,
      bodyUsed: false,
      clone: jest.fn(),
    } as unknown as Response)
  );

  // Mock global Headers
  global.Headers = (Headers as any) || class MockHeaders {
    constructor() {}
    append() {}
    delete() {}
    get() { return null; }
    has() { return false; }
    set() {}
    forEach() {}
  } as any;

  // Mock global Request
  global.Request = (Request as any) || class MockRequest {
    constructor(public url: string) {}
  } as any;

  // Mock global Response
  global.Response = (Response as any) || class MockResponse {
    constructor() {}
  } as any;

  // Mock setTimeout/clearTimeout for consistency
  // Use a numeric id return so TypeScript agrees with DOM/Node timer typings
  global.setTimeout = jest.fn((callback: (...args: any[]) => void, delay?: number) => {
    const id = (globalThis as any).__test_timer_id = ((globalThis as any).__test_timer_id || 0) + 1;
    // Invoke callback asynchronously using setImmediate if available, else use Promise
    if (typeof setImmediate === 'function') {
      setImmediate(callback as any);
    } else {
      Promise.resolve().then(() => callback());
    }
    return id as unknown as number;
  }) as any;

  global.clearTimeout = jest.fn((id?: number) => {
    // noop for tests
  }) as any;

  // Mock setInterval/clearInterval with proper function signatures
  global.setInterval = jest.fn((handler: TimerHandler, timeout?: number, ...args: any[]) => {
    // Return a numeric id placeholder
    return 1 as unknown as number;
  }) as any;
  global.clearInterval = jest.fn((id?: number) => {
    // noop
  }) as any;

  // Mock localStorage for web compatibility
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(() => null),
    },
    writable: true,
  });
}

/**
 * Setup performance measurement mocks
 */
function setupPerformanceMocks() {
  // Mock performance.now
  Object.defineProperty(global, 'performance', {
    value: {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => []),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
    },
    writable: true,
  });

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
    // Return a numeric id similar to browsers
    return setTimeout(callback as any, 16) as unknown as number;
  });

  global.cancelAnimationFrame = jest.fn((id: number | undefined | null) => {
    // Ensure we only call clearTimeout for numeric ids
    if (typeof id === 'number') {
      clearTimeout(id);
    }
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })) as any;

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })) as any;
}

export default setupGlobalMocks;