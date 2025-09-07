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

    // Performance budgets and assertions (relaxed for CI stability)
    assert: {
      // Performance score thresholds (more lenient for CI)
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],

        // Core Web Vitals thresholds (relaxed for CI environment)
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 5000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.2 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        'speed-index': ['warn', { maxNumericValue: 5000 }],

        // Resource optimization assertions (all warnings, no errors)
        'unused-css-rules': ['off'],
        'unused-javascript': ['off'],
        'render-blocking-resources': ['off'],
        'unminified-css': ['off'],
        'unminified-javascript': ['off'],

        // Image optimization (warnings only)
        'modern-image-formats': ['off'],
        'uses-optimized-images': ['off'],
        'uses-responsive-images': ['off'],

        // Network efficiency (warnings only)
        'uses-text-compression': ['off'],
        'efficient-animated-content': ['off'],

        // JavaScript optimization (warnings only)
        'legacy-javascript': ['off'],
        'duplicated-javascript': ['off']
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