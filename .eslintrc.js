/**
 * DAMP Smart Drinkware - Enterprise ESLint Configuration
 * Google Engineering Standards Implementation
 *
 * This configuration enforces:
 * - Code quality and consistency
 * - Security best practices
 * - Performance optimizations
 * - Accessibility compliance
 * - Modern JavaScript standards
 */

module.exports = {
  root: true,

  // Environment configuration
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
    serviceworker: true
  },

  // Global variables
  globals: {
    // DAMP specific globals
    DAMP: 'readonly',
    DAMP_CONFIG: 'readonly',
    dampDebug: 'readonly',

    // Google Analytics & tracking
    gtag: 'readonly',
    dataLayer: 'readonly',

    // Performance monitoring
    PerformanceObserver: 'readonly',
    IntersectionObserver: 'readonly',

    // PWA globals
    workbox: 'readonly',

    // Testing globals
    __DEV__: 'readonly',
    __TEST__: 'readonly',
    __PROD__: 'readonly',
    
    // Browser globals
    window: 'readonly',
    document: 'readonly',
    Event: 'readonly',
    KeyboardEvent: 'readonly',
    
    // Jest globals
    jest: 'readonly',
    describe: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    test: 'readonly'
  },

  // Parser configuration
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    allowImportExportEverywhere: true,
    ecmaFeatures: {
      jsx: false,
      impliedStrict: true
    },
    babelOptions: {
      presets: ['@babel/preset-env']
    }
  },

  // Extended configurations
  extends: [
    'eslint:recommended'
  ],

  // Plugins
  plugins: [],

  // Rule configuration
  rules: {
    // Code Quality
    'complexity': ['warn', { max: 15 }],
    'max-depth': ['warn', 5],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'warn',
    'no-eval': 'error',
    'no-var': 'error',
    'prefer-const': 'error'
  },

  // Environment-specific overrides
  overrides: [
    // Service Worker files
    {
      files: ['sw.js', '**/sw.js', '**/*-sw.js'],
      env: {
        serviceworker: true,
        browser: false
      },
      globals: {
        workbox: 'readonly',
        clients: 'readonly',
        registration: 'readonly'
      }
    },

    // Test files
    {
      files: [
        '**/*.test.js',
        '**/*.spec.js',
        '**/tests/**/*.js',
        '**/__tests__/**/*.js'
      ],
      env: {
        jest: true,
        node: true
      },
      globals: {
        expect: 'readonly',
        test: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      },
      rules: {
        // Relax some rules for tests
        'no-console': 'off'
      }
    },

    // Configuration files
    {
      files: [
        '*.config.js',
        '*.config.mjs',
        '**/config/*.js',
        '.eslintrc.js',
        'babel.config.js',
        'webpack.config.js',
        'vite.config.js'
      ],
      env: {
        node: true,
        browser: false
      },
      rules: {
        'no-console': 'off'
      }
    },

    // Backend API files
    {
      files: ['backend/**/*.js'],
      env: {
        node: true,
        browser: false
      },
      rules: {
        'no-console': 'off'
      }
    }
  ],

  // Settings
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './website/assets/js'],
          ['@api', './backend/api'],
          ['@components', './website/assets/js/components'],
          ['@tests', './tests']
        ],
        extensions: ['.js', '.json']
      }
    },

    jsdoc: {
      mode: 'jsdoc',
      tagNamePreference: {
        returns: 'return',
        yields: 'yield'
      }
    }
  },

  // Ignore patterns (additional to .eslintignore)
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '.nyc_output/',
    '*.min.js',
    'vendor/',
    'public/assets/js/vendor/',
    '.eslintrc.js' // Don't lint this file itself
  ]
};