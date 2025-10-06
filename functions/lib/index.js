"use strict";
/**
 * DAMP Smart Drinkware - Firebase Cloud Functions
 * Backend services for Web, iOS, and Android apps
 * Copyright 2025 WeCr8 Solutions LLC
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDevice = exports.deleteUserData = exports.createUserProfile = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("firebase-functions/v2/auth");
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
exports.createUserProfile = (0, auth_1.beforeUserCreated)(async (event) => {
    const user = event.data;
    if (!user) {
        throw new https_1.HttpsError('invalid-argument', 'No user data provided');
    }
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
exports.deleteUserData = (0, auth_1.onUserDeleted)(async (event) => {
    const { uid } = event.data;
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
        export const updateDeviceStatus = (0, https_1.onCall)(async (request) => {
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
                export const castVote = (0, https_1.onCall)(async (request) => {
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
                        batch.update(admin.firestore().collection('users').doc(userId), {
                            'stats.votesCount': admin.firestore.FieldValue.increment(1),
                            'stats.loyaltyPoints': admin.firestore.FieldValue.increment(10),
                            updatedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                    // Create a batch for atomic updates
                    finally {
                    }
                    // Create a batch for atomic updates
                    const batch = admin.firestore().batch();
                    // Create vote document
                    const voteRef = admin.firestore().collection('votes').doc();
                    const voteId = voteRef.id;
                    if (!auth) {
                        throw new https_1.HttpsError('unauthenticated', 'Must be authenticated to vote');
                    }
                    batch.set(voteRef, {
                        productId,
                        userId: auth.uid,
                        vote,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
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
                });
                try { }
                catch (error) {
                    console.error('Error casting vote:', error);
                    throw new https_1.HttpsError('internal', 'Failed to cast vote');
                }
            }
            finally { }
        });
        // =============================================================================
        // NOTIFICATION FUNCTIONS
        // =============================================================================
        /**
         * Store FCM token for push notifications
         */
        export const saveFCMToken = (0, https_1.onCall)(async (request) => {
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
        export const sendNotification = (0, https_1.onCall)(async (request) => {
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
        export const trackActivity = (0, https_1.onCall)(async (request) => {
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
        export const getAdminDashboard = (0, https_1.onCall)(async (request) => {
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
                // Get global stats
                const globalStats = (await admin.firestore().collection('stats').doc('global').get()).data() || {};
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
        export const api = (0, https_1.onRequest)(app);
        // =============================================================================
        // SUBSCRIPTION MANAGEMENT FUNCTIONS
        // =============================================================================
        export { createSubscriptionCheckout, handleSubscriptionSuccess, manageSubscription, getSubscriptionStatus, } from './subscriptions';
        // =============================================================================
        // USER PROFILE MANAGEMENT FUNCTIONS
        // =============================================================================
        export { updateUserProfile, uploadUserAvatar, getUserProfile, updateNotificationPreferences, completeDeviceSetup, getPersonalizedGreeting, deleteUserAccount, } from './user-profile';
        // =============================================================================
        // OFFLINE SYNC FUNCTIONS
        // =============================================================================
        export { queueOfflineAction, processSyncQueue, getSyncStatus, cleanupSyncQueue, bulkSyncData, getLastSyncTimestamp, } from './offline-sync';
        // =============================================================================
        // ENHANCED STRIPE WEBHOOK FUNCTIONS
        // =============================================================================
        export { handleStripeWebhook, } from './stripe-webhooks';
    }
    finally { }
});
//# sourceMappingURL=index.js.map