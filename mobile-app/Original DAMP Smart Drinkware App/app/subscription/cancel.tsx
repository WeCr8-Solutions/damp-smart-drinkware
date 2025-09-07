/**
 * ❌ DAMP Smart Drinkware - Subscription Canceled Screen
 * Handles canceled Stripe checkout
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SubscriptionCancelScreen() {

  const handleRetry = () => {
    router.replace('/account/subscription');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/');
  };

  return (
    <LinearGradient colors={['#FFF5F5', '#FFFFFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Cancel Header */}
          <View style={styles.headerSection}>
            <View style={styles.cancelIcon}>
              <XCircle size={64} color="#F44336" />
            </View>
            <Text style={styles.cancelTitle}>Subscription Canceled</Text>
            <Text style={styles.cancelSubtitle}>
              Your subscription signup was canceled
            </Text>
          </View>

          {/* Information Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What Happened?</Text>
            <Text style={styles.infoText}>
              You canceled the subscription process before completing payment.
              No charges were made to your account.
            </Text>

            <Text style={styles.infoTitle2}>Still Want Premium?</Text>
            <Text style={styles.infoText}>
              You can start the subscription process again anytime. Premium features include:
            </Text>

            <View style={styles.featuresList}>
              <Text style={styles.featureText}>• Unlimited devices</Text>
              <Text style={styles.featureText}>• Advanced analytics</Text>
              <Text style={styles.featureText}>• Push notifications</Text>
              <Text style={styles.featureText}>• Zone management</Text>
              <Text style={styles.featureText}>• Priority support</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <RefreshCw size={20} color="#FFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleGoHome}
            >
              <ArrowLeft size={20} color="#0277BD" />
              <Text style={styles.homeButtonText}>Back to App</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cancelIcon: {
    marginBottom: 20,
  },
  cancelTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F44336',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  cancelSubtitle: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  infoTitle2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0277BD',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 16,
  },
  featuresList: {
    gap: 6,
  },
  featureText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  actionSection: {
    marginTop: 'auto',
    paddingBottom: 20,
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#0277BD',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0277BD',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  homeButtonText: {
    color: '#0277BD',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});