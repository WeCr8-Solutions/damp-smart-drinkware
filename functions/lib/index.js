"use strict";
/**
 * DAMP Smart Drinkware - Firebase Cloud Functions
 * Backend services for Web, iOS, and Android apps
 * Copyright 2025 WeCr8 Solutions LLC
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.getLastSyncTimestamp = exports.bulkSyncData = exports.cleanupSyncQueue = exports.getSyncStatus = exports.processSyncQueue = exports.queueOfflineAction = exports.deleteUserAccount = exports.getPersonalizedGreeting = exports.completeDeviceSetup = exports.updateNotificationPreferences = exports.getUserProfile = exports.uploadUserAvatar = exports.updateUserProfile = exports.getSubscriptionStatus = exports.manageSubscription = exports.handleSubscriptionSuccess = exports.createSubscriptionCheckout = exports.api = exports.getAdminDashboard = exports.trackActivity = exports.sendNotification = exports.saveFCMToken = exports.castVote = exports.updateDeviceStatus = exports.registerDevice = exports.deleteUserData = exports.createUserProfile = void 0;
const functions = require("firebase-functions");
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
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, photoURL, phoneNumber } = user;
    try {
        const userData = {
            uid,
            email: email || null,
            displayName: displayName || null,
            photoURL: photoURL || null,
            phoneNumber: phoneNumber || null,
            emailVerified: user.emailVerified,
            // Platform tracking
            platform: 'unknown', // Will be updated on first login
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastSignIn: admin.firestore.FieldValue.serverTimestamp(),
            isOnline: true,
            // Default preferences
            preferences: {
                notifications: {
                    push: true,
                    email: true,
                    sms: false,
                    marketing: true,
                    productUpdates: true,
                    orderUpdates: true,
                    votingReminders: true,
                },
                app: {
                    darkMode: false,
                    language: 'en',
                    currency: 'USD',
                    units: 'fahrenheit',
                    autoSync: true,
                },
                privacy: {
                    shareAnalytics: true,
                    shareLocation: false,
                    profileVisibility: 'public',
                    activityVisibility: 'friends',
                },
                device: {
                    biometricEnabled: false,
                    autoLock: 5,
                    hapticFeedback: true,
                    soundEffects: true,
                }
            },
            // Activity stats
            stats: {
                votesCount: 0,
                ordersCount: 0,
                reviewsCount: 0,
                loyaltyPoints: 100, // Welcome bonus
                referralsCount: 0,
                streakDays: 0,
                totalSpent: 0,
                platformStats: {
                    web: { sessionsCount: 0, totalTimeSpent: 0 },
                    mobile: { appOpens: 0, pushNotificationClicks: 0 }
                }
            },
            // Social & loyalty
            social: {
                following: [],
                followers: [],
                blockedUsers: [],
                friendRequests: [],
            },
            loyalty: {
                tier: 'bronze',
                points: 100,
                lifetimePoints: 100,
                nextTierRequirement: 500,
                rewards: [],
                redemptions: [],
            },
            // Connected devices
            devices: [],
            // Subscription info
            subscription: {
                plan: 'free',
                status: 'active',
                startDate: admin.firestore.FieldValue.serverTimestamp(),
                endDate: null,
                stripeCustomerId: null,
                paymentMethods: [],
                billingHistory: [],
            },
            // Marketing data
            marketing: {
                source: null,
                campaign: null,
                referredBy: null,
                utmSource: null,
                utmMedium: null,
                utmCampaign: null,
            },
            // Role and permissions
            role: 'user',
            permissions: [],
            // Beta testing
            beta: {
                isBetaTester: false,
                betaFeatures: [],
                feedbackCount: 0,
            },
            // Security
            security: {
                lastPasswordChange: admin.firestore.FieldValue.serverTimestamp(),
                loginAttempts: 0,
                accountLocked: false,
                twoFactorEnabled: false,
                backupCodes: [],
                ipAddress: null,
                userAgent: null,
            }
        };
        // Create user document
        await admin.firestore().collection('users').doc(uid).set(userData);
        // Update global stats
        await admin.firestore().collection('stats').doc('global').update({
            totalUsers: admin.firestore.FieldValue.increment(1),
            newUsersToday: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`User profile created for ${uid}`);
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
    const { uid } = user;
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
exports.registerDevice = functions.https.onCall(async (data, context) => {
    // Verify user authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { deviceId, deviceType, name, macAddress, firmwareVersion } = data;
    const userId = context.auth.uid;
    try {
        // Validate device data
        if (!deviceId || !deviceType || !macAddress) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required device information');
        }
        // Check if device is already registered
        const existingDevice = await admin.firestore()
            .collection('devices')
            .doc(deviceId)
            .get();
        if (existingDevice.exists) {
            throw new functions.https.HttpsError('already-exists', 'Device is already registered');
        }
        const deviceData = {
            deviceId,
            deviceType, // 'handle', 'bottom', 'sleeve', 'bottle'
            name: name || `DAMP ${deviceType}`,
            macAddress,
            firmwareVersion: firmwareVersion || '1.0.0',
            userId,
            registeredAt: admin.firestore.FieldValue.serverTimestamp(),
            lastSeen: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            batteryLevel: 100,
            settings: {
                alertDistance: 10, // meters
                batteryWarning: 20, // percentage
                notificationCooldown: 15, // minutes
                vibrationEnabled: true,
                ledEnabled: true,
            },
            stats: {
                totalAlerts: 0,
                batteryChanges: 0,
                connectionAttempts: 0,
                lastFirmwareUpdate: null,
            }
        };
        // Register device
        await admin.firestore().collection('devices').doc(deviceId).set(deviceData);
        // Add device to user's device list
        await admin.firestore().collection('users').doc(userId).update({
            devices: admin.firestore.FieldValue.arrayUnion({
                deviceId,
                deviceType,
                name: deviceData.name,
                registeredAt: admin.firestore.FieldValue.serverTimestamp()
            }),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Update global device stats
        await admin.firestore().collection('stats').doc('global').update({
            totalDevices: admin.firestore.FieldValue.increment(1),
            [`${deviceType}Count`]: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, deviceId };
    }
    catch (error) {
        console.error('Error registering device:', error);
        throw error;
    }
});
/**
 * Update device status (battery, location, etc.)
 */
