"use strict";
// @ts-nocheck - Temporarily disabled type checking - file uses v1 API and is not currently exported
/**
 * 🪝 DAMP Smart Drinkware - Enhanced Stripe Webhook Handler
 * Complete webhook processing for all Stripe events
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
// Initialize Stripe
const stripe = new stripe_1.default(functions.config().stripe.secret_key, {
    apiVersion: '2023-10-16',
});
/**
 * Enhanced webhook handler for all Stripe events
 */
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.get('Stripe-Signature');
    const webhookSecret = functions.config().stripe.webhook_secret;
    if (!sig || !webhookSecret) {
        console.error('Missing Stripe signature or webhook secret');
        res.status(400).send('Missing Stripe signature or webhook secret');
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
        console.log('Webhook received:', event.type, event.id);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(400).send(`Webhook Error: ${err}`);
        return;
    }
    try {
        // Process webhook event
        await processWebhookEvent(event);
        // Log successful webhook processing
        await admin.firestore().collection('webhook_logs').add({
            eventId: event.id,
            eventType: event.type,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'success',
        });
        res.json({ received: true });
    }
    catch (error) {
        console.error('Error handling webhook:', error);
        // Log failed webhook processing
        await admin.firestore().collection('webhook_logs').add({
            eventId: event.id,
            eventType: event.type,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});
/**
 * Process different types of webhook events
 */
async function processWebhookEvent(event) {
    switch (event.type) {
        // Subscription events
        case 'customer.subscription.created':
            await handleSubscriptionCreated(event.data.object);
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            break;
        // Invoice events
        case 'invoice.payment_succeeded':
            await handlePaymentSucceeded(event.data.object);
            break;
        case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
        case 'invoice.upcoming':
            await handleUpcomingInvoice(event.data.object);
            break;
        // Customer events
        case 'customer.created':
            await handleCustomerCreated(event.data.object);
            break;
        case 'customer.updated':
            await handleCustomerUpdated(event.data.object);
            break;
        // Payment method events
        case 'payment_method.attached':
            await handlePaymentMethodAttached(event.data.object);
            break;
        // Checkout events
        case 'checkout.session.completed':
            await handleCheckoutSessionCompleted(event.data.object);
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
}
/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription) {
    console.log('Processing subscription created:', subscription.id);
    const userId = await getUserIdFromCustomer(subscription.customer);
    if (!userId) {
        console.error('User not found for customer:', subscription.customer);
        return;
    }
    // Update user subscription status
    await admin.firestore().collection('users').doc(userId).update({
        'subscription.status': subscription.status,
        'subscription.stripeSubscriptionId': subscription.id,
        'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
    });
    // Send welcome notification
    await sendSubscriptionNotification(userId, {
        type: 'subscription_activated',
        title: 'Welcome to Premium!',
        body: 'Your DAMP Smart Drinkware premium subscription is now active.',
    });
}
/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
    console.log('Processing subscription updated:', subscription.id);
    const userId = await getUserIdFromCustomer(subscription.customer);
    if (!userId)
        return;
    const updateData = {
        'subscription.status': subscription.status,
        'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
    };
    await admin.firestore().collection('users').doc(userId).update(updateData);
    // Log subscription event
    await admin.firestore().collection('subscription_events').add({
        userId,
        type: 'subscription_updated',
        subscriptionId: subscription.id,
        status: subscription.status,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
}
/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription) {
    console.log('Processing subscription deleted:', subscription.id);
    const userId = await getUserIdFromCustomer(subscription.customer);
    if (!userId)
        return;
    await admin.firestore().collection('users').doc(userId).update({
        'subscription.status': 'canceled',
        'subscription.cancelAtPeriodEnd': true,
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
    });
    // Send cancellation notification
    await sendSubscriptionNotification(userId, {
        type: 'subscription_canceled',
        title: 'Subscription Canceled',
        body: 'Your premium subscription has been canceled. You\'ll keep access until your billing period ends.',
    });
}
/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice) {
    console.log('Processing payment succeeded:', invoice.id);
    if (!invoice.subscription)
        return;
    const userId = await getUserIdFromSubscription(invoice.subscription);
    if (!userId)
        return;
    // Update billing history
    await admin.firestore().collection('users').doc(userId).update({
        'subscription.billingHistory': admin.firestore.FieldValue.arrayUnion({
            invoiceId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'paid',
            paidAt: new Date(invoice.status_transitions.paid_at * 1000),
        }),
        'subscription.lastPaymentDate': new Date(invoice.status_transitions.paid_at * 1000),
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
    });
    // Send payment confirmation
    await sendSubscriptionNotification(userId, {
        type: 'payment_succeeded',
        title: 'Payment Successful',
        body: `Your payment of ${formatCurrency(invoice.amount_paid, invoice.currency)} has been processed.`,
    });
}
/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
    console.log('Processing payment failed:', invoice.id);
    if (!invoice.subscription)
        return;
    const userId = await getUserIdFromSubscription(invoice.subscription);
    if (!userId)
        return;
    // Update failed payment info
    await admin.firestore().collection('users').doc(userId).update({
        'subscription.lastFailedPayment': {
            invoiceId: invoice.id,
            amount: invoice.amount_due,
            currency: invoice.currency,
            failedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
    });
    // Send payment failure notification
    await sendSubscriptionNotification(userId, {
        type: 'payment_failed',
        title: 'Payment Failed',
        body: 'Your subscription payment failed. Please update your payment method.',
    });
}
/**
 * Handle upcoming invoice (3 days before charge)
 */
