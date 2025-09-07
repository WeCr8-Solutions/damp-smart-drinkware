/**
 * 💳 DAMP Smart Drinkware - Subscription Management Screen
 * Complete subscription modification and billing management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Crown,
  Zap,
  Shield,
  Smartphone,
  Bell,
  RefreshCw,
  Trash2,
  Edit3,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase/config';
import FirebaseStripeService, { SUBSCRIPTION_PLANS } from '@/services/firebase-stripe';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  stripePriceId: string;
}

interface UserSubscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  paymentMethod?: {
    type: string;
    last4: string;
    brand: string;
  };
}

export default function SubscriptionManagementScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Use plans from Firebase Stripe service with popular flag
  const plans = SUBSCRIPTION_PLANS.map(plan => ({
    ...plan,
    interval: plan.interval as 'monthly' | 'yearly',
    isPopular: plan.id === 'premium',
  }));

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load current subscription from Firebase
      const subscriptionData = await FirebaseStripeService.getSubscriptionStatus();

      if (subscriptionData.hasSubscription) {
        setSubscription({
          id: 'firebase-subscription',
          planId: subscriptionData.plan,
          status: subscriptionData.status,
          currentPeriodStart: subscriptionData.currentPeriodStart!,
          currentPeriodEnd: subscriptionData.currentPeriodEnd!,
          cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
          paymentMethod: null, // Will be loaded separately if needed
        });
      } else {
        setSubscription(null);
      }

      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (planId: string) => {
    if (!user || actionLoading) return;

    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    if (!subscription) {
      // New subscription - create checkout session
      try {
        setActionLoading(planId);
        await FirebaseStripeService.openCheckout(planId);
        // Checkout will handle success/failure via deep linking
      } catch (error) {
        console.error('Error opening checkout:', error);
        Alert.alert('Error', 'Failed to start checkout. Please try again.');
      } finally {
        setActionLoading(null);
      }
    } else {
      // Existing subscription - change plan
      Alert.alert(
        'Change Plan',
        `Are you sure you want to switch to the ${selectedPlan.name} plan?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              setActionLoading(planId);
              try {
                await FirebaseStripeService.changePlan(planId);
                Alert.alert('Success', 'Your subscription has been updated!');
                loadSubscriptionData();
              } catch (error) {
                console.error('Error changing plan:', error);
                Alert.alert('Error', 'Failed to change plan. Please try again.');
              } finally {
                setActionLoading(null);
              }
            },
          },
        ]
      );
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription || actionLoading) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You\'ll continue to have access until the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setActionLoading('cancel');
            try {
              await FirebaseStripeService.cancelSubscription();
              Alert.alert(
                'Subscription Canceled',
                'Your subscription has been canceled. You\'ll continue to have access until your current period ends.'
              );
              loadSubscriptionData();
            } catch (error) {
              console.error('Error canceling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleReactivateSubscription = async () => {
    if (!user || !subscription || actionLoading) return;

    setActionLoading('reactivate');
    try {
      await FirebaseStripeService.reactivateSubscription();
      Alert.alert('Success', 'Your subscription has been reactivated!');
      loadSubscriptionData();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      Alert.alert('Error', 'Failed to reactivate subscription. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePaymentMethod = () => {
    // Navigate to payment method update screen
    router.push('/account/payment-methods');
  };

  if (loading) {
    return (
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0277BD" />
            <Text style={styles.loadingText}>Loading subscription details...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0277BD" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Subscription Status */}
          {subscription && (
            <View style={styles.currentSubscriptionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Crown size={24} color="#FFD700" />
                  <Text style={styles.cardTitle}>Current Plan</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  subscription.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                ]}>
                  {subscription.status === 'active' ? (
                    <CheckCircle size={16} color="#4CAF50" />
                  ) : (
                    <XCircle size={16} color="#F44336" />
                  )}
                  <Text style={[
                    styles.statusText,
                    subscription.status === 'active' ? styles.activeText : styles.inactiveText
                  ]}>
                    {subscription.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.planName}>
                {plans.find(p => p.id === subscription.planId)?.name || 'Premium'}
              </Text>

              <View style={styles.subscriptionDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Renews on {subscription.currentPeriodEnd.toLocaleDateString()}
                  </Text>
                </View>

                {subscription.paymentMethod && (
                  <View style={styles.detailRow}>
                    <CreditCard size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                    </Text>
                  </View>
                )}

                {subscription.cancelAtPeriodEnd && (
                  <View style={styles.cancellationNotice}>
                    <XCircle size={16} color="#FF9800" />
                    <Text style={styles.cancellationText}>
                      Subscription will end on {subscription.currentPeriodEnd.toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionButtons}>
                {subscription.cancelAtPeriodEnd ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleReactivateSubscription}
                    disabled={actionLoading === 'reactivate'}
                  >
                    {actionLoading === 'reactivate' ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <RefreshCw size={18} color="#FFF" />
                    )}
                    <Text style={styles.primaryButtonText}>Reactivate</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                  >
                    {actionLoading === 'cancel' ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Trash2 size={18} color="#FFF" />
                    )}
                    <Text style={styles.dangerButtonText}>Cancel Subscription</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleUpdatePaymentMethod}
                >
                  <Edit3 size={18} color="#0277BD" />
                  <Text style={styles.secondaryButtonText}>Update Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Available Plans */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            <Text style={styles.sectionSubtitle}>
              Choose the plan that best fits your needs
            </Text>

            {plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Zap size={14} color="#FFF" />
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.planPrice}>
                    <Text style={styles.priceAmount}>
                      ${plan.price.toFixed(2)}
                    </Text>
                    <Text style={styles.priceInterval}>
                      /{plan.interval}
                    </Text>
                  </View>
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <CheckCircle size={16} color="#4CAF50" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.planButton,
                    subscription?.planId === plan.id && styles.currentPlanButton,
                    plan.isPopular && styles.popularPlanButton,
                  ]}
                  onPress={() => handlePlanChange(plan.id)}
                  disabled={subscription?.planId === plan.id || actionLoading === plan.id}
                >
                  {actionLoading === plan.id ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : subscription?.planId === plan.id ? (
                    <>
                      <CheckCircle size={18} color="#4CAF50" />
                      <Text style={styles.currentPlanText}>Current Plan</Text>
                    </>
                  ) : (
                    <Text style={[
                      styles.planButtonText,
                      plan.isPopular && styles.popularPlanButtonText
                    ]}>
                      {subscription ? 'Switch to This Plan' : 'Select Plan'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Billing History */}
          <TouchableOpacity
            style={styles.billingHistoryButton}
            onPress={() => router.push('/account/billing-history')}
          >
            <CreditCard size={20} color="#0277BD" />
            <Text style={styles.billingHistoryText}>View Billing History</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Medium',
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
  currentSubscriptionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#F44336',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0277BD',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  subscriptionDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  cancellationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
  },
  cancellationText: {
    fontSize: 14,
    color: '#FF9800',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: '#0277BD',
  },
  secondaryButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#0277BD',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButtonText: {
    color: '#0277BD',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  dangerButtonText: {
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
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  popularText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0277BD',
    fontFamily: 'Inter-Bold',
  },
  priceInterval: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  planFeatures: {
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  planButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  currentPlanButton: {
    backgroundColor: '#E8F5E8',
  },
  popularPlanButton: {
    backgroundColor: '#0277BD',
  },
  planButtonText: {
    color: '#0277BD',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  popularPlanButtonText: {
    color: '#FFF',
  },
  currentPlanText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  billingHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  billingHistoryText: {
    color: '#0277BD',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});