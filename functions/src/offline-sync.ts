// @ts-nocheck - Temporarily disabled type checking - file uses v1 API and is not currently exported
/**
 * 🔄 DAMP Smart Drinkware - Offline Data Synchronization Functions
 * Firebase Functions for handling offline data sync and queue management
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface QueuedAction {
  id: string;
  userId: string;
  action: string;
  payload: any;
  timestamp: admin.firestore.Timestamp;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  deviceId?: string;
  priority: number;
}

/**
 * Queue action for offline sync
 */
export const queueOfflineAction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { action, payload, deviceId, priority } = data;

  try {
    if (!action || !payload) {
      throw new functions.https.HttpsError('invalid-argument', 'Action and payload are required');
    }

    const queuedAction: QueuedAction = {
      id: admin.firestore().collection('sync_queue').doc().id,
      userId,
      action,
      payload,
      timestamp: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      retryCount: 0,
      status: 'pending',
      deviceId: deviceId || null,
      priority: priority || 1,
    };

    await admin.firestore().collection('sync_queue').doc(queuedAction.id).set(queuedAction);

    // Update user's queued actions count
    await admin.firestore().collection('users').doc(userId).update({
      'syncStatus.queuedActions': admin.firestore.FieldValue.increment(1),
      'syncStatus.lastQueuedAt': admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, actionId: queuedAction.id };

  } catch (error) {
    console.error('Error queuing offline action:', error);
    throw new functions.https.HttpsError('internal', 'Failed to queue action');
  }
});

/**
 * Process sync queue for a user
 */
