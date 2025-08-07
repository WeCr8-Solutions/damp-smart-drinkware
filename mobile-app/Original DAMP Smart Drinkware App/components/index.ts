/**
 * 🧩 DAMP Smart Drinkware - Components Index
 * Central export hub for all reusable components ensuring circular connectivity
 */

// Import and re-export all components for centralized access
// This prevents dead ends and ensures all components are accessible

// BLE Management Components
export { default as BLEManager } from './BLEManager';
export { default as BLEProvider } from './BLEProvider';

// UI Components
export * from './modals';
export { SettingsCard, AccountSettingsCard, SecuritySettingsCard, PremiumSettingsCard } from './SettingsCard';
export { default as ProfileAvatar, SmallProfileAvatar, LargeProfileAvatar, ReadOnlyProfileAvatar } from './ProfileAvatar';
export { default as OfflineIndicator, ConnectionStatusIndicator, OfflineModeBadge } from './OfflineIndicator';

// Error handling
export { AppErrorBoundary, withErrorBoundary, useErrorReporting } from './ErrorBoundary';

// Device and Data Components
export { default as DeviceList } from './DeviceList';
export { default as DeviceCard } from './DeviceCard';

// Category and Navigation Components
export { default as CategorySlider } from './CategorySlider';

// Base component types for consistency across the app
export interface ComponentExports {
  BLEManager: typeof import('./BLEManager');
  BLEProvider: typeof import('./BLEProvider');
  CategorySlider: typeof import('./CategorySlider');
  modals: typeof import('./modals');
}

// Component connectivity map for circular system validation
export const componentConnections = {
  // Components that use contexts
  contextConsumers: [
    'BLEManager',
    'BLEProvider',
    'CategorySlider'
  ],
  
  // Components that use hooks
  hookConsumers: [
    'BLEManager',
    'BLEProvider'
  ],
  
  // Components that use utilities
  utilityConsumers: [
    'BLEManager',
    'CategorySlider'
  ],
  
  // Cross-component dependencies
  dependencies: {
    'BLEManager': ['@/hooks/useBLE', '@/contexts/AuthContext', '@/utils/deviceManager'],
    'BLEProvider': ['@/hooks/useBLE', '@/types/global'],
    'CategorySlider': ['@/utils', '@/types'],
  }
};

// Type definitions for component props inheritance
export interface BaseProps {
  children?: React.ReactNode;
  style?: any;
  testID?: string;
}

export interface BLEComponentProps extends BaseProps {
  onDeviceFound?: (device: any) => void;
  onDeviceConnected?: (device: any) => void;
  onDeviceDisconnected?: (device: any) => void;
  onError?: (error: any) => void;
}

export interface NavigationProps extends BaseProps {
  navigation?: any;
  route?: any;
}

// Component registry for dynamic loading and validation
export const componentRegistry: Record<string, React.ComponentType<any>> = {
  // Will be populated as components are loaded
};

// Validation function to ensure all components are properly connected
export function validateComponentConnectivity(): {
  connected: string[];
  disconnected: string[];
  circularRefs: string[];
} {
  const connected: string[] = [];
  const disconnected: string[] = [];
  const circularRefs: string[] = [];

  // Check each component's dependencies
  Object.entries(componentConnections.dependencies).forEach(([component, deps]) => {
    try {
      // Attempt to resolve each dependency
      deps.forEach(dep => {
        // This would be implemented with actual module resolution
        // For now, we're setting up the structure
      });
      connected.push(component);
    } catch (error) {
      disconnected.push(component);
    }
  });

  return { connected, disconnected, circularRefs };
}

// Export component metadata for development and debugging
export const componentMetadata = {
  totalComponents: Object.keys(componentRegistry).length,
  connectedComponents: componentConnections.contextConsumers.length,
  lastUpdated: new Date().toISOString(),
  dependencies: componentConnections,
};

// Ensure circular connectivity by re-exporting types
export type { BLEDevice, DeviceReading } from '@/types';
export type { AppUser, AppSettings } from '@/types/global';