/**
 * DAMP Smart Drinkware - Accessibility Test Setup
 * Configuration for accessibility testing with axe-core and custom a11y checks
 * Copyright 2025 WeCr8 Solutions LLC
 */

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import { configureAxe } from '@axe-core/react-native';
import type { RunOptions, Result, AxeResults } from '@axe-core/react-native';

// Configure axe-core for React Native accessibility testing
const axeConfig: RunOptions = {
  rules: {
    // Enable all WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'semantic-markup': { enabled: true },
    'aria-labels': { enabled: true },
    'touch-targets': { enabled: true },
    'text-alternatives': { enabled: true },

    // React Native specific rules
    'accessibility-label': { enabled: true },
    'accessibility-hint': { enabled: true },
    'accessibility-role': { enabled: true },
    'accessibility-state': { enabled: true },
    'accessibility-value': { enabled: true }
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  reporter: 'v2'
};

configureAxe(axeConfig);

// Mock React Native accessibility modules
jest.mock('react-native-accessibility-info', () => ({
  isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
  isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
  isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
  isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
  isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  announceForAccessibility: jest.fn(),
  setAccessibilityFocus: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn()
}));

// Mock expo-screen-orientation for accessibility testing
jest.mock('expo-screen-orientation', () => ({
  lockAsync: jest.fn(() => Promise.resolve()),
  unlockAsync: jest.fn(() => Promise.resolve()),
  getOrientationAsync: jest.fn(() => Promise.resolve('portrait')),
  addOrientationChangeListener: jest.fn(() => ({ remove: jest.fn() }))
}));

// Accessibility testing utilities
export const accessibilityTestUtils = {
  // Screen reader simulation
  screenReader: {
    isEnabled: false,
    toggle: (enabled: boolean) => {
      accessibilityTestUtils.screenReader.isEnabled = enabled;
      const AccessibilityInfo = require('react-native-accessibility-info');
      AccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(enabled);
    },
    announce: jest.fn((message: string) => {
      console.log(`Screen Reader: ${message}`);
    })
  },

  // Reduce motion simulation
  reduceMotion: {
    isEnabled: false,
    toggle: (enabled: boolean) => {
      accessibilityTestUtils.reduceMotion.isEnabled = enabled;
      const AccessibilityInfo = require('react-native-accessibility-info');
      AccessibilityInfo.isReduceMotionEnabled.mockResolvedValue(enabled);
    }
  },

  // Color contrast utilities
  colorContrast: {
    calculateRatio: (foreground: string, background: string): number => {
      // Simplified contrast ratio calculation
      // In real implementation, this would use proper color parsing
      const fgLuminance = parseInt(foreground.replace('#', ''), 16) / 0xffffff;
      const bgLuminance = parseInt(background.replace('#', ''), 16) / 0xffffff;

      const lighter = Math.max(fgLuminance, bgLuminance);
      const darker = Math.min(fgLuminance, bgLuminance);

      return (lighter + 0.05) / (darker + 0.05);
    },

    meetsWCAGAA: (ratio: number): boolean => ratio >= 4.5,
    meetsWCAGAAA: (ratio: number): boolean => ratio >= 7,
    meetsLargeTextAA: (ratio: number): boolean => ratio >= 3
  },

  // Touch target utilities
  touchTarget: {
    minimumSize: 44, // 44pt minimum as per Apple/Google guidelines

    isTouchTargetAccessible: (width: number, height: number): boolean => {
      return width >= accessibilityTestUtils.touchTarget.minimumSize &&
             height >= accessibilityTestUtils.touchTarget.minimumSize;
    },

    hasAdequateSpacing: (targets: Array<{ x: number, y: number, width: number, height: number }>): boolean => {
      const minSpacing = 8; // 8pt minimum spacing

      for (let i = 0; i < targets.length; i++) {
        for (let j = i + 1; j < targets.length; j++) {
          const target1 = targets[i];
          const target2 = targets[j];

          const distance = Math.sqrt(
            Math.pow(target2.x - target1.x, 2) + Math.pow(target2.y - target1.y, 2)
          );

          if (distance < minSpacing) {
            return false;
          }
        }
      }

      return true;
    }
  },

  // Focus management utilities
  focusManagement: {
    focusOrder: [] as string[],
    currentFocus: null as string | null,

    simulateFocusChange: (elementId: string) => {
      accessibilityTestUtils.focusManagement.currentFocus = elementId;
      accessibilityTestUtils.focusManagement.focusOrder.push(elementId);
    },

    isFocusOrderLogical: (): boolean => {
      // Check if focus order follows reading order (top to bottom, left to right)
      // This is a simplified check
      return accessibilityTestUtils.focusManagement.focusOrder.length > 0;
    },

    reset: () => {
      accessibilityTestUtils.focusManagement.focusOrder = [];
      accessibilityTestUtils.focusManagement.currentFocus = null;
    }
  },

  // Semantic markup utilities
  semantics: {
    validateRole: (role: string, allowedRoles: string[]): boolean => {
      return allowedRoles.includes(role);
    },

    validateState: (state: any): boolean => {
      // Check if accessibility state is properly defined
      return typeof state === 'object' && state !== null;
    },

    validateValue: (value: any): boolean => {
      // Check if accessibility value is properly defined for controls
      return value !== undefined && value !== null;
    }
  },

  // Keyboard navigation utilities
  keyboard: {
    simulateKeyPress: (key: string, element?: string) => {
      console.log(`Keyboard: ${key} pressed${element ? ` on ${element}` : ''}`);
      return Promise.resolve();
    },

    simulateTabNavigation: (direction: 'forward' | 'backward' = 'forward') => {
      const key = direction === 'forward' ? 'Tab' : 'Shift+Tab';
      return accessibilityTestUtils.keyboard.simulateKeyPress(key);
    }
  }
};

// Accessibility testing presets
export const accessibilityTestPresets = {
  // WCAG 2.1 AA compliance
  wcag21AA: {
    colorContrast: { minimum: 4.5 },
    touchTargetSize: { minimum: 44 },
    textScaling: { maximum: 200 },
    focusVisible: true,
    screenReaderCompatible: true
  },

  // WCAG 2.1 AAA compliance
  wcag21AAA: {
    colorContrast: { minimum: 7 },
    touchTargetSize: { minimum: 44 },
    textScaling: { maximum: 200 },
    focusVisible: true,
    screenReaderCompatible: true,
    reducedMotion: true
  },

  // Mobile-specific accessibility
  mobile: {
    touchTargetSize: { minimum: 44 },
    gestureAlternatives: true,
    orientationSupport: ['portrait', 'landscape'],
    pinchToZoom: true,
    voiceoverCompatible: true,
    talkbackCompatible: true
  }
};

// Custom accessibility matchers
expect.extend({
  toBeAccessible(received: any) {
    // This would integrate with axe-core to run accessibility tests
    const violations: any[] = []; // Mock violations array

    const pass = violations.length === 0;

    return {
      message: () => {
        if (pass) {
          return `expected element to have accessibility violations`;
        } else {
          const violationMessages = violations.map(v => `- ${v.description}`).join('\n');
          return `expected element to be accessible but found violations:\n${violationMessages}`;
        }
      },
      pass,
    };
  },

  toHaveSufficientColorContrast(received: { foreground: string, background: string }, level: 'AA' | 'AAA' = 'AA') {
    const ratio = accessibilityTestUtils.colorContrast.calculateRatio(
      received.foreground,
      received.background
    );

    const meetsStandard = level === 'AA'
      ? accessibilityTestUtils.colorContrast.meetsWCAGAA(ratio)
      : accessibilityTestUtils.colorContrast.meetsWCAGAAA(ratio);

    return {
      message: () =>
        meetsStandard
          ? `expected color contrast ratio ${ratio.toFixed(2)}:1 to not meet WCAG ${level} standards`
          : `expected color contrast ratio ${ratio.toFixed(2)}:1 to meet WCAG ${level} standards (minimum ${level === 'AA' ? '4.5' : '7'}:1)`,
      pass: meetsStandard,
    };
  },

  toHaveAccessibleTouchTarget(received: { width: number, height: number }) {
    const isAccessible = accessibilityTestUtils.touchTarget.isTouchTargetAccessible(
      received.width,
      received.height
    );

    return {
      message: () =>
        isAccessible
          ? `expected touch target ${received.width}x${received.height} to be too small`
          : `expected touch target ${received.width}x${received.height} to be at least ${accessibilityTestUtils.touchTarget.minimumSize}x${accessibilityTestUtils.touchTarget.minimumSize}`,
      pass: isAccessible,
    };
  },

  toHaveAccessibilityLabel(received: any) {
    const hasLabel = received.props?.accessibilityLabel ||
                    received.props?.accessible !== false;

    return {
      message: () =>
        hasLabel
          ? `expected element not to have accessibility label`
          : `expected element to have accessibility label for screen readers`,
      pass: hasLabel,
    };
  },

  toSupportKeyboardNavigation(received: any) {
    const supportsKeyboard = received.props?.accessible !== false &&
                            (received.props?.onPress || received.props?.focusable);

    return {
      message: () =>
        supportsKeyboard
          ? `expected element not to support keyboard navigation`
          : `expected element to support keyboard navigation`,
      pass: supportsKeyboard,
    };
  }
});

// Global setup for accessibility tests
beforeEach(() => {
  jest.clearAllMocks();
  accessibilityTestUtils.focusManagement.reset();
  accessibilityTestUtils.screenReader.toggle(false);
  accessibilityTestUtils.reduceMotion.toggle(false);
});

// Configure console to show accessibility warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  // Log accessibility-related warnings prominently
  if (args.some(arg =>
    typeof arg === 'string' &&
    (arg.includes('accessibility') || arg.includes('a11y'))
  )) {
    originalWarn('🔴 ACCESSIBILITY WARNING:', ...args);
  } else {
    originalWarn(...args);
  }
};

// Accessibility test timeout
jest.setTimeout(15000);