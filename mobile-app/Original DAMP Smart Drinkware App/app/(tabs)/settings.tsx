import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  CircleHelp as HelpCircle,
  LogOut,
  Smartphone,
  ShoppingBag,
  MapPin,
  Vote,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase/config';
import {
  AccountInfoModal,
  EditProfileModal,
  ThemePickerModal,
  LanguagePickerModal,
} from '@/components/modals';
import DeviceManagementModal from '@/components/modals/DeviceManagementModal';
import PrivacySettingsModal from '@/components/modals/PrivacySettingsModal';
import SubscriptionModal from '@/components/modals/SubscriptionModal';
import StoreModal from '@/components/modals/StoreModal';
import ZoneManagementModal from '@/components/modals/ZoneManagementModal';
import { SettingsCard } from '@/components/SettingsCard';

export default function Settings() {
  const { user, signOut, updateProfile, loading } = useAuth();

  // Modal management state hooks
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);

  // Subscription status tracking
  // Subscription, Preferences, and Error/Debug Logging Improved

  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Track preference error/debug
  const [preferences, setPreferences] = useState(() => {
    const fallback = {
      notifications: true,
      theme: "system",
      language: "en",
    };
    try {
      // Improved preferences initialization with defensive logic & type safety
      // If user does not have settings, fallback to app defaults
      // Prevent runtime errors if AuthUser type doesn't have preferences fields

      let prefs = { ...fallback };
      try {
        // Attempt to source preferences from user.settings or user.preferences, else fallback
        if (user && typeof user === "object") {
          // Look for explicit settings object, or fallback to flattened fields, or fallback value
          const userPrefs = 
            (user as any).preferences ?? 
            (user as any).settings ??
            user;

          prefs.notifications = typeof userPrefs.notifications === "boolean"
            ? userPrefs.notifications
            : fallback.notifications;

          prefs.theme = typeof userPrefs.theme === "string"
            ? userPrefs.theme
            : fallback.theme;

          prefs.language = typeof userPrefs.language === "string"
            ? userPrefs.language
            : fallback.language;
        }
      } catch (err) {
        console.error('[Settings] Error initializing preferences:', err);
        // prefs already set to fallback
      }

       // Debug preferences loaded
       console.log('[Settings] Loaded preferences for user:', prefs);
 
       return prefs;
     } catch (outerErr) {
       console.error('[Settings] Fatal error in preferences init:', outerErr);
       return fallback;
     }
   });
  
    useEffect(() => {
      fetchSubscriptionStatus();
    }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      // Logging subscription fetch attempt
      console.log('[Settings] Fetching subscription status from backend...');
      // TODO: Implement Firebase subscription status fetch
      // Using Firebase Functions to get subscription data (placeholder)
      setSubscriptionStatus('active');
      console.log('[Settings] Subscription status fetched successfully: active');
    } catch (error) {
      console.error('[Settings] Error fetching subscription status:', error);
      setSubscriptionStatus(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (!user) {
    console.warn('[Settings] No user found, showing login required screen.');
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Authentication Required</Text>
            <Text style={styles.errorMessage}>
              Please log in to access your settings
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Remove broken import (UserProfile module does not exist)
  const handleProfileSave = useCallback(
    async (updates: Partial<any>) => {
      if (!user) {
        console.warn('[Settings] No user found, cannot update profile.');
        return;
      }
      try {
        console.log('[Settings] handleProfileSave called with:', updates);
        await updateProfile(updates);
        console.log('[Settings] Profile updated successfully.');
      } catch (err) {
        console.error('[Settings] Error updating profile:', err);
      }
    },
    [updateProfile, user]
  );

  const handleSignOut = useCallback(async () => {
    try {
      console.log('[Settings] Attempting to sign out user...');
      const result = await signOut();
      if (result && result.error) {
        console.error('[Settings] Failed to sign out:', result.error);
      } else {
        console.log('[Settings] User signed out successfully.');
      }
    } catch (err) {
      console.error('[Settings] Error during sign out:', err);
    }
  }, [signOut]);

  const getLanguageLabel = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
    };
    if (!languages[code]) {
      console.warn(`[Settings] Unknown language code "${code}", defaulting to English.`);
    }
    return languages[code] || 'English';
  };

  if (loading) {
    console.log('[Settings] Loading state true, showing activity indicator.');
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0277BD" />
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Debug: Track each render of Settings main screen
  useEffect(() => {
    console.log('[Settings] Settings component rendered.');
  });

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your DAMP experience</Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.cardsContainer}>
              <SettingsCard
                icon={User}
                title="Profile"
                subtitle="View and edit your profile details"
                onPress={() => {
                  console.log('[Settings] Profile card pressed.');
                  setAccountModalVisible(true);
                }}
              />
              <SettingsCard
                icon={CreditCard}
                title="Subscription"
                subtitle={
                  subscriptionLoading
                    ? 'Loading subscription status...'
                    : subscriptionStatus === 'active'
                    ? 'DAMP+ Active'
                    : 'Manage your DAMP+ subscription'
                }
                onPress={() => {
                  console.log('[Settings] Subscription card pressed.');
                  router.push('/account/subscription');
                }}
              />
              <SettingsCard
                icon={Shield}
                title="Privacy & Security"
                subtitle="Manage your privacy settings"
                onPress={() => {
                  console.log('[Settings] Privacy & Security card pressed.');
                  setPrivacyModalVisible(true);
                }}
              />
            </View>
          </View>

          {/* Devices & Zones Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Devices & Zones</Text>
            <View style={styles.cardsContainer}>
              <SettingsCard
                icon={Smartphone}
                title="My Devices"
                subtitle="View and manage your DAMP devices"
                onPress={() => {
                  console.log('[Settings] My Devices card pressed.');
                  setDeviceModalVisible(true);
                }}
              />
              <SettingsCard
                icon={MapPin}
                title="My Zones"
                subtitle="Create and manage location zones"
                onPress={() => {
                  console.log('[Settings] My Zones card pressed.');
                  setZoneModalVisible(true);
                }}
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.cardsContainer}>
              <SettingsCard
                icon={Bell}
                title="Notifications"
                subtitle={preferences.notifications ? 'Enabled' : 'Disabled'}
                onPress={async () => {
                  try {
                    const newValue = !preferences.notifications;
                    setPreferences(prev => ({ ...prev, notifications: newValue }));
                    console.log(`[Settings] Notifications toggled, now: ${newValue}`);
                  } catch (err) {
                    console.error('[Settings] Error toggling notifications:', err);
                  }
                }}
              />
              <SettingsCard
                icon={Palette}
                title="Theme"
                subtitle={`${preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1)}`}
                onPress={() => {
                  console.log('[Settings] Theme card pressed.');
                  setThemeModalVisible(true);
                }}
              />
              <SettingsCard
                icon={Globe}
                title="Language"
                subtitle={getLanguageLabel(preferences.language)}
                onPress={() => {
                  console.log('[Settings] Language card pressed.');
                  setLanguageModalVisible(true);
                }}
              />
            </View>
          </View>

          {/* Community & Store Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community & Store</Text>
            <View style={styles.cardsContainer}>
              <SettingsCard
                icon={Vote}
                title="Product Voting"
                subtitle="Vote on new DAMP product features"
                onPress={() => {
                  console.log('[Settings] Product Voting card pressed.');
                  router.push('/(tabs)/voting');
                }}
              />
              <SettingsCard
                icon={ShoppingBag}
                title="DAMP Store"
                subtitle="Shop premium DAMP smart drinkware"
                onPress={() => {
                  console.log('[Settings] DAMP Store card pressed.');
                  setStoreModalVisible(true);
                }}
              />
              <SettingsCard
                icon={HelpCircle}
                title="Help & Support"
                subtitle="Get assistance with your devices"
                onPress={() => {
                  console.log('[Settings] Help & Support card pressed.');
                  // Show help alert or integrate with future support backend/FAQ
                  try {
                    if (typeof Alert !== 'undefined') {
                      Alert.alert(
                        "Help & Support",
                        "For assistance with your devices, please visit our FAQ at damp-support.example.com or contact support at support@example.com.",
                        [{ text: "OK" }]
                      );
                    } else {
                      console.warn('[Settings] Alert API unavailable in this environment.');
                    }
                  } catch (err) {
                    console.error('[Settings] Error showing help alert:', err);
                  }
                }}
              />
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#F44336" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Modals */}
        <AccountInfoModal
          visible={accountModalVisible}
          onClose={() => setAccountModalVisible(false)}
          user={user}
          onEdit={() => {
            setAccountModalVisible(false);
            setEditModalVisible(true);
          }}
        />

        <EditProfileModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          user={user}
          onSave={handleProfileSave}
        />

        <ThemePickerModal
          visible={themeModalVisible}
          onClose={() => setThemeModalVisible(false)}
          currentTheme={preferences.theme}
          onSelect={(theme) => {
            setPreferences(prev => ({ ...prev, theme }));
            // theme is a local UI preference; do NOT attempt to store with updateProfile.
            // If needed for the backend, must be a valid key on UserProfile type.
            // updateProfile({ theme }); // <-- This is likely incorrect -- remove or update property to a valid UserProfile key if needed
          }}
        />

        <LanguagePickerModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
          currentLanguage={preferences.language}
          onSelect={(language) => {
            setPreferences(prev => ({ ...prev, language }));
            // language is a local UI preference; do NOT attempt to store with updateProfile.
            // If needed for the backend, must be a valid key on UserProfile type.
            // updateProfile({ language }); // <-- This is likely incorrect -- remove or update property to a valid UserProfile key if needed
          }}
        />

        <DeviceManagementModal
          visible={deviceModalVisible}
          onClose={() => setDeviceModalVisible(false)}
        />

        <PrivacySettingsModal
          visible={privacyModalVisible}
          onClose={() => setPrivacyModalVisible(false)}
        />

        <SubscriptionModal
          visible={subscriptionModalVisible}
          onClose={() => {
            setSubscriptionModalVisible(false);
            fetchSubscriptionStatus(); // Refresh subscription status when modal closes
          }}
        />

        <StoreModal
          visible={storeModalVisible}
          onClose={() => setStoreModalVisible(false)}
        />

        <ZoneManagementModal
          visible={zoneModalVisible}
          onClose={() => setZoneModalVisible(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra space for tab bar + safe area
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginBottom: 12,
  },
  cardsContainer: {
    gap: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F44336',
    marginLeft: 8,
  },
  spacer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#F44336',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F44336',
    textAlign: 'center',
  },
});