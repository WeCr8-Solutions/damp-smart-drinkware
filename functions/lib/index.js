"use strict";
/**
 * DAMP Smart Drinkware - Firebase Cloud Functions
 * Backend services for Web, iOS, and Android apps
 * Copyright 2025 WeCr8 Solutions LLC
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesStats = exports.deleteUserAccount = exports.getPersonalizedGreeting = exports.completeDeviceSetup = exports.updateNotificationPreferences = exports.getUserProfile = exports.uploadUserAvatar = exports.updateUserProfile = exports.getSubscriptionStatus = exports.manageSubscription = exports.handleSubscriptionSuccess = exports.createSubscriptionCheckout = exports.stripeWebhook = exports.getWaitlistCount = exports.saveEmail = exports.checkVoteStatus = exports.getVotingResults = exports.submitVote = exports.getSalesStatsHttp = exports.getCheckoutSession = exports.createCheckoutSession = exports.api = exports.getAdminDashboard = exports.trackActivity = exports.sendNotification = exports.saveFCMToken = exports.castVote = exports.updateDeviceStatus = exports.registerDevice = exports.deleteUserData = exports.createUserProfile = void 0;
const https_1 = require("firebase-functions/v2/https");
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const cors = require("cors");
const express = require("express");
const stripe_1 = require("stripe");
// Initialize Firebase Admin
admin.initializeApp();
const corsHandler = cors({ origin: true });
const app = express();
app.use(corsHandler);
// =============================================================================
// USER MANAGEMENT FUNCTIONS
// =============================================================================
/**
 * Create user profile after authentication
 * Triggered when new user signs up
 */
exports.createUserProfile = functions.auth.user().beforeCreate(async (user) => {
    try {
        const userProfile = {
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isAdmin: false,
            devices: []
        };
        await admin.firestore().collection('users').doc(user.uid).set(userProfile);
        console.log(`Created profile for user ${user.uid}`);
    }
    catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
});
/**
 * Clean up user data when account is deleted
 */
exports.deleteUserData = functions.auth.user().onDelete(async (user) => {
    const uid = user.uid;
    try {
        const batch = admin.firestore().batch();
        // Delete user document
        const userRef = admin.firestore().collection('users').doc(uid);
        batch.delete(userRef);
        // Delete user's votes
        const votesQuery = await admin.firestore()
            .collection('userVotes')
            .where('userId', '==', uid)
            .get();
        votesQuery.forEach(doc => {
            batch.delete(doc.ref);
        });
        // Delete user's devices
        const devicesQuery = await admin.firestore()
            .collection('devices')
            .where('userId', '==', uid)
            .get();
        devicesQuery.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        // Update global stats
        await admin.firestore().collection('stats').doc('global').update({
            totalUsers: admin.firestore.FieldValue.increment(-1),
            deletedUsersToday: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`User data deleted for ${uid}`);
    }
    catch (error) {
        console.error('Error deleting user data:', error);
    }
});
// =============================================================================
// DEVICE MANAGEMENT FUNCTIONS
// =============================================================================
/**
 * Register a new DAMP device
 */
exports.registerDevice = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = auth.uid;
    try {
        // Validate device data
        if (!data.deviceId || !data.name || !data.type) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required device information');
        }
        // Check if device is already registered
        const deviceRef = admin.firestore().collection('devices').doc(data.deviceId);
        const deviceDoc = await deviceRef.get();
        if (deviceDoc.exists) {
            throw new https_1.HttpsError('already-exists', 'Device is already registered');
        }
        // Register the device
        const deviceData = Object.assign(Object.assign({}, data), { userId, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), status: 'active' });
        await deviceRef.set(deviceData);
        // Update user's devices list
        await admin.firestore().collection('users').doc(userId).update({
            devices: admin.firestore.FieldValue.arrayUnion(data.deviceId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, deviceId: data.deviceId };
    }
    catch (error) {
        console.error('Error registering device:', error);
        throw new https_1.HttpsError('internal', 'Failed to register device');
    }
});
/**
 * Update device status (battery, location, etc.)
 */
