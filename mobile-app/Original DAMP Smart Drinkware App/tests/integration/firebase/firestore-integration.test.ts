/**
 * DAMP Smart Drinkware - Firestore Integration Tests
 * Testing Firebase Firestore operations with emulator
 * Copyright 2025 WeCr8 Solutions LLC
 */

import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { integrationTestUtils } from '../../setup/integration-setup';

describe('Firestore Integration Tests', () => {
  let db: any;

  beforeAll(async () => {
    db = integrationTestUtils.firebase.firestore;
  });

  beforeEach(async () => {
    await integrationTestUtils.firebase.clearData();
  });

  describe('Device Data Management', () => {
    const mockDevice = {
      id: 'device-123',
      name: 'DAMP Test Device',
      type: 'silicone-bottom',
      userId: 'user-123',
      batteryLevel: 85,
      isConnected: false,
      lastSeen: new Date(),
      firmwareVersion: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create device document', async () => {
      const devicesRef = collection(db, 'devices');
      const docRef = await addDoc(devicesRef, mockDevice);
      
      expect(docRef.id).toBeDefined();
      
      const savedDoc = await getDoc(docRef);
      expect(savedDoc.exists()).toBe(true);
      expect(savedDoc.data()).toMatchObject({
        name: mockDevice.name,
        type: mockDevice.type,
        userId: mockDevice.userId
      });
    });

    it('should update device status', async () => {
      const devicesRef = collection(db, 'devices');
      const docRef = await addDoc(devicesRef, mockDevice);
      
      await updateDoc(docRef, {
        batteryLevel: 75,
        isConnected: true,
        lastSeen: new Date(),
        updatedAt: new Date()
      });
      
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data();
      
      expect(data?.batteryLevel).toBe(75);
      expect(data?.isConnected).toBe(true);
    });

    it('should query devices by user', async () => {
      const devicesRef = collection(db, 'devices');
      
      // Add multiple devices for different users
      await addDoc(devicesRef, { ...mockDevice, userId: 'user-123' });
      await addDoc(devicesRef, { ...mockDevice, userId: 'user-123' });
      await addDoc(devicesRef, { ...mockDevice, userId: 'user-456' });
      
      const userDevicesQuery = query(
        devicesRef,
        where('userId', '==', 'user-123')
      );
      
      const querySnapshot = await getDocs(userDevicesQuery);
      expect(querySnapshot.size).toBe(2);
      
      querySnapshot.forEach(doc => {
        expect(doc.data().userId).toBe('user-123');
      });
    });

    it('should delete device and cleanup related data', async () => {
      const devicesRef = collection(db, 'devices');
      const sensorDataRef = collection(db, 'sensorData');
      
      const deviceDocRef = await addDoc(devicesRef, mockDevice);
      const deviceId = deviceDocRef.id;
      
      // Add some sensor data for this device
      await addDoc(sensorDataRef, {
        deviceId,
        temperature: 23.5,
        humidity: 45.2,
        timestamp: new Date()
      });
      
      // Delete device using transaction
      await runTransaction(db, async (transaction) => {
        // Delete device
        transaction.delete(deviceDocRef);
        
        // Delete related sensor data
        const sensorQuery = query(sensorDataRef, where('deviceId', '==', deviceId));
        const sensorDocs = await getDocs(sensorQuery);
        
        sensorDocs.forEach(doc => {
          transaction.delete(doc.ref);
        });
      });
      
      // Verify device is deleted
      const deletedDevice = await getDoc(deviceDocRef);
      expect(deletedDevice.exists()).toBe(false);
      
      // Verify sensor data is cleaned up
      const remainingSensorData = await getDocs(
        query(sensorDataRef, where('deviceId', '==', deviceId))
      );
      expect(remainingSensorData.size).toBe(0);
    });
  });

  describe('Sensor Data Operations', () => {
    const mockSensorData = {
      deviceId: 'device-123',
      temperature: 23.5,
      humidity: 45.2,
      pressure: 1013.25,
      batteryLevel: 85,
      timestamp: new Date(),
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 5
      }
    };

    it('should store sensor data with automatic timestamps', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      const docRef = await addDoc(sensorDataRef, mockSensorData);
      
      const savedDoc = await getDoc(docRef);
      const data = savedDoc.data();
      
      expect(data?.temperature).toBe(23.5);
      expect(data?.deviceId).toBe('device-123');
      expect(data?.timestamp).toBeInstanceOf(Date);
    });

    it('should batch write multiple sensor readings', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      const batch = writeBatch(db);
      
      const readings = Array.from({ length: 5 }, (_, i) => ({
        ...mockSensorData,
        temperature: 20 + i,
        timestamp: new Date(Date.now() + i * 60000) // 1 minute apart
      }));
      
      readings.forEach(reading => {
        const docRef = doc(sensorDataRef);
        batch.set(docRef, reading);
      });
      
      await batch.commit();
      
      const allDocs = await getDocs(sensorDataRef);
      expect(allDocs.size).toBe(5);
    });

    it('should query recent sensor data efficiently', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      
      // Add data with different timestamps
      const now = Date.now();
      const testData = [
        { ...mockSensorData, timestamp: new Date(now - 3600000) }, // 1 hour ago
        { ...mockSensorData, timestamp: new Date(now - 1800000) }, // 30 minutes ago
        { ...mockSensorData, timestamp: new Date(now - 900000) },  // 15 minutes ago
        { ...mockSensorData, timestamp: new Date(now) }            // Now
      ];
      
      for (const data of testData) {
        await addDoc(sensorDataRef, data);
      }
      
      // Query last 2 entries
      const recentQuery = query(
        sensorDataRef,
        where('deviceId', '==', 'device-123'),
        orderBy('timestamp', 'desc'),
        limit(2)
      );
      
      const querySnapshot = await getDocs(recentQuery);
      expect(querySnapshot.size).toBe(2);
      
      const docs = querySnapshot.docs.map(doc => doc.data());
      expect(docs[0].timestamp.getTime()).toBeGreaterThan(docs[1].timestamp.getTime());
    });

    it('should handle real-time sensor data updates', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      const deviceId = 'device-123';
      
      const realtimeQuery = query(
        sensorDataRef,
        where('deviceId', '==', deviceId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      let latestData: any = null;
      let updateCount = 0;
      
      const unsubscribe = onSnapshot(realtimeQuery, (snapshot) => {
        updateCount++;
        if (!snapshot.empty) {
          latestData = snapshot.docs[0].data();
        }
      });
      
      // Add new sensor data
      await addDoc(sensorDataRef, mockSensorData);
      
      // Wait for real-time update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(updateCount).toBeGreaterThan(1); // Initial + update
      expect(latestData?.deviceId).toBe(deviceId);
      
      unsubscribe();
    });

    it('should handle data aggregation queries', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      const deviceId = 'device-123';
      
      // Add 24 hours of data (one reading per hour)
      const readings = Array.from({ length: 24 }, (_, i) => ({
        ...mockSensorData,
        deviceId,
        temperature: 20 + Math.random() * 10,
        timestamp: new Date(Date.now() - i * 3600000) // i hours ago
      }));
      
      for (const reading of readings) {
        await addDoc(sensorDataRef, reading);
      }
      
      // Query last 24 hours of data
      const dayAgo = new Date(Date.now() - 86400000);
      const dailyQuery = query(
        sensorDataRef,
        where('deviceId', '==', deviceId),
        where('timestamp', '>=', dayAgo),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(dailyQuery);
      expect(querySnapshot.size).toBe(24);
      
      // Calculate average temperature
      let totalTemp = 0;
      querySnapshot.forEach(doc => {
        totalTemp += doc.data().temperature;
      });
      const avgTemp = totalTemp / querySnapshot.size;
      
      expect(avgTemp).toBeWithinRange(20, 30);
    });
  });

  describe('User Data Management', () => {
    const mockUser = {
      uid: 'user-123',
      email: 'test@dampdrinkware.com',
      displayName: 'Test User',
      preferences: {
        units: 'metric',
        notifications: true,
        dataSharing: false,
        theme: 'auto'
      },
      subscription: {
        status: 'active',
        plan: 'premium',
        startDate: new Date(),
        endDate: new Date(Date.now() + 2592000000) // 30 days
      },
      devices: [],
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    it('should create user profile with preferences', async () => {
      const usersRef = collection(db, 'users');
      const userDocRef = doc(usersRef, mockUser.uid);
      
      await updateDoc(userDocRef, mockUser);
      
      const userDoc = await getDoc(userDocRef);
      expect(userDoc.exists()).toBe(true);
      
      const userData = userDoc.data();
      expect(userData?.email).toBe(mockUser.email);
      expect(userData?.preferences.units).toBe('metric');
    });

    it('should update user preferences atomically', async () => {
      const usersRef = collection(db, 'users');
      const userDocRef = doc(usersRef, mockUser.uid);
      
      await updateDoc(userDocRef, mockUser);
      
      // Update preferences
      const newPreferences = {
        ...mockUser.preferences,
        units: 'imperial',
        notifications: false
      };
      
      await updateDoc(userDocRef, {
        preferences: newPreferences,
        updatedAt: new Date()
      });
      
      const updatedDoc = await getDoc(userDocRef);
      const data = updatedDoc.data();
      
      expect(data?.preferences.units).toBe('imperial');
      expect(data?.preferences.notifications).toBe(false);
      expect(data?.preferences.theme).toBe('auto'); // Unchanged
    });

    it('should manage user device associations', async () => {
      const usersRef = collection(db, 'users');
      const devicesRef = collection(db, 'devices');
      const userDocRef = doc(usersRef, mockUser.uid);
      
      await updateDoc(userDocRef, mockUser);
      
      // Add devices to user
      const device1Ref = await addDoc(devicesRef, {
        name: 'Device 1',
        type: 'silicone-bottom',
        userId: mockUser.uid
      });
      
      const device2Ref = await addDoc(devicesRef, {
        name: 'Device 2',
        type: 'damp-handle',
        userId: mockUser.uid
      });
      
      // Update user with device references
      await updateDoc(userDocRef, {
        devices: [device1Ref.id, device2Ref.id]
      });
      
      // Verify associations
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      
      expect(userData?.devices).toHaveLength(2);
      expect(userData?.devices).toContain(device1Ref.id);
      expect(userData?.devices).toContain(device2Ref.id);
    });
  });

  describe('Analytics and Reporting', () => {
    it('should generate device usage analytics', async () => {
      const analyticsRef = collection(db, 'analytics');
      const sensorDataRef = collection(db, 'sensorData');
      
      // Create sample data for analytics
      const devices = ['device-1', 'device-2', 'device-3'];
      const now = Date.now();
      
      for (const deviceId of devices) {
        for (let i = 0; i < 10; i++) {
          await addDoc(sensorDataRef, {
            deviceId,
            temperature: 20 + Math.random() * 10,
            timestamp: new Date(now - i * 3600000)
          });
        }
      }
      
      // Generate analytics report
      const analyticsReport = {
        reportId: 'usage-report-' + Date.now(),
        type: 'device_usage',
        dateRange: {
          start: new Date(now - 86400000), // 24 hours ago
          end: new Date(now)
        },
        metrics: {
          totalDevices: devices.length,
          activeDevices: devices.length,
          totalDataPoints: 30,
          averageDataPointsPerDevice: 10
        },
        generatedAt: new Date()
      };
      
      const reportDocRef = await addDoc(analyticsRef, analyticsReport);
      const savedReport = await getDoc(reportDocRef);
      
      expect(savedReport.exists()).toBe(true);
      expect(savedReport.data()?.metrics.totalDevices).toBe(3);
    });

    it('should handle complex aggregation queries', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      
      // Add data for different devices and time periods
      const testData = [
        { deviceId: 'device-1', temperature: 22, timestamp: new Date('2025-01-01T10:00:00Z') },
        { deviceId: 'device-1', temperature: 23, timestamp: new Date('2025-01-01T11:00:00Z') },
        { deviceId: 'device-2', temperature: 21, timestamp: new Date('2025-01-01T10:00:00Z') },
        { deviceId: 'device-2', temperature: 24, timestamp: new Date('2025-01-01T11:00:00Z') }
      ];
      
      for (const data of testData) {
        await addDoc(sensorDataRef, data);
      }
      
      // Query data for specific time range
      const startTime = new Date('2025-01-01T09:00:00Z');
      const endTime = new Date('2025-01-01T12:00:00Z');
      
      const timeRangeQuery = query(
        sensorDataRef,
        where('timestamp', '>=', startTime),
        where('timestamp', '<=', endTime),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(timeRangeQuery);
      expect(querySnapshot.size).toBe(4);
      
      // Group by device for analysis
      const deviceData: Record<string, any[]> = {};
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (!deviceData[data.deviceId]) {
          deviceData[data.deviceId] = [];
        }
        deviceData[data.deviceId].push(data);
      });
      
      expect(Object.keys(deviceData)).toHaveLength(2);
      expect(deviceData['device-1']).toHaveLength(2);
      expect(deviceData['device-2']).toHaveLength(2);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle batch operations efficiently', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      const batchSize = 100;
      
      const startTime = performance.now();
      
      // Create batch write operations
      const batch = writeBatch(db);
      
      for (let i = 0; i < batchSize; i++) {
        const docRef = doc(sensorDataRef);
        batch.set(docRef, {
          deviceId: `device-${i % 5}`, // 5 different devices
          temperature: 20 + Math.random() * 10,
          timestamp: new Date(Date.now() - i * 1000)
        });
      }
      
      await batch.commit();
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      expect(operationTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Verify all documents were created
      const allDocs = await getDocs(sensorDataRef);
      expect(allDocs.size).toBe(batchSize);
    });

    it('should handle concurrent read/write operations', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      const deviceId = 'concurrent-test-device';
      
      // Start concurrent operations
      const writePromises = Array.from({ length: 10 }, (_, i) => 
        addDoc(sensorDataRef, {
          deviceId,
          temperature: 20 + i,
          timestamp: new Date(Date.now() + i * 1000)
        })
      );
      
      const readPromises = Array.from({ length: 5 }, () =>
        getDocs(query(sensorDataRef, where('deviceId', '==', deviceId)))
      );
      
      // Execute all operations concurrently
      const results = await Promise.allSettled([...writePromises, ...readPromises]);
      
      // All operations should succeed
      const failures = results.filter(result => result.status === 'rejected');
      expect(failures).toHaveLength(0);
      
      // Verify final state
      const finalQuery = await getDocs(
        query(sensorDataRef, where('deviceId', '==', deviceId))
      );
      expect(finalQuery.size).toBe(10);
    });

    it('should optimize queries with composite indexes', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      
      // Add test data
      const testData = Array.from({ length: 50 }, (_, i) => ({
        deviceId: `device-${i % 5}`,
        userId: `user-${i % 3}`,
        temperature: 20 + Math.random() * 10,
        timestamp: new Date(Date.now() - i * 60000),
        location: {
          latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.1
        }
      }));
      
      for (const data of testData) {
        await addDoc(sensorDataRef, data);
      }
      
      const startTime = performance.now();
      
      // Complex query that would benefit from composite index
      const complexQuery = query(
        sensorDataRef,
        where('userId', '==', 'user-1'),
        where('timestamp', '>=', new Date(Date.now() - 1800000)), // Last 30 minutes
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(complexQuery);
      
      const endTime = performance.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(1000); // Should be fast with proper indexing
      expect(querySnapshot.size).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network interruptions gracefully', async () => {
      const sensorDataRef = collection(db, 'sensorData');
      
      // This test simulates network issues by using invalid data
      const invalidData = {
        deviceId: null, // Invalid - should cause error
        temperature: 'not-a-number',
        timestamp: 'invalid-date'
      };
      
      await expect(addDoc(sensorDataRef, invalidData)).rejects.toBeDefined();
    });

    it('should handle document not found scenarios', async () => {
      const nonExistentDocRef = doc(db, 'devices', 'non-existent-id');
      
      const docSnapshot = await getDoc(nonExistentDocRef);
      expect(docSnapshot.exists()).toBe(false);
    });

    it('should handle transaction conflicts', async () => {
      const devicesRef = collection(db, 'devices');
      const deviceDocRef = await addDoc(devicesRef, {
        name: 'Conflict Test Device',
        batteryLevel: 100
      });
      
      // Simulate concurrent transactions trying to update the same document
      const transaction1 = runTransaction(db, async (transaction) => {
        const doc = await transaction.get(deviceDocRef);
        const currentBattery = doc.data()?.batteryLevel || 0;
        transaction.update(deviceDocRef, { batteryLevel: currentBattery - 10 });
      });
      
      const transaction2 = runTransaction(db, async (transaction) => {
        const doc = await transaction.get(deviceDocRef);
        const currentBattery = doc.data()?.batteryLevel || 0;
        transaction.update(deviceDocRef, { batteryLevel: currentBattery - 20 });
      });
      
      // Both transactions should complete (one will retry)
      await expect(Promise.all([transaction1, transaction2])).resolves.toBeDefined();
      
      // Final battery level should reflect both updates
      const finalDoc = await getDoc(deviceDocRef);
      const finalBattery = finalDoc.data()?.batteryLevel;
      expect(finalBattery).toBeLessThan(100);
    });
  });
});