exports.updateDeviceStatus = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { deviceId, batteryLevel, location, temperature, isConnected } = data;
    const userId = context.auth.uid;
    try {
        // Verify device ownership
        const deviceDoc = await admin.firestore().collection('devices').doc(deviceId).get();
        if (!deviceDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Device not found');
        }
        const deviceData = deviceDoc.data();
        if ((deviceData === null || deviceData === void 0 ? void 0 : deviceData.userId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        const updates = {
            lastSeen: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (batteryLevel !== undefined) {
            updates.batteryLevel = batteryLevel;
            // Check for low battery alert
            if (batteryLevel <= (((_a = deviceData.settings) === null || _a === void 0 ? void 0 : _a.batteryWarning) || 20)) {
                await sendBatteryAlert(userId, deviceId, batteryLevel);
            }
        }
        if (location !== undefined) {
            updates.location = location;
            updates.locationHistory = admin.firestore.FieldValue.arrayUnion(Object.assign(Object.assign({}, location), { timestamp: admin.firestore.FieldValue.serverTimestamp() }));
        }
        if (temperature !== undefined) {
            updates.temperature = temperature;
        }
        if (isConnected !== undefined) {
            updates.isConnected = isConnected;
            updates.isActive = isConnected;
        }
        await admin.firestore().collection('devices').doc(deviceId).update(updates);
        return { success: true };
    }
    catch (error) {
        console.error('Error updating device status:', error);
        throw error;
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
exports.castVote = functions.https.onCall(async (data, context) => {
    const { productId, userId, voteType } = data;
    try {
        // Create unique vote ID
        const voteId = `${productId}_${userId || 'anonymous'}_${Date.now()}`;
        // Check for existing vote (authenticated users only)
        if (userId && context.auth) {
            const existingVote = await admin.firestore()
                .collection('userVotes')
                .where('userId', '==', userId)
                .where('productId', '==', productId)
                .get();
            if (!existingVote.empty) {
                throw new functions.https.HttpsError('already-exists', 'User has already voted for this product');
            }
        }
        const batch = admin.firestore().batch();
        // Record the vote
        const voteData = {
            voteId,
            productId,
            userId: userId || null,
            voteType: voteType || 'upvote',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            isAuthenticated: !!userId,
            platform: data.platform || 'web'
        };
        if (userId) {
            // Authenticated vote
            batch.set(admin.firestore().collection('userVotes').doc(voteId), voteData);
            // Update user stats
            batch.update(admin.firestore().collection('users').doc(userId), {
                'stats.votesCount': admin.firestore.FieldValue.increment(1),
                'stats.loyaltyPoints': admin.firestore.FieldValue.increment(10),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        else {
            // Public vote
            batch.set(admin.firestore().collection('publicVotes').doc(voteId), voteData);
        }
        // Update product vote count
        batch.update(admin.firestore().collection('voting').doc('productVoting'), {
            [`products.${productId}.votes`]: admin.firestore.FieldValue.increment(1),
            [`products.${productId}.lastVote`]: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Update global stats
        batch.update(admin.firestore().collection('stats').doc('global'), {
            totalVotes: admin.firestore.FieldValue.increment(1),
            votesToday: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await batch.commit();
        return { success: true, voteId };
    }
    catch (error) {
        console.error('Error casting vote:', error);
        throw error;
    }
});
// =============================================================================
// NOTIFICATION FUNCTIONS
// =============================================================================
/**
 * Store FCM token for push notifications
 */
exports.saveFCMToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { token, platform } = data;
    const userId = context.auth.uid;
    try {
        await admin.firestore().collection('fcmTokens').doc(token).set({
            token,
            userId,
            platform: platform || 'web',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUsed: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error saving FCM token:', error);
        throw error;
    }
});
/**
 * Send notification to user
 */
exports.sendNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { userId, title, body, type, additionalData } = data;
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
        if (tokens.length === 0) {
            throw new functions.https.HttpsError('not-found', 'No FCM tokens found for user');
        }
        const message = {
            notification: { title, body },
            data: Object.assign({ type: type || 'general' }, additionalData),
            tokens
        };
        const response = await admin.messaging().sendMulticast(message);
        // Clean up invalid tokens
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                invalidTokens.push(tokens[idx]);
            }
        });
        // Remove invalid tokens
        const batch = admin.firestore().batch();
        invalidTokens.forEach(token => {
            batch.delete(admin.firestore().collection('fcmTokens').doc(token));
        });
        await batch.commit();
        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        };
    }
    catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
});
// =============================================================================
// ANALYTICS FUNCTIONS
// =============================================================================
/**
 * Track user activity
 */
exports.trackActivity = functions.https.onCall(async (data, context) => {
    const { event, properties, userId } = data;
    try {
        const activityData = {
            event,
            properties: properties || {},
            userId: userId || null,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            isAuthenticated: !!userId,
            platform: (properties === null || properties === void 0 ? void 0 : properties.platform) || 'web'
        };
        // Store activity
        await admin.firestore().collection('analytics').add(activityData);
        // Update user stats if authenticated
        if (userId && context.auth) {
            const updates = {
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            // Track platform-specific stats
            if ((properties === null || properties === void 0 ? void 0 : properties.platform) === 'web') {
                updates['stats.platformStats.web.sessionsCount'] = admin.firestore.FieldValue.increment(1);
            }
            else if ((properties === null || properties === void 0 ? void 0 : properties.platform) === 'ios' || (properties === null || properties === void 0 ? void 0 : properties.platform) === 'android') {
                updates['stats.platformStats.mobile.appOpens'] = admin.firestore.FieldValue.increment(1);
            }
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
exports.getAdminDashboard = functions.https.onCall(async (data, context) => {
    // Verify admin access
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    try {
        // Check if user is admin
        const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
        const userData = userDoc.data();
        if ((userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        // Get global stats
        const statsDoc = await admin.firestore().collection('stats').doc('global').get();
        const stats = statsDoc.data();
        // Get recent activity
        const recentActivity = await admin.firestore()
            .collection('analytics')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        const activities = recentActivity.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        return {
            stats,
            recentActivity: activities
        };
    }
    catch (error) {
        console.error('Error getting admin dashboard:', error);
        throw error;
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
exports.api = functions.https.onRequest(app);
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