exports.updateDeviceStatus = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = auth.uid;
    try {
        const deviceId = data.deviceId;
        const deviceRef = admin.firestore().collection('devices').doc(deviceId);
        const device = await deviceRef.get();
        if (!device.exists) {
            throw new https_1.HttpsError('not-found', 'Device not found');
        }
        const deviceData = device.data();
        if (deviceData.userId !== userId) {
            throw new https_1.HttpsError('permission-denied', 'Access denied');
        }
        // Update device status
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (data.batteryLevel !== undefined) {
            updateData.batteryLevel = data.batteryLevel;
            // Check if battery is low
            const warningThreshold = ((_a = data.settings) === null || _a === void 0 ? void 0 : _a.batteryWarning) || 20;
            if (data.batteryLevel < warningThreshold) {
                await sendBatteryAlert(userId, deviceId, data.batteryLevel);
            }
        }
        if (data.lastSeen !== undefined) {
            updateData.lastSeen = data.lastSeen;
        }
        if (data.isConnected !== undefined) {
            updateData.isConnected = data.isConnected;
        }
        if (data.settings) {
            const existingSettings = deviceData.settings || {};
            updateData.settings = {
                batteryWarning: (_b = data.settings.batteryWarning) !== null && _b !== void 0 ? _b : existingSettings.batteryWarning,
                additionalSettings: Object.assign(Object.assign({}, existingSettings.additionalSettings), data.settings.additionalSettings)
            };
        }
        await deviceRef.update(updateData);
        return { success: true, deviceId };
    }
    catch (error) {
        console.error('Error updating device status:', error);
        throw new https_1.HttpsError('internal', 'Failed to update device status');
    }
});
/**
 * Send low battery alert
 */
async function sendBatteryAlert(userId, deviceId, batteryLevel) {
    var _a, _b;
    try {
        // Get user's notification preferences
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();
        if (!((_b = (_a = userData === null || userData === void 0 ? void 0 : userData.preferences) === null || _a === void 0 ? void 0 : _a.notifications) === null || _b === void 0 ? void 0 : _b.push)) {
            return; // User has disabled push notifications
        }
        // Get user's FCM tokens (for mobile push notifications)
        const tokensQuery = await admin.firestore()
            .collection('fcmTokens')
            .where('userId', '==', userId)
            .get();
        const tokens = [];
        tokensQuery.forEach(doc => {
            tokens.push(doc.data().token);
        });
        if (tokens.length === 0) {
            return; // No FCM tokens found
        }
        // Send push notification
        const message = {
            notification: {
                title: 'DAMP Device Low Battery',
                body: `Your device battery is at ${batteryLevel}%. Please charge soon.`
            },
            data: {
                type: 'battery_alert',
                deviceId,
                batteryLevel: batteryLevel.toString()
            },
            tokens
        };
        await admin.messaging().sendMulticast(message);
    }
    catch (error) {
        console.error('Error sending battery alert:', error);
    }
}
// =============================================================================
// VOTING SYSTEM FUNCTIONS
// =============================================================================
/**
 * Cast a vote (with duplicate prevention)
 */
