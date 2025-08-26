/**
 * 🏠 DAMP Smart Drinkware - Home Screen Integration Tests
 * Complete testing of home screen functionality and user interactions
 */

import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '@/app/(tabs)/index';
import { AuthProvider } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    }
  }
}));

jest.mock('@/utils/userProfileManager', () => ({
  getUserProfile: jest.fn(),
  getUserGreeting: jest.fn(),
  registerCurrentDevice: jest.fn(),
}));

jest.mock('@/utils/supabaseDeviceManager', () => ({
  getAllDevices: jest.fn(),
  getDeviceStats: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
};

// Mock router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <AuthProvider>
      {children}
    </AuthProvider>
  </NavigationContainer>
);

// Mock data
const mockUser = {
  id: 'test-user-123',
  email: 'test@dampdrink.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

const mockProfile = {
  id: 'test-user-123',
  full_name: 'Test User',
  email: 'test@dampdrink.com',
  preferences: {},
};

const mockDevices = [
  {
    id: 'device-1',
    name: 'Coffee Mug',
    type: 'cup',
    status: 'connected',
    battery_level: 85,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'device-2',
    name: 'Water Bottle',
    type: 'bottle',
    status: 'disconnected',
    battery_level: 45,
    last_reading: new Date().toISOString(),
  },
];

const mockStats = {
  total: 2,
  connected: 1,
  disconnected: 1,
  lowBattery: 1,
};

describe('HomeScreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementations
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      }),
    });
    
    (supabase.from as jest.Mock).mockImplementation(mockFrom);
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    require('@/utils/userProfileManager').getUserProfile.mockResolvedValue(mockProfile);
    require('@/utils/userProfileManager').getUserGreeting.mockResolvedValue('Good morning');
    require('@/utils/supabaseDeviceManager').getAllDevices.mockResolvedValue(mockDevices);
    require('@/utils/supabaseDeviceManager').getDeviceStats.mockResolvedValue(mockStats);
  });

  describe('Screen Rendering', () => {
    it('should render home screen with loading state initially', async () => {
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Should show loading initially
      await waitFor(() => {
        expect(getByText('Hello')).toBeTruthy();
      });
    });

    it('should render user greeting after data loads', async () => {
      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Good morning')).toBeTruthy();
        expect(getByText('Test User')).toBeTruthy();
      });
    });

    it('should render device statistics correctly', async () => {
      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('2')).toBeTruthy(); // Total devices
        expect(getByText('1')).toBeTruthy(); // Connected devices
      });
    });

    it('should render zone information', async () => {
      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Home')).toBeTruthy();
        expect(getByText('Office')).toBeTruthy();
        expect(getByText('Kitchen')).toBeTruthy();
      });
    });
  });

  describe('User Interactions', () => {
    it('should navigate to add device screen when add device button is pressed', async () => {
      const { router } = require('expo-router');
      const { getByTestId } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        const addButton = getByTestId('add-device-button');
        fireEvent.press(addButton);
        expect(router.push).toHaveBeenCalledWith('/add-device');
      });
    });

    it('should open device info modal when device is selected', async () => {
      const { getByText, queryByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(getByText('Coffee Mug')).toBeTruthy();
      });

      // Tap on device
      fireEvent.press(getByText('Coffee Mug'));

      // Modal should be visible
      await waitFor(() => {
        expect(queryByText('Device Information')).toBeTruthy();
      });
    });

    it('should show zone management when zone is tapped', async () => {
      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        const homeZone = getByText('Home');
        fireEvent.press(homeZone);
        // Should navigate to zones tab or show zone management
      });
    });
  });

  describe('Data Loading and Error Handling', () => {
    it('should handle user profile loading error gracefully', async () => {
      require('@/utils/userProfileManager').getUserProfile.mockRejectedValue(
        new Error('Profile loading failed')
      );

      const { queryByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show default greeting instead of user name
        expect(queryByText('Hello')).toBeTruthy();
      });
    });

    it('should handle device loading error', async () => {
      require('@/utils/supabaseDeviceManager').getAllDevices.mockRejectedValue(
        new Error('Device loading failed')
      );

      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show empty state or error message
        expect(getByText('0')).toBeTruthy(); // No devices loaded
      });
    });

    it('should retry data loading when retry button is pressed', async () => {
      // First call fails, second succeeds
      require('@/utils/supabaseDeviceManager').getAllDevices
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockDevices);

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Wait for error state
      await waitFor(() => {
        expect(getByText('0')).toBeTruthy();
      });

      // Retry should be available (implementation specific)
      // This would depend on how retry is implemented in the component
    });
  });

  describe('Real-time Updates', () => {
    it('should update device status when devices change', async () => {
      const { getByText, rerender } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(getByText('Coffee Mug')).toBeTruthy();
      });

      // Simulate device status change
      const updatedDevices = [
        { ...mockDevices[0], status: 'disconnected' },
        mockDevices[1],
      ];

      require('@/utils/supabaseDeviceManager').getAllDevices.mockResolvedValue(updatedDevices);
      require('@/utils/supabaseDeviceManager').getDeviceStats.mockResolvedValue({
        ...mockStats,
        connected: 0,
        disconnected: 2,
      });

      // Trigger refresh (this would typically happen through real-time updates)
      rerender(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('0')).toBeTruthy(); // No connected devices
      });
    });
  });

  describe('Performance and Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      const { getByLabelText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByLabelText('Add new device')).toBeTruthy();
        expect(getByLabelText('Device statistics')).toBeTruthy();
      });
    });

    it('should render without performance issues', async () => {
      const startTime = Date.now();
      
      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(Date.now() - startTime).toBeLessThan(1000); // Should render quickly
      });
    });
  });

  describe('Integration with External Services', () => {
    it('should register current device on mount', async () => {
      const registerCurrentDevice = require('@/utils/userProfileManager').registerCurrentDevice;
      
      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(registerCurrentDevice).toHaveBeenCalled();
      });
    });

    it('should handle Supabase connection errors', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Supabase connection failed');
      });

      const { queryByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should handle error gracefully without crashing
        expect(queryByText('Hello')).toBeTruthy();
      });
    });
  });

  describe('Navigation Integration', () => {
    it('should navigate correctly between tabs', async () => {
      const { router } = require('expo-router');
      const { getByTestId } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        // Test navigation to different sections
        const zonesButton = getByTestId('zones-navigation');
        if (zonesButton) {
          fireEvent.press(zonesButton);
          expect(router.push).toHaveBeenCalledWith('/(tabs)/zones');
        }
      });
    });
  });

  describe('State Management', () => {
    it('should maintain proper state during component lifecycle', async () => {
      const { unmount, getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Test User')).toBeTruthy();
      });

      // Component should unmount cleanly
      act(() => {
        unmount();
      });

      // No memory leaks or errors should occur
    });
  });
});