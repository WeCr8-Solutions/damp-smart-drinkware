/**
 * DAMP Smart Drinkware - Playwright E2E Test Configuration
 * Enterprise-grade testing setup for CI/CD pipeline
 */

const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

// Ensure we use the project root's node_modules
process.env.NODE_PATH = path.resolve(__dirname, '../../node_modules');
require('module').Module._initPaths();

module.exports = defineConfig({
  // Test directory
  testDir: '../../website/tests/e2e',
  testMatch: ['**/*.test.js', '**/*.spec.js'],
  testIgnore: ['../**/node_modules/**', '**/*.ignore.js'],
  
  // Global configuration
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  retries: 1,
  workers: 2,

  // Global setup and teardown
  globalSetup: './playwright-global-setup.js',
  globalTeardown: './playwright-global-teardown.js',

  // Output configuration
  outputDir: '../../website/test-results/playwright-artifacts',
  reporter: [
    ['html'],
    ['json', { outputFile: '../../website/test-results/results.json' }]
  ],

  // Test configuration
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    launchOptions: {
      slowMo: 100
    },
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 15000,
    navigationTimeout: 15000,
    locale: 'en-US'
  },

  // Browser configurations
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5']
      }
    }
  ]
});