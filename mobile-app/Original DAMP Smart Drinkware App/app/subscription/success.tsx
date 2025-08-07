/**
 * 🎉 DAMP Smart Drinkware - Subscription Success Screen
 * Handles successful Stripe checkout completion
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, ArrowRight, Crown } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import FirebaseStripeService from '@/services/firebase-stripe';

export default function SubscriptionSuccessScreen() {
  const { user } = useAuth();
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  const [processing, setProcessing] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    handleSubscriptionSuccess();
  }, [session_id]);

  const handleSubscriptionSuccess = async () => {
    if (!session_id || !user) {
      Alert.alert('Error', 'Invalid session. Please try again.');
      router.replace('/subscription');
      return;
    }

    try {
      setProcessing(true);

      // Process the successful checkout
      const result = await FirebaseStripeService.handleCheckoutSuccess(session_id);
      setSubscriptionData(result);

      // Small delay for better UX
      setTimeout(() => {
        setProcessing(false);
      }, 1500);

    } catch (error) {
      console.error('Error processing subscription success:', error);
      Alert.alert(
        'Processing Error',
        'There was an issue processing your subscription. Please contact support if you were charged.',
        [
          {
            text: 'Contact Support',
            onPress: () => router.push('/support'),
          },
          {
            text: 'Continue',
            onPress: () => router.replace('/subscription'),
          },
        ]
      );
    }
  };

  const handleContinue = () => {
    // Navigate back to subscription screen to show updated status
    router.replace('/account/subscription');
  };

  if (processing) {
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.processingContainer}>
            <View style={styles.processingContent}>
              <ActivityIndicator size="large" color="#0277BD" />
              <Text style={styles.processingTitle}>Processing Your Subscription</Text>
              <Text style={styles.processingText}>
                We're setting up your premium features...
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Header */}
          <View style={styles.headerSection}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Subscription Activated!</Text>
            <Text style={styles.successSubtitle}>
              Welcome to DAMP Smart Drinkware Premium
            </Text>
          </View>

          {/* Subscription Details */}
          <View style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <Crown size={24} color="#FFD700" />
              <Text style={styles.cardTitle}>Premium Features Unlocked</Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Unlimited devices</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Advanced analytics</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Push notifications</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Zone management</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Priority support</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Export data</Text>
              </View>
            </View>

            {subscriptionData && (
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionInfoText}>
                  Subscription ID: {subscriptionData.subscriptionId}
                </Text>
                <Text style={styles.subscriptionInfoText}>
                  Status: {subscriptionData.status?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Next Steps */}
          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>What's Next?</Text>
            <Text style={styles.nextStepsText}>
              • Connect more devices to track them all
            </Text>
            <Text style={styles.nextStepsText}>
              • Set up zones for enhanced tracking
            </Text>
            <Text style={styles.nextStepsText}>
              • Customize notification preferences
            </Text>
            <Text style={styles.nextStepsText}>
              • Explore advanced analytics
            </Text>
          </View>

          {/* Continue Button */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue to App</Text>
              <ArrowRight size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
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
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  processingContent: {
    alignItems: 'center',
    gap: 20,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0277BD',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  processingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0277BD',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0277BD',
    fontFamily: 'Inter-SemiBold',
  },
  featuresList: {
    gap: 12,
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
  subscriptionInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subscriptionInfoText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  nextStepsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0277BD',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  nextStepsText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  actionSection: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#0277BD',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});