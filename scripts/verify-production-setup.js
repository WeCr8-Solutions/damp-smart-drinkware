#!/usr/bin/env node
/**
 * Verify Production Setup
 * 
 * This script verifies that all production configuration is correct
 * for the live website and Firebase Auth.
 * 
 * Usage:
 *   node scripts/verify-production-setup.js
 */

const fs = require('fs');
const path = require('path');

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w",
  authDomain: "damp-smart-drinkware.firebaseapp.com",
  projectId: "damp-smart-drinkware",
  storageBucket: "damp-smart-drinkware.firebasestorage.app",
  messagingSenderId: "309818614427",
  appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
  measurementId: "G-YW2BN4SVPQ",
  databaseURL: "https://damp-smart-drinkware-default-rtdb.firebaseio.com"
};

const REQUIRED_FILES = [
  'website/js/firebase-config.js',
  'website/assets/js/firebase-services.js',
  'website/assets/js/store/damp-store-config.js',
  'remoteconfig.template.json',
  'firebase.json'
];

const REQUIRED_CONFIG_FILES = [
  'website/js/firebase-config.js',
  'website/assets/js/firebase-services.js',
  'website/assets/js/store/damp-store-config.js'
];

function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
}

function checkFirebaseConfig(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    return { exists: false, error: 'File not found' };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const checks = {
    hasApiKey: content.includes(FIREBASE_CONFIG.apiKey),
    hasAuthDomain: content.includes(FIREBASE_CONFIG.authDomain),
    hasProjectId: content.includes(FIREBASE_CONFIG.projectId),
    hasStorageBucket: content.includes(FIREBASE_CONFIG.storageBucket),
    hasAppId: content.includes(FIREBASE_CONFIG.appId),
    hasMeasurementId: content.includes(FIREBASE_CONFIG.measurementId)
  };

  const allPassed = Object.values(checks).every(v => v === true);
  return { exists: true, checks, allPassed };
}

function checkRemoteConfig() {
  const filePath = path.join(__dirname, '..', 'remoteconfig.template.json');
  if (!fs.existsSync(filePath)) {
    return { exists: false, error: 'Remote Config file not found' };
  }

  try {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const params = config.parameters || {};
    
    const requiredParams = [
      'firebase_api_key',
      'firebase_auth_domain',
      'firebase_project_id',
      'firebase_storage_bucket',
      'firebase_app_id',
      'firebase_measurement_id'
    ];

    const missing = requiredParams.filter(p => !params[p]);
    const hasApiKey = params.firebase_api_key?.defaultValue?.value === FIREBASE_CONFIG.apiKey;

    return {
      exists: true,
      hasAllParams: missing.length === 0,
      hasApiKey,
      missingParams: missing,
      totalParams: Object.keys(params).length
    };
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

function checkFirebaseJSON() {
  const filePath = path.join(__dirname, '..', 'firebase.json');
  if (!fs.existsSync(filePath)) {
    return { exists: false, error: 'firebase.json not found' };
  }

  try {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const hasHosting = !!config.hosting;
    const hasRemoteConfig = !!config.remoteconfig;
    const hasFunctions = !!config.functions;

    return {
      exists: true,
      hasHosting,
      hasRemoteConfig,
      hasFunctions,
      allConfigured: hasHosting && hasRemoteConfig && hasFunctions
    };
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

function main() {
  console.log('🔍 Verifying Production Setup');
  console.log('==============================\n');

  let allPassed = true;
  const results = [];

  // Check required files
  console.log('📁 Checking Required Files...');
  REQUIRED_FILES.forEach(file => {
    const exists = checkFileExists(file);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${file}`);
    results.push({ file, exists });
    if (!exists) allPassed = false;
  });

  console.log('');

  // Check Firebase config files
  console.log('🔥 Checking Firebase Configuration...');
  REQUIRED_CONFIG_FILES.forEach(file => {
    const result = checkFirebaseConfig(file);
    if (result.exists) {
      if (result.allPassed) {
        console.log(`  ✅ ${file} - All config values present`);
      } else {
        console.log(`  ⚠️  ${file} - Some config values missing:`);
        Object.entries(result.checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`     - Missing: ${key}`);
          }
        });
        allPassed = false;
      }
    } else {
      console.log(`  ❌ ${file} - ${result.error}`);
      allPassed = false;
    }
  });

  console.log('');

  // Check Remote Config
  console.log('📡 Checking Remote Config...');
  const remoteConfigResult = checkRemoteConfig();
  if (remoteConfigResult.exists) {
    if (remoteConfigResult.error) {
      console.log(`  ❌ Error: ${remoteConfigResult.error}`);
      allPassed = false;
    } else {
      if (remoteConfigResult.hasAllParams && remoteConfigResult.hasApiKey) {
        console.log(`  ✅ Remote Config - All parameters present (${remoteConfigResult.totalParams} total)`);
      } else {
        console.log(`  ⚠️  Remote Config - Issues found:`);
        if (!remoteConfigResult.hasAllParams) {
          console.log(`     - Missing parameters: ${remoteConfigResult.missingParams.join(', ')}`);
        }
        if (!remoteConfigResult.hasApiKey) {
          console.log(`     - API key not set correctly`);
        }
        allPassed = false;
      }
    }
  } else {
    console.log(`  ❌ Remote Config - ${remoteConfigResult.error}`);
    allPassed = false;
  }

  console.log('');

  // Check firebase.json
  console.log('⚙️  Checking firebase.json...');
  const firebaseJsonResult = checkFirebaseJSON();
  if (firebaseJsonResult.exists) {
    if (firebaseJsonResult.error) {
      console.log(`  ❌ Error: ${firebaseJsonResult.error}`);
      allPassed = false;
    } else {
      if (firebaseJsonResult.allConfigured) {
        console.log(`  ✅ firebase.json - All services configured`);
      } else {
        console.log(`  ⚠️  firebase.json - Missing configurations:`);
        if (!firebaseJsonResult.hasHosting) console.log(`     - Hosting not configured`);
        if (!firebaseJsonResult.hasRemoteConfig) console.log(`     - Remote Config not configured`);
        if (!firebaseJsonResult.hasFunctions) console.log(`     - Functions not configured`);
        allPassed = false;
      }
    }
  } else {
    console.log(`  ❌ firebase.json - ${firebaseJsonResult.error}`);
    allPassed = false;
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All production checks passed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Push Remote Config: npm run remoteconfig:push');
    console.log('   2. Deploy to Firebase: firebase deploy --only hosting,functions');
    console.log('   3. Verify auth works on live site');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed. Please fix the issues above.');
    console.log('\n💡 Tips:');
    console.log('   - Ensure all Firebase config files have the correct API key');
    console.log('   - Update remoteconfig.template.json with all required values');
    console.log('   - Verify firebase.json is properly configured');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFirebaseConfig, checkRemoteConfig, checkFirebaseJSON };

