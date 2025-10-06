// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const fs = require('fs');

const isCI = !!process.env.CI;
const PORT = process.env.PORT || 3000;
const resolvedWebServerCmd = 'npm run dev';

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: 1,
  reporter: [
    ['html', { 
      open: 'never',
      outputFolder: 'test-reports/html-report',
      attachments: true,
    }],
    ['json', { 
      outputFile: 'test-reports/test-results.json',
    }],
    ['list'],
    ['./tests/e2e/custom-reporter.js']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    launchOptions: { slowMo: 100 },
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: { mode: 'on', fullPage: true },
    ignoreHTTPSErrors: true,
    viewport: { width: 1366, height: 800 },
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
    userAgent: 'Playwright E2E'
  },
  grep: process.env?.PW_SMOKE === '1' ? /@smoke/ : undefined,
  grepInvert: isCI ? /@flaky/ : undefined,
  projects: [
    {
      name: 'setup:auth',
      testMatch: /auth\.setup\.(ts|js)$/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: fs.existsSync('storage/auth.json') ? 'storage/auth.json' : undefined,
      },
      dependencies: ['setup:auth'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: fs.existsSync('storage/auth.json') ? 'storage/auth.json' : undefined,
      },
      dependencies: ['setup:auth'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: fs.existsSync('storage/auth.json') ? 'storage/auth.json' : undefined,
      },
      dependencies: ['setup:auth'],
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: fs.existsSync('storage/auth.json') ? 'storage/auth.json' : undefined
      },
      dependencies: ['setup:auth'],
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14'],
        storageState: fs.existsSync('storage/auth.json') ? 'storage/auth.json' : undefined
      },
      dependencies: ['setup:auth'],
    },
  ],
});

