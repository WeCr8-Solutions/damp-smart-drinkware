#!/usr/bin/env node
/**
 * 📱 DAMP Smart Drinkware - App Information Extractor
 * Gets all package information needed for iOS and Android app store submissions
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

console.log(`${colors.cyan}
📱 DAMP Smart Drinkware - App Store Package Information
=====================================================${colors.reset}`);

function readAppConfig() {
  try {
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    const packageConfig = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    return { appConfig: appConfig.expo, packageConfig };
  } catch (error) {
    log('red', '❌ Error reading configuration files');
    log('white', `   ${error.message}`);
    return null;
  }
}

function displayAppInfo(config) {
  const { appConfig, packageConfig } = config;
  
  log('bright', '\n📱 MOBILE APP INFORMATION');
  log('blue', '=========================');
  
  // Basic App Info
  log('green', '✅ Basic Information:');
  log('white', `   App Name: ${appConfig.name}`);
  log('white', `   Version: ${appConfig.version}`);
  log('white', `   Slug: ${appConfig.slug}`);
  log('white', `   Scheme: ${appConfig.scheme}`);
  
  // iOS Information
  log('green', '\n🍎 iOS App Store Information:');
  log('white', `   Bundle ID: ${appConfig.ios?.bundleIdentifier || 'Not configured'}`);
  log('white', `   Build Number: ${appConfig.ios?.buildNumber || 'Not configured'}`);
  log('white', `   Supports iPad: ${appConfig.ios?.supportsTablet ? 'Yes' : 'No'}`);
  log('white', `   Display Name: ${appConfig.ios?.infoPlist?.CFBundleDisplayName || appConfig.name}`);
  
  // Android Information
  log('green', '\n🤖 Google Play Store Information:');
  log('white', `   Package Name: ${appConfig.android?.package || 'Not configured'}`);
  log('white', `   Version Code: ${appConfig.android?.versionCode || 'Not configured'}`);
  log('white', `   Permissions: ${appConfig.android?.permissions?.length || 0} permissions`);
  
  // Permissions Details
  if (appConfig.android?.permissions) {
    log('cyan', '\n   📋 Android Permissions:');
    appConfig.android.permissions.forEach(permission => {
      log('white', `      • ${permission}`);
    });
  }
  
  // Bluetooth & Location
  log('green', '\n📡 Device Features:');
  log('white', `   Bluetooth: ${appConfig.android?.permissions?.some(p => p.includes('BLUETOOTH')) ? 'Yes' : 'No'}`);
  log('white', `   Location: ${appConfig.android?.permissions?.some(p => p.includes('LOCATION')) ? 'Yes' : 'No'}`);
  log('white', `   Background Modes: ${appConfig.ios?.infoPlist?.UIBackgroundModes?.join(', ') || 'None'}`);
}

function generateStoreInfo(config) {
  const { appConfig, packageConfig } = config;
  
  log('bright', '\n📋 APP STORE SUBMISSION CHECKLIST');
  log('blue', '==================================');
  
  // iOS App Store Connect Info
  log('yellow', '\n🍎 iOS App Store Connect Requirements:');
  log('white', `   ✅ App Name: ${appConfig.name}`);
  log('white', `   ✅ Bundle ID: ${appConfig.ios?.bundleIdentifier || '❌ MISSING'}`);
  log('white', `   ✅ Version: ${appConfig.version}`);
  log('white', `   ✅ Build Number: ${appConfig.ios?.buildNumber || '❌ MISSING'}`);
  log('white', `   📱 Device Support: iPhone, iPad`);
  log('white', `   📋 Privacy Policy: Required for Bluetooth/Location`);
  
  // Google Play Console Info
  log('yellow', '\n🤖 Google Play Console Requirements:');
  log('white', `   ✅ App Name: ${appConfig.name}`);
  log('white', `   ✅ Package Name: ${appConfig.android?.package || '❌ MISSING'}`);
  log('white', `   ✅ Version Name: ${appConfig.version}`);
  log('white', `   ✅ Version Code: ${appConfig.android?.versionCode || '❌ MISSING'}`);
  log('white', `   📋 Target SDK: 34 (Android 14)`);
  log('white', `   📋 Privacy Policy: Required for Bluetooth/Location`);
  
  // Required Assets
  log('yellow', '\n🎨 Required Assets:');
  log('white', '   iOS:');
  log('white', '      • App Icon (1024x1024)');
  log('white', '      • Launch Screen');
  log('white', '      • Screenshots (6.5", 5.5", iPad)');
  log('white', '   Android:');
  log('white', '      • App Icon (512x512)');
  log('white', '      • Feature Graphic (1024x500)');
  log('white', '      • Screenshots (Phone, Tablet)');
  
  // Store Descriptions
  log('yellow', '\n📝 Store Descriptions:');
  log('white', '   Short Description (80 chars max):');
  log('white', '   "Smart drinkware with Bluetooth connectivity and health tracking"');
  log('white', '   \n   Full Description:');
  log('white', '   "DAMP Smart Drinkware connects to your smart cups and bottles via');
  log('white', '   Bluetooth to track hydration, temperature, and usage patterns."');
}

function generateBuildCommands(config) {
  const { appConfig } = config;
  
  log('bright', '\n🏗️ BUILD COMMANDS');
  log('blue', '==================');
  
  log('green', '📱 Development Builds:');
  log('white', '   npm run ios:dev              # Run iOS simulator');
  log('white', '   npm run android:dev          # Run Android emulator');
  log('white', '   npm run app:start            # Start with dev client');
  
  log('green', '\n🚀 Production Builds:');
  log('white', '   npm run ios:build:production     # Build for App Store');
  log('white', '   npm run android:build:production # Build for Play Store');
  
  log('green', '\n📤 Store Submission:');
  log('white', '   npm run ios:submit           # Submit to App Store');
  log('white', '   npm run android:submit       # Submit to Play Store');
  
  log('green', '\n🔧 Utilities:');
  log('white', '   npm run app:doctor           # Check Expo setup');
  log('white', '   npm run app:prebuild         # Generate native code');
  log('white', '   npm run store:prepare        # Prepare store assets');
}

function checkEASSetup() {
  log('bright', '\n🔧 EAS BUILD SETUP');
  log('blue', '===================');
  
  if (fs.existsSync('eas.json')) {
    log('green', '✅ eas.json configuration exists');
    
    try {
      const easConfig = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
      log('white', `   Build profiles: ${Object.keys(easConfig.build || {}).join(', ')}`);
      log('white', `   Submit profiles: ${Object.keys(easConfig.submit || {}).join(', ')}`);
    } catch (error) {
      log('yellow', '⚠️  eas.json exists but has syntax errors');
    }
  } else {
    log('red', '❌ eas.json not found - EAS builds not configured');
    log('white', '   Run: eas build:configure');
  }
}

function saveAppInfo(config) {
  const { appConfig, packageConfig } = config;
  
  const appInfo = {
    basic: {
      name: appConfig.name,
      version: appConfig.version,
      slug: appConfig.slug,
      scheme: appConfig.scheme
    },
    ios: {
      bundleId: appConfig.ios?.bundleIdentifier,
      buildNumber: appConfig.ios?.buildNumber,
      supportsTablet: appConfig.ios?.supportsTablet,
      displayName: appConfig.ios?.infoPlist?.CFBundleDisplayName || appConfig.name
    },
    android: {
      packageName: appConfig.android?.package,
      versionCode: appConfig.android?.versionCode,
      permissions: appConfig.android?.permissions || []
    },
    features: {
      bluetooth: appConfig.android?.permissions?.some(p => p.includes('BLUETOOTH')) || false,
      location: appConfig.android?.permissions?.some(p => p.includes('LOCATION')) || false,
      backgroundModes: appConfig.ios?.infoPlist?.UIBackgroundModes || []
    },
    generated: new Date().toISOString()
  };
  
  fs.writeFileSync('app-info-export.json', JSON.stringify(appInfo, null, 2));
  log('green', '\n✅ App information exported to app-info-export.json');
}

function mainAppInfo() {
  const config = readAppConfig();
  
  if (!config) {
    log('red', '\n❌ Could not read app configuration');
    return;
  }
  
  displayAppInfo(config);
  generateStoreInfo(config);
  generateBuildCommands(config);
  checkEASSetup();
  saveAppInfo(config);
  
  log('bright', '\n🎯 NEXT STEPS');
  log('blue', '==============');
  log('white', '1. Install EAS CLI: npm install -g @expo/eas-cli');
  log('white', '2. Login to Expo: eas login');
  log('white', '3. Configure builds: eas build:configure');
  log('white', '4. Build for stores: npm run ios:build:production');
  log('white', '5. Submit to stores: npm run ios:submit');
  
  log('cyan', '\n💡 Pro Tip: Run "npm run store:help" for all store commands');
}

// Run if called directly
if (require.main === module) {
  mainAppInfo();
}

module.exports = { readAppConfig, displayAppInfo, generateStoreInfo };