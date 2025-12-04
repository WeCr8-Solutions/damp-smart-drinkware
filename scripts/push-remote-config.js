#!/usr/bin/env node
/**
 * Push Remote Config to Firebase
 * 
 * This script pushes the remoteconfig.template.json to Firebase Remote Config.
 * It ensures all client-safe configuration values are available in Firebase.
 * 
 * Usage:
 *   node scripts/push-remote-config.js
 * 
 * Requirements:
 *   - Firebase CLI must be installed and authenticated
 *   - Must be run from project root
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REMOTE_CONFIG_FILE = path.join(__dirname, '..', 'remoteconfig.template.json');
const FIREBASE_PROJECT = 'damp-smart-drinkware';

function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ Firebase CLI not found. Please install it:');
    console.error('   npm install -g firebase-tools');
    console.error('   firebase login');
    return false;
  }
}

function checkAuthentication() {
  try {
    const result = execSync('firebase projects:list', { encoding: 'utf-8', stdio: 'pipe' });
    if (result.includes(FIREBASE_PROJECT)) {
      return true;
    }
    console.warn(`⚠️  Project ${FIREBASE_PROJECT} not found in authenticated projects`);
    return false;
  } catch (error) {
    console.error('❌ Not authenticated with Firebase. Please run:');
    console.error('   firebase login');
    return false;
  }
}

function validateRemoteConfigFile() {
  if (!fs.existsSync(REMOTE_CONFIG_FILE)) {
    console.error(`❌ Remote Config file not found: ${REMOTE_CONFIG_FILE}`);
    return false;
  }

  try {
    const config = JSON.parse(fs.readFileSync(REMOTE_CONFIG_FILE, 'utf-8'));
    
    if (!config.parameters) {
      console.error('❌ Invalid Remote Config format: missing "parameters"');
      return false;
    }

    // Check for required client config values
    const requiredParams = [
      'firebase_api_key',
      'firebase_auth_domain',
      'firebase_project_id',
      'stripe_publishable_key'
    ];

    const missing = requiredParams.filter(param => !config.parameters[param]);
    if (missing.length > 0) {
      console.warn(`⚠️  Missing recommended parameters: ${missing.join(', ')}`);
    }

    console.log(`✅ Remote Config file validated (${Object.keys(config.parameters).length} parameters)`);
    return true;
  } catch (error) {
    console.error(`❌ Error parsing Remote Config file: ${error.message}`);
    return false;
  }
}

function pushRemoteConfig() {
  try {
    console.log('📤 Pushing Remote Config to Firebase...');
    
    // Use firebase deploy --only remoteconfig
    execSync(
      `firebase deploy --only remoteconfig --project ${FIREBASE_PROJECT}`,
      { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      }
    );
    
    console.log('✅ Remote Config pushed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Verify values in Firebase Console:');
    console.log(`      https://console.firebase.google.com/project/${FIREBASE_PROJECT}/config`);
    console.log('   2. Update Stripe publishable key if needed');
    console.log('   3. Test client apps to ensure they fetch config correctly');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to push Remote Config:', error.message);
    return false;
  }
}

function main() {
  console.log('🔥 Firebase Remote Config Pusher');
  console.log('================================\n');

  // Check prerequisites
  if (!checkFirebaseCLI()) {
    process.exit(1);
  }

  if (!checkAuthentication()) {
    console.warn('⚠️  Continuing anyway, but authentication may fail...\n');
  }

  if (!validateRemoteConfigFile()) {
    process.exit(1);
  }

  console.log('');

  // Push to Firebase
  if (pushRemoteConfig()) {
    console.log('\n✅ All done!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { pushRemoteConfig, validateRemoteConfigFile };