export const processSyncQueue = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    // Get pending actions for user, ordered by priority and timestamp
    const queueQuery = await admin.firestore()
      .collection('sync_queue')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .orderBy('priority', 'desc')
      .orderBy('timestamp', 'asc')
      .limit(50)
      .get();

    if (queueQuery.empty) {
      return { success: true, processedActions: 0 };
    }

    const batch = admin.firestore().batch();
    const results = [];

    for (const doc of queueQuery.docs) {
      const action = doc.data() as QueuedAction;

      try {
        // Mark as processing
        batch.update(doc.ref, {
          status: 'processing',
          processingStartedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Process the action based on type
        const result = await processAction(action);

        if (result.success) {
          // Mark as completed
          batch.update(doc.ref, {
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            result: result.data,
          });
          results.push({ actionId: action.id, status: 'completed' });
        } else {
          // Mark as failed, increment retry count
          batch.update(doc.ref, {
            status: action.retryCount >= 3 ? 'failed' : 'pending',
            retryCount: admin.firestore.FieldValue.increment(1),
            lastError: result.error,
            lastRetryAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          results.push({
            actionId: action.id,
            status: action.retryCount >= 3 ? 'failed' : 'retry',
            error: result.error,
          });
        }
      } catch (processingError) {
        // Handle processing errors
        const errorMessage = processingError instanceof Error ? processingError.message : String(processingError);
        batch.update(doc.ref, {
          status: 'failed',
          lastError: errorMessage,
          failedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        results.push({
          actionId: action.id,
          status: 'failed',
          error: errorMessage,
        });
      }
    }

    await batch.commit();

    // Update user sync status
    const completedCount = results.filter(r => r.status === 'completed').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    await admin.firestore().collection('users').doc(userId).update({
      'syncStatus.queuedActions': admin.firestore.FieldValue.increment(-completedCount - failedCount),
      'syncStatus.lastSyncAt': admin.firestore.FieldValue.serverTimestamp(),
      'syncStatus.successfulSyncs': admin.firestore.FieldValue.increment(completedCount),
      'syncStatus.failedSyncs': admin.firestore.FieldValue.increment(failedCount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      processedActions: results.length,
      results,
    };

  } catch (error) {
    console.error('Error processing sync queue:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process sync queue');
  }
});

/**
 * Process individual action based on type
 */
async function processAction(action: QueuedAction): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    switch (action.action) {
      case 'device_reading':
        return await processDeviceReading(action);

      case 'user_preference_update':
        return await processUserPreferenceUpdate(action);

      case 'device_status_update':
        return await processDeviceStatusUpdate(action);

      case 'zone_update':
        return await processZoneUpdate(action);

      case 'activity_log':
        return await processActivityLog(action);

      default:
        return { success: false, error: `Unknown action type: ${action.action}` };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Process device reading sync
 */
async function processDeviceReading(action: QueuedAction): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { deviceId, reading, timestamp } = action.payload;

    // Validate device ownership
    const deviceDoc = await admin.firestore().collection('devices').doc(deviceId).get();
    if (!deviceDoc.exists || deviceDoc.data()?.userId !== action.userId) {
      return { success: false, error: 'Device not found or access denied' };
    }

    // Save device reading
    const readingData = {
      deviceId,
      userId: action.userId,
      reading,
      timestamp: new Date(timestamp),
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('device_readings').add(readingData);

    // Update device's last reading
    await admin.firestore().collection('devices').doc(deviceId).update({
      lastReading: reading,
      lastReadingAt: new Date(timestamp),
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, data: { readingId: 'generated_id' } };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Process user preference update sync
 */
async function processUserPreferenceUpdate(action: QueuedAction): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { preferences } = action.payload;

    // Get current user preferences
    const userDoc = await admin.firestore().collection('users').doc(action.userId).get();
    const currentData = userDoc.data();

    // Merge preferences
    const updatedPreferences = {
      ...currentData?.preferences,
      ...preferences,
    };

    await admin.firestore().collection('users').doc(action.userId).update({
      preferences: updatedPreferences,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, data: { updatedPreferences } };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Process device status update sync
 */
async function processDeviceStatusUpdate(action: QueuedAction): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { deviceId, status } = action.payload;

    // Validate device ownership
    const deviceDoc = await admin.firestore().collection('devices').doc(deviceId).get();
    if (!deviceDoc.exists || deviceDoc.data()?.userId !== action.userId) {
      return { success: false, error: 'Device not found or access denied' };
    }

    const updateData = {
      ...status,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('devices').doc(deviceId).update(updateData);

    return { success: true, data: { deviceId, updatedStatus: status } };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Process zone update sync
 */
async function processZoneUpdate(action: QueuedAction): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { zoneId, updates } = action.payload;

    if (zoneId) {
      // Update existing zone
      const zoneDoc = await admin.firestore().collection('safe_zones').doc(zoneId).get();
      if (!zoneDoc.exists || zoneDoc.data()?.userId !== action.userId) {
        return { success: false, error: 'Zone not found or access denied' };
      }

      await admin.firestore().collection('safe_zones').doc(zoneId).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, data: { zoneId, updates } };
    } else {
      // Create new zone
      const zoneData = {
        userId: action.userId,
        ...updates,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const newZoneRef = await admin.firestore().collection('safe_zones').add(zoneData);

      return { success: true, data: { zoneId: newZoneRef.id } };
    }

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Process activity log sync
 */
async function processActivityLog(action: QueuedAction): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { event, properties } = action.payload;

    const activityData = {
      userId: action.userId,
      event,
      properties,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'offline_sync',
    };

    await admin.firestore().collection('user_activity').add(activityData);

    return { success: true, data: { event } };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Get sync status for user
 */
export const getSyncStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    // Get user's sync status
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Get pending queue items count
    const pendingQuery = await admin.firestore()
      .collection('sync_queue')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .get();

    // Get failed queue items count
    const failedQuery = await admin.firestore()
      .collection('sync_queue')
      .where('userId', '==', userId)
      .where('status', '==', 'failed')
      .get();

    const syncStatus = {
      queuedActions: pendingQuery.size,
      failedActions: failedQuery.size,
      lastSyncAt: userData?.syncStatus?.lastSyncAt,
      lastQueuedAt: userData?.syncStatus?.lastQueuedAt,
      successfulSyncs: userData?.syncStatus?.successfulSyncs || 0,
      failedSyncs: userData?.syncStatus?.failedSyncs || 0,
    };

    return syncStatus;

  } catch (error) {
    console.error('Error getting sync status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get sync status');
  }
});

/**
 * Clear completed sync queue items (cleanup function)
 */
export const cleanupSyncQueue = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep records for 7 days

      // Find old completed items
      const oldItemsQuery = await admin.firestore()
        .collection('sync_queue')
        .where('status', '==', 'completed')
        .where('completedAt', '<', cutoffDate)
        .limit(1000)
        .get();

      if (oldItemsQuery.empty) {
        console.log('No old sync queue items to clean up');
        return;
      }

      const batch = admin.firestore().batch();
      oldItemsQuery.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Cleaned up ${oldItemsQuery.size} old sync queue items`);

    } catch (error) {
      console.error('Error cleaning up sync queue:', error);
    }
  });

/**
 * Bulk sync data when user comes back online
 */
export const bulkSyncData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { actions } = data;

  try {
    if (!Array.isArray(actions) || actions.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Actions array is required');
    }

    // Limit bulk sync to reasonable number
    if (actions.length > 100) {
      throw new functions.https.HttpsError('invalid-argument', 'Too many actions (max 100)');
    }

    const batch = admin.firestore().batch();
    const results = [];

    // Queue all actions
    for (const actionData of actions) {
      const queuedAction: QueuedAction = {
        id: admin.firestore().collection('sync_queue').doc().id,
        userId,
        action: actionData.action,
        payload: actionData.payload,
        timestamp: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        retryCount: 0,
        status: 'pending',
        deviceId: actionData.deviceId || null,
        priority: actionData.priority || 1,
      };

      const docRef = admin.firestore().collection('sync_queue').doc(queuedAction.id);
      batch.set(docRef, queuedAction);
      results.push({ actionId: queuedAction.id, status: 'queued' });
    }

    await batch.commit();

    // Update user's queued actions count
    await admin.firestore().collection('users').doc(userId).update({
      'syncStatus.queuedActions': admin.firestore.FieldValue.increment(actions.length),
      'syncStatus.lastQueuedAt': admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      queuedActions: actions.length,
      message: 'Actions queued successfully. Use processSyncQueue to process them.',
    };

  } catch (error) {
    console.error('Error bulk syncing data:', error);
    throw new functions.https.HttpsError('internal', 'Failed to bulk sync data');
  }
});

/**
 * Get last sync timestamp for client
 */
export const getLastSyncTimestamp = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    return {
      lastSyncAt: userData?.syncStatus?.lastSyncAt,
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

  } catch (error) {
    console.error('Error getting last sync timestamp:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get sync timestamp');
  }
});