#!/usr/bin/env node

/**
 * DAMP Smart Drinkware - Secure Build Script
 * Injects environment variables into client-side code at build time
 */

const fs = require('fs');
const path = require('path');

// Environment variables that are safe for client-side use
const CLIENT_SAFE_ENV_VARS = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID',
  'FIREBASE_DATABASE_URL',
  'STRIPE_PUBLISHABLE_KEY', // Publishable keys are safe for client-side
  'GOOGLE_ANALYTICS_ID',
  'APP_URL',
  'APP_NAME',
  'APP_VERSION',
  'ENABLE_VOTING',
  'ENABLE_CUSTOMER_VOTING',
  'ENABLE_PUBLIC_VOTING',
  'ENABLE_ANALYTICS'
];

// Server-only environment variables (never exposed to client)
const SERVER_ONLY_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'DATABASE_URL',
  'EMAIL_SERVICE_API_KEY',
  'ADMIN_KEY',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'API_SECRET_KEY',
  'SENDGRID_API_KEY',
  'MAILCHIMP_API_KEY'
];

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');

  let hasErrors = false;

  // Check that server-only vars aren't accidentally exposed
  for (const varName of SERVER_ONLY_ENV_VARS) {
    if (process.env[`EXPO_PUBLIC_${varName}`] || process.env[`REACT_APP_${varName}`]) {
      console.error(`🚨 ERROR: Server-only variable ${varName} is exposed with client prefix!`);
      hasErrors = true;
    }
  }

  // Check that required client vars are available
  for (const varName of CLIENT_SAFE_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      console.warn(`⚠️  Warning: ${varName} appears to be a placeholder value`);
    }
  }

  if (hasErrors) {
    console.error('\n❌ Build stopped due to security errors');
    process.exit(1);
  }

  console.log('✅ Environment validation passed\n');
}

function generateClientConfig() {
  const config = {};

  for (const varName of CLIENT_SAFE_ENV_VARS) {
    const value = process.env[varName];
    if (value && !value.includes('your_') && !value.includes('_here')) {
      config[varName] = value;
    }
  }

  return config;
}

function injectConfigIntoFile(filePath, config) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace Firebase config injection point
  if (content.includes('window.FIREBASE_CONFIG?.apiKey')) {
    const configScript = `
// Environment configuration injected at build time
window.FIREBASE_CONFIG = ${JSON.stringify(config, null, 2)};
`;

    // Add the config script before the existing script
    content = configScript + '\n' + content;
    console.log(`✅ Injected config into ${filePath}`);
  }

  // Replace service worker config
  if (filePath.includes('firebase-messaging-sw.js')) {
    content = content.replace(
      'apiKey: "your_firebase_api_key_here"',
      `apiKey: "${config.FIREBASE_API_KEY || 'your_firebase_api_key_here'}"`
    );
    console.log(`✅ Updated service worker config in ${filePath}`);
  }

  fs.writeFileSync(filePath, content);
}

function buildWebsite() {
  console.log('🏗️  Building website with environment injection...\n');

  const config = generateClientConfig();

  // Files to inject config into
  const filesToUpdate = [
    'website/assets/js/firebase-services.js',
    'website/firebase-messaging-sw.js',
    'website/js/firebase-config.js'
  ];

  for (const file of filesToUpdate) {
    injectConfigIntoFile(file, config);
  }

  console.log('\n✅ Website build completed with secure environment injection');
}

function createRuntimeConfigLoader() {
  const loaderScript = `
/**
 * DAMP Smart Drinkware - Runtime Configuration Loader
 * Loads configuration securely at runtime
 */

window.DAMP_CONFIG = {
  // Firebase configuration (safe for client-side)
  firebase: {
    apiKey: window.FIREBASE_CONFIG?.FIREBASE_API_KEY || 'development-placeholder',
    authDomain: window.FIREBASE_CONFIG?.FIREBASE_AUTH_DOMAIN || 'damp-smart-drinkware.firebaseapp.com',
    projectId: window.FIREBASE_CONFIG?.FIREBASE_PROJECT_ID || 'damp-smart-drinkware',
    storageBucket: window.FIREBASE_CONFIG?.FIREBASE_STORAGE_BUCKET || 'damp-smart-drinkware.firebasestorage.app',
    messagingSenderId: window.FIREBASE_CONFIG?.FIREBASE_MESSAGING_SENDER_ID || '309818614427',
    appId: window.FIREBASE_CONFIG?.FIREBASE_APP_ID || '1:309818614427:web:db15a4851c05e58aa25c3e',
    measurementId: window.FIREBASE_CONFIG?.FIREBASE_MEASUREMENT_ID || 'G-YW2BN4SVPQ'
  },

  // Stripe configuration (safe for client-side)
  stripe: {
    publishableKey: window.FIREBASE_CONFIG?.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
  },

  // Analytics
  analytics: {
    googleAnalyticsId: window.FIREBASE_CONFIG?.GOOGLE_ANALYTICS_ID || ''
  }
};

// Validate configuration in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.group('🔧 DAMP Configuration Status');

  Object.entries(window.DAMP_CONFIG.firebase).forEach(([key, value]) => {
    if (value.includes('placeholder') || value.includes('your_') || value.includes('_here')) {
      console.warn(\`⚠️  \${key}: Using placeholder value\`);
    } else {
      console.log(\`✅ \${key}: Configured\`);
    }
  });

  console.groupEnd();
}
`;

  fs.writeFileSync('website/assets/js/config-loader.js', loaderScript);
  console.log('✅ Created runtime configuration loader');
}

// Main execution
if (require.main === module) {
  const command = process.argv[2] || 'build';

  switch (command) {
    case 'validate':
      validateEnvironment();
      break;
    case 'build':
      validateEnvironment();
      buildWebsite();
      createRuntimeConfigLoader();
      break;
    case 'config-loader':
      createRuntimeConfigLoader();
      break;
    default:
      console.log('Usage: node build-with-env.js [validate|build|config-loader]');
      process.exit(1);
  }
}

module.exports = { validateEnvironment, generateClientConfig, buildWebsite };