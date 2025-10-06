/**
 * 👤 DAMP Smart Drinkware - User Profile Management Functions
 * Firebase Functions for handling user profiles, avatars, and preferences
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

/**
 * Update user profile information
 */
export const updateUserProfile = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = auth.uid;
  const {
    displayName,
    email,
    phoneNumber,
    preferences,
    location,
    bio,
    dateOfBirth,
  } = data;

  try {
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (bio !== undefined) updateData.bio = bio;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (location !== undefined) updateData.location = location;

    // Handle preferences update
    if (preferences) {
      const currentUserDoc = await admin.firestore().collection('users').doc(userId).get();
      const currentData = currentUserDoc.data();

      updateData.preferences = {
        ...currentData?.preferences,
        ...preferences,
      };
    }

    await admin.firestore().collection('users').doc(userId).update(updateData);

    // Update Auth user profile if display name or photo changed
    if (displayName !== undefined) {
      await admin.auth().updateUser(userId, { displayName });
    }

    return { success: true };

  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new HttpsError('internal', 'Failed to update profile');
  }
});

/**
 * Upload and process user avatar
 */
export const uploadUserAvatar = onCall(async (request) => {
  const { data, auth } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = auth.uid;
  const { imageData, mimeType } = data;

  try {
    // Validate input
    if (!imageData || !mimeType) {
      throw new HttpsError('invalid-argument', 'Image data and mime type are required');
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      throw new HttpsError('invalid-argument', 'Invalid image type');
    }

    // Decode base64 image
    const imageBuffer = Buffer.from(imageData, 'base64');

    // Validate file size (max 5MB)
    if (imageBuffer.length > 5 * 1024 * 1024) {
      throw new HttpsError('invalid-argument', 'Image too large (max 5MB)');
    }

    // Process image with Sharp
    const processedImage = await sharp(imageBuffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Generate filename
    const filename = `avatars/${userId}_${uuidv4()}.jpg`;

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(filename);

    await file.save(processedImage, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    // Update user document with new avatar URL
    await admin.firestore().collection('users').doc(userId).update({
      photoURL: publicUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update Auth user record
    await admin.auth().updateUser(userId, { photoURL: publicUrl });

    // Delete old avatar if exists
    try {
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      const oldPhotoURL = userData?.photoURL;

      if (oldPhotoURL && oldPhotoURL.includes('storage.googleapis.com')) {
        const oldFilename = oldPhotoURL.split('/').pop();
        if (oldFilename && oldFilename !== filename.split('/').pop()) {
          const oldFile = bucket.file(`avatars/${oldFilename}`);
          await oldFile.delete().catch(() => {
            // Ignore errors when deleting old file
          });
        }
      }
    } catch (error) {
      // Ignore errors when cleaning up old avatar
    }

    // Log avatar upload
    await admin.firestore().collection('user_activity').add({
      userId,
      action: 'avatar_uploaded',
      metadata: {
        filename,
        fileSize: processedImage.length,
        originalSize: imageBuffer.length,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      avatarUrl: publicUrl,
    };

  } catch (error) {
    console.error('Error uploading avatar:', error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError('internal', 'Failed to upload avatar');
  }
});

/**
 * Get user profile data
 */
export const getUserProfile = onCall(async (request) => {
  const { data, auth } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }

    const userData = userDoc.data()!;

    // Remove sensitive data
    const profileData = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      phoneNumber: userData.phoneNumber,
      bio: userData.bio,
      location: userData.location,
      dateOfBirth: userData.dateOfBirth,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      preferences: userData.preferences,
      stats: userData.stats,
      subscription: {
        plan: userData.subscription?.planId || 'free',
        status: userData.subscription?.status || 'inactive',
      },
      devices: userData.devices || [],
    };

    return profileData;

  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get profile');
  }
});

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = onCall(async (request) => {
  const { data, auth } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = auth.uid;
  const { notificationSettings } = data;

  try {
    // Validate notification settings structure
    const validSettings = {
      hydrationReminders: typeof notificationSettings.hydrationReminders === 'boolean'
        ? notificationSettings.hydrationReminders : true,
      deviceStatus: typeof notificationSettings.deviceStatus === 'boolean'
        ? notificationSettings.deviceStatus : true,
      bluetoothAlerts: typeof notificationSettings.bluetoothAlerts === 'boolean'
        ? notificationSettings.bluetoothAlerts : true,
      batteryAlerts: typeof notificationSettings.batteryAlerts === 'boolean'
        ? notificationSettings.batteryAlerts : true,
      zoneNotifications: typeof notificationSettings.zoneNotifications === 'boolean'
        ? notificationSettings.zoneNotifications : false,
      goalAchievements: typeof notificationSettings.goalAchievements === 'boolean'
        ? notificationSettings.goalAchievements : true,
      marketingUpdates: typeof notificationSettings.marketingUpdates === 'boolean'
        ? notificationSettings.marketingUpdates : false,
      systemUpdates: typeof notificationSettings.systemUpdates === 'boolean'
        ? notificationSettings.systemUpdates : true,
      quietHoursEnabled: typeof notificationSettings.quietHoursEnabled === 'boolean'
        ? notificationSettings.quietHoursEnabled : false,
      quietHoursStart: typeof notificationSettings.quietHoursStart === 'string'
        ? notificationSettings.quietHoursStart : '22:00',
      quietHoursEnd: typeof notificationSettings.quietHoursEnd === 'string'
        ? notificationSettings.quietHoursEnd : '07:00',
      soundEnabled: typeof notificationSettings.soundEnabled === 'boolean'
        ? notificationSettings.soundEnabled : true,
      vibrationEnabled: typeof notificationSettings.vibrationEnabled === 'boolean'
        ? notificationSettings.vibrationEnabled : true,
      reminderInterval: typeof notificationSettings.reminderInterval === 'number'
        ? notificationSettings.reminderInterval : 60,
    };

    // Update user preferences
    await admin.firestore().collection('users').doc(userId).update({
      'preferences.notifications': validSettings,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log preference update
    await admin.firestore().collection('user_activity').add({
      userId,
      action: 'notification_preferences_updated',
      metadata: {
        settings: validSettings,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw new HttpsError('internal', 'Failed to update preferences');
  }
});

/**
 * Complete device setup wizard
 */
export const completeDeviceSetup = onCall(async (request) => {
  const { data, auth } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = auth.uid;
  const {
    deviceType,
    deviceName,
    selectedZone,
    notificationsEnabled,
    permissionsGranted,
  } = data;

  try {
    // Create setup completion record
    const setupData = {
      userId,
      deviceType,
      deviceName,
      selectedZone,
      notificationsEnabled: notificationsEnabled || true,
      permissionsGranted: permissionsGranted || {
        bluetooth: true,
        notifications: true,
        location: false,
      },
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save setup record
    await admin.firestore().collection('device_setups').add(setupData);

    // Update user profile to mark setup as completed
    await admin.firestore().collection('users').doc(userId).update({
      setupCompleted: true,
      onboardingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // If a zone was created/selected, create it
    if (selectedZone) {
      await admin.firestore().collection('safe_zones').add({
        userId,
        name: selectedZone,
        isDefault: true,
        active: true,
        deviceCount: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Log setup completion
    await admin.firestore().collection('user_activity').add({
      userId,
      action: 'device_setup_completed',
      metadata: setupData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update global stats
    await admin.firestore().collection('stats').doc('global').update({
      completedSetups: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };

  } catch (error) {
    console.error('Error completing device setup:', error);
    throw new HttpsError('internal', 'Failed to complete setup');
  }
});

/**
 * Generate personalized greeting based on time and user data
 */
export const getPersonalizedGreeting = onCall(async (request) => {
  const { data, auth } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    const displayName = userData?.displayName || 'there';
    const hour = new Date().getHours();

    let greeting: string;

    if (hour < 12) {
      greeting = `Good morning, ${displayName}`;
    } else if (hour < 17) {
      greeting = `Good afternoon, ${displayName}`;
    } else {
      greeting = `Good evening, ${displayName}`;
    }

    // Add contextual messages based on user stats or recent activity
    const messages = [];

    // Check for recent device activity
    const recentDeviceActivity = await admin.firestore()
      .collection('device_readings')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (recentDeviceActivity.empty) {
      messages.push("Let's get your hydration tracking started!");
    } else {
      const lastReading = recentDeviceActivity.docs[0].data();
      const lastReadingTime = lastReading.timestamp.toDate();
      const hoursSinceLastReading = (Date.now() - lastReadingTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastReading > 24) {
        messages.push("It's been a while since your last hydration check.");
      } else if (hoursSinceLastReading > 6) {
        messages.push("Time for a hydration break!");
      }
    }

    // Check subscription status
    if (userData?.subscription?.status === 'active') {
      messages.push("Enjoying your premium features?");
    }

    return {
      greeting,
      messages,
      timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening',
    };

  } catch (error) {
    console.error('Error generating greeting:', error);
    throw new HttpsError('internal', 'Failed to generate greeting');
  }
});

/**
 * Delete user account and all associated data
 */
export const deleteUserAccount = onCall(async (request) => {
  const { data, auth } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = auth.uid;

  try {
    const batch = admin.firestore().batch();

    // Delete user document
    batch.delete(admin.firestore().collection('users').doc(userId));

    // Delete user's devices
    const devicesQuery = await admin.firestore()
      .collection('devices')
      .where('userId', '==', userId)
      .get();

    devicesQuery.forEach(doc => batch.delete(doc.ref));

    // Delete user's zones
    const zonesQuery = await admin.firestore()
      .collection('safe_zones')
      .where('userId', '==', userId)
      .get();

    zonesQuery.forEach(doc => batch.delete(doc.ref));

    // Delete user activity
    const activityQuery = await admin.firestore()
      .collection('user_activity')
      .where('userId', '==', userId)
      .get();

    activityQuery.forEach(doc => batch.delete(doc.ref));

    // Delete FCM tokens
    const tokensQuery = await admin.firestore()
      .collection('fcmTokens')
      .where('userId', '==', userId)
      .get();

    tokensQuery.forEach(doc => batch.delete(doc.ref));

    await batch.commit();

    // Delete user avatar from Storage
    try {
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      const photoURL = userData?.photoURL;

      if (photoURL && photoURL.includes('storage.googleapis.com')) {
        const filename = photoURL.split('/').pop();
        if (filename) {
          const bucket = admin.storage().bucket();
          const file = bucket.file(`avatars/${filename}`);
          await file.delete().catch(() => {
            // Ignore errors when deleting avatar
          });
        }
      }
    } catch (error) {
      // Ignore storage cleanup errors
    }

    // Delete from Auth
    await admin.auth().deleteUser(userId);

    return { success: true };

  } catch (error) {
    console.error('Error deleting user account:', error);
    throw new HttpsError('internal', 'Failed to delete account');
  }
});