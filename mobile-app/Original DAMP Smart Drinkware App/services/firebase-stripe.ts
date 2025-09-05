/**
 * 🔥💳 DAMP Smart Drinkware - Firebase Stripe Integration Service
 * Complete Stripe payment processing through Firebase Functions
 */

import { FeatureFlags } from '@/config/feature-flags';

// Mock implementations for when Stripe/Firebase is disabled
let createSubscriptionCheckoutFn: any;
let handleSubscriptionSuccessFn: any;
let manageSubscriptionFn: any;
let getSubscriptionStatusFn: any;

if (FeatureFlags.STRIPE && FeatureFlags.FIREBASE) {
  try {
    const { httpsCallable, getFunctions } = require('firebase/functions');
    
    // Initialize Firebase Functions
    const functions = getFunctions();

    // Stripe Firebase Functions
    createSubscriptionCheckoutFn = httpsCallable(functions, 'createSubscriptionCheckout');
    handleSubscriptionSuccessFn = httpsCallable(functions, 'handleSubscriptionSuccess');
    manageSubscriptionFn = httpsCallable(functions, 'manageSubscription');
    getSubscriptionStatusFn = httpsCallable(functions, 'getSubscriptionStatus');
  } catch (error) {
    console.warn('Stripe/Firebase functions initialization failed - using mocks:', error);
    createSubscriptionCheckoutFn = () => Promise.reject(new Error('Stripe disabled'));
    handleSubscriptionSuccessFn = () => Promise.reject(new Error('Stripe disabled'));
    manageSubscriptionFn = () => Promise.reject(new Error('Stripe disabled'));
    getSubscriptionStatusFn = () => Promise.reject(new Error('Stripe disabled'));
  }
} else {
  console.info('Stripe/Firebase disabled via feature flags - using mocks');
  createSubscriptionCheckoutFn = () => Promise.reject(new Error('Stripe disabled'));
  handleSubscriptionSuccessFn = () => Promise.reject(new Error('Stripe disabled'));
  manageSubscriptionFn = () => Promise.reject(new Error('Stripe disabled'));
  getSubscriptionStatusFn = () => Promise.reject(new Error('Stripe disabled'));
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export interface UserSubscription {
  hasSubscription: boolean;
  plan: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'inactive';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
}

/**
 * Subscription Plans Configuration (matches Firebase functions)
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 4.99,
    interval: 'month',
    stripePriceId: 'price_1S48fwCcrIDahSGR9F8vyYIi', // Real Stripe Price ID
    features: [
      'Up to 3 devices',
      'Basic analytics',
      'Email notifications',
      'Standard support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    stripePriceId: 'price_1S48fwCcrIDahSGRE9ekpMMN', // Real Stripe Price ID
    features: [
      'Unlimited devices',
      'Advanced analytics',
      'Push notifications',
      'Zone management',
      'Priority support',
      'Export data',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Premium (Yearly)',
    price: 99.99,
    interval: 'year',
    stripePriceId: 'price_1S48fwCcrIDahSGRlsoMMVhI', // Real Stripe Price ID
    features: [
      'All Premium features',
      '2 months free',
      'Priority support',
      'Early access to features',
    ],
  },
];

/**
 * Firebase Stripe Service Class
 */
export class FirebaseStripeService {
  
  /**
   * Create Stripe checkout session for subscription
   */
  static async createCheckoutSession(
    planId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<CheckoutSession> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await createSubscriptionCheckoutFn({
        planId,
        successUrl: successUrl || 'damp://subscription/success',
        cancelUrl: cancelUrl || 'damp://subscription/cancel',
      });

      return result.data as CheckoutSession;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session. Please try again.');
    }
  }

  /**
   * Handle successful subscription checkout
   */
  static async handleCheckoutSuccess(sessionId: string): Promise<any> {
    try {
      const result = await handleSubscriptionSuccessFn({
        sessionId,
      });

      return result.data;
    } catch (error) {
      console.error('Error handling checkout success:', error);
      throw new Error('Failed to process subscription. Please contact support.');
    }
  }

  /**
   * Get current subscription status
   */
  static async getSubscriptionStatus(): Promise<UserSubscription> {
    try {
      const result = await getSubscriptionStatusFn();
      const data = result.data as UserSubscription;

      // Convert date strings to Date objects
      if (data.currentPeriodStart) {
        data.currentPeriodStart = new Date(data.currentPeriodStart);
      }
      if (data.currentPeriodEnd) {
        data.currentPeriodEnd = new Date(data.currentPeriodEnd);
      }

      return data;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw new Error('Failed to load subscription status.');
    }
  }

  /**
   * Change subscription plan
   */
  static async changePlan(newPlanId: string): Promise<any> {
    try {
      const result = await manageSubscriptionFn({
        action: 'change_plan',
        newPlanId,
      });

      return result.data;
    } catch (error) {
      console.error('Error changing plan:', error);
      throw new Error('Failed to change subscription plan. Please try again.');
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(): Promise<any> {
    try {
      const result = await manageSubscriptionFn({
        action: 'cancel',
      });

      return result.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription. Please try again.');
    }
  }

  /**
   * Reactivate subscription
   */
  static async reactivateSubscription(): Promise<any> {
    try {
      const result = await manageSubscriptionFn({
        action: 'reactivate',
      });

      return result.data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('Failed to reactivate subscription. Please try again.');
    }
  }

  /**
   * Get plan by ID
   */
  static getPlan(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, interval: 'month' | 'year'): string {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);

    return `${formatted}/${interval === 'month' ? 'mo' : 'yr'}`;
  }

  /**
   * Calculate yearly savings
   */
  static calculateYearlySavings(): number {
    const monthly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium')?.price || 0;
    const yearly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_yearly')?.price || 0;
    
    const yearlyEquivalent = monthly * 12;
    return yearlyEquivalent - yearly;
  }

  /**
   * Open Stripe checkout in browser/webview
   */
  static async openCheckout(planId: string): Promise<void> {
    try {
      const { checkoutUrl } = await this.createCheckoutSession(planId);
      
      // Use Expo WebBrowser to open checkout
      const { WebBrowser } = await import('expo-web-browser');
      await WebBrowser.openBrowserAsync(checkoutUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
    } catch (error) {
      console.error('Error opening checkout:', error);
      throw error;
    }
  }

  /**
   * Validate subscription status
   */
  static isSubscriptionActive(subscription: UserSubscription): boolean {
    return subscription.hasSubscription && 
           subscription.status === 'active' && 
           !subscription.cancelAtPeriodEnd;
  }

  /**
   * Get subscription display status
   */
  static getSubscriptionDisplayStatus(subscription: UserSubscription): {
    status: string;
    color: string;
    icon: 'check' | 'x' | 'clock' | 'alert';
  } {
    if (!subscription.hasSubscription) {
      return { status: 'No Subscription', color: '#999', icon: 'x' };
    }

    switch (subscription.status) {
      case 'active':
        if (subscription.cancelAtPeriodEnd) {
          return { status: 'Ending Soon', color: '#FF9800', icon: 'clock' };
        }
        return { status: 'Active', color: '#4CAF50', icon: 'check' };
      
      case 'past_due':
        return { status: 'Past Due', color: '#F44336', icon: 'alert' };
      
      case 'canceled':
        return { status: 'Canceled', color: '#999', icon: 'x' };
      
      case 'incomplete':
        return { status: 'Incomplete', color: '#FF9800', icon: 'clock' };
      
      default:
        return { status: 'Unknown', color: '#999', icon: 'x' };
    }
  }
}

// Default export
export default FirebaseStripeService;