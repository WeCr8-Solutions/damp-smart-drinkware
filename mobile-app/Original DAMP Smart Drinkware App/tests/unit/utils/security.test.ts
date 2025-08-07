/**
 * 🧪 DAMP Smart Drinkware - Security Utils Tests
 * Comprehensive unit tests for Google-level security utilities
 */

import { SecurityUtils } from '@/utils/security';

// Mock crypto for testing
const mockCrypto = {
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

global.crypto = mockCrypto as any;

describe('SecurityUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Sanitization', () => {
    test('should remove script tags', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = SecurityUtils.sanitizeInput(maliciousInput);
      
      expect(sanitized).toBe('Hello World');
      expect(sanitized).not.toContain('<script>');
    });

    test('should remove javascript: protocol', () => {
      const maliciousInput = 'javascript:alert("xss")';
      const sanitized = SecurityUtils.sanitizeInput(maliciousInput);
      
      expect(sanitized).toBe('alert("xss")');
      expect(sanitized).not.toContain('javascript:');
    });

    test('should remove on* event handlers', () => {
      const maliciousInput = '<div onclick="alert(\'xss\')">Click me</div>';
      const sanitized = SecurityUtils.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('onclick=');
    });

    test('should handle non-string input', () => {
      expect(SecurityUtils.sanitizeInput(null as any)).toBe('');
      expect(SecurityUtils.sanitizeInput(undefined as any)).toBe('');
      expect(SecurityUtils.sanitizeInput(123 as any)).toBe('');
    });

    test('should limit input length', () => {
      const longInput = 'a'.repeat(20000);
      const sanitized = SecurityUtils.sanitizeInput(longInput);
      
      expect(sanitized.length).toBeLessThanOrEqual(10000);
    });
  });

  describe('Email Validation', () => {
    test('should validate correct emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(SecurityUtils.validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user space@domain.com',
        'user@domain',
        'a'.repeat(250) + '@domain.com' // Too long
      ];

      invalidEmails.forEach(email => {
        expect(SecurityUtils.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Phone Number Validation', () => {
    test('should validate correct phone numbers', () => {
      const validNumbers = [
        '+1234567890',
        '1234567890',
        '+44 20 7123 4567',
        '+1 (555) 123-4567'
      ];

      validNumbers.forEach(number => {
        expect(SecurityUtils.validatePhoneNumber(number)).toBe(true);
      });
    });

    test('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '123',
        'abc123',
        '+',
        '++1234567890',
        '0123456789012345678' // Too long
      ];

      invalidNumbers.forEach(number => {
        expect(SecurityUtils.validatePhoneNumber(number)).toBe(false);
      });
    });
  });

  describe('API Response Validation', () => {
    test('should validate correct API response', () => {
      const response = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true
      };

      const schema = {
        id: { type: 'string' as const, required: true },
        name: { type: 'string' as const, required: true },
        email: { type: 'string' as const, required: false },
        isActive: { type: 'boolean' as const, required: true }
      };

      expect(SecurityUtils.validateApiResponse(response, schema)).toBe(true);
    });

    test('should reject invalid API response', () => {
      const response = {
        id: 123, // Wrong type
        name: 'Test User'
        // Missing required fields
      };

      const schema = {
        id: { type: 'string' as const, required: true },
        name: { type: 'string' as const, required: true },
        email: { type: 'string' as const, required: true }
      };

      expect(SecurityUtils.validateApiResponse(response, schema)).toBe(false);
    });

    test('should handle non-object responses', () => {
      const schema = { id: { type: 'string' as const, required: true } };
      
      expect(SecurityUtils.validateApiResponse(null, schema)).toBe(false);
      expect(SecurityUtils.validateApiResponse('string', schema)).toBe(false);
      expect(SecurityUtils.validateApiResponse(123, schema)).toBe(false);
    });
  });

  describe('Secure Random Generation', () => {
    test('should generate random string of correct length', () => {
      const random32 = SecurityUtils.generateSecureRandom(32);
      const random16 = SecurityUtils.generateSecureRandom(16);
      
      expect(random32.length).toBe(32);
      expect(random16.length).toBe(16);
      expect(random32).not.toBe(random16);
    });

    test('should use default length', () => {
      const randomDefault = SecurityUtils.generateSecureRandom();
      
      expect(randomDefault.length).toBe(32);
    });

    test('should generate different values', () => {
      const random1 = SecurityUtils.generateSecureRandom(16);
      const random2 = SecurityUtils.generateSecureRandom(16);
      
      expect(random1).not.toBe(random2);
    });
  });

  describe('Encryption/Decryption', () => {
    test('should encrypt and decrypt data', () => {
      const originalData = 'sensitive information';
      const key = 'test-encryption-key';
      
      const encrypted = SecurityUtils.encryptData(originalData, key);
      const decrypted = SecurityUtils.decryptData(encrypted, key);
      
      expect(encrypted).not.toBe(originalData);
      expect(decrypted).toBe(originalData);
    });

    test('should handle encryption errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = SecurityUtils.encryptData('test', '');
      
      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('should handle decryption errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = SecurityUtils.decryptData('invalid-encrypted-data', 'key');
      
      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Token Obfuscation', () => {
    test('should obfuscate long tokens', () => {
      const longToken = 'sk_live_1234567890abcdef1234567890abcdef';
      const obfuscated = SecurityUtils.obfuscateToken(longToken);
      
      expect(obfuscated).toBe('sk_l***cdef');
      expect(obfuscated).not.toBe(longToken);
    });

    test('should handle short tokens', () => {
      const shortToken = '12345678';
      const obfuscated = SecurityUtils.obfuscateToken(shortToken);
      
      expect(obfuscated).toBe('***');
    });

    test('should handle invalid tokens', () => {
      expect(SecurityUtils.obfuscateToken('')).toBe('***');
      expect(SecurityUtils.obfuscateToken(null as any)).toBe('***');
      expect(SecurityUtils.obfuscateToken(undefined as any)).toBe('***');
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Reset rate limiter state
      SecurityUtils.rateLimiter.reset('test-key');
    });

    test('should allow requests within limit', () => {
      const key = 'test-user';
      
      expect(SecurityUtils.rateLimiter.isAllowed(key, 5, 60000)).toBe(true);
      expect(SecurityUtils.rateLimiter.isAllowed(key, 5, 60000)).toBe(true);
      expect(SecurityUtils.rateLimiter.isAllowed(key, 5, 60000)).toBe(true);
    });

    test('should block requests exceeding limit', () => {
      const key = 'test-user-blocked';
      
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        expect(SecurityUtils.rateLimiter.isAllowed(key, 5, 60000)).toBe(true);
      }
      
      // This should be blocked
      expect(SecurityUtils.rateLimiter.isAllowed(key, 5, 60000)).toBe(false);
    });

    test('should reset rate limit', () => {
      const key = 'test-user-reset';
      
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        SecurityUtils.rateLimiter.isAllowed(key, 5, 60000);
      }
      
      // Reset and try again
      SecurityUtils.rateLimiter.reset(key);
      expect(SecurityUtils.rateLimiter.isAllowed(key, 5, 60000)).toBe(true);
    });
  });

  describe('JWT Validation', () => {
    test('should validate correct JWT format', () => {
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      expect(SecurityUtils.validateJWTFormat(validJWT)).toBe(true);
    });

    test('should reject invalid JWT format', () => {
      const invalidJWTs = [
        'invalid.jwt',
        'one.two.three.four',
        '',
        'not-a-jwt',
        null,
        undefined
      ];

      invalidJWTs.forEach(jwt => {
        expect(SecurityUtils.validateJWTFormat(jwt as any)).toBe(false);
      });
    });

    test('should detect expired JWT', () => {
      const expiredPayload = btoa(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      }));
      
      const expiredJWT = `header.${expiredPayload}.signature`;
      
      expect(SecurityUtils.isJWTExpired(expiredJWT)).toBe(true);
    });

    test('should detect valid JWT', () => {
      const validPayload = btoa(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
      }));
      
      const validJWT = `header.${validPayload}.signature`;
      
      expect(SecurityUtils.isJWTExpired(validJWT)).toBe(false);
    });
  });

  describe('Security Headers', () => {
    test('should generate secure headers without token', () => {
      const headers = SecurityUtils.getSecureHeaders();
      
      expect(headers).toMatchObject({
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-DAMP-Client': expect.any(String),
        'X-DAMP-Version': '1.0.0'
      });
      
      expect(headers['Authorization']).toBeUndefined();
    });

    test('should generate secure headers with token', () => {
      const token = 'test-auth-token';
      const headers = SecurityUtils.getSecureHeaders(token);
      
      expect(headers['Authorization']).toBe(`Bearer ${token}`);
    });
  });

  describe('CSP Validation', () => {
    test('should allow whitelisted domains', () => {
      const allowedURLs = [
        'https://api.dampdrink.com/users',
        'https://firebaseapp.com/auth',
        'https://googleapis.com/storage',
        'https://stripe.com/checkout'
      ];

      allowedURLs.forEach(url => {
        expect(SecurityUtils.validateCSP(url)).toBe(true);
      });
    });

    test('should block non-whitelisted domains', () => {
      const blockedURLs = [
        'https://malicious-site.com',
        'http://insecure-site.com',
        'https://unknown-domain.org'
      ];

      blockedURLs.forEach(url => {
        expect(SecurityUtils.validateCSP(url)).toBe(false);
      });
    });
  });

  describe('Security Threat Detection', () => {
    test('should detect development mode', () => {
      (global as any).__DEV__ = true;
      
      const report = SecurityUtils.detectSecurityThreats();
      
      expect(report.threats).toContain('debug_mode_enabled');
      expect(report.threatLevel).toBe('medium');
      
      delete (global as any).__DEV__;
    });

    test('should return low threat level for clean environment', () => {
      // Ensure clean environment
      delete (global as any).__DEV__;
      
      const report = SecurityUtils.detectSecurityThreats();
      
      expect(report.threatLevel).toBe('low');
      expect(report.threats.length).toBe(0);
    });
  });
});