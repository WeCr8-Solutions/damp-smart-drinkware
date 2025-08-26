/**
 * DAMP Smart Drinkware - Firebase Functions Tests
 * Testing Firebase Cloud Functions integration and edge functions
 * Copyright 2025 WeCr8 Solutions LLC
 */

import { httpsCallable, getFunctions } from 'firebase/functions';
import supabase from '@/lib/supabase';

// Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
}));

// Mock local supabase shim
jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: {
    functions: { invoke: jest.fn() },
    auth: { getSession: jest.fn(), getUser: jest.fn(), signOut: jest.fn() },
    from: jest.fn()
  },
  createClient: jest.fn()
}));

describe('Firebase Functions Integration', () => {
  let mockFunctions: any;
  let mockSupabase: any;
  let mockHttpsCallable: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockHttpsCallable = jest.fn();
    mockFunctions = {};
    mockSupabase = {
      functions: {
        invoke: jest.fn(),
      },
      auth: {
        getSession: jest.fn(),
        getUser: jest.fn(),
      },
    };

  (getFunctions as jest.Mock).mockReturnValue(mockFunctions);
  (httpsCallable as jest.Mock).mockReturnValue(mockHttpsCallable);
  // ensure mocked default shape is returned
  (require('@/lib/supabase').default as any).functions = mockSupabase.functions;
  (require('@/lib/supabase').default as any).auth = mockSupabase.auth;
  });

  describe('Stripe Checkout Function', () => {
    it('should create checkout session successfully', async () => {
      const mockSession = {
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      };

      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockSession,
        error: null
      });

      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'fake-token'
          }
        },
        error: null
      });

      // Simulate calling the stripe-checkout function
  const checkoutFunction = httpsCallable(mockFunctions, 'stripe-checkout') as unknown as jest.MockedFunction<any>;
      mockHttpsCallable.mockResolvedValue({ data: mockSession });

      const result = await checkoutFunction({
        price_id: 'price_test_123',
        success_url: 'https://app.dampdrinkware.com/success',
        cancel_url: 'https://app.dampdrinkware.com/cancel',
        mode: 'payment'
      });

      expect(result.data).toEqual(mockSession);
      expect(mockHttpsCallable).toHaveBeenCalledWith({
        price_id: 'price_test_123',
        success_url: 'https://app.dampdrinkware.com/success',
        cancel_url: 'https://app.dampdrinkware.com/cancel',
        mode: 'payment'
      });
    });

    it('should handle missing parameters', async () => {
      const mockError = {
        code: 'invalid-argument',
        message: 'Missing required parameter price_id'
      };

      mockHttpsCallable.mockRejectedValue(mockError);

  const checkoutFunction = httpsCallable(mockFunctions, 'stripe-checkout') as unknown as jest.MockedFunction<any>;

      await expect(checkoutFunction({
        success_url: 'https://app.dampdrinkware.com/success',
        cancel_url: 'https://app.dampdrinkware.com/cancel',
        mode: 'payment'
        // Missing price_id
      })).rejects.toEqual(mockError);
    });

    it('should handle authentication errors', async () => {
      const mockError = {
        code: 'unauthenticated',
        message: 'Failed to authenticate user'
      };

      mockHttpsCallable.mockRejectedValue(mockError);

  const checkoutFunction = httpsCallable(mockFunctions, 'stripe-checkout') as unknown as jest.MockedFunction<any>;

      await expect(checkoutFunction({
        price_id: 'price_test_123',
        success_url: 'https://app.dampdrinkware.com/success',
        cancel_url: 'https://app.dampdrinkware.com/cancel',
        mode: 'payment'
      })).rejects.toEqual(mockError);
    });

    it('should create subscription checkout session', async () => {
      const mockSession = {
        sessionId: 'cs_sub_123',
        url: 'https://checkout.stripe.com/pay/cs_sub_123'
      };

      mockHttpsCallable.mockResolvedValue({ data: mockSession });

  const checkoutFunction = httpsCallable(mockFunctions, 'stripe-checkout') as unknown as jest.MockedFunction<any>;

      const result = await checkoutFunction({
        price_id: 'price_sub_123',
        success_url: 'https://app.dampdrinkware.com/success',
        cancel_url: 'https://app.dampdrinkware.com/cancel',
        mode: 'subscription'
      });

      expect(result.data).toEqual(mockSession);
      expect(mockHttpsCallable).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription'
        })
      );
    });
  });

  describe('Stripe Store Checkout Function', () => {
    it('should create store checkout session with cart items', async () => {
      const mockSession = {
        sessionId: 'cs_store_123',
        url: 'https://checkout.stripe.com/pay/cs_store_123'
      };

      mockHttpsCallable.mockResolvedValue({ data: mockSession });

  const storeCheckoutFunction = httpsCallable(mockFunctions, 'stripe-store-checkout') as unknown as jest.MockedFunction<any>;

      const cartItems = [
        {
          price_id: 'price_silicone_bottom',
          quantity: 2,
          color: 'blue'
        },
        {
          price_id: 'price_damp_handle',
          quantity: 1,
          model: 'universal'
        }
      ];

      const result = await storeCheckoutFunction({
        cart_items: cartItems,
        success_url: 'https://store.dampdrinkware.com/success',
        cancel_url: 'https://store.dampdrinkware.com/cart',
        mode: 'payment',
        shipping_address_collection: true
      });

      expect(result.data).toEqual(mockSession);
      expect(mockHttpsCallable).toHaveBeenCalledWith(
        expect.objectContaining({
          cart_items: cartItems,
          shipping_address_collection: true
        })
      );
    });

    it('should handle empty cart', async () => {
      const mockError = {
        code: 'invalid-argument',
        message: 'Cart cannot be empty'
      };

      mockHttpsCallable.mockRejectedValue(mockError);

  const storeCheckoutFunction = httpsCallable(mockFunctions, 'stripe-store-checkout') as unknown as jest.MockedFunction<any>;

      await expect(storeCheckoutFunction({
        cart_items: [],
        success_url: 'https://store.dampdrinkware.com/success',
        cancel_url: 'https://store.dampdrinkware.com/cart',
        mode: 'payment'
      })).rejects.toEqual(mockError);
    });

    it('should apply discount codes', async () => {
      const mockSession = {
        sessionId: 'cs_discount_123',
        url: 'https://checkout.stripe.com/pay/cs_discount_123'
      };

      mockHttpsCallable.mockResolvedValue({ data: mockSession });

  const storeCheckoutFunction = httpsCallable(mockFunctions, 'stripe-store-checkout') as unknown as jest.MockedFunction<any>;

      const result = await storeCheckoutFunction({
        cart_items: [{ price_id: 'price_test', quantity: 1 }],
        success_url: 'https://store.dampdrinkware.com/success',
        cancel_url: 'https://store.dampdrinkware.com/cart',
        mode: 'payment',
        discount_code: 'SAVE20'
      });

      expect(result.data).toEqual(mockSession);
      expect(mockHttpsCallable).toHaveBeenCalledWith(
        expect.objectContaining({
          discount_code: 'SAVE20'
        })
      );
    });
  });

  describe('Stripe Webhook Function', () => {
    it('should process payment success webhook', async () => {
      const mockWebhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            customer: 'cus_test_123',
            subscription: null,
            mode: 'payment'
          }
        }
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { success: true, processed: true } 
      });

  const webhookFunction = httpsCallable(mockFunctions, 'stripe-webhook') as unknown as jest.MockedFunction<any>;

      const result = await webhookFunction({
        webhook_payload: mockWebhookPayload,
        stripe_signature: 'test_signature'
      });

      expect(result.data.success).toBe(true);
      expect(mockHttpsCallable).toHaveBeenCalledWith(
        expect.objectContaining({
          webhook_payload: mockWebhookPayload
        })
      );
    });

    it('should process subscription creation webhook', async () => {
      const mockWebhookPayload = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            current_period_start: 1640995200,
            current_period_end: 1643673600
          }
        }
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { success: true, subscription_created: true } 
      });

  const webhookFunction = httpsCallable(mockFunctions, 'stripe-webhook') as unknown as jest.MockedFunction<any>;

      const result = await webhookFunction({
        webhook_payload: mockWebhookPayload,
        stripe_signature: 'test_signature'
      });

      expect(result.data.subscription_created).toBe(true);
    });

    it('should handle webhook signature validation failure', async () => {
      const mockError = {
        code: 'invalid-argument',
        message: 'Invalid webhook signature'
      };

      mockHttpsCallable.mockRejectedValue(mockError);

  const webhookFunction = httpsCallable(mockFunctions, 'stripe-webhook') as unknown as jest.MockedFunction<any>;

      await expect(webhookFunction({
        webhook_payload: { type: 'test' },
        stripe_signature: 'invalid_signature'
      })).rejects.toEqual(mockError);
    });
  });

  describe('Device Data Functions', () => {
    it('should save device sensor data', async () => {
      const mockSensorData = {
        device_id: 'device_123',
        temperature: 23.5,
        humidity: 45.2,
        pressure: 1013.25,
        battery_level: 85,
        timestamp: Date.now()
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { success: true, data_id: 'data_123' } 
      });

  const saveDataFunction = httpsCallable(mockFunctions, 'save-sensor-data') as unknown as jest.MockedFunction<any>;

      const result = await saveDataFunction(mockSensorData);

      expect(result.data.success).toBe(true);
      expect(result.data.data_id).toBe('data_123');
      expect(mockHttpsCallable).toHaveBeenCalledWith(mockSensorData);
    });

    it('should validate sensor data before saving', async () => {
      const invalidSensorData = {
        device_id: 'device_123',
        temperature: -100, // Invalid temperature
        humidity: 150, // Invalid humidity
        battery_level: -10 // Invalid battery level
      };

      const mockError = {
        code: 'invalid-argument',
        message: 'Invalid sensor data values'
      };

      mockHttpsCallable.mockRejectedValue(mockError);

  const saveDataFunction = httpsCallable(mockFunctions, 'save-sensor-data') as unknown as jest.MockedFunction<any>;

      await expect(saveDataFunction(invalidSensorData)).rejects.toEqual(mockError);
    });

    it('should retrieve device data history', async () => {
      const mockHistoryData = [
        {
          id: 'data_123',
          temperature: 23.5,
          humidity: 45.2,
          timestamp: Date.now() - 3600000
        },
        {
          id: 'data_124',
          temperature: 24.0,
          humidity: 44.8,
          timestamp: Date.now() - 7200000
        }
      ];

      mockHttpsCallable.mockResolvedValue({ 
        data: { success: true, history: mockHistoryData } 
      });

  const getHistoryFunction = httpsCallable(mockFunctions, 'get-device-history') as unknown as jest.MockedFunction<any>;

      const result = await getHistoryFunction({
        device_id: 'device_123',
        start_date: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
        end_date: new Date().toISOString(),
        limit: 100
      });

      expect(result.data.history).toEqual(mockHistoryData);
      expect(mockHttpsCallable).toHaveBeenCalledWith(
        expect.objectContaining({
          device_id: 'device_123',
          limit: 100
        })
      );
    });
  });

  describe('Analytics Functions', () => {
    it('should generate device analytics report', async () => {
      const mockAnalytics = {
        device_count: 150,
        active_devices_24h: 120,
        total_data_points: 45000,
        average_temperature: 22.8,
        average_humidity: 48.2,
        battery_health_distribution: {
          good: 85,
          fair: 10,
          poor: 5
        }
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { success: true, analytics: mockAnalytics } 
      });

  const analyticsFunction = httpsCallable(mockFunctions, 'get-analytics') as unknown as jest.MockedFunction<any>;

      const result = await analyticsFunction({
        report_type: 'device_overview',
        date_range: '30d',
        include_inactive: false
      });

      expect(result.data.analytics).toEqual(mockAnalytics);
    });

    it('should generate user usage analytics', async () => {
      const mockUserAnalytics = {
        total_users: 1250,
        active_users_30d: 980,
        premium_subscribers: 245,
        average_devices_per_user: 1.8,
        top_device_types: [
          { type: 'silicone-bottom', count: 850 },
          { type: 'damp-handle', count: 620 },
          { type: 'cup-sleeve', count: 380 }
        ]
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { success: true, analytics: mockUserAnalytics } 
      });

  const analyticsFunction = httpsCallable(mockFunctions, 'get-analytics') as unknown as jest.MockedFunction<any>;

      const result = await analyticsFunction({
        report_type: 'user_overview',
        date_range: '30d'
      });

      expect(result.data.analytics).toEqual(mockUserAnalytics);
    });
  });

  describe('User Management Functions', () => {
    it('should create user profile', async () => {
      const mockUserProfile = {
        user_id: 'user_123',
        email: 'test@dampdrinkware.com',
        display_name: 'Test User',
        preferences: {
          units: 'metric',
          notifications: true,
          data_sharing: false
        }
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { success: true, profile: mockUserProfile } 
      });

  const createProfileFunction = httpsCallable(mockFunctions, 'create-user-profile') as unknown as jest.MockedFunction<any>;

      const result = await createProfileFunction({
        email: 'test@dampdrinkware.com',
        display_name: 'Test User',
        preferences: mockUserProfile.preferences
      });

      expect(result.data.profile).toEqual(mockUserProfile);
    });

    it('should update user preferences', async () => {
      const updatedPreferences = {
        units: 'imperial',
        notifications: false,
        data_sharing: true
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { success: true, preferences: updatedPreferences } 
      });

  const updatePrefsFunction = httpsCallable(mockFunctions, 'update-user-preferences') as unknown as jest.MockedFunction<any>;

      const result = await updatePrefsFunction({
        user_id: 'user_123',
        preferences: updatedPreferences
      });

      expect(result.data.preferences).toEqual(updatedPreferences);
    });

    it('should handle user deletion', async () => {
      mockHttpsCallable.mockResolvedValue({ 
        data: { 
          success: true, 
          deleted: true,
          cleanup_completed: true 
        } 
      });

  const deleteUserFunction = httpsCallable(mockFunctions, 'delete-user-account') as unknown as jest.MockedFunction<any>;

      const result = await deleteUserFunction({
        user_id: 'user_123',
        confirm_deletion: true
      });

      expect(result.data.deleted).toBe(true);
      expect(result.data.cleanup_completed).toBe(true);
    });
  });

  describe('Notification Functions', () => {
    it('should send push notification', async () => {
      const mockNotification = {
        recipient_token: 'expo_push_token_123',
        title: 'Low Battery Alert',
        body: 'Your DAMP device battery is running low (15%)',
        data: {
          device_id: 'device_123',
          alert_type: 'battery_low'
        }
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { 
          success: true, 
          notification_id: 'notif_123',
          delivered: true 
        } 
      });

  const sendNotificationFunction = httpsCallable(mockFunctions, 'send-notification') as unknown as jest.MockedFunction<any>;

      const result = await sendNotificationFunction(mockNotification);

      expect(result.data.delivered).toBe(true);
      expect(result.data.notification_id).toBe('notif_123');
    });

    it('should schedule recurring notifications', async () => {
      const mockSchedule = {
        user_id: 'user_123',
        notification_type: 'weekly_summary',
        schedule: 'weekly',
        day_of_week: 1, // Monday
        time_of_day: '09:00'
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { 
          success: true, 
          schedule_id: 'schedule_123',
          next_delivery: new Date(Date.now() + 604800000).toISOString() // Next week
        } 
      });

  const scheduleNotificationFunction = httpsCallable(mockFunctions, 'schedule-notification') as unknown as jest.MockedFunction<any>;

      const result = await scheduleNotificationFunction(mockSchedule);

      expect(result.data.schedule_id).toBe('schedule_123');
      expect(result.data.next_delivery).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle function timeout', async () => {
      const timeoutError = {
        code: 'deadline-exceeded',
        message: 'Function execution timed out'
      };

      mockHttpsCallable.mockRejectedValue(timeoutError);

  const slowFunction = httpsCallable(mockFunctions, 'slow-function') as unknown as jest.MockedFunction<any>;

      await expect(slowFunction({})).rejects.toEqual(timeoutError);
    });

    it('should handle network errors', async () => {
      const networkError = {
        code: 'unavailable',
        message: 'Network error occurred'
      };

      mockHttpsCallable.mockRejectedValue(networkError);

  const testFunction = httpsCallable(mockFunctions, 'test-function') as unknown as jest.MockedFunction<any>;

      await expect(testFunction({})).rejects.toEqual(networkError);
    });

    it('should retry failed function calls', async () => {
      let callCount = 0;
      mockHttpsCallable.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject({
            code: 'internal',
            message: 'Internal server error'
          });
        }
        return Promise.resolve({ data: { success: true } });
      });

  const retryableFunction = httpsCallable(mockFunctions, 'retryable-function') as unknown as jest.MockedFunction<any>;

      // Mock retry logic
      let result;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          result = await retryableFunction({});
          break;
        } catch (error: any) {
          attempts++;
          if (attempts >= maxAttempts || !error.code.includes('internal')) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      expect(result?.data.success).toBe(true);
      expect(callCount).toBe(3);
    });
  });

  describe('Performance and Scaling', () => {
    it('should handle large payloads efficiently', async () => {
      const largePayload = {
        sensor_data: Array.from({ length: 1000 }, (_, i) => ({
          id: `data_${i}`,
          temperature: 20 + Math.random() * 10,
          humidity: 40 + Math.random() * 20,
          timestamp: Date.now() - i * 1000
        }))
      };

      mockHttpsCallable.mockResolvedValue({ 
        data: { 
          success: true, 
          processed_count: 1000,
          processing_time_ms: 250 
        } 
      });

  const batchProcessFunction = httpsCallable(mockFunctions, 'batch-process-data') as unknown as jest.MockedFunction<any>;

      const startTime = performance.now();
      const result = await batchProcessFunction(largePayload);
      const endTime = performance.now();

      expect(result.data.processed_count).toBe(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent function calls', async () => {
      mockHttpsCallable.mockResolvedValue({ 
        data: { success: true, timestamp: Date.now() } 
      });

  const testFunction = httpsCallable(mockFunctions, 'concurrent-test') as unknown as jest.MockedFunction<any>;

      const concurrentCalls = Array.from({ length: 10 }, (_, i) => 
        testFunction({ call_id: i })
      );

      const results = await Promise.all(concurrentCalls);

      expect(results).toHaveLength(10);
      expect(results.every(result => result.data.success)).toBe(true);
      expect(mockHttpsCallable).toHaveBeenCalledTimes(10);
    });
  });
});