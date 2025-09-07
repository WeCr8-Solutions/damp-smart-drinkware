/**
 * Lighthouse CI Configuration for DAMP Smart Drinkware
 * Automated performance monitoring and regression detection
 */

module.exports = {
  ci: {
    // Build configuration
    collect: {
      // URLs to audit (start with main page only)
      url: [
        'http://localhost:3000'
      ],

      // Number of runs per URL for more reliable results
      numberOfRuns: 3,

      // Chrome settings for consistent results
      settings: {
        chromeFlags: [
          '--headless',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--allow-running-insecure-content'
        ],

        // Throttling settings to simulate real-world conditions
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },

        // Emulated device settings
        emulatedFormFactor: 'mobile',

        // Skip certain audits that might be flaky in CI or not applicable to localhost
        skipAudits: [
          'canonical',
          'uses-http2',
          'redirects-http',
          'csp-xss',
          'meta-description',
          'font-size',
          'tap-targets'
        ]
      }
    },

    // Performance budgets and assertions
    assert: {
      // Performance score thresholds
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 4000 }],

        // Resource optimization assertions (relaxed for initial testing)
        'unused-css-rules': ['warn', { maxLength: 1 }],
        'unused-javascript': ['warn', { maxLength: 1 }],
        'render-blocking-resources': ['warn', { maxLength: 2 }],
        'unminified-css': ['warn', { maxLength: 1 }],
        'unminified-javascript': ['warn', { maxLength: 1 }],

        // Image optimization
        'modern-image-formats': ['warn', { maxLength: 2 }],
        'uses-optimized-images': ['warn', { maxLength: 2 }],
        'uses-responsive-images': ['warn', { maxLength: 2 }],

        // Network efficiency
        'uses-text-compression': ['warn', { maxLength: 1 }],
        'efficient-animated-content': ['warn', { maxLength: 1 }],

        // JavaScript optimization
        'legacy-javascript': ['warn', { maxLength: 1 }],
        'duplicated-javascript': ['warn', { maxLength: 1 }]
      }
    },

    // Upload results to Lighthouse CI server with your token
    upload: {
      target: 'lhci',
      token: 'rC9ONokd8Gifyl:84787798:fURYEOcJXI',
      serverBaseUrl: 'https://lhci.canary.dev'
    },

    // Server configuration for local testing
    server: {
      command: 'npm run serve:ci',
      port: 3000,
      timeout: 120000
    }
  }
};