exports.castVote = (0, https_1.onCall)(async (request) => {
    const { data, auth } = request;
    const { productId, vote } = data;
    try {
        // Create unique vote ID
        const userId = (auth === null || auth === void 0 ? void 0 : auth.uid) || 'anonymous';
        const voteId = `${productId}_${userId}_${Date.now()}`;
        // Check for existing vote (authenticated users only)
        if (userId !== 'anonymous') {
            const existingVote = await admin.firestore()
                .collection('userVotes')
                .where('userId', '==', userId)
                .where('productId', '==', productId)
                .get();
            if (!existingVote.empty) {
                throw new https_1.HttpsError('already-exists', 'User has already voted for this product');
            }
        }
        const batch = admin.firestore().batch();
        // Record the vote
        const voteRecord = {
            voteId,
            productId,
            userId,
            vote,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            isAuthenticated: userId !== 'anonymous',
            platform: 'web'
        };
        // Save vote record
        batch.set(admin.firestore().collection('userVotes').doc(voteId), voteRecord);
        // Update user stats (only for authenticated users)
        if (userId !== 'anonymous') {
            batch.update(admin.firestore().collection('users').doc(userId), {
                'stats.votesCount': admin.firestore.FieldValue.increment(1),
                'stats.loyaltyPoints': admin.firestore.FieldValue.increment(10),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        // Update product vote count
        batch.update(admin.firestore().collection('voting').doc('productVoting'), {
            [`products.${productId}.votes`]: admin.firestore.FieldValue.increment(1),
            [`products.${productId}.${vote ? 'up' : 'down'}votes`]: admin.firestore.FieldValue.increment(1),
            [`products.${productId}.lastVote`]: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Update global stats
        batch.update(admin.firestore().collection('stats').doc('global'), {
            totalVotes: admin.firestore.FieldValue.increment(1),
            [`${vote ? 'up' : 'down'}votes`]: admin.firestore.FieldValue.increment(1),
            votesToday: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await batch.commit();
        return { success: true, id: voteId };
    }
    catch (error) {
        console.error('Error casting vote:', error);
        throw new https_1.HttpsError('internal', 'Failed to cast vote');
    }
});
// =============================================================================
// NOTIFICATION FUNCTIONS
// =============================================================================
/**
 * Store FCM token for push notifications
 */
exports.saveFCMToken = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const userId = auth.uid;
        const { token } = data;
        if (!token) {
            throw new https_1.HttpsError('invalid-argument', 'No token provided');
        }
        // Add token to user's FCM tokens
        await admin.firestore()
            .collection('users')
            .doc(userId)
            .collection('fcm_tokens')
            .doc(token)
            .set({
            token,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error saving FCM token:', error);
        throw new https_1.HttpsError('internal', error instanceof Error ? error.message : 'An error occurred while saving the FCM token');
    }
});
/**
 * Send notification to user
 */
exports.sendNotification = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const { userId, title, body, data: messageData } = data;
        // Get user's FCM tokens
        const tokensSnapshot = await admin.firestore()
            .collection('users')
            .doc(userId)
            .collection('fcm_tokens')
            .get();
        if (tokensSnapshot.empty) {
            throw new https_1.HttpsError('not-found', 'No FCM tokens found for user');
        }
        const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
        // Send notifications to all tokens
        const message = {
            notification: {
                title,
                body,
            },
            data: messageData,
            tokens,
        };
        const response = await admin.messaging().sendMulticast(message);
        // Clean up invalid tokens
        const invalidTokens = response.responses
            .map((res, idx) => res.success ? null : tokens[idx])
            .filter((token) => token !== null);
        const removePromises = invalidTokens.map(token => admin.firestore()
            .collection('users')
            .doc(userId)
            .collection('fcm_tokens')
            .doc(token)
            .delete());
        await Promise.all(removePromises);
        return {
            successCount: response.successCount,
            failureCount: response.failureCount
        };
    }
    catch (error) {
        console.error('Error sending notification:', error);
        throw new https_1.HttpsError('internal', error instanceof Error ? error.message : 'An error occurred while sending the notification');
    }
});
// =============================================================================
// ANALYTICS FUNCTIONS
// =============================================================================
/**
 * Track user activity
 */
exports.trackActivity = (0, https_1.onCall)(async (request) => {
    const { data, auth } = request;
    const { activityType, activityData: properties } = data;
    try {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        const userId = (auth === null || auth === void 0 ? void 0 : auth.uid) || null;
        const activity = {
            activityType,
            properties: properties || {},
            userId,
            timestamp,
            isAuthenticated: !!userId,
            platform: (properties === null || properties === void 0 ? void 0 : properties.platform) || 'web'
        };
        // Store activity
        await admin.firestore().collection('analytics').add(activity);
        // Update user stats if authenticated
        if (userId) {
            const updates = {
                lastActivityAt: timestamp,
                updatedAt: timestamp,
                'stats.activitiesCount': admin.firestore.FieldValue.increment(1),
                [`stats.platformStats.${(properties === null || properties === void 0 ? void 0 : properties.platform) || 'web'}.activityCount`]: admin.firestore.FieldValue.increment(1)
            };
            await admin.firestore().collection('users').doc(userId).update(updates);
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error tracking activity:', error);
        throw error;
    }
});
// =============================================================================
// ADMIN FUNCTIONS
// =============================================================================
/**
 * Get admin dashboard data
 */
exports.getAdminDashboard = (0, https_1.onCall)(async (request) => {
    var _a;
    const { data, auth } = request;
    // Validate auth
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required');
    }
    // Check admin role
    const user = await admin.auth().getUser(auth.uid);
    if (!((_a = user.customClaims) === null || _a === void 0 ? void 0 : _a.admin)) {
        throw new https_1.HttpsError('permission-denied', 'Admin access required');
    }
    try {
        // Prepare date ranges
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const startDate = data.startDate ? new Date(data.startDate) : thirtyDaysAgo;
        const endDate = data.endDate ? new Date(data.endDate) : new Date();
        // Query user stats
        const usersSnapshot = await admin.firestore().collection('users').get();
        const activeUsersSnapshot = await admin.firestore()
            .collection('users')
            .where('lastActivityAt', '>=', startDate)
            .get();
        const newUsersSnapshot = await admin.firestore()
            .collection('users')
            .where('createdAt', '>=', startDate)
            .get();
        // Query device stats
        const devicesSnapshot = await admin.firestore().collection('devices').get();
        const activeDevicesSnapshot = await admin.firestore()
            .collection('devices')
            .where('lastActiveAt', '>=', startDate)
            .get();
        // Build device status stats
        const deviceStatusStats = {};
        devicesSnapshot.forEach(doc => {
            const data = doc.data();
            const status = data.status || 'unknown';
            deviceStatusStats[status] = (deviceStatusStats[status] || 0) + 1;
        });
        // Query activity stats within date range
        const activitiesSnapshot = await admin.firestore()
            .collection('analytics')
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .get();
        // Build activity type and platform stats
        const activityTypeStats = {};
        const platformStats = {};
        activitiesSnapshot.forEach(doc => {
            const data = doc.data();
            const type = data.activityType || 'unknown';
            const platform = data.platform || 'web';
            activityTypeStats[type] = (activityTypeStats[type] || 0) + 1;
            platformStats[platform] = (platformStats[platform] || 0) + 1;
        });
        // Get voting stats
        const votingStats = (await admin.firestore()
            .collection('voting')
            .doc('productVoting')
            .get()).data() || {};
        // Build voting by product stats
        const votesByProduct = {};
        Object.entries(votingStats.products || {}).forEach(([productId, product]) => {
            votesByProduct[productId] = product.votes || 0;
        });
        // Return aggregated dashboard data
        return {
            userStats: {
                total: usersSnapshot.size,
                active: activeUsersSnapshot.size,
                new: newUsersSnapshot.size
            },
            activityStats: {
                total: activitiesSnapshot.size,
                byPlatform: platformStats,
                byType: activityTypeStats
            },
            votingStats: {
                total: votingStats.totalVotes || 0,
                byProduct: votesByProduct
            },
            deviceStats: {
                total: devicesSnapshot.size,
                active: activeDevicesSnapshot.size,
                byStatus: deviceStatusStats
            }
        };
    }
    catch (error) {
        console.error('Error getting dashboard data:', error);
        throw new https_1.HttpsError('internal', error instanceof Error ? error.message : 'An error occurred while getting dashboard data');
    }
});
// =============================================================================
// HTTP ENDPOINTS
// =============================================================================
/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
/**
 * User profile management
 */
app.put('/user/:userId/profile', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        // Add timestamp
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        await admin.firestore().collection('users').doc(userId).update(updates);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * Device management endpoint
 */
app.get('/user/:userId/devices', async (req, res) => {
    try {
        const { userId } = req.params;
        const devicesQuery = await admin.firestore()
            .collection('devices')
            .where('userId', '==', userId)
            .get();
        const devices = devicesQuery.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.json({ devices });
    }
    catch (error) {
        console.error('Error getting user devices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Export the Express app as a Firebase Function
exports.api = (0, https_1.onRequest)(app);
// =============================================================================
// MIGRATED NETLIFY FUNCTIONS - HTTP ENDPOINTS
// =============================================================================
// Lazy Stripe initialization - only when needed
let stripe = null;
function getStripeInstance() {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
        stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
}
const DEFAULT_VOTING_DATA = {
    products: {
        handle: { votes: 0, name: 'DAMP Handle v1.0' },
        siliconeBottom: { votes: 0, name: 'Silicone Bottom v1.0' },
        cupSleeve: { votes: 0, name: 'Cup Sleeve v1.0' }
    },
    votes: {},
    totalVotes: 0,
    lastUpdated: new Date().toISOString()
};
async function getVotingData() {
    try {
        const doc = await admin.firestore().collection('system').doc('voting-data').get();
        if (doc.exists) {
            return doc.data();
        }
        // Initialize with default data
        await admin.firestore().collection('system').doc('voting-data').set(DEFAULT_VOTING_DATA);
        return DEFAULT_VOTING_DATA;
    }
    catch (error) {
        console.error('Error loading voting data:', error);
        return DEFAULT_VOTING_DATA;
    }
}
async function saveVotingData(data) {
    try {
        data.lastUpdated = new Date().toISOString();
        await admin.firestore().collection('system').doc('voting-data').set(data);
    }
    catch (error) {
        console.error('Error saving voting data:', error);
        throw error;
    }
}
async function getVote(voterId) {
    const data = await getVotingData();
    return data.votes[voterId] || null;
}
async function hasVoted(voterId) {
    const data = await getVotingData();
    return !!data.votes[voterId];
}
async function recordVote(voterId, productId, voteType) {
    const data = await getVotingData();
    if (data.votes[voterId]) {
        return {
            success: false,
            error: 'already_voted',
            existingVote: data.votes[voterId]
        };
    }
    data.votes[voterId] = {
        productId,
        timestamp: Date.now(),
        type: voteType
    };
    if (data.products[productId]) {
        data.products[productId].votes += 1;
        data.totalVotes += 1;
    }
    await saveVotingData(data);
    return {
        success: true,
        vote: data.votes[voterId],
        stats: {
            productVotes: data.products[productId].votes,
            totalVotes: data.totalVotes
        }
    };
}
async function getVotingResultsHelper() {
    const data = await getVotingData();
    const results = Object.entries(data.products).map(([id, productData]) => ({
        id,
        name: productData.name,
        votes: productData.votes,
        percentage: data.totalVotes > 0
            ? Math.round((productData.votes / data.totalVotes) * 100)
            : 0
    }));
    results.sort((a, b) => b.votes - a.votes);
    return {
        results,
        totalVotes: data.totalVotes,
        lastUpdated: data.lastUpdated
    };
}
// =============================================================================
// EMAIL STORAGE HELPERS (Using Firestore)
// =============================================================================
async function getWaitlistEmails() {
    try {
        const snapshot = await admin.firestore()
            .collection('waitlist_emails')
            .orderBy('timestamp', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
    catch (error) {
        console.error('Error getting waitlist emails:', error);
        return [];
    }
}
async function saveWaitlistEmail(email, name, source, ip) {
    try {
        const emailLower = email.toLowerCase();
        // Check if email already exists
        const existing = await admin.firestore()
            .collection('waitlist_emails')
            .where('email', '==', emailLower)
            .limit(1)
            .get();
        if (!existing.empty) {
            return { exists: true, count: (await getWaitlistEmails()).length };
        }
        // Save new email
        await admin.firestore().collection('waitlist_emails').add({
            email: emailLower,
            name,
            source,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            ip
        });
        const emails = await getWaitlistEmails();
        return { exists: false, count: emails.length };
    }
    catch (error) {
        console.error('Error saving waitlist email:', error);
        throw error;
    }
}
// =============================================================================
// HTTP FUNCTIONS - MIGRATED FROM NETLIFY
// =============================================================================
/**
 * Create Stripe Checkout Session
 */
exports.createCheckoutSession = (0, https_1.onRequest)({
    cors: true
}, async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const stripeInstance = getStripeInstance();
    if (!stripeInstance) {
        res.status(500).json({ error: 'Stripe not configured' });
        return;
    }
    try {
        const { line_items, mode, success_url, cancel_url, metadata, shipping_address_collection } = req.body;
        if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
            res.status(400).json({ error: 'Invalid line items' });
            return;
        }
        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: mode || 'payment',
            success_url,
            cancel_url,
            billing_address_collection: 'required',
            shipping_address_collection: shipping_address_collection || {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH'],
            },
            metadata: Object.assign(Object.assign({}, metadata), { timestamp: new Date().toISOString(), source: (metadata === null || metadata === void 0 ? void 0 : metadata.source) || 'website', refund_policy_version: '1.0', expected_delivery: '90-120 days after goal met', refund_eligible: 'true', production_threshold: '500 reservations' }),
            allow_promotion_codes: true,
            phone_number_collection: {
                enabled: true,
            },
            automatic_tax: {
                enabled: false,
            },
            consent_collection: {
                terms_of_service: 'required'
            },
            customer_creation: 'always',
        });
        res.json({
            sessionId: session.id,
            url: session.url
        });
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({
            error: 'Unable to create checkout session',
            details: error.message
        });
    }
});
/**
 * Get Stripe Checkout Session
 */
exports.getCheckoutSession = (0, https_1.onRequest)({
    cors: true
}, async (req, res) => {
    var _a, _b, _c, _d;
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const stripeInstance = getStripeInstance();
    if (!stripeInstance) {
        res.status(500).json({ error: 'Stripe not configured' });
        return;
    }
    try {
        const session_id = req.query.session_id;
        if (!session_id) {
            res.status(400).json({ error: 'Missing session_id parameter' });
            return;
        }
        const session = await stripeInstance.checkout.sessions.retrieve(session_id, {
            expand: ['line_items', 'customer', 'payment_intent']
        });
        res.json({
            id: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
            customer_email: ((_a = session.customer_details) === null || _a === void 0 ? void 0 : _a.email) || session.customer_email,
            customer_details: {
                email: (_b = session.customer_details) === null || _b === void 0 ? void 0 : _b.email,
                name: (_c = session.customer_details) === null || _c === void 0 ? void 0 : _c.name
            },
            payment_status: session.payment_status,
            status: session.status,
            created: session.created,
            metadata: session.metadata,
            line_items: ((_d = session.line_items) === null || _d === void 0 ? void 0 : _d.data.map(item => {
                var _a;
                return ({
                    id: item.id,
                    description: item.description,
                    amount_total: item.amount_total,
                    quantity: item.quantity || 0,
                    price: (_a = item.price) === null || _a === void 0 ? void 0 : _a.unit_amount
                });
            })) || []
        });
    }
    catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).json({
            error: 'Failed to retrieve order details',
            details: error.message
        });
    }
});
/**
 * Get Sales Stats (HTTP endpoint - migrated from Netlify)
 */
exports.getSalesStatsHttp = (0, https_1.onRequest)({
    cors: true
}, async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const stripeInstance = getStripeInstance();
    if (!stripeInstance) {
        res.json({
            totalSales: 0,
            productSales: {
                'cup-sleeve': 0,
                'silicone-bottom': 0,
                'damp-handle': 0,
            },
            lastUpdated: new Date().toISOString(),
            message: 'Stripe integration pending - showing mock data'
        });
        return;
    }
    try {
        const sessions = await stripeInstance.checkout.sessions.list({
            limit: 100,
            status: 'complete',
        });
        let totalSales = 0;
        const productSales = {
            'cup-sleeve': 0,
            'silicone-bottom': 0,
            'damp-handle': 0,
        };
        for (const session of sessions.data) {
            totalSales++;
            try {
                const lineItems = await stripeInstance.checkout.sessions.listLineItems(session.id, {
                    limit: 10,
                });
                for (const item of lineItems.data) {
                    const description = (item.description || '').toLowerCase();
                    const quantity = item.quantity || 0;
                    if (description.includes('cup sleeve')) {
                        productSales['cup-sleeve'] += quantity;
                    }
                    else if (description.includes('silicone bottom')) {
                        productSales['silicone-bottom'] += quantity;
                    }
                    else if (description.includes('handle')) {
                        productSales['damp-handle'] += quantity;
                    }
                }
            }
            catch (lineItemError) {
                console.warn('Could not fetch line items for session:', session.id);
            }
        }
        res.json({
            totalSales,
            productSales,
            lastUpdated: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error fetching sales stats:', error);
        res.json({
            error: 'Failed to fetch sales statistics',
            errorMessage: error.message || 'Unknown error',
            totalSales: 0,
            productSales: {
                'cup-sleeve': 0,
                'silicone-bottom': 0,
                'damp-handle': 0,
            },
            lastUpdated: new Date().toISOString(),
        });
    }
});
/**
 * Submit Vote
 */
exports.submitVote = (0, https_1.onRequest)({
    cors: true
}, async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { productId, fingerprint, userId, voteType } = req.body;
        if (!productId || !['handle', 'siliconeBottom', 'cupSleeve'].includes(productId)) {
            res.status(400).json({ error: 'Invalid product ID' });
            return;
        }
        if (voteType !== 'public' && voteType !== 'authenticated') {
            res.status(400).json({ error: 'Invalid vote type' });
            return;
        }
        const voterId = voteType === 'authenticated' ? userId : fingerprint;
        if (!voterId) {
            res.status(400).json({ error: 'Missing voter identifier' });
            return;
        }
        const existingVote = await getVote(voterId);
        if (existingVote) {
            const productNames = {
                handle: 'DAMP Handle v1.0',
                siliconeBottom: 'Silicone Bottom v1.0',
                cupSleeve: 'Cup Sleeve v1.0'
            };
            res.status(409).json({
                error: 'Already voted',
                message: `You already voted for ${productNames[existingVote.productId]}`,
                existingVote
            });
            return;
        }
        const result = await recordVote(voterId, productId, voteType);
        if (!result.success) {
            res.status(409).json({
                error: result.error,
                message: 'Vote could not be recorded',
                existingVote: result.existingVote
            });
            return;
        }
        const productNames = {
            handle: 'DAMP Handle v1.0',
            siliconeBottom: 'Silicone Bottom v1.0',
            cupSleeve: 'Cup Sleeve v1.0'
        };
        res.json({
            success: true,
            message: `Vote recorded for ${productNames[productId]}`,
            vote: result.vote,
            stats: result.stats
        });
    }
    catch (error) {
        console.error('Vote submission error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});
/**
 * Get Voting Results
 */
exports.getVotingResults = (0, https_1.onRequest)({
    cors: true
}, async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const data = await getVotingResultsHelper();
        res.set('Cache-Control', 'public, max-age=10');
        res.json(Object.assign({ success: true }, data));
    }
    catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});
/**
 * Check Vote Status
 */
exports.checkVoteStatus = (0, https_1.onRequest)({
    cors: true
}, async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { fingerprint, userId, voteType } = req.body;
        const voterId = voteType === 'authenticated' ? userId : fingerprint;
        if (!voterId) {
            res.status(400).json({ error: 'Missing voter identifier' });
            return;
        }
        const voted = await hasVoted(voterId);
        const existingVote = voted ? await getVote(voterId) : null;
        res.json({
            success: true,
            hasVoted: voted,
            vote: existingVote
        });
    }
    catch (error) {
        console.error('Error checking vote status:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});
/**
 * Save Email (Waitlist)
 */
exports.saveEmail = (0, https_1.onRequest)({
    cors: true
}, async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    try {
        if (req.method === 'GET') {
            const emails = await getWaitlistEmails();
            res.json({
                count: emails.length,
                lastUpdated: new Date().toISOString()
            });
            return;
        }
        if (req.method === 'POST') {
            const { email, source = 'waitlist', name = '' } = req.body;
            if (!email || !email.includes('@')) {
                res.status(400).json({ error: 'Valid email required' });
                return;
            }
            const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
            const result = await saveWaitlistEmail(email, name, source, Array.isArray(ip) ? ip[0] : ip);
            if (result.exists) {
                res.json({
                    message: 'Email already registered',
                    count: result.count,
                    alreadyExists: true
                });
                return;
            }
            res.json({
                success: true,
                message: 'Email saved successfully',
                count: result.count
            });
            return;
        }
        res.status(405).json({ error: 'Method not allowed' });
    }
    catch (error) {
        console.error('Error saving email:', error);
        res.status(500).json({
            error: 'Failed to save email',
            message: error.message
        });
    }
});
/**
 * Get Waitlist Count
 */
exports.getWaitlistCount = (0, https_1.onRequest)({
    cors: true
}, async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const emails = await getWaitlistEmails();
        res.json({
            count: emails.length,
            lastUpdated: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching waitlist count:', error);
        res.json({
            count: 0,
            lastUpdated: new Date().toISOString(),
            error: 'Could not fetch count'
        });
    }
});
/**
 * Stripe Webhook (HTTP endpoint - migrated from Netlify)
 * Note: For webhooks, use the dedicated handleStripeWebhook from stripe-webhooks.ts
 * This is kept for backward compatibility
 */
exports.stripeWebhook = (0, https_1.onRequest)({
    cors: true,
    rawBody: true
}, async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const stripeInstance = getStripeInstance();
    if (!stripeInstance) {
        res.status(500).json({ error: 'Stripe not configured' });
        return;
    }
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_LIVE_WEBHOOK_SECRET;
        let stripeEvent;
        if (webhookSecret) {
            try {
                const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
                stripeEvent = stripeInstance.webhooks.constructEvent(rawBody, sig, webhookSecret);
                console.log('Webhook signature verified');
            }
            catch (err) {
                console.error('Webhook signature verification failed:', err.message);
                res.status(400).json({ error: 'Webhook signature verification failed' });
                return;
            }
        }
        else {
            console.warn('No webhook secret - processing without verification');
            stripeEvent = req.body;
        }
        console.log('Stripe webhook event:', stripeEvent.type);
        switch (stripeEvent.type) {
            case 'checkout.session.completed':
                console.log('Checkout completed:', stripeEvent.data.object.id);
                // TODO: Send confirmation email, save to database
                break;
            case 'payment_intent.succeeded':
                console.log('Payment succeeded:', stripeEvent.data.object.id);
                break;
            case 'payment_intent.payment_failed':
                console.log('Payment failed:', stripeEvent.data.object.id);
                break;
            default:
                console.log(`Unhandled event type: ${stripeEvent.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            error: 'Webhook handler error',
            details: error.message
        });
    }
});
// =============================================================================
// SUBSCRIPTION MANAGEMENT FUNCTIONS
// =============================================================================
var subscriptions_1 = require("./subscriptions");
Object.defineProperty(exports, "createSubscriptionCheckout", { enumerable: true, get: function () { return subscriptions_1.createSubscriptionCheckout; } });
Object.defineProperty(exports, "handleSubscriptionSuccess", { enumerable: true, get: function () { return subscriptions_1.handleSubscriptionSuccess; } });
Object.defineProperty(exports, "manageSubscription", { enumerable: true, get: function () { return subscriptions_1.manageSubscription; } });
Object.defineProperty(exports, "getSubscriptionStatus", { enumerable: true, get: function () { return subscriptions_1.getSubscriptionStatus; } });
// =============================================================================
// USER PROFILE MANAGEMENT FUNCTIONS
// =============================================================================
var user_profile_1 = require("./user-profile");
Object.defineProperty(exports, "updateUserProfile", { enumerable: true, get: function () { return user_profile_1.updateUserProfile; } });
Object.defineProperty(exports, "uploadUserAvatar", { enumerable: true, get: function () { return user_profile_1.uploadUserAvatar; } });
Object.defineProperty(exports, "getUserProfile", { enumerable: true, get: function () { return user_profile_1.getUserProfile; } });
Object.defineProperty(exports, "updateNotificationPreferences", { enumerable: true, get: function () { return user_profile_1.updateNotificationPreferences; } });
Object.defineProperty(exports, "completeDeviceSetup", { enumerable: true, get: function () { return user_profile_1.completeDeviceSetup; } });
Object.defineProperty(exports, "getPersonalizedGreeting", { enumerable: true, get: function () { return user_profile_1.getPersonalizedGreeting; } });
Object.defineProperty(exports, "deleteUserAccount", { enumerable: true, get: function () { return user_profile_1.deleteUserAccount; } });
// =============================================================================
// OFFLINE SYNC FUNCTIONS
// =============================================================================
// Temporarily commented out - using v1 API, needs migration
// export {
//   queueOfflineAction,
//   processSyncQueue,
//   getSyncStatus,
//   cleanupSyncQueue,
//   bulkSyncData,
//   getLastSyncTimestamp,
// } from './offline-sync';
// =============================================================================
// ENHANCED STRIPE WEBHOOK FUNCTIONS
// =============================================================================
// Temporarily commented out - using v1 API, needs migration
// export {
//   handleStripeWebhook,
// } from './stripe-webhooks';
// =============================================================================
// STRIPE SALES STATISTICS
// =============================================================================
/**
 * Get real-time sales statistics from Firestore
 * This provides accurate pre-order counts without fake data
 */
exports.getSalesStats = (0, https_1.onCall)(async (request) => {
    try {
        // Count completed checkout sessions
        const checkoutEventsSnapshot = await admin.firestore()
            .collection('subscription_events')
            .where('type', '==', 'checkout_completed')
            .get();
        const totalSales = checkoutEventsSnapshot.size;
        // Get recent activity (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentSalesSnapshot = await admin.firestore()
            .collection('subscription_events')
            .where('type', '==', 'checkout_completed')
            .where('timestamp', '>=', oneDayAgo)
            .get();
        const recentSales = recentSalesSnapshot.size;
        return {
            totalSales,
            recentSales,
            lastUpdated: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error('Error getting sales stats:', error);
        throw new https_1.HttpsError('internal', 'Failed to get sales statistics');
    }
});
//# sourceMappingURL=index.js.map