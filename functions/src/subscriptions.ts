/**
 * 💳 DAMP Smart Drinkware - Subscription Management Functions
 * Firebase Functions for handling subscription, billing, and plan management
 */

import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Initialize config parameters
const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const appUrl = defineString('APP_URL');

// Initialize Stripe
const stripe = new Stripe(stripeSecretKey.value(), {
  apiVersion: '2023-10-16',
});

// Subscription Plans Configuration
const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 4.99,
    interval: 'month',
    stripePriceId: 'price_basic_monthly',
    features: [
      'Up to 3 devices',
      'Basic analytics',
      'Email notifications',
      'Standard support',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    stripePriceId: 'price_premium_monthly',
    features: [
      'Unlimited devices',
      'Advanced analytics',
      'Push notifications',
      'Zone management',
      'Priority support',
      'Export data',
    ],
  },
  premium_yearly: {
    id: 'premium_yearly',
    name: 'Premium (Yearly)',
    price: 99.99,
    interval: 'year',
    stripePriceId: 'price_premium_yearly',
    features: [
      'All Premium features',
      '2 months free',
      'Priority support',
      'Early access to features',
    ],
  },
};

/**
 * Create or retrieve Stripe customer
 */
async function getOrCreateStripeCustomer(userId: string, userEmail: string): Promise<string> {
  // Check if user already has a Stripe customer ID
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (userData?.subscription?.stripeCustomerId) {
    return userData.subscription.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: {
      userId,
      platform: 'damp_mobile_app',
    },
  });

  // Update user document with Stripe customer ID
  await admin.firestore().collection('users').doc(userId).update({
    'subscription.stripeCustomerId': customer.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return customer.id;
}

/**
 * Create Stripe checkout session for subscription
 */
export const createSubscriptionCheckout = onCall(async (request) => {
  const { data, auth } = request;
  
  // Verify authentication
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { planId, successUrl, cancelUrl } = data;
  const userId = auth.uid;
  const userEmail = auth.token.email || auth.token.firebase?.identities?.email?.[0];

  try {
    // Validate plan
    if (!SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      throw new HttpsError('invalid-argument', 'Invalid subscription plan');
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId, userEmail);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${appUrl.value()}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${appUrl.value()}/subscription/cancel`,
      metadata: {
        userId,
        planId,
      },
    });

    // Log checkout session creation
    await admin.firestore().collection('subscription_events').add({
      userId,
      type: 'checkout_session_created',
      sessionId: session.id,
      planId,
      amount: plan.price * 100, // Stripe uses cents
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };

  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw new HttpsError('internal', 'Failed to create checkout session');
  }
});

/**
 * Handle successful subscription checkout
 */
export const handleSubscriptionSuccess = onCall(async (request) => {
  const { data, auth } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { sessionId } = data;
  const userId = auth.uid;

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.metadata?.userId !== userId) {
      throw new HttpsError('permission-denied', 'Invalid session');
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    // Update user's subscription in Firestore
    const subscriptionData = {
      status: subscription.status,
      planId: session.metadata?.planId,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('users').doc(userId).update({
      subscription: subscriptionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create subscription document for detailed tracking
    await admin.firestore().collection('subscriptions').doc(subscription.id).set({
      userId,
      stripeSubscriptionId: subscription.id,
      customerId: subscription.customer,
      planId: session.metadata?.planId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata: subscription.metadata,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log subscription creation
    await admin.firestore().collection('subscription_events').add({
      userId,
      type: 'subscription_created',
      subscriptionId: subscription.id,
      planId: session.metadata?.planId,
      amount: subscription.items.data[0].price.unit_amount,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
    };

  } catch (error) {
    console.error('Error handling subscription success:', error);
    throw new HttpsError('internal', 'Failed to process subscription');
  }
});

/**
 * Manage subscription (change plan, cancel, reactivate)
 */
export const manageSubscription = onCall(async (request) => {
  const { data, auth } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = auth.uid;
  const { action, planId } = data;

  try {
    // Get user's current subscription
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.subscription?.stripeSubscriptionId) {
      throw new HttpsError('not-found', 'No active subscription found');
    }

    const currentSubscription = await stripe.subscriptions.retrieve(userData.subscription.stripeSubscriptionId);

    switch (action) {
      case 'upgrade':
      case 'downgrade': {
        if (!planId) {
          throw new HttpsError('invalid-argument', 'Invalid plan ID');
        }

        const newPlan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
        if (!newPlan) {
          throw new HttpsError('invalid-argument', 'Invalid plan ID');
        }

        // Update subscription with new price
        const updatedSubscription = await stripe.subscriptions.update(currentSubscription.id, {
          items: [{
            id: currentSubscription.items.data[0].id,
            price: newPlan.stripePriceId,
          }],
          proration_behavior: action === 'upgrade' ? 'always_invoice' : 'none',
        });

        // Update user doc
        await admin.firestore().collection('users').doc(userId).update({
          'subscription.planId': planId,
          'subscription.status': updatedSubscription.status,
          'subscription.currentPeriodStart': new Date(updatedSubscription.current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date(updatedSubscription.current_period_end * 1000),
          'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, subscription: updatedSubscription };
      }
      default:
        throw new HttpsError('invalid-argument', 'Invalid subscription action');
    }
  } catch (error) {
    console.error('Error managing subscription:', error);
    throw new HttpsError('internal', 'Failed to manage subscription');
  }
});

/**
 * Get subscription status
 */
export const getSubscriptionStatus = onCall(async (request) => {
  const { data, auth } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.subscription) {
      return {
        hasSubscription: false,
        plan: 'free',
        status: 'inactive',
      };
    }

    const subscription = userData.subscription;

    // If there's a Stripe subscription ID, get latest status from Stripe
    if (subscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

        // Update Firestore with latest Stripe data
        const updateData = {
          'subscription.status': stripeSubscription.status,
          'subscription.currentPeriodStart': new Date(stripeSubscription.current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date(stripeSubscription.current_period_end * 1000),
          'subscription.cancelAtPeriodEnd': stripeSubscription.cancel_at_period_end,
          'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
        };

        await admin.firestore().collection('users').doc(userId).update(updateData);

        return {
          hasSubscription: true,
          plan: subscription.planId || 'premium',
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        };
      } catch (stripeError) {
        console.error('Error fetching from Stripe:', stripeError);
        // Return cached data if Stripe is unavailable
        return {
          hasSubscription: true,
          plan: subscription.planId || 'premium',
          status: subscription.status || 'unknown',
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        };
      }
    }

    return {
      hasSubscription: false,
      plan: 'free',
      status: 'inactive',
    };

  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw new HttpsError('internal', 'Failed to get subscription status');
  }
});

/**
 * Webhook handler for Stripe events
 */
export const handleStripeWebhook = onRequest(async (request, response) => {
  const sig = request.get('Stripe-Signature') as string;
  const webhookSecret = defineString('STRIPE_WEBHOOK_SECRET').value();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(request.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    response.status(400).send(`Webhook Error: ${err}`);
    return;
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    response.json({ received: true });

  } catch (error) {
    console.error('Error handling webhook:', error);
    response.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle subscription updated webhook
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Find user by Stripe customer ID
    const usersQuery = await admin.firestore()
      .collection('users')
      .where('subscription.stripeCustomerId', '==', subscription.customer)
      .get();

    if (usersQuery.empty) {
      console.error('No user found for customer:', subscription.customer);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;

    // Update user subscription data
    const updateData = {
      'subscription.status': subscription.status,
      'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('users').doc(userId).update(updateData);

    // Update subscription document
    await admin.firestore().collection('subscriptions').doc(subscription.id).set({
      userId,
      stripeSubscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Log the event
    await admin.firestore().collection('subscription_events').add({
      userId,
      type: 'subscription_updated',
      subscriptionId: subscription.id,
      status: subscription.status,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

/**
 * Handle payment succeeded webhook
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) return;

    // Find user by subscription
    const subscriptionDoc = await admin.firestore()
      .collection('subscriptions')
      .doc(invoice.subscription as string)
      .get();

    if (!subscriptionDoc.exists) return;

    const subscriptionData = subscriptionDoc.data();
    const userId = subscriptionData?.userId;

    if (!userId) return;

    // Log successful payment
    await admin.firestore().collection('subscription_events').add({
      userId,
      type: 'payment_succeeded',
      subscriptionId: invoice.subscription,
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update user's billing history
    await admin.firestore().collection('users').doc(userId).update({
      'subscription.billingHistory': admin.firestore.FieldValue.arrayUnion({
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'paid',
        paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
      }),
      'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
    });

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle payment failed webhook
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) return;

    // Find user by subscription
    const subscriptionDoc = await admin.firestore()
      .collection('subscriptions')
      .doc(invoice.subscription as string)
      .get();

    if (!subscriptionDoc.exists) return;

    const subscriptionData = subscriptionDoc.data();
    const userId = subscriptionData?.userId;

    if (!userId) return;

    // Log failed payment
    await admin.firestore().collection('subscription_events').add({
      userId,
      type: 'payment_failed',
      subscriptionId: invoice.subscription,
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send notification to user about failed payment
    await sendPaymentFailedNotification(userId, invoice);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Send payment failed notification
 */
async function sendPaymentFailedNotification(userId: string, invoice: Stripe.Invoice) {
  try {
    // Get user's FCM tokens
    const tokensQuery = await admin.firestore()
      .collection('fcmTokens')
      .where('userId', '==', userId)
      .get();

    const tokens: string[] = [];
    tokensQuery.forEach(doc => {
      tokens.push(doc.data().token);
    });

    if (tokens.length === 0) return;

    const message = {
      notification: {
        title: 'Payment Failed',
        body: 'Your subscription payment failed. Please update your payment method.',
      },
      data: {
        type: 'payment_failed',
        invoiceId: invoice.id,
        amount: invoice.amount_due?.toString() || '0',
      },
      tokens,
    };

    await admin.messaging().sendMulticast(message);

  } catch (error) {
    console.error('Error sending payment failed notification:', error);
  }
}