#!/usr/bin/env node
/**
 * Deploy to Firebase Production
 * 
 * This script deploys the website and functions to Firebase production,
 * ensuring all configuration is correct for the live site.
 * 
 * Usage:
 *   node scripts/deploy-production-firebase.js
 */

const { execSync } = require('child_process');
const path = require('path');
const { checkFirebaseConfig, checkRemoteConfig, checkFirebaseJSON } = require('./verify-production-setup.js');

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
    if (result.includes('damp-smart-drinkware')) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

function pushRemoteConfig() {
  try {
    console.log('📤 Pushing Remote Config to Firebase...');
    execSync(
      'firebase deploy --only remoteconfig --project damp-smart-drinkware',
      { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      }
    );
    console.log('✅ Remote Config pushed successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to push Remote Config:', error.message);
    return false;
  }
}

function deployHosting() {
  try {
    console.log('🌐 Deploying website to Firebase Hosting...');
    execSync(
      'firebase deploy --only hosting --project damp-smart-drinkware',
      { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      }
    );
    console.log('✅ Website deployed successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy website:', error.message);
    return false;
  }
}

function deployFunctions() {
  try {
    console.log('⚡ Deploying Cloud Functions...');
    execSync(
      'firebase deploy --only functions --project damp-smart-drinkware',
      { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      }
    );
    console.log('✅ Functions deployed successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy functions:', error.message);
    return false;
  }
}

function deployAll() {
  try {
    console.log('🚀 Deploying everything to Firebase...');
    execSync(
      'firebase deploy --project damp-smart-drinkware',
      { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      }
    );
    console.log('✅ All services deployed successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Firebase Production Deployment');
  console.log('=================================\n');

  // Pre-flight checks
  console.log('🔍 Running pre-flight checks...\n');
  
  if (!checkFirebaseCLI()) {
    process.exit(1);
  }

  if (!checkAuthentication()) {
    console.error('❌ Not authenticated with Firebase. Please run:');
    console.error('   firebase login');
    process.exit(1);
  }

  // Verify configuration
  const remoteConfigResult = checkRemoteConfig();
  if (!remoteConfigResult.exists || !remoteConfigResult.hasAllParams) {
    console.warn('⚠️  Remote Config not fully configured. Continuing anyway...\n');
  }

  console.log('✅ Pre-flight checks passed\n');

  // Get deployment options
  const args = process.argv.slice(2);
  const deployRemoteConfig = args.includes('--remote-config') || args.includes('--all');
  const deployHostingOnly = args.includes('--hosting-only');
  const deployFunctionsOnly = args.includes('--functions-only');
  const deployEverything = args.includes('--all') || (!deployHostingOnly && !deployFunctionsOnly);

  let success = true;

  if (deployRemoteConfig || deployEverything) {
    success = pushRemoteConfig() && success;
  }

  if (deployHostingOnly || deployEverything) {
    success = deployHosting() && success;
  }

  if (deployFunctionsOnly || deployEverything) {
    success = deployFunctions() && success;
  }

  if (deployEverything && !deployHostingOnly && !deployFunctionsOnly) {
    // Deploy all at once for efficiency
    success = deployAll() && success;
  }

  console.log('='.repeat(50));
  if (success) {
    console.log('✅ Production deployment completed successfully!');
    console.log('\n🔗 Your live site:');
    console.log('   https://damp-smart-drinkware.web.app');
    console.log('   https://damp-smart-drinkware.firebaseapp.com');
    console.log('\n📋 Next Steps:');
    console.log('   1. Test authentication on live site');
    console.log('   2. Verify Remote Config values in Firebase Console');
    console.log('   3. Test signup/login flows');
    process.exit(0);
  } else {
    console.log('❌ Deployment completed with errors. Please review above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { pushRemoteConfig, deployHosting, deployFunctions, deployAll };

