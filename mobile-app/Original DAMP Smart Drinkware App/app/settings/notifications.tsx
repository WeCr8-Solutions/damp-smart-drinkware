/**
 * 🔔 DAMP Smart Drinkware - Push Notification Settings
 * Complete notification management and preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Clock,
  Droplets,
  Battery,
  Bluetooth,
  MapPin,
  Crown,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase/config';
import * as Notifications from 'expo-notifications';
import { SettingsCard } from '@/components/SettingsCard';

interface NotificationSettings {
  hydrationReminders: boolean;
  deviceStatus: boolean;
  bluetoothAlerts: boolean;
  batteryAlerts: boolean;
  zoneNotifications: boolean;
  goalAchievements: boolean;
  marketingUpdates: boolean;
  systemUpdates: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminderInterval: number;
}

export default function NotificationSettingsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [settings, setSettings] = useState<NotificationSettings>({
    hydrationReminders: true,
    deviceStatus: true,
    bluetoothAlerts: true,
    batteryAlerts: true,
    zoneNotifications: false,
    goalAchievements: true,
    marketingUpdates: false,
    systemUpdates: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    soundEnabled: true,
    vibrationEnabled: true,
    reminderInterval: 60, // minutes
  });

  const reminderIntervals = [
    { value: 30, label: 'Every 30 minutes' },
    { value: 60, label: 'Every hour' },
    { value: 120, label: 'Every 2 hours' },
    { value: 180, label: 'Every 3 hours' },
    { value: 240, label: 'Every 4 hours' },
  ];

  useEffect(() => {
    loadNotificationSettings();
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      // TODO: Implement Firebase notification settings fetch
      // For now, using default settings
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveNotificationSettings = async (newSettings: NotificationSettings) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          notification_settings: newSettings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings.');
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | number | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const requestNotificationPermission = async () => {
    try {
      setLoading(true);
      
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        Alert.alert(
          'Notifications Enabled',
          'You\'ll now receive helpful hydration reminders and device updates.'
        );
      } else if (status === 'denied') {
        Alert.alert(
          'Notifications Blocked',
          'To enable notifications, please go to your device Settings > Notifications > DAMP Smart Drinkware and turn on notifications.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Notifications.openNotificationSettingsAsync() },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert('Error', 'Failed to request notification permission.');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    if (permissionStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications first to test them.'
      );
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Hydration Reminder',
          body: 'Time for a refreshing drink! Your DAMP device is ready.',
          sound: settings.soundEnabled,
        },
        trigger: {
          seconds: 1,
        },
      });

      Alert.alert(
        'Test Notification Sent',
        'You should receive a notification in a moment!'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const PermissionBanner = () => {
    if (permissionStatus === 'granted') return null;

    return (
      <View style={[
        styles.permissionBanner,
        permissionStatus === 'denied' ? styles.permissionDenied : styles.permissionRequest
      ]}>
        <View style={styles.permissionContent}>
          {permissionStatus === 'denied' ? <BellOff size={24} color="#F44336" /> : <Bell size={24} color="#FF9800" />}
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>
              {permissionStatus === 'denied' ? 'Notifications Disabled' : 'Enable Notifications'}
            </Text>
            <Text style={styles.permissionSubtitle}>
              {permissionStatus === 'denied'
                ? 'Go to Settings to enable notifications for hydration reminders'
                : 'Get helpful reminders and stay updated with your devices'
              }
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={permissionStatus === 'denied' ? () => Notifications.openNotificationSettingsAsync() : requestNotificationPermission}
          disabled={loading}
        >
          <Text style={styles.permissionButtonText}>
            {permissionStatus === 'denied' ? 'Open Settings' : 'Enable'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0277BD" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <PermissionBanner />

          {/* Core Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hydration & Health</Text>
            <Text style={styles.sectionSubtitle}>
              Stay on top of your hydration goals
            </Text>

            <SettingsCard
              title="Hydration Reminders"
              subtitle="Smart reminders based on your drinking patterns"
              icon={Droplets}
              rightElement={
                <Switch
                  value={settings.hydrationReminders}
                  onValueChange={(value) => updateSetting('hydrationReminders', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.hydrationReminders ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />

            <SettingsCard
              title="Goal Achievements"
              subtitle="Celebrate your hydration milestones"
              icon={Crown}
              rightElement={
                <Switch
                  value={settings.goalAchievements}
                  onValueChange={(value) => updateSetting('goalAchievements', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.goalAchievements ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />

            {settings.hydrationReminders && (
              <View style={styles.subSetting}>
                <Text style={styles.subSettingTitle}>Reminder Frequency</Text>
                <View style={styles.intervalOptions}>
                  {reminderIntervals.map((interval) => (
                    <TouchableOpacity
                      key={interval.value}
                      style={[
                        styles.intervalOption,
                        settings.reminderInterval === interval.value && styles.selectedInterval
                      ]}
                      onPress={() => updateSetting('reminderInterval', interval.value)}
                    >
                      <Text style={[
                        styles.intervalText,
                        settings.reminderInterval === interval.value && styles.selectedIntervalText
                      ]}>
                        {interval.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Device Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Status</Text>
            <Text style={styles.sectionSubtitle}>
              Stay informed about your devices
            </Text>

            <SettingsCard
              title="Device Connectivity"
              subtitle="Bluetooth connection alerts"
              icon={Bluetooth}
              rightElement={
                <Switch
                  value={settings.bluetoothAlerts}
                  onValueChange={(value) => updateSetting('bluetoothAlerts', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.bluetoothAlerts ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />

            <SettingsCard
              title="Battery Alerts"
              subtitle="Low battery warnings"
              icon={Battery}
              rightElement={
                <Switch
                  value={settings.batteryAlerts}
                  onValueChange={(value) => updateSetting('batteryAlerts', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.batteryAlerts ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />

            <SettingsCard
              title="Zone Notifications"
              subtitle="Location-based device alerts"
              icon={MapPin}
              rightElement={
                <Switch
                  value={settings.zoneNotifications}
                  onValueChange={(value) => updateSetting('zoneNotifications', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.zoneNotifications ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />
          </View>

          {/* System Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Updates</Text>
            <Text style={styles.sectionSubtitle}>
              Stay informed about app improvements
            </Text>

            <SettingsCard
              title="System Updates"
              subtitle="Important app updates and features"
              icon={SettingsIcon}
              rightElement={
                <Switch
                  value={settings.systemUpdates}
                  onValueChange={(value) => updateSetting('systemUpdates', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.systemUpdates ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />

            <SettingsCard
              title="Marketing Updates"
              subtitle="New products and special offers"
              icon={Bell}
              rightElement={
                <Switch
                  value={settings.marketingUpdates}
                  onValueChange={(value) => updateSetting('marketingUpdates', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.marketingUpdates ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />
          </View>

          {/* Notification Behavior */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Behavior</Text>
            <Text style={styles.sectionSubtitle}>
              Customize how notifications appear and sound
            </Text>

            <SettingsCard
              title="Sound"
              subtitle="Play notification sounds"
              icon={settings.soundEnabled ? Volume2 : VolumeX}
              rightElement={
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={(value) => updateSetting('soundEnabled', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.soundEnabled ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />

            <SettingsCard
              title="Vibration"
              subtitle="Vibrate for notifications"
              icon={Bluetooth}
              rightElement={
                <Switch
                  value={settings.vibrationEnabled}
                  onValueChange={(value) => updateSetting('vibrationEnabled', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.vibrationEnabled ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />

            <SettingsCard
              title="Quiet Hours"
              subtitle={
                settings.quietHoursEnabled
                  ? `${settings.quietHoursStart} - ${settings.quietHoursEnd}`
                  : "Pause notifications during specific hours"
              }
              icon={Clock}
              rightElement={
                <Switch
                  value={settings.quietHoursEnabled}
                  onValueChange={(value) => updateSetting('quietHoursEnabled', value)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={settings.quietHoursEnabled ? '#4CAF50' : '#F4F3F4'}
                />
              }
              showChevron={false}
            />
          </View>

          {/* Test Notifications */}
          {permissionStatus === 'granted' && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={testNotification}
              >
                <Bell size={20} color="#0277BD" />
                <Text style={styles.testButtonText}>Send Test Notification</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0277BD',
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  permissionBanner: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  permissionRequest: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FF9800',
    borderWidth: 1,
  },
  permissionDenied: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionText: {
    flex: 1,
    marginLeft: 12,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#0277BD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0277BD',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  subSetting: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  subSettingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  intervalOptions: {
    gap: 8,
  },
  intervalOption: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedInterval: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0277BD',
  },
  intervalText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  selectedIntervalText: {
    color: '#0277BD',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  testButtonText: {
    color: '#0277BD',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  bottomSpacer: {
    height: 20,
  },
});