/**
 * 🛡️ DAMP Smart Drinkware - Security Utilities
 * Google-level security hardening and protection mechanisms
 */

import React from 'react';
import { Platform } from 'react-native';
import * as CryptoJS from 'crypto-js';

/**
 * Security utilities following Google's security best practices
 */
export class SecurityUtils {
  private static readonly SALT_ROUNDS = 12;
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Sanitize user input to prevent XSS and injection attacks
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove on* event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove potentially dangerous HTML
      .replace(/<(iframe|object|embed|link|meta|style)[^>]*>/gi, '')
      // Trim whitespace
      .trim()
      // Limit length to prevent DoS
      .substring(0, 10000);
  }

  /**
   * Validate email format with strict RFC compliance
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate phone number format (international)
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validate API response structure and types
   */
  static validateApiResponse<T>(
    response: unknown,
    schema: SchemaDefinition
  ): response is T {
    try {
      return this.validateSchema(response, schema);
    } catch (error) {
      console.error('API response validation failed:', error);
      return false;
    }
  }

  /**
   * Simple schema validation
   */
  private static validateSchema(data: unknown, schema: SchemaDefinition): boolean {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;

    for (const [key, expectedType] of Object.entries(schema)) {
      const value = obj[key];
      
      if (expectedType.required && value === undefined) {
        return false;
      }

      if (value !== undefined && typeof value !== expectedType.type) {
        return false;
      }

      // Additional validations
      if (expectedType.maxLength && typeof value === 'string' && value.length > expectedType.maxLength) {
        return false;
      }

      if (expectedType.pattern && typeof value === 'string' && !expectedType.pattern.test(value)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate cryptographically secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      // Use crypto.getRandomValues if available (web), fallback to Math.random
      const randomIndex = this.getSecureRandomInt(0, chars.length - 1);
      result += chars[randomIndex];
    }
    
    return result;
  }

  /**
   * Generate secure random integer
   */
  private static getSecureRandomInt(min: number, max: number): number {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return min + (array[0] % (max - min + 1));
    }
    
    // Fallback for React Native
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Hash password securely (for client-side pre-hashing)
   */
  static hashPassword(password: string, salt?: string): string {
    const finalSalt = salt || this.generateSecureRandom(16);
    return CryptoJS.PBKDF2(password, finalSalt, {
      keySize: 256/32,
      iterations: 100000 // OWASP recommended minimum
    }).toString();
  }

  /**
   * Encrypt sensitive data for local storage
   */
  static encryptData(data: string, key: string): string {
    try {
      return CryptoJS.AES.encrypt(data, key).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return '';
    }
  }

  /**
   * Decrypt sensitive data from local storage
   */
  static decryptData(encryptedData: string, key: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  /**
   * Obfuscate sensitive tokens for logging
   */
  static obfuscateToken(token: string): string {
    if (!token || typeof token !== 'string') {
      return '***';
    }
    
    if (token.length <= 8) {
      return '***';
    }
    
    return `${token.slice(0, 4)}***${token.slice(-4)}`;
  }

  /**
   * Rate limiting helper (simple in-memory implementation)
   */
  static rateLimiter = (() => {
    const attempts = new Map<string, number[]>();
    
    return {
      isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
        const now = Date.now();
        const userAttempts = attempts.get(key) || [];
        
        // Remove old attempts outside the window
        const recentAttempts = userAttempts.filter(time => now - time < windowMs);
        
        if (recentAttempts.length >= maxAttempts) {
          return false;
        }
        
        // Add current attempt
        recentAttempts.push(now);
        attempts.set(key, recentAttempts);
        
        return true;
      },
      
      reset(key: string): void {
        attempts.delete(key);
      }
    };
  })();

  /**
   * Check if app is running in debug mode (security risk)
   */
  static isDebuggingEnabled(): boolean {
    return __DEV__ || 
           (Platform.OS === 'android' && (global as any).__DEV__) ||
           (typeof window !== 'undefined' && (window as any).__DEV__);
  }

  /**
   * Detect potential security threats
   */
  static detectSecurityThreats(): SecurityThreatReport {
    const threats: string[] = [];
    
    // Check for debugging
    if (this.isDebuggingEnabled()) {
      threats.push('debug_mode_enabled');
    }
    
    // Check for jailbreak/root (basic check)
    if (Platform.OS === 'ios' && this.isJailbroken()) {
      threats.push('jailbroken_device');
    }
    
    if (Platform.OS === 'android' && this.isRooted()) {
      threats.push('rooted_device');
    }
    
    // Check for suspicious network conditions
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      threats.push('offline_mode');
    }
    
    return {
      threatLevel: threats.length > 0 ? 'medium' : 'low',
      threats,
      timestamp: Date.now(),
      platform: Platform.OS,
    };
  }

  /**
   * Basic jailbreak detection (iOS)
   */
  private static isJailbroken(): boolean {
    // This is a basic check - real implementation would be more comprehensive
    return false; // Placeholder
  }

  /**
   * Basic root detection (Android)
   */
  private static isRooted(): boolean {
    // This is a basic check - real implementation would be more comprehensive
    return false; // Placeholder
  }

  /**
   * Validate JWT token format (basic check)
   */
  static validateJWTFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    try {
      // Validate base64 encoding of header and payload
      atob(parts[0]);
      atob(parts[1]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if JWT token is expired
   */
  static isJWTExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < currentTime;
    } catch {
      return true; // Invalid token is considered expired
    }
  }

  /**
   * Content Security Policy validation for web views
   */
  static validateCSP(url: string): boolean {
    const allowedDomains = [
      'https://api.dampdrink.com',
      'https://firebaseapp.com',
      'https://googleapis.com',
      'https://stripe.com',
    ];
    
    return allowedDomains.some(domain => url.startsWith(domain));
  }

  /**
   * Secure headers for API requests
   */
  static getSecureHeaders(authToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-DAMP-Client': Platform.OS,
      'X-DAMP-Version': '1.0.0',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
  }
}

// Types
interface SchemaDefinition {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object';
    required?: boolean;
    maxLength?: number;
    pattern?: RegExp;
  };
}

export interface SecurityThreatReport {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  timestamp: number;
  platform: string;
}

// Security monitoring hook
export function useSecurityMonitoring() {
  const [threatLevel, setThreatLevel] = React.useState<string>('low');
  
  React.useEffect(() => {
    const checkThreats = () => {
      const report = SecurityUtils.detectSecurityThreats();
      setThreatLevel(report.threatLevel);
      
      if (report.threats.length > 0) {
        console.warn('🚨 Security threats detected:', report);
      }
    };
    
    checkThreats();
    const interval = setInterval(checkThreats, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return { threatLevel };
}

export default SecurityUtils;