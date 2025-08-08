import { auth, db } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { FeatureFlags } from '@/config/feature-flags';

/**
 * 🔥 DAMP Smart Drinkware - User Profile Manager (Firebase Only)
 * Owner: zach@wecr8.info
 */

// Types
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  } | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface DeviceRegistration {
  id: string;
  user_id: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  device_name: string;
  operating_system: string | null;
  registered_at: string;
  last_active: string;
  status: 'active' | 'inactive';
  device_metadata: Record<string, any> | null;
}

export interface UserGreeting {
  id: string;
  user_id: string;
  greeting_message: string;
  language: string;
  time_context: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Get the current user's profile from Firebase Firestore
 */
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  if (!FeatureFlags.FIREBASE) {
    console.warn('Firebase disabled - returning mock profile');
    return getMockProfile();
  }

  try {
    const currentUser = auth.currentUser;
    const targetUserId = userId || currentUser?.uid;
    
    if (!targetUserId) return null;
    
    const userDocRef = doc(db, 'profiles', targetUserId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create a default profile if it doesn't exist
      const defaultProfile: UserProfile = {
        id: targetUserId,
        full_name: currentUser?.displayName || null,
        email: currentUser?.email || null,
        phone: null,
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      
      await setDoc(userDocRef, defaultProfile);
      return defaultProfile;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return getMockProfile();
  }
}

/**
 * Update the current user's profile in Firebase Firestore
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  if (!FeatureFlags.FIREBASE) {
    console.warn('Firebase disabled - returning mock profile');
    return getMockProfile();
  }

  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) return null;
    
    const userDocRef = doc(db, 'profiles', currentUser.uid);
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await updateDoc(userDocRef, updateData);
    
    // Return the updated profile
    return await getUserProfile(currentUser.uid);
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
}

/**
 * Register the current device for the user in Firebase Firestore
 */
export async function registerCurrentDevice(): Promise<DeviceRegistration | null> {
  if (!FeatureFlags.FIREBASE) {
    console.warn('Firebase disabled - returning mock device');
    return getMockDevice();
  }

  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) return null;
    
    const deviceId = `${currentUser.uid}_${getDeviceType()}_${Date.now()}`;
    const deviceRegistration: DeviceRegistration = {
      id: deviceId,
      user_id: currentUser.uid,
      device_type: getDeviceType(),
      device_name: Device.deviceName || 'Unknown Device',
      operating_system: getOperatingSystem(),
      registered_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      status: 'active',
      device_metadata: {
        brand: Device.brand,
        modelName: Device.modelName,
        osVersion: Device.osVersion,
        platform: Platform.OS,
      }
    };
    
    const deviceDocRef = doc(db, 'user_devices', deviceId);
    await setDoc(deviceDocRef, deviceRegistration);
    
    return deviceRegistration;
  } catch (error) {
    console.error('Error in registerCurrentDevice:', error);
    return getMockDevice();
  }
}

/**
 * Get all devices registered to the current user from Firebase Firestore
 */
export async function getUserDevices(userId?: string): Promise<DeviceRegistration[]> {
  if (!FeatureFlags.FIREBASE) {
    console.warn('Firebase disabled - returning mock devices');
    return [getMockDevice()];
  }

  try {
    const currentUser = auth.currentUser;
    const targetUserId = userId || currentUser?.uid;
    
    if (!targetUserId) return [];
    
    const devicesQuery = query(
      collection(db, 'user_devices'),
      where('user_id', '==', targetUserId)
    );
    
    const querySnapshot = await getDocs(devicesQuery);
    const devices: DeviceRegistration[] = [];
    
    querySnapshot.forEach((doc) => {
      devices.push(doc.data() as DeviceRegistration);
    });
    
    return devices;
  } catch (error) {
    console.error('Error in getUserDevices:', error);
    return [];
  }
}

/**
 * Get appropriate greeting for the current user based on time of day
 */
export async function getUserGreeting(name?: string): Promise<string> {
  if (!FeatureFlags.FIREBASE) {
    return getDefaultGreeting();
  }

  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) return getDefaultGreeting();
    
    // Try to get user profile for personalized greeting
    const profile = await getUserProfile(currentUser.uid);
    const userName = name || profile?.full_name || currentUser.displayName;
    
    const timeGreeting = getDefaultGreeting();
    
    if (userName) {
      return `${timeGreeting}, ${userName.split(' ')[0]}!`;
    }
    
    return timeGreeting;
  } catch (error) {
    console.error('Error in getUserGreeting:', error);
    return getDefaultGreeting();
  }
}

/**
 * Create or update a custom greeting for the user in Firebase Firestore
 */
export async function setCustomGreeting(
  message: string, 
  timeContext: TimeOfDay = 'any'
): Promise<UserGreeting | null> {
  if (!FeatureFlags.FIREBASE) {
    console.warn('Firebase disabled - cannot set custom greeting');
    return null;
  }

  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) return null;
    
    const greetingId = `${currentUser.uid}_${timeContext}`;
    const customGreeting: UserGreeting = {
      id: greetingId,
      user_id: currentUser.uid,
      greeting_message: message,
      language: 'en', // Default to English
      time_context: timeContext,
      is_custom: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const greetingDocRef = doc(db, 'user_greetings', greetingId);
    await setDoc(greetingDocRef, customGreeting);
    
    return customGreeting;
  } catch (error) {
    console.error('Error in setCustomGreeting:', error);
    return null;
  }
}

/**
 * Helper function to get device type
 */
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (Platform.OS === 'web') {
    // Simple detection for web
    const userAgent = navigator.userAgent.toLowerCase();
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
    
    if (isTablet) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent)) return 'mobile';
    return 'desktop';
  } else {
    // For native platforms
    if (Device.deviceType === Device.DeviceType.TABLET) return 'tablet';
    if (Device.deviceType === Device.DeviceType.PHONE) return 'mobile';
    return 'desktop'; // Default fallback
  }
}

/**
 * Helper function to get operating system
 */
function getOperatingSystem(): string {
  if (Platform.OS === 'web') {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Win') !== -1) return 'Windows';
    if (userAgent.indexOf('Mac') !== -1) return 'MacOS';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    if (userAgent.indexOf('Android') !== -1) return 'Android';
    if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) return 'iOS';
    return 'Unknown';
  } else {
    return Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS;
  }
}

/**
 * Helper function to get time of day
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Helper function to get default greeting based on time of day
 */
function getDefaultGreeting(timeContext?: TimeOfDay): string {
  const time = timeContext || getTimeOfDay();
  
  switch (time) {
    case 'morning':
      return 'Good morning';
    case 'afternoon':
      return 'Good afternoon';
    case 'evening':
      return 'Good evening';
    case 'night':
      return 'Good night';
    default:
      return 'Hello';
  }
}

/**
 * Mock profile for when Firebase is disabled
 */
function getMockProfile(): UserProfile {
  return {
    id: 'mock-user-id',
    full_name: 'Demo User',
    email: 'demo@damp.com',
    phone: null,
    preferences: {
      theme: 'system',
      language: 'en',
      notifications: true,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  };
}

/**
 * Mock device for when Firebase is disabled
 */
function getMockDevice(): DeviceRegistration {
  return {
    id: 'mock-device-id',
    user_id: 'mock-user-id',
    device_type: getDeviceType(),
    device_name: Device.deviceName || 'Demo Device',
    operating_system: getOperatingSystem(),
    registered_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    status: 'active',
    device_metadata: {
      brand: Device.brand,
      modelName: Device.modelName,
      osVersion: Device.osVersion,
      platform: Platform.OS,
    }
  };
}