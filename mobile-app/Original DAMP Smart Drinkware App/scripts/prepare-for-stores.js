#!/usr/bin/env node
/**
 * 🏪 DAMP Smart Drinkware - App Store Preparation Assistant
 * Helps prepare assets and information for iOS App Store and Google Play Store submission
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve);
  });
};

console.log(`${colors.cyan}
🏪 DAMP Smart Drinkware - App Store Preparation Assistant
=======================================================${colors.reset}`);

function checkAssets() {
  log('bright', '\n🎨 CHECKING REQUIRED ASSETS');
  log('blue', '============================');
  
  const requiredAssets = [
    { path: 'assets/images/app-icon.png', name: 'App Icon', required: true },
    { path: 'assets/images/favicon.png', name: 'Favicon', required: false },
    { path: 'assets/images/splash.png', name: 'Splash Screen', required: false }
  ];
  
  let missingAssets = [];
  
  requiredAssets.forEach(asset => {
    if (fs.existsSync(asset.path)) {
      log('green', `✅ ${asset.name}: Found`);
    } else {
      if (asset.required) {
        log('red', `❌ ${asset.name}: Missing (Required)`);
        missingAssets.push(asset);
      } else {
        log('yellow', `⚠️  ${asset.name}: Missing (Optional)`);
      }
    }
  });
  
  return missingAssets;
}

function generateAppStoreInfo() {
  log('bright', '\n🍎 iOS APP STORE CONNECT INFORMATION');
  log('blue', '====================================');
  
  try {
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
    
    const appStoreInfo = {
      appInformation: {
        name: appConfig.name,
        bundleId: appConfig.ios?.bundleIdentifier || 'com.damp.smartdrinkware',
        primaryLanguage: 'English (U.S.)',
        category: 'Health & Fitness',
        contentRating: '4+',
        version: appConfig.version,
        buildNumber: appConfig.ios?.buildNumber || '1'
      },
      appReview: {
        firstName: 'DAMP',
        lastName: 'Team',
        phoneNumber: 'Your phone number',
        email: 'your-email@domain.com',
        demoAccount: 'Not required',
        notes: 'Smart drinkware app with Bluetooth connectivity'
      },
      versionInformation: {
        whatsNew: 'Initial release of DAMP Smart Drinkware app with Bluetooth device connectivity and hydration tracking.',
        keywords: 'smart drinkware, bluetooth, hydration, health, fitness, water bottle, smart cup',
        shortDescription: 'Smart drinkware with Bluetooth connectivity and health tracking',
        fullDescription: `DAMP Smart Drinkware connects to your smart cups and bottles via Bluetooth to track hydration, temperature, and usage patterns.

Features:
• Bluetooth connectivity to DAMP smart drinkware devices
• Real-time hydration tracking
• Temperature monitoring
• Usage pattern analytics
• Health insights and recommendations
• Secure data storage with Firebase

Perfect for health-conscious individuals who want to optimize their hydration habits with smart technology.`
      },
      privacyAndCompliance: {
        privacyPolicyUrl: 'https://your-website.com/privacy-policy',
        usesIDFA: false,
        encryptionCompliance: 'No, this app does not use encryption'
      }
    };
    
    log('green', '✅ App Store Information Generated:');
    log('white', `   App Name: ${appStoreInfo.appInformation.name}`);
    log('white', `   Bundle ID: ${appStoreInfo.appInformation.bundleId}`);
    log('white', `   Version: ${appStoreInfo.appInformation.version}`);
    log('white', `   Category: ${appStoreInfo.appInformation.category}`);
    
    // Save to file
    fs.writeFileSync('app-store-info.json', JSON.stringify(appStoreInfo, null, 2));
    log('green', '✅ App Store info saved to app-store-info.json');
    
    return appStoreInfo;
    
  } catch (error) {
    log('red', '❌ Error generating App Store information');
    return null;
  }
}

function generatePlayStoreInfo() {
  log('bright', '\n🤖 GOOGLE PLAY STORE INFORMATION');
  log('blue', '=================================');
  
  try {
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
    
    const playStoreInfo = {
      appDetails: {
        title: appConfig.name,
        packageName: appConfig.android?.package || 'com.damp.smartdrinkware',
        category: 'Health & Fitness',
        contentRating: 'Everyone',
        targetAudience: 'General audience',
        contactDetails: {
          email: 'your-email@domain.com',
          phone: 'Your phone number',
          website: 'https://your-website.com'
        }
      },
      storeListingMainInformation: {
        shortDescription: 'Smart drinkware with Bluetooth connectivity and health tracking',
        fullDescription: `DAMP Smart Drinkware connects to your smart cups and bottles via Bluetooth to track hydration, temperature, and usage patterns.

🔹 Features:
• Bluetooth connectivity to DAMP smart drinkware devices
• Real-time hydration tracking
• Temperature monitoring
• Usage pattern analytics
• Health insights and recommendations
• Secure data storage with Firebase

🔹 Perfect for:
Health-conscious individuals who want to optimize their hydration habits with smart technology.

🔹 Privacy & Security:
Your data is protected with enterprise-grade Firebase security. We respect your privacy and never sell your personal information.

🔹 Device Requirements:
• Android 6.0 or later
• Bluetooth 4.0 or later
• Compatible DAMP smart drinkware device`,
        tags: ['smart drinkware', 'bluetooth', 'hydration', 'health', 'fitness', 'water bottle', 'smart cup']
      },
      privacyAndDataSafety: {
        privacyPolicyUrl: 'https://your-website.com/privacy-policy',
        dataCollected: [
          'Device identifiers',
          'Usage analytics',
          'Health data (hydration tracking)',
          'Device connectivity data'
        ],
        dataSharingPractices: 'Data is not shared with third parties',
        dataRetention: 'Data is retained until user requests deletion'
      }
    };
    
    log('green', '✅ Play Store Information Generated:');
    log('white', `   App Title: ${playStoreInfo.appDetails.title}`);
    log('white', `   Package Name: ${playStoreInfo.appDetails.packageName}`);
    log('white', `   Category: ${playStoreInfo.appDetails.category}`);
    
    // Save to file
    fs.writeFileSync('play-store-info.json', JSON.stringify(playStoreInfo, null, 2));
    log('green', '✅ Play Store info saved to play-store-info.json');
    
    return playStoreInfo;
    
  } catch (error) {
    log('red', '❌ Error generating Play Store information');
    return null;
  }
}

function generateAssetRequirements() {
  log('bright', '\n📋 ASSET REQUIREMENTS CHECKLIST');
  log('blue', '=================================');
  
  const assetRequirements = {
    ios: {
      appIcon: {
        size: '1024x1024 pixels',
        format: 'PNG',
        description: 'App Store Connect app icon'
      },
      screenshots: {
        iPhone6_5: '1290×2796 pixels',
        iPhone5_5: '1242×2208 pixels',
        iPad: '2048×2732 pixels',
        format: 'PNG or JPEG',
        quantity: '3-10 screenshots per device type'
      },
      appPreview: {
        iPhone: '1080×1920 pixels or 1200×1600 pixels',
        iPad: '1200×1600 pixels or 1600×1200 pixels',
        format: 'MP4 or MOV',
        duration: '15-30 seconds'
      }
    },
    android: {
      appIcon: {
        size: '512x512 pixels',
        format: 'PNG',
        description: 'Google Play Console app icon'
      },
      featureGraphic: {
        size: '1024x500 pixels',
        format: 'PNG or JPEG',
        description: 'Featured on Google Play'
      },
      screenshots: {
        phone: '16:9 aspect ratio, min 320px',
        tablet: '16:10 aspect ratio, min 1024px',
        format: 'PNG or JPEG',
        quantity: '2-8 screenshots per device type'
      }
    }
  };
  
  log('yellow', '\n🍎 iOS Assets Required:');
  log('white', `   • App Icon: ${assetRequirements.ios.appIcon.size} ${assetRequirements.ios.appIcon.format}`);
  log('white', `   • iPhone 6.5" Screenshots: ${assetRequirements.ios.screenshots.iPhone6_5}`);
  log('white', `   • iPhone 5.5" Screenshots: ${assetRequirements.ios.screenshots.iPhone5_5}`);
  log('white', `   • iPad Screenshots: ${assetRequirements.ios.screenshots.iPad}`);
  log('white', `   • App Preview Videos (optional): ${assetRequirements.ios.appPreview.duration}`);
  
  log('yellow', '\n🤖 Android Assets Required:');
  log('white', `   • App Icon: ${assetRequirements.android.appIcon.size} ${assetRequirements.android.appIcon.format}`);
  log('white', `   • Feature Graphic: ${assetRequirements.android.featureGraphic.size}`);
  log('white', `   • Phone Screenshots: ${assetRequirements.android.screenshots.phone}`);
  log('white', `   • Tablet Screenshots: ${assetRequirements.android.screenshots.tablet}`);
  
  // Save requirements
  fs.writeFileSync('asset-requirements.json', JSON.stringify(assetRequirements, null, 2));
  log('green', '\n✅ Asset requirements saved to asset-requirements.json');
  
  return assetRequirements;
}

async function createSubmissionChecklist() {
  log('bright', '\n📝 SUBMISSION CHECKLIST');
  log('blue', '=======================');
  
  const checklist = {
    preSubmission: [
      'App thoroughly tested on physical devices',
      'All required assets created and optimized',
      'Privacy policy created and hosted',
      'App description and metadata prepared',
      'Screenshots taken on required device sizes',
      'App Store Connect / Play Console accounts created',
      'Developer accounts verified and paid',
      'Bundle ID / Package Name configured correctly'
    ],
    technicalRequirements: [
      'App builds successfully without errors',
      'No placeholder or test data in production',
      'All third-party services configured',
      'Proper error handling implemented',
      'App responds to system events correctly',
      'Memory usage optimized',
      'App starts quickly (<3 seconds)',
      'No hardcoded credentials in code'
    ],
    storeSpecific: {
      ios: [
        'App follows Apple Human Interface Guidelines',
        'Uses standard iOS UI elements appropriately',
        'Handles device rotation properly',
        'Supports latest iOS version',
        'No private APIs used',
        'Follows App Store Review Guidelines'
      ],
      android: [
        'App follows Material Design guidelines',
        'Supports multiple screen densities',
        'Handles Android system permissions properly',
        'Targets latest Android SDK version',
        'Follows Google Play policies',
        'APK/AAB size optimized'
      ]
    }
  };
  
  log('green', '✅ Pre-Submission Requirements:');
  checklist.preSubmission.forEach(item => {
    log('white', `   • ${item}`);
  });
  
  log('green', '\n✅ Technical Requirements:');
  checklist.technicalRequirements.forEach(item => {
    log('white', `   • ${item}`);
  });
  
  log('green', '\n✅ iOS Specific:');
  checklist.storeSpecific.ios.forEach(item => {
    log('white', `   • ${item}`);
  });
  
  log('green', '\n✅ Android Specific:');
  checklist.storeSpecific.android.forEach(item => {
    log('white', `   • ${item}`);
  });
  
  // Save checklist
  fs.writeFileSync('submission-checklist.json', JSON.stringify(checklist, null, 2));
  log('green', '\n✅ Submission checklist saved to submission-checklist.json');
}

async function interactiveSetup() {
  log('bright', '\n🛠️ INTERACTIVE STORE SETUP');
  log('blue', '============================');
  
  const appName = await question('App Name (or press Enter for "DAMP Smart Drinkware"): ');
  const contactEmail = await question('Contact Email for stores: ');
  const websiteUrl = await question('Website URL (optional): ');
  const privacyPolicyUrl = await question('Privacy Policy URL: ');
  
  const storeConfig = {
    appName: appName || 'DAMP Smart Drinkware',
    contactEmail,
    websiteUrl: websiteUrl || 'https://your-website.com',
    privacyPolicyUrl: privacyPolicyUrl || 'https://your-website.com/privacy-policy',
    generatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('store-config.json', JSON.stringify(storeConfig, null, 2));
  log('green', '\n✅ Store configuration saved to store-config.json');
  
  return storeConfig;
}

async function mainStorePrep() {
  try {
    log('cyan', 'Welcome to the App Store Preparation Assistant!');
    log('white', 'This will help you prepare for iOS App Store and Google Play Store submission.\n');
    
    // Check assets
    const missingAssets = checkAssets();
    
    // Generate store information
    const appStoreInfo = generateAppStoreInfo();
    const playStoreInfo = generatePlayStoreInfo();
    
    // Generate asset requirements
    generateAssetRequirements();
    
    // Create submission checklist
    await createSubmissionChecklist();
    
    // Interactive setup
    const setupInteractive = await question('\nWould you like to customize store information? (y/n): ');
    if (setupInteractive.toLowerCase() === 'y') {
      await interactiveSetup();
    }
    
    log('bright', '\n🎯 PREPARATION COMPLETE!');
    log('green', '========================');
    log('white', 'Generated files:');
    log('white', '• app-store-info.json - iOS App Store Connect information');
    log('white', '• play-store-info.json - Google Play Console information');
    log('white', '• asset-requirements.json - Required assets checklist');
    log('white', '• submission-checklist.json - Pre-submission checklist');
    if (fs.existsSync('store-config.json')) {
      log('white', '• store-config.json - Your customized configuration');
    }
    
    log('bright', '\n📱 NEXT STEPS:');
    log('white', '1. Create missing assets (icons, screenshots)');
    log('white', '2. Set up developer accounts (Apple, Google)');
    log('white', '3. Build production apps: npm run ios:build:production');
    log('white', '4. Test thoroughly on physical devices');
    log('white', '5. Submit to stores: npm run ios:submit');
    
    if (missingAssets.length > 0) {
      log('yellow', '\n⚠️  Missing Required Assets:');
      missingAssets.forEach(asset => {
        log('white', `   • ${asset.name} (${asset.path})`);
      });
    }
    
  } catch (error) {
    log('red', `\n❌ Error during store preparation: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (require.main === module) {
  mainStorePrep();
}

module.exports = { 
  checkAssets, 
  generateAppStoreInfo, 
  generatePlayStoreInfo, 
  generateAssetRequirements 
};