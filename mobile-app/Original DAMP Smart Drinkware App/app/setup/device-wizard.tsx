/**
 * 🧙‍♂️ DAMP Smart Drinkware - Device Setup Wizard
 * Guided setup for first-time users
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Bluetooth,
  Smartphone,
  Coffee,
  Baby,
  Droplets,
  MapPin,
  Bell,
  Crown,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');

interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

export default function DeviceSetupWizard() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [deviceName, setDeviceName] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState({
    bluetooth: false,
    notifications: false,
    location: false,
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const deviceTypes = [
    {
      id: 'cup',
      name: 'Coffee Cup Handle',
      description: 'Smart handle for your favorite mug',
      icon: Coffee,
      color: '#8D6E63',
    },
    {
      id: 'sleeve',
      name: 'Cup Sleeve',
      description: 'Universal sleeve for any cup',
      icon: Droplets,
      color: '#0277BD',
    },
    {
      id: 'bottle',
      name: 'Baby Bottle',
      description: 'Track feeding bottles',
      icon: Baby,
      color: '#E91E63',
    },
    {
      id: 'bottom',
      name: 'Silicone Bottom',
      description: 'Smart tracking base',
      icon: Droplets,
      color: '#4CAF50',
    },
  ];

  const zones = [
    { id: 'home', name: 'Home', icon: '🏠' },
    { id: 'office', name: 'Office', icon: '💼' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
    { id: 'living-room', name: 'Living Room', icon: '🛋️' },
  ];

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DAMP!',
      subtitle: 'Let\'s set up your first smart drinkware device',
      component: <WelcomeStep />,
    },
    {
      id: 'permissions',
      title: 'Enable Permissions',
      subtitle: 'We need a few permissions to make your device work perfectly',
      component: <PermissionsStep />,
    },
    {
      id: 'device-type',
      title: 'Choose Your Device',
      subtitle: 'What type of DAMP device are you setting up?',
      component: <DeviceTypeStep />,
    },
    {
      id: 'device-scan',
      title: 'Find Your Device',
      subtitle: 'Make sure your device is powered on and nearby',
      component: <DeviceScanStep />,
    },
    {
      id: 'device-setup',
      title: 'Configure Device',
      subtitle: 'Give your device a name and location',
      component: <DeviceConfigStep />,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Stay updated with your device status',
      component: <NotificationsStep />,
    },
    {
      id: 'complete',
      title: 'All Set!',
      subtitle: 'Your device is ready to use',
      component: <CompleteStep />,
    },
  ];

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    scrollViewRef.current?.scrollTo({
      x: stepIndex * screenWidth,
      animated: true,
    });

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (stepIndex / (steps.length - 1)) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      goToStep(currentStep + 1);
    } else {
      completeWizard();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const completeWizard = async () => {
    try {
      // Mark wizard as completed for user
      const { error } = await supabase
        .from('user_profiles')
        .update({ setup_completed: true, updated_at: new Date().toISOString() })
        .eq('id', user?.id);

      if (error) throw error;

      Alert.alert(
        'Setup Complete!',
        'Your DAMP device is ready to use. Enjoy tracking your hydration!',
        [
          {
            text: 'Start Using App',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error completing wizard:', error);
      router.replace('/(tabs)');
    }
  };

  function WelcomeStep() {
    return (
      <View style={styles.stepContent}>
        <View style={styles.welcomeIcon}>
          <Droplets size={64} color="#0277BD" />
        </View>
        <Text style={styles.welcomeTitle}>Welcome to DAMP Smart Drinkware!</Text>
        <Text style={styles.welcomeText}>
          Your journey to smarter hydration starts here. We'll help you set up your first device in just a few simple steps.
        </Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Track your hydration automatically</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Get smart notifications</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Organize devices by location</Text>
          </View>
        </View>
      </View>
    );
  }

  function PermissionsStep() {
    const requestBluetooth = async () => {
      // Simulate bluetooth permission request
      setTimeout(() => {
        setPermissionsGranted(prev => ({ ...prev, bluetooth: true }));
      }, 1000);
    };

    const requestNotifications = async () => {
      // Simulate notification permission request
      setTimeout(() => {
        setPermissionsGranted(prev => ({ ...prev, notifications: true }));
      }, 1000);
    };

    const requestLocation = async () => {
      // Simulate location permission request
      setTimeout(() => {
        setPermissionsGranted(prev => ({ ...prev, location: true }));
      }, 1000);
    };

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepDescription}>
          To provide the best experience, we need these permissions:
        </Text>
        
        <View style={styles.permissionsList}>
          <TouchableOpacity
            style={[styles.permissionItem, permissionsGranted.bluetooth && styles.permissionGranted]}
            onPress={requestBluetooth}
          >
            <Bluetooth size={24} color={permissionsGranted.bluetooth ? "#4CAF50" : "#0277BD"} />
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Bluetooth</Text>
              <Text style={styles.permissionSubtitle}>Connect to your DAMP devices</Text>
            </View>
            {permissionsGranted.bluetooth && <CheckCircle size={24} color="#4CAF50" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.permissionItem, permissionsGranted.notifications && styles.permissionGranted]}
            onPress={requestNotifications}
          >
            <Bell size={24} color={permissionsGranted.notifications ? "#4CAF50" : "#0277BD"} />
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Notifications</Text>
              <Text style={styles.permissionSubtitle}>Get hydration reminders</Text>
            </View>
            {permissionsGranted.notifications && <CheckCircle size={24} color="#4CAF50" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.permissionItem, permissionsGranted.location && styles.permissionGranted]}
            onPress={requestLocation}
          >
            <MapPin size={24} color={permissionsGranted.location ? "#4CAF50" : "#0277BD"} />
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Location (Optional)</Text>
              <Text style={styles.permissionSubtitle}>Zone-based device management</Text>
            </View>
            {permissionsGranted.location && <CheckCircle size={24} color="#4CAF50" />}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function DeviceTypeStep() {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepDescription}>
          Select the type of DAMP device you're setting up:
        </Text>
        
        <View style={styles.deviceTypeGrid}>
          {deviceTypes.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.deviceTypeCard,
                selectedDeviceType === device.id && styles.selectedDeviceType,
              ]}
              onPress={() => setSelectedDeviceType(device.id)}
            >
              <View style={[styles.deviceTypeIcon, { backgroundColor: device.color + '20' }]}>
                <device.icon size={32} color={device.color} />
              </View>
              <Text style={styles.deviceTypeName}>{device.name}</Text>
              <Text style={styles.deviceTypeDescription}>{device.description}</Text>
              {selectedDeviceType === device.id && (
                <CheckCircle size={20} color="#4CAF50" style={styles.selectedIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  function DeviceScanStep() {
    return (
      <View style={styles.stepContent}>
        <View style={styles.scanningContainer}>
          <View style={styles.scanningAnimation}>
            <Bluetooth size={48} color="#0277BD" />
          </View>
          <Text style={styles.scanningText}>Scanning for devices...</Text>
          <Text style={styles.scanningSubtext}>
            Make sure your device is powered on and within range
          </Text>
        </View>
        
        <View style={styles.deviceFound}>
          <CheckCircle size={24} color="#4CAF50" />
          <Text style={styles.deviceFoundText}>DAMP Device Found!</Text>
          <Text style={styles.deviceFoundSubtext}>
            {deviceTypes.find(d => d.id === selectedDeviceType)?.name}
          </Text>
        </View>
      </View>
    );
  }

  function DeviceConfigStep() {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepDescription}>
          Give your device a name and choose where you'll use it:
        </Text>
        
        <View style={styles.configSection}>
          <Text style={styles.configLabel}>Device Name</Text>
          <View style={styles.nameInput}>
            <Text style={styles.nameInputText}>
              {deviceName || `My ${deviceTypes.find(d => d.id === selectedDeviceType)?.name}`}
            </Text>
          </View>
        </View>

        <View style={styles.configSection}>
          <Text style={styles.configLabel}>Location Zone</Text>
          <View style={styles.zoneGrid}>
            {zones.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.zoneCard,
                  selectedZone === zone.id && styles.selectedZone,
                ]}
                onPress={() => setSelectedZone(zone.id)}
              >
                <Text style={styles.zoneIcon}>{zone.icon}</Text>
                <Text style={styles.zoneName}>{zone.name}</Text>
                {selectedZone === zone.id && (
                  <CheckCircle size={16} color="#4CAF50" style={styles.zoneSelectedIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  function NotificationsStep() {
    return (
      <View style={styles.stepContent}>
        <View style={styles.notificationIcon}>
          <Bell size={48} color="#0277BD" />
        </View>
        
        <Text style={styles.notificationTitle}>Stay Hydrated!</Text>
        <Text style={styles.notificationText}>
          Get gentle reminders to drink water and track your hydration goals.
        </Text>
        
        <View style={styles.notificationOptions}>
          <View style={styles.notificationOption}>
            <Text style={styles.notificationOptionTitle}>Hydration Reminders</Text>
            <Text style={styles.notificationOptionSubtitle}>
              Smart reminders based on your drinking patterns
            </Text>
          </View>
          
          <View style={styles.notificationOption}>
            <Text style={styles.notificationOptionTitle}>Device Status</Text>
            <Text style={styles.notificationOptionSubtitle}>
              Battery alerts and connection status
            </Text>
          </View>
          
          <View style={styles.notificationOption}>
            <Text style={styles.notificationOptionTitle}>Goals & Achievements</Text>
            <Text style={styles.notificationOptionSubtitle}>
              Celebrate your hydration milestones
            </Text>
          </View>
        </View>
      </View>
    );
  }

  function CompleteStep() {
    return (
      <View style={styles.stepContent}>
        <View style={styles.completeIcon}>
          <CheckCircle size={64} color="#4CAF50" />
        </View>
        
        <Text style={styles.completeTitle}>You're All Set!</Text>
        <Text style={styles.completeText}>
          Your DAMP device is configured and ready to help you stay hydrated. 
          Start using the app to track your progress!
        </Text>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Setup Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Device:</Text>
            <Text style={styles.summaryValue}>
              {deviceTypes.find(d => d.id === selectedDeviceType)?.name}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Location:</Text>
            <Text style={styles.summaryValue}>
              {zones.find(z => z.id === selectedZone)?.name}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Notifications:</Text>
            <Text style={styles.summaryValue}>
              {notificationsEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Permissions
        return permissionsGranted.bluetooth && permissionsGranted.notifications;
      case 2: // Device Type
        return selectedDeviceType !== '';
      case 4: // Device Config
        return selectedZone !== '';
      default:
        return true;
    }
  };

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={previousStep}>
              <ArrowLeft size={24} color="#0277BD" />
            </TouchableOpacity>
          )}
          
          <View style={styles.headerCenter}>
            <Text style={styles.stepCounter}>
              {currentStep + 1} of {steps.length}
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground} />
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.stepsContainer}
        >
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                {step.component}
              </ScrollView>
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
            ]}
            onPress={nextStep}
            disabled={!canProceed()}
          >
            <Text style={[
              styles.nextButtonText,
              !canProceed() && styles.nextButtonTextDisabled,
            ]}>
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
            </Text>
            <ArrowRight size={20} color={canProceed() ? "#FFF" : "#CCC"} />
          </TouchableOpacity>
        </View>
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
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  stepCounter: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#E1F5FE',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0277BD',
    borderRadius: 2,
  },
  stepsContainer: {
    flex: 1,
  },
  stepContainer: {
    width: screenWidth,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0277BD',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Welcome Step
  welcomeIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0277BD',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-Regular',
  },

  // Permissions Step
  permissionsList: {
    gap: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionGranted: {
    backgroundColor: '#F0F8F0',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },

  // Device Type Step
  deviceTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  deviceTypeCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  selectedDeviceType: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F0F8F0',
  },
  deviceTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deviceTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  deviceTypeDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  selectedIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Scanning Step
  scanningContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scanningAnimation: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  scanningSubtext: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  deviceFound: {
    backgroundColor: '#F0F8F0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  deviceFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'Inter-SemiBold',
  },
  deviceFoundSubtext: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },

  // Config Step
  configSection: {
    marginBottom: 24,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nameInputText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-Regular',
  },
  zoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  zoneCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedZone: {
    backgroundColor: '#F0F8F0',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  zoneIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  zoneName: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  zoneSelectedIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  // Notifications Step
  notificationIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  notificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0277BD',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  notificationText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  notificationOptions: {
    gap: 20,
  },
  notificationOption: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  notificationOptionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },

  // Complete Step
  completeIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  nextButton: {
    backgroundColor: '#0277BD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  nextButtonTextDisabled: {
    color: '#CCC',
  },
});