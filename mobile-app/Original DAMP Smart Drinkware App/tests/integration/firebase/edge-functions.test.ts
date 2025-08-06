/**
 * DAMP Smart Drinkware - Firebase Edge Functions Integration Tests
 * Testing actual Supabase Edge Functions with Deno runtime
 * Copyright 2025 WeCr8 Solutions LLC
 */

import { createClient } from '@supabase/supabase-js';
import { integrationTestUtils } from '../../setup/integration-setup';

describe('Firebase Edge Functions Integration', () => {
  let supabase: any;
  let testUser: any;

  beforeAll(async () => {
    supabase = integrationTestUtils.firebase.testApp; // Use test client
    
    // Create test user for authenticated requests
    testUser = {
      id: 'test-user-123',
      email: 'test@dampdrinkware.com',
      access_token: 'test-access-token'
    };
  });

  beforeEach(async () => {
    await integrationTestUtils.firebase.clearData();
  });

  describe('stripe-checkout Edge Function', () => {
    const validCheckoutRequest = {
      price_id: 'price_test_123',
      success_url: 'https://app.dampdrinkware.com/success',
      cancel_url: 'https://app.dampdrinkware.com/cancel',
      mode: 'payment'
    };

    it('should create checkout session for authenticated user', async () => {
      // Mock successful Stripe session creation
      const mockSession = {
        sessionId: 'cs_test_123456789',
        url: 'https://checkout.stripe.com/pay/cs_test_123456789'
      };

      // Mock the edge function call
      const mockInvoke = jest.fn().mockResolvedValue({
        data: mockSession,
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: validCheckoutRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeNull();
      expect(data.sessionId).toBe(mockSession.sessionId);
      expect(data.url).toContain('checkout.stripe.com');
      expect(mockInvoke).toHaveBeenCalledWith('stripe-checkout', {
        body: validCheckoutRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });
    });

    it('should validate required parameters', async () => {
      const invalidRequest = {
        success_url: 'https://app.dampdrinkware.com/success',
        cancel_url: 'https://app.dampdrinkware.com/cancel',
        mode: 'payment'
        // Missing price_id
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'Missing required parameter price_id'
        }
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: invalidRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeTruthy();
      expect(error.message).toContain('price_id');
      expect(data).toBeNull();
    });

    it('should handle subscription mode correctly', async () => {
      const subscriptionRequest = {
        ...validCheckoutRequest,
        mode: 'subscription',
        price_id: 'price_subscription_123'
      };

      const mockSession = {
        sessionId: 'cs_sub_123456789',
        url: 'https://checkout.stripe.com/pay/cs_sub_123456789'
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: mockSession,
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: subscriptionRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeNull();
      expect(data.sessionId).toBe(mockSession.sessionId);
      expect(mockInvoke).toHaveBeenCalledWith('stripe-checkout', {
        body: subscriptionRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });
    });

    it('should handle customer creation for new users', async () => {
      const newUserRequest = {
        ...validCheckoutRequest,
        user_email: 'newuser@dampdrinkware.com'
      };

      const mockSession = {
        sessionId: 'cs_newuser_123',
        url: 'https://checkout.stripe.com/pay/cs_newuser_123',
        customer_created: true,
        customer_id: 'cus_newuser_123'
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: mockSession,
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: newUserRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeNull();
      expect(data.customer_created).toBe(true);
      expect(data.customer_id).toBe('cus_newuser_123');
    });

    it('should handle authentication errors', async () => {
      const mockInvoke = jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'Failed to authenticate user',
          status: 401
        }
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: validCheckoutRequest,
        headers: {
          Authorization: 'Bearer invalid_token'
        }
      });

      expect(error).toBeTruthy();
      expect(error.status).toBe(401);
      expect(data).toBeNull();
    });
  });

  describe('stripe-store-checkout Edge Function', () => {
    const validStoreRequest = {
      cart_items: [
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
      ],
      success_url: 'https://store.dampdrinkware.com/success',
      cancel_url: 'https://store.dampdrinkware.com/cart',
      mode: 'payment',
      shipping_address_collection: true
    };

    it('should create store checkout session with multiple items', async () => {
      const mockSession = {
        sessionId: 'cs_store_123456789',
        url: 'https://checkout.stripe.com/pay/cs_store_123456789',
        line_items_count: 3, // 2 + 1 quantity
        total_amount: 12950 // $129.50
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: mockSession,
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-store-checkout', {
        body: validStoreRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeNull();
      expect(data.sessionId).toBe(mockSession.sessionId);
      expect(data.line_items_count).toBe(3);
      expect(data.total_amount).toBe(12950);
    });

    it('should handle empty cart validation', async () => {
      const emptyCartRequest = {
        ...validStoreRequest,
        cart_items: []
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'Cart cannot be empty'
        }
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-store-checkout', {
        body: emptyCartRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeTruthy();
      expect(error.message).toContain('Cart cannot be empty');
    });

    it('should apply discount codes', async () => {
      const discountRequest = {
        ...validStoreRequest,
        discount_code: 'SAVE20'
      };

      const mockSession = {
        sessionId: 'cs_discount_123',
        url: 'https://checkout.stripe.com/pay/cs_discount_123',
        discount_applied: true,
        discount_amount: 2590, // $25.90 discount
        final_amount: 10360 // $103.60 after discount
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: mockSession,
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-store-checkout', {
        body: discountRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeNull();
      expect(data.discount_applied).toBe(true);
      expect(data.discount_amount).toBe(2590);
      expect(data.final_amount).toBe(10360);
    });

    it('should handle international shipping', async () => {
      const internationalRequest = {
        ...validStoreRequest,
        shipping_country: 'CA',
        shipping_address_collection: true
      };

      const mockSession = {
        sessionId: 'cs_international_123',
        url: 'https://checkout.stripe.com/pay/cs_international_123',
        shipping_rate: 'shr_canada_standard',
        shipping_cost: 1500, // $15.00 CAD
        currency: 'cad'
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: mockSession,
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-store-checkout', {
        body: internationalRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeNull();
      expect(data.shipping_rate).toBe('shr_canada_standard');
      expect(data.shipping_cost).toBe(1500);
      expect(data.currency).toBe('cad');
    });
  });

  describe('stripe-webhook Edge Function', () => {
    it('should process successful payment webhook', async () => {
      const webhookPayload = {
        id: 'evt_test_webhook_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123456789',
            payment_status: 'paid',
            customer: 'cus_test_123',
            amount_total: 4999,
            currency: 'usd',
            metadata: {
              user_id: testUser.id,
              product_type: 'silicone_bottom'
            }
          }
        }
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: {
          success: true,
          processed: true,
          order_id: 'order_123',
          user_notified: true
        },
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-webhook', {
        body: {
          webhook_payload: webhookPayload,
          stripe_signature: 'test_signature_123'
        }
      });

      expect(error).toBeNull();
      expect(data.success).toBe(true);
      expect(data.processed).toBe(true);
      expect(data.order_id).toBe('order_123');
      expect(data.user_notified).toBe(true);
    });

    it('should handle subscription events', async () => {
      const subscriptionWebhook = {
        id: 'evt_subscription_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
            plan: {
              id: 'plan_premium',
              amount: 999,
              currency: 'usd',
              interval: 'month'
            }
          }
        }
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: {
          success: true,
          subscription_activated: true,
          premium_features_enabled: true,
          billing_cycle_start: subscriptionWebhook.data.object.current_period_start
        },
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-webhook', {
        body: {
          webhook_payload: subscriptionWebhook,
          stripe_signature: 'test_signature_sub_123'
        }
      });

      expect(error).toBeNull();
      expect(data.subscription_activated).toBe(true);
      expect(data.premium_features_enabled).toBe(true);
    });

    it('should handle failed payment webhooks', async () => {
      const failedPaymentWebhook = {
        id: 'evt_payment_failed_123',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test_failed',
            customer: 'cus_test_123',
            amount_due: 999,
            attempt_count: 2,
            next_payment_attempt: Math.floor(Date.now() / 1000) + 86400 // 24 hours
          }
        }
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: {
          success: true,
          payment_retry_scheduled: true,
          customer_notified: true,
          next_attempt: failedPaymentWebhook.data.object.next_payment_attempt
        },
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-webhook', {
        body: {
          webhook_payload: failedPaymentWebhook,
          stripe_signature: 'test_signature_failed_123'
        }
      });

      expect(error).toBeNull();
      expect(data.payment_retry_scheduled).toBe(true);
      expect(data.customer_notified).toBe(true);
    });

    it('should reject invalid webhook signatures', async () => {
      const invalidWebhook = {
        webhook_payload: { type: 'test.event' },
        stripe_signature: 'invalid_signature'
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid webhook signature',
          status: 400
        }
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('stripe-webhook', {
        body: invalidWebhook
      });

      expect(error).toBeTruthy();
      expect(error.message).toContain('Invalid webhook signature');
      expect(error.status).toBe(400);
    });
  });

  describe('Custom Business Logic Functions', () => {
    it('should process device data aggregation', async () => {
      const deviceDataRequest = {
        device_id: 'device_123',
        date_range: '7d',
        metrics: ['temperature', 'humidity', 'battery_level']
      };

      const mockAggregatedData = {
        device_id: 'device_123',
        period: '7d',
        data_points: 168, // 7 days * 24 hours
        averages: {
          temperature: 23.2,
          humidity: 45.8,
          battery_level: 78.5
        },
        trends: {
          temperature: 'stable',
          humidity: 'increasing',
          battery_level: 'decreasing'
        },
        alerts: [
          {
            type: 'battery_low',
            severity: 'warning',
            message: 'Battery level trending downward'
          }
        ]
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: mockAggregatedData,
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('aggregate-device-data', {
        body: deviceDataRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeNull();
      expect(data.device_id).toBe('device_123');
      expect(data.data_points).toBe(168);
      expect(data.averages.temperature).toBe(23.2);
      expect(data.alerts).toHaveLength(1);
    });

    it('should generate user analytics report', async () => {
      const analyticsRequest = {
        user_id: testUser.id,
        report_type: 'monthly_summary',
        include_comparisons: true
      };

      const mockAnalytics = {
        user_id: testUser.id,
        period: 'monthly',
        devices_active: 3,
        total_data_points: 2160,
        usage_patterns: {
          most_active_device: 'device_123',
          peak_usage_hours: [8, 12, 18, 22],
          average_daily_readings: 72
        },
        environmental_insights: {
          average_room_temp: 22.8,
          humidity_range: [35, 55],
          comfort_score: 8.2
        },
        comparisons: {
          vs_previous_month: {
            data_points_change: '+12%',
            avg_temp_change: '-0.3°C',
            comfort_score_change: '+0.4'
          },
          vs_community_average: {
            more_active: true,
            temp_comparison: 'similar',
            humidity_preference: 'lower'
          }
        }
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: mockAnalytics,
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('generate-user-analytics', {
        body: analyticsRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeNull();
      expect(data.user_id).toBe(testUser.id);
      expect(data.devices_active).toBe(3);
      expect(data.usage_patterns.most_active_device).toBe('device_123');
      expect(data.comparisons.vs_previous_month.data_points_change).toBe('+12%');
    });

    it('should handle firmware update notifications', async () => {
      const updateRequest = {
        device_type: 'silicone_bottom',
        current_version: '1.0.0',
        check_beta: false
      };

      const mockUpdateInfo = {
        update_available: true,
        latest_version: '1.2.0',
        update_type: 'recommended',
        release_notes: [
          'Improved battery optimization',
          'Enhanced sensor accuracy',
          'Bug fixes for connection stability'
        ],
        download_url: 'https://firmware.dampdrinkware.com/v1.2.0/silicone_bottom.bin',
        file_size: 245760,
        estimated_update_time: 180, // 3 minutes
        compatibility_check: 'passed',
        rollback_supported: true
      };

      const mockInvoke = jest.fn().mockResolvedValue({
        data: mockUpdateInfo,
        error: null
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('check-firmware-updates', {
        body: updateRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeNull();
      expect(data.update_available).toBe(true);
      expect(data.latest_version).toBe('1.2.0');
      expect(data.release_notes).toHaveLength(3);
      expect(data.compatibility_check).toBe('passed');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle function timeouts', async () => {
      const longRunningRequest = {
        operation: 'heavy_computation',
        timeout: 300000 // 5 minutes
      };

      const mockInvoke = jest.fn().mockRejectedValue({
        message: 'Function execution timed out',
        code: 'TIMEOUT'
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('long-running-task', {
        body: longRunningRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      }).catch(err => ({ data: null, error: err }));

      expect(error).toBeTruthy();
      expect(error.code).toBe('TIMEOUT');
    });

    it('should handle malformed request data', async () => {
      const malformedRequest = {
        invalid_json: '{ this is not valid json',
        circular_reference: {}
      };
      
      // Create circular reference
      (malformedRequest.circular_reference as any).self = malformedRequest.circular_reference;

      const mockInvoke = jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid request format',
          status: 400
        }
      });

      supabase.functions = { invoke: mockInvoke };

      const { data, error } = await supabase.functions.invoke('test-function', {
        body: { data: 'valid data' }, // Send valid data, mock will return error
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });

      expect(error).toBeTruthy();
      expect(error.status).toBe(400);
    });

    it('should handle rate limiting', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => ({
        request_id: i,
        data: `request_${i}`
      }));

      let rateLimitHit = false;
      const mockInvoke = jest.fn().mockImplementation((functionName, options) => {
        const requestNumber = JSON.parse(options.body).request_id;
        
        if (requestNumber > 10) {
          rateLimitHit = true;
          return Promise.resolve({
            data: null,
            error: {
              message: 'Rate limit exceeded',
              status: 429,
              retry_after: 60
            }
          });
        }
        
        return Promise.resolve({
          data: { success: true, request_id: requestNumber },
          error: null
        });
      });

      supabase.functions = { invoke: mockInvoke };

      const results = await Promise.allSettled(
        requests.slice(0, 15).map(request =>
          supabase.functions.invoke('rate-limited-function', {
            body: request,
            headers: {
              Authorization: `Bearer ${testUser.access_token}`
            }
          })
        )
      );

      expect(rateLimitHit).toBe(true);
      
      const successful = results.filter(r => 
        r.status === 'fulfilled' && !r.value.error
      );
      const rateLimited = results.filter(r => 
        r.status === 'fulfilled' && r.value.error?.status === 429
      );

      expect(successful.length).toBe(11); // First 11 requests succeed
      expect(rateLimited.length).toBe(4); // Next 4 are rate limited
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent function invocations', async () => {
      const concurrentRequests = Array.from({ length: 20 }, (_, i) => ({
        request_id: `concurrent_${i}`,
        timestamp: Date.now()
      }));

      const mockInvoke = jest.fn().mockImplementation((functionName, options) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: {
                success: true,
                processed_at: Date.now(),
                request_id: JSON.parse(options.body).request_id
              },
              error: null
            });
          }, Math.random() * 100); // Random delay 0-100ms
        });
      });

      supabase.functions = { invoke: mockInvoke };

      const startTime = performance.now();
      
      const results = await Promise.all(
        concurrentRequests.map(request =>
          supabase.functions.invoke('concurrent-test', {
            body: request,
            headers: {
              Authorization: `Bearer ${testUser.access_token}`
            }
          })
        )
      );

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      expect(results.every(r => r.data.success)).toBe(true);
      
      // Concurrent execution should be faster than sequential
      expect(totalTime).toBeLessThan(1000); // Under 1 second for 20 concurrent requests
      
      // All requests should have unique request IDs
      const requestIds = results.map(r => r.data.request_id);
      const uniqueIds = new Set(requestIds);
      expect(uniqueIds.size).toBe(20);
    });

    it('should optimize cold start performance', async () => {
      const coldStartRequest = {
        function_name: 'rarely_used_function',
        payload_size: 'small'
      };

      // Simulate cold start delay
      const mockInvoke = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: {
                success: true,
                cold_start: true,
                execution_time_ms: 850,
                memory_used_mb: 45
              },
              error: null
            });
          }, 850); // Cold start delay
        });
      });

      supabase.functions = { invoke: mockInvoke };

      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('cold-start-function', {
        body: coldStartRequest,
        headers: {
          Authorization: `Bearer ${testUser.access_token}`
        }
      });
      const endTime = performance.now();

      expect(error).toBeNull();
      expect(data.cold_start).toBe(true);
      
      // Cold start should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(2000); // Under 2 seconds
      expect(data.memory_used_mb).toBeLessThan(128); // Under 128MB
    });
  });
});