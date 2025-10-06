const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60000, // Increase global timeout to 60 seconds
  expect: {
    timeout: 15000 // Default timeout for expect operations
  },
  use: {
    baseURL: 'http://localhost:3000',
    actionTimeout: 15000, // Timeout for actions like click
    navigationTimeout: 30000, // Timeout for navigations
    
    // Wait for the page to reach loading state
    waitForNavigation: 'networkidle',
    
    // Retry actions like click if they fail
    retry: 2,
    
    // Screenshots on failure
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000, // Give the dev server 2 minutes to start up
  },
});