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
        
        // Skip certain audits that might be flaky in CI
        skipAudits: [
          'canonical',
          'uses-http2',
          'redirects-http'
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
        
        // Resource optimization assertions
        'unused-css-rules': ['error', { maxLength: 0 }],
        'unused-javascript': ['error', { maxLength: 0 }],
        'render-blocking-resources': ['error', { maxLength: 0 }],
        'unminified-css': ['error', { maxLength: 0 }],
        'unminified-javascript': ['error', { maxLength: 0 }],
        
        // Image optimization
        'modern-image-formats': ['error', { maxLength: 0 }],
        'uses-optimized-images': ['error', { maxLength: 0 }],
        'uses-responsive-images': ['error', { maxLength: 0 }],
        
        // Network efficiency
        'uses-text-compression': ['error', { maxLength: 0 }],
        'efficient-animated-content': ['error', { maxLength: 0 }],
        
        // JavaScript optimization
        'legacy-javascript': ['error', { maxLength: 0 }],
        'duplicated-javascript': ['error', { maxLength: 0 }]
      }
    },
    
    // Upload results to temporary public storage
    upload: {
      target: 'temporary-public-storage'
    },
    
    // Server configuration for local testing
    server: {
      command: 'npm run serve:ci',
      port: 3000,
      timeout: 120000
    }
  }
};
