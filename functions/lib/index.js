"use strict";
/**
 * DAMP Smart Drinkware - Firebase Cloud Functions
 * Backend services for Web, iOS, and Android apps
 * Copyright 2025 WeCr8 Solutions LLC
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.getLastSyncTimestamp = exports.bulkSyncData = exports.cleanupSyncQueue = exports.getSyncStatus = exports.processSyncQueue = exports.queueOfflineAction = exports.deleteUserAccount = exports.getPersonalizedGreeting = exports.completeDeviceSetup = exports.updateNotificationPreferences = exports.getUserProfile = exports.uploadUserAvatar = exports.updateUserProfile = exports.manageSubscription = exports.handleSubscriptionSuccess = exports.createSubscriptionCheckout = exports.api = exports.getAdminDashboard = exports.trackActivity = exports.sendNotification = exports.saveFCMToken = exports.castVote = exports.updateDeviceStatus = exports.registerDevice = exports.deleteUserData = exports.createUserProfile = void 0;
// Remove unused imports and fix missing modules
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors");
const express = require("express");
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
exports.createUserProfile = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = auth.uid;
    try {
        const userProfile = {
            email: data.email || '',
            displayName: data.displayName || '',
            photoURL: data.photoURL || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isAdmin: false,
            devices: []
        };
        await admin.firestore().collection('users').doc(userId).set(userProfile);
        console.log(`Created profile for user ${userId}`);
        return { customClaims: {} };
    }
    catch (error) {
        console.error('Error creating user profile:', error);
        throw new https_1.HttpsError('internal', 'Error creating user profile');
    }
});
/**
 * Clean up user data when account is deleted
 */
exports.deleteUserData = (0, https_1.onCall)(async (request) => {
    const { auth } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = auth.uid;
    try {
        const batch = admin.firestore().batch();
        // Delete user document
        const userRef = admin.firestore().collection('users').doc(userId);
        batch.delete(userRef);
        // Delete user's votes
        const votesQuery = await admin.firestore()
            .collection('userVotes')
            .where('userId', '==', userId)
            .get();
        votesQuery.forEach(doc => {
            batch.delete(doc.ref);
        });
        // Delete user's devices
        const devicesQuery = await admin.firestore()
            .collection('devices')
            .where('userId', '==', userId)
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
        console.log(`User data deleted for ${userId}`);
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
        const deviceData = {
            deviceId: data.deviceId,
            name: data.name,
            type: data.type,
            userId,
            settings: data.settings || {},
            metadata: data.metadata || {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        // Register the device
        await deviceRef.set(deviceData);
        // Update user document
        await admin.firestore().collection('users').doc(userId).update({
            devices: admin.firestore.FieldValue.arrayUnion(data.deviceId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
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
        await deviceRef.update({
            batteryLevel: data.batteryLevel,
            lastSeen: data.lastSeen ? admin.firestore.Timestamp.fromDate(new Date(data.lastSeen)) : undefined,
            isConnected: data.isConnected,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Check battery level for alerts
        if (data.batteryLevel !== undefined && data.batteryLevel < 20) {
            // Send low battery alert
            await sendBatteryAlert(userId, deviceId, data.batteryLevel);
        }
        return { success: true };
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
        // Use recommended sendEachForMulticast instead of deprecated sendMulticast
        await admin.messaging().sendEachForMulticast(message);
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
        // Update user stats
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
        // Use recommended sendEachForMulticast instead of deprecated sendMulticast
        const response = await admin.messaging().sendEachForMulticast(message);
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
app.get('/health', (_req, res) => {
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
// SUBSCRIPTION MANAGEMENT FUNCTIONS
// =============================================================================
var subscriptions_1 = require("./subscriptions");
Object.defineProperty(exports, "createSubscriptionCheckout", { enumerable: true, get: function () { return subscriptions_1.createSubscriptionCheckout; } });
Object.defineProperty(exports, "handleSubscriptionSuccess", { enumerable: true, get: function () { return subscriptions_1.handleSubscriptionSuccess; } });
Object.defineProperty(exports, "manageSubscription", { enumerable: true, get: function () { return subscriptions_1.manageSubscription; } });
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
var offline_sync_1 = require("./offline-sync");
Object.defineProperty(exports, "queueOfflineAction", { enumerable: true, get: function () { return offline_sync_1.queueOfflineAction; } });
Object.defineProperty(exports, "processSyncQueue", { enumerable: true, get: function () { return offline_sync_1.processSyncQueue; } });
Object.defineProperty(exports, "getSyncStatus", { enumerable: true, get: function () { return offline_sync_1.getSyncStatus; } });
Object.defineProperty(exports, "cleanupSyncQueue", { enumerable: true, get: function () { return offline_sync_1.cleanupSyncQueue; } });
Object.defineProperty(exports, "bulkSyncData", { enumerable: true, get: function () { return offline_sync_1.bulkSyncData; } });
Object.defineProperty(exports, "getLastSyncTimestamp", { enumerable: true, get: function () { return offline_sync_1.getLastSyncTimestamp; } });
// =============================================================================
// ENHANCED STRIPE WEBHOOK FUNCTIONS
// =============================================================================
var stripe_webhooks_1 = require("./stripe-webhooks");
Object.defineProperty(exports, "handleStripeWebhook", { enumerable: true, get: function () { return stripe_webhooks_1.handleStripeWebhook; } });
//# sourceMappingURL=index.js.map