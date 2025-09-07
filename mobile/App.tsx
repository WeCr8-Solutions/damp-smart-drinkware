/**
 * DAMP Smart Drinkware - Mobile App
 * React Native app for iOS and Android
 * Copyright 2025 WeCr8 Solutions LLC
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  StatusBar,
  Platform,
  View,
  StyleSheet,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Local imports
import { DAMPAuthService } from './services/AuthService';
import { DeviceManager } from './services/DeviceManager';
import { NotificationService } from './services/NotificationService';
import { getPlatformConfig, isDevelopment } from './config/firebase-config';

// Screen imports
import HomeScreen from './screens/HomeScreen';
import DevicesScreen from './screens/DevicesScreen';
import ProfileScreen from './screens/ProfileScreen';
import VotingScreen from './screens/VotingScreen';
import LoginScreen from './screens/LoginScreen';
import DeviceDetailScreen from './screens/DeviceDetailScreen';
import SettingsScreen from './screens/SettingsScreen';

// Component imports
import LoadingScreen from './components/LoadingScreen';
import SafeAreaWrapper from './components/SafeAreaWrapper';

// Types
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Navigation Types
type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  DeviceDetail: { deviceId: string };
  Settings: undefined;
};

type TabParamList = {
  Home: undefined;
  Devices: undefined;
  Voting: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Initialize Firebase
const firebaseConfig = getPlatformConfig();
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);

// Connect to emulators in development
if (isDevelopment()) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.warn('⚠️ Firebase emulator connection failed:', error);
  }
}

// Initialize services
const authService = new DAMPAuthService(auth, firestore);
const deviceManager = new DeviceManager();
const notificationService = new NotificationService();

/**
 * Main Tab Navigator
 */
function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f23',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ fontSize: 20 }}>🏠</View>
          ),
        }}
      />
      <Tab.Screen
        name="Devices"
        component={DevicesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ fontSize: 20 }}>📱</View>
          ),
        }}
      />
      <Tab.Screen
        name="Voting"
        component={VotingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ fontSize: 20 }}>🗳️</View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ fontSize: 20 }}>👤</View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main App Component
 */
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  /**
   * Initialize app services
   */
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize the app
   */
  async function initializeApp() {
    try {
      setIsLoading(true);

      // Initialize notification service
      await notificationService.initialize();

      // Initialize device manager
      await deviceManager.initialize();

      // Set up authentication state listener
      const unsubscribe = authService.onAuthStateChange((user) => {
        setUser(user);
        setIsLoading(false);
      });

      // Handle app state changes
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
          // App has come to the foreground
          handleAppForeground();
        } else if (nextAppState.match(/inactive|background/)) {
          // App has gone to the background
          handleAppBackground();
        }
        setAppState(nextAppState);
      };

      AppState.addEventListener('change', handleAppStateChange);

      setIsInitialized(true);

      return () => {
        unsubscribe();
        AppState.removeEventListener('change', handleAppStateChange);
      };

    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart and try again.',
        [{ text: 'OK' }]
      );
      setIsLoading(false);
    }
  }

  /**
   * Handle app coming to foreground
   */
  async function handleAppForeground() {
    try {
      // Refresh device connections
      await deviceManager.refreshConnections();

      // Check for pending notifications
      await notificationService.checkPendingNotifications();

      // Update user online status
      if (user) {
        await authService.updateUserStatus(user.uid, { isOnline: true });
      }

      console.log('📱 App foregrounded');
    } catch (error) {
      console.error('Error handling app foreground:', error);
    }
  }

  /**
   * Handle app going to background
   */
  async function handleAppBackground() {
    try {
      // Update user offline status
      if (user) {
        await authService.updateUserStatus(user.uid, {
          isOnline: false,
          lastSeen: new Date().toISOString()
        });
      }

      // Save device states
      await deviceManager.saveDeviceStates();

      console.log('📱 App backgrounded');
    } catch (error) {
      console.error('Error handling app background:', error);
    }
  }

  /**
   * Show loading screen while initializing
   */
  if (!isInitialized || isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaWrapper>
          <LoadingScreen />
        </SafeAreaWrapper>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
        backgroundColor="#0f0f23"
        translucent={false}
      />

      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0f23' },
          }}
        >
          {user ? (
            // User is authenticated
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen
                name="DeviceDetail"
                component={DeviceDetailScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Device Details',
                  headerStyle: {
                    backgroundColor: '#0f0f23',
                  },
                  headerTintColor: '#ffffff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Settings',
                  headerStyle: {
                    backgroundColor: '#0f0f23',
                  },
                  headerTintColor: '#ffffff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
            </>
          ) : (
            // User is not authenticated
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
});