async function handleUpcomingInvoice(invoice) {
    console.log('Processing upcoming invoice:', invoice.id);
    if (!invoice.subscription)
        return;
    const userId = await getUserIdFromSubscription(invoice.subscription);
    if (!userId)
        return;
    // Send upcoming payment notification
    await sendSubscriptionNotification(userId, {
        type: 'upcoming_payment',
        title: 'Upcoming Payment',
        body: `Your subscription will renew on ${new Date(invoice.period_end * 1000).toLocaleDateString()}.`,
    });
}
/**
 * Handle customer creation
 */
async function handleCustomerCreated(customer) {
    console.log('Processing customer created:', customer.id);
    // Log customer creation - user will be linked when subscription is created
    await admin.firestore().collection('stripe_customers').doc(customer.id).set({
        customerId: customer.id,
        email: customer.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}
/**
 * Handle customer updates
 */
async function handleCustomerUpdated(customer) {
    console.log('Processing customer updated:', customer.id);
    await admin.firestore().collection('stripe_customers').doc(customer.id).update({
        email: customer.email,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}
/**
 * Handle payment method attachment
 */
async function handlePaymentMethodAttached(paymentMethod) {
    var _a, _b, _c, _d;
    console.log('Processing payment method attached:', paymentMethod.id);
    if (!paymentMethod.customer)
        return;
    const userId = await getUserIdFromCustomer(paymentMethod.customer);
    if (!userId)
        return;
    // Update user's payment method info
    const paymentMethodInfo = {
        id: paymentMethod.id,
        type: paymentMethod.type,
        last4: (_a = paymentMethod.card) === null || _a === void 0 ? void 0 : _a.last4,
        brand: (_b = paymentMethod.card) === null || _b === void 0 ? void 0 : _b.brand,
        expiryMonth: (_c = paymentMethod.card) === null || _c === void 0 ? void 0 : _c.exp_month,
        expiryYear: (_d = paymentMethod.card) === null || _d === void 0 ? void 0 : _d.exp_year,
    };
    await admin.firestore().collection('users').doc(userId).update({
        'subscription.paymentMethod': paymentMethodInfo,
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
    });
}
/**
 * Handle checkout session completion
 */
async function handleCheckoutSessionCompleted(session) {
    var _a;
    console.log('Processing checkout session completed:', session.id);
    const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId)
        return;
    // Log successful checkout
    await admin.firestore().collection('subscription_events').add({
        userId,
        type: 'checkout_completed',
        sessionId: session.id,
        subscriptionId: session.subscription,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
}
/**
 * Helper Functions
 */
async function getUserIdFromCustomer(customerId) {
    const usersQuery = await admin.firestore()
        .collection('users')
        .where('subscription.stripeCustomerId', '==', customerId)
        .get();
    if (usersQuery.empty)
        return null;
    return usersQuery.docs[0].id;
}
async function getUserIdFromSubscription(subscriptionId) {
    var _a;
    const subscriptionDoc = await admin.firestore()
        .collection('subscriptions')
        .doc(subscriptionId)
        .get();
    if (!subscriptionDoc.exists)
        return null;
    return ((_a = subscriptionDoc.data()) === null || _a === void 0 ? void 0 : _a.userId) || null;
}
async function sendSubscriptionNotification(userId, notification) {
    try {
        // Get user's FCM tokens
        const tokensQuery = await admin.firestore()
            .collection('fcmTokens')
            .where('userId', '==', userId)
            .get();
        const tokens = [];
        tokensQuery.forEach(doc => {
            tokens.push(doc.data().token);
        });
        if (tokens.length === 0)
            return;
        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: {
                type: notification.type,
                userId,
            },
            tokens,
        };
        await admin.messaging().sendMulticast(message);
    }
    catch (error) {
        console.error('Error sending subscription notification:', error);
    }
}
function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
}
//# sourceMappingURL=stripe-webhooks.js.map