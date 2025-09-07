#!/usr/bin/env node
/**
 * 🔧 DAMP Smart Drinkware - Environment Debug Script
 * Interactive debugging for environment and secrets issues
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

// Create readline interface for interactive prompts
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
🔧 DAMP Smart Drinkware - Interactive Environment Debugger
=========================================================${colors.reset}`);

// Debug categories
const debugCategories = {
  '1': 'Environment Files & Variables',
  '2': 'Firebase Configuration',
  '3': 'Stripe Setup',
  '4': 'Expo/React Native Issues',
  '5': 'GitHub Actions Pipeline',
  '6': 'Build & Deployment Issues',
  '7': 'General Troubleshooting'
};

// Environment files debugger
async function debugEnvironmentFiles() {
  log('bright', '\n🔍 DEBUGGING ENVIRONMENT FILES');
  log('blue', '===============================');

  const envFiles = ['.env', '.env.local', '.env.development', '.env.staging', '.env.production'];
  const foundFiles = [];
  const issues = [];

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      foundFiles.push(file);
      log('green', `✅ Found: ${file}`);

      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for common issues
        if (content.includes('your-api-key-here') || content.includes('CHANGE_ME')) {
          issues.push(`${file}: Contains placeholder values`);
        }

        if (content.includes('sk_live_') || content.includes('pk_live_')) {
          issues.push(`${file}: Contains live Stripe keys (security risk)`);
        }

        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('=') && !line.startsWith('#') && line.includes(' ')) {
            const beforeEquals = line.split('=')[0];
            if (!beforeEquals.includes(' ') && line.split('=')[1].includes(' ')) {
              issues.push(`${file}:${index + 1}: Unquoted value with spaces`);
            }
          }
        });

      } catch (error) {
        issues.push(`${file}: Cannot read file - ${error.message}`);
      }
    } else {
      log('yellow', `⚠️  Missing: ${file}`);
    }
  });

  if (issues.length > 0) {
    log('red', '\n❌ Issues found:');
    issues.forEach(issue => log('red', `   • ${issue}`));

    const fix = await question('\nWould you like to create a template .env file? (y/n): ');
    if (fix.toLowerCase() === 'y') {
      await createEnvTemplate();
    }
  } else {
    log('green', '\n✅ Environment files look good!');
  }

  return foundFiles.length > 0;
}

// Firebase debugger
async function debugFirebase() {
  log('bright', '\n🔥 DEBUGGING FIREBASE CONFIGURATION');
  log('blue', '===================================');

  const firebaseKeys = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];

  // Check if Firebase config exists
  const firebaseConfigPath = 'firebase/config.ts';
  if (fs.existsSync(firebaseConfigPath)) {
    log('green', '✅ Firebase config file found');
  } else {
    log('red', '❌ Firebase config file missing');
    log('white', '   Expected: firebase/config.ts');
  }

  // Check environment variables
  const envVars = {};
  firebaseKeys.forEach(key => {
    const value = process.env[key];
    if (value) {
      envVars[key] = value;
      log('green', `✅ ${key}: ${value.substring(0, 10)}...`);
    } else {
      log('red', `❌ ${key}: Missing`);
    }
  });

  if (Object.keys(envVars).length === 0) {
    log('yellow', '\nNo Firebase environment variables found.');
    const help = await question('Would you like help setting up Firebase? (y/n): ');

    if (help.toLowerCase() === 'y') {
      log('white', '\nFirebase Setup Steps:');
      log('white', '1. Go to https://console.firebase.google.com');
      log('white', '2. Create or select your project');
      log('white', '3. Go to Project Settings (gear icon)');
      log('white', '4. Scroll down to "Your apps" section');
      log('white', '5. Click on web app or add one');
      log('white', '6. Copy the config values to your .env file');
      log('white', '\nFormat:');
      firebaseKeys.forEach(key => {
        log('white', `${key}=your-value-here`);
      });
    }
  }

  // Test Firebase connection (basic check)
  if (envVars.FIREBASE_PROJECT_ID) {
    log('cyan', '\nTesting Firebase connection...');
    // This is a basic format check
    if (!/^[a-z0-9-]+$/.test(envVars.FIREBASE_PROJECT_ID)) {
      log('red', '❌ Firebase Project ID format looks incorrect');
    } else {
      log('green', '✅ Firebase Project ID format looks correct');
    }
  }
}

// Stripe debugger
async function debugStripe() {
  log('bright', '\n💳 DEBUGGING STRIPE CONFIGURATION');
  log('blue', '=================================');

  const stripeKeys = {
    'STRIPE_SECRET_KEY': 'Secret Key (Test)',
    'STRIPE_PUBLISHABLE_KEY': 'Publishable Key (Test)',
    'PROD_STRIPE_SECRET_KEY': 'Secret Key (Live)',
    'PROD_STRIPE_PUBLISHABLE_KEY': 'Publishable Key (Live)'
  };

  let hasTestKeys = false;
  let hasLiveKeys = false;

  Object.entries(stripeKeys).forEach(([key, description]) => {
    const value = process.env[key];
    if (value) {
      log('green', `✅ ${key}: ${description} (${value.substring(0, 8)}...)`);

      // Validate format
      if (key.includes('SECRET') && !value.match(/^sk_(test_|live_)[0-9A-Za-z]{99}$/)) {
        log('yellow', `   ⚠️  Format may be incorrect for secret key`);
      }

      if (key.includes('PUBLISHABLE') && !value.match(/^pk_(test_|live_)[0-9A-Za-z]{99}$/)) {
        log('yellow', `   ⚠️  Format may be incorrect for publishable key`);
      }

      if (value.includes('test_')) hasTestKeys = true;
      if (value.includes('live_')) hasLiveKeys = true;

    } else {
      log('red', `❌ ${key}: Missing (${description})`);
    }
  });

  if (!hasTestKeys && !hasLiveKeys) {
    log('yellow', '\nNo Stripe keys found.');
    const help = await question('Would you like help setting up Stripe? (y/n): ');

    if (help.toLowerCase() === 'y') {
      log('white', '\nStripe Setup Steps:');
      log('white', '1. Go to https://dashboard.stripe.com');
      log('white', '2. Sign in to your account');
      log('white', '3. Go to Developers > API keys');
      log('white', '4. Copy the Publishable key and Secret key');
      log('white', '5. For testing, use the test keys');
      log('white', '6. For production, use the live keys');
      log('white', '\nAdd to your .env file:');
      log('white', 'STRIPE_PUBLISHABLE_KEY=pk_test_...');
      log('white', 'STRIPE_SECRET_KEY=sk_test_...');
    }
  }

  if (hasLiveKeys) {
    log('yellow', '\n⚠️  WARNING: Live Stripe keys detected!');
    log('white', '   Make sure these are only used in production environment');
    log('white', '   Never commit live keys to Git');
  }
}

// Expo/React Native debugger
async function debugExpo() {
  log('bright', '\n📱 DEBUGGING EXPO/REACT NATIVE SETUP');
  log('blue', '====================================');

  // Check Expo token
  const expoToken = process.env.EXPO_TOKEN;
  if (expoToken) {
    log('green', `✅ EXPO_TOKEN: Found (${expoToken.substring(0, 10)}...)`);
  } else {
    log('red', '❌ EXPO_TOKEN: Missing');

    const help = await question('Would you like help setting up Expo token? (y/n): ');
    if (help.toLowerCase() === 'y') {
      log('white', '\nExpo Token Setup:');
      log('white', '1. Go to https://expo.dev');
      log('white', '2. Sign in to your account');
      log('white', '3. Go to Account Settings > Access Tokens');
      log('white', '4. Click "Create Token"');
      log('white', '5. Give it a name like "CI/CD Pipeline"');
      log('white', '6. Copy the token to your .env file:');
      log('white', '   EXPO_TOKEN=your-token-here');
    }
  }

  // Check app.json
  if (fs.existsSync('app.json')) {
    log('green', '✅ app.json found');

    try {
      const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));

      if (appConfig.expo?.name) {
        log('green', `   App name: ${appConfig.expo.name}`);
      }

      if (appConfig.expo?.slug) {
        log('green', `   App slug: ${appConfig.expo.slug}`);
      }

      if (appConfig.expo?.version) {
        log('green', `   Version: ${appConfig.expo.version}`);
      }

    } catch (error) {
      log('red', '❌ app.json is not valid JSON');
    }
  } else {
    log('red', '❌ app.json missing');
    log('white', '   Run: npx create-expo-app or npx expo init');
  }

  // Check package.json for expo dependencies
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (packageJson.dependencies?.expo) {
      log('green', `✅ Expo SDK: ${packageJson.dependencies.expo}`);
    } else {
      log('red', '❌ Expo SDK not found in dependencies');
    }
  }
}

// GitHub Actions debugger
async function debugGitHubActions() {
  log('bright', '\n🚀 DEBUGGING GITHUB ACTIONS PIPELINE');
  log('blue', '====================================');

  const workflowPath = '.github/workflows/ci.yml';

  if (!fs.existsSync(workflowPath)) {
    log('red', '❌ GitHub Actions workflow not found');
    log('white', '   Expected: .github/workflows/ci.yml');
    return;
  }

  log('green', '✅ GitHub Actions workflow found');

  try {
    const workflow = fs.readFileSync(workflowPath, 'utf8');

    // Check for required sections
    const requiredSections = [
      'secrets-check',
      'quality-gates',
      'build-staging',
      'deploy-production'
    ];

    requiredSections.forEach(section => {
      if (workflow.includes(section)) {
        log('green', `✅ Job: ${section}`);
      } else {
        log('red', `❌ Missing job: ${section}`);
      }
    });

    // Check for secrets usage
    const secretsUsed = [
      'FIREBASE_PROJECT_ID',
      'STRIPE_SECRET_KEY',
      'EXPO_TOKEN'
    ];

    secretsUsed.forEach(secret => {
      if (workflow.includes(secret)) {
        log('green', `✅ Uses secret: ${secret}`);
      } else {
        log('yellow', `⚠️  Secret not used in workflow: ${secret}`);
      }
    });

  } catch (error) {
    log('red', `❌ Error reading workflow: ${error.message}`);
  }

  log('white', '\nTo check pipeline status:');
  log('white', '1. Go to your GitHub repository');
  log('white', '2. Click the "Actions" tab');
  log('white', '3. Look for recent workflow runs');
  log('white', '4. Click on a run to see detailed logs');
}

// Build issues debugger
async function debugBuildIssues() {
  log('bright', '\n🏗️ DEBUGGING BUILD & DEPLOYMENT ISSUES');
  log('blue', '======================================');

  log('cyan', 'Checking common build issues...');

  // Check Node version
  const nodeVersion = process.version;
  log('green', `✅ Node.js version: ${nodeVersion}`);

  if (parseInt(nodeVersion.substring(1)) < 18) {
    log('yellow', '⚠️  Node.js version is quite old, consider upgrading to v18+');
  }

  // Check package.json scripts
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    const importantScripts = ['build', 'test', 'start'];
    importantScripts.forEach(script => {
      if (packageJson.scripts?.[script]) {
        log('green', `✅ Script: ${script}`);
      } else {
        log('yellow', `⚠️  Missing script: ${script}`);
      }
    });
  }

  // Check for common problematic files
  const problemFiles = [
    'package-lock.json.bak',
    'yarn.lock',  // If using npm
    'node_modules/.package-lock.json'
  ];

  problemFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log('yellow', `⚠️  Potential issue: ${file} exists`);
    }
  });

  // Check disk space (rough estimate)
  try {
    const stats = fs.statSync('.');
    log('green', '✅ Can access current directory');
  } catch (error) {
    log('red', `❌ Directory access error: ${error.message}`);
  }

  log('white', '\nCommon build fixes:');
  log('white', '• Clear cache: npm cache clean --force');
  log('white', '• Reinstall: rm -rf node_modules package-lock.json && npm install');
  log('white', '• Update Expo: npx expo install --fix');
  log('white', '• Check logs: npm run build 2>&1 | tee build.log');
}

// General troubleshooting
async function generalTroubleshooting() {
  log('bright', '\n🔧 GENERAL TROUBLESHOOTING');
  log('blue', '==========================');

  log('white', 'Let me help you with common issues...\n');

  const issues = [
    'Pipeline fails at secrets check',
    'Build fails with dependency errors',
    'Tests are not running',
    'Environment variables not loading',
    'Firebase connection issues',
    'Stripe webhook problems',
    'Mobile build fails',
    'Other issue'
  ];

  issues.forEach((issue, index) => {
    log('white', `${index + 1}. ${issue}`);
  });

  const choice = await question('\nWhich issue are you experiencing? (1-8): ');
  const issueIndex = parseInt(choice) - 1;

  if (issueIndex >= 0 && issueIndex < issues.length) {
    await handleSpecificIssue(issueIndex);
  } else {
    log('yellow', 'Invalid choice. Please run the script again.');
  }
}

// Handle specific issues
async function handleSpecificIssue(issueIndex) {
  const solutions = [
    // Pipeline fails at secrets check
    () => {
      log('blue', '\n🔍 PIPELINE SECRETS CHECK FAILURE');
      log('white', 'Common causes:');
      log('white', '• Secret names don\'t match exactly (case-sensitive)');
      log('white', '• Secrets not added to GitHub repository');
      log('white', '• Secrets added to wrong environment');
      log('white', '\nSolutions:');
      log('white', '1. Run: node scripts/discover-secrets.js');
      log('white', '2. Add missing secrets to GitHub');
      log('white', '3. Check secret names are exact matches');
      log('white', '4. Verify environment settings in GitHub');
    },

    // Build fails with dependency errors
    () => {
      log('blue', '\n🏗️ BUILD DEPENDENCY ERRORS');
      log('white', 'Try these solutions in order:');
      log('white', '1. Clear cache: npm cache clean --force');
      log('white', '2. Delete node_modules: rm -rf node_modules');
      log('white', '3. Delete package-lock.json: rm package-lock.json');
      log('white', '4. Fresh install: npm install');
      log('white', '5. Fix Expo dependencies: npx expo install --fix');
      log('white', '6. If still failing, try: npm install --legacy-peer-deps');
    },

    // Tests are not running
    () => {
      log('blue', '\n🧪 TESTS NOT RUNNING');
      log('white', 'Check these items:');
      log('white', '• Jest config exists: jest.config.js or jest-minimal.config.js');
      log('white', '• Test files exist in tests/ directory');
      log('white', '• Dependencies installed: npm install');
      log('white', '\nTry running:');
      log('white', '• npm run test:core (for core utilities)');
      log('white', '• npm run test (for all tests)');
      log('white', '• npx jest --verbose (for detailed output)');
    },

    // Environment variables not loading
    () => {
      log('blue', '\n🔧 ENVIRONMENT VARIABLES NOT LOADING');
      log('white', 'Debugging steps:');
      log('white', '1. Check .env file exists and has correct format');
      log('white', '2. Verify no spaces around = signs');
      log('white', '3. Quote values with spaces: KEY="value with spaces"');
      log('white', '4. Check .env is not in .gitignore locally');
      log('white', '5. Restart your development server');
      log('white', '6. For Expo: Make sure variables start with EXPO_PUBLIC_');
    },

    // Firebase connection issues
    () => {
      log('blue', '\n🔥 FIREBASE CONNECTION ISSUES');
      log('white', 'Troubleshooting steps:');
      log('white', '1. Verify Firebase project is active');
      log('white', '2. Check API key format: should start with "AIza"');
      log('white', '3. Verify project ID matches exactly');
      log('white', '4. Check Firebase rules allow your operations');
      log('white', '5. Test in Firebase console first');
      log('white', '6. Check network/firewall restrictions');
    },

    // Stripe webhook problems
    () => {
      log('blue', '\n💳 STRIPE WEBHOOK PROBLEMS');
      log('white', 'Common solutions:');
      log('white', '1. Verify webhook endpoint URL is correct');
      log('white', '2. Check webhook secret matches your code');
      log('white', '3. Ensure endpoint accepts POST requests');
      log('white', '4. Verify webhook events are configured');
      log('white', '5. Check Stripe dashboard for webhook logs');
      log('white', '6. Test webhook with Stripe CLI');
    },

    // Mobile build fails
    () => {
      log('blue', '\n📱 MOBILE BUILD FAILURES');
      log('white', 'Build troubleshooting:');
      log('white', '1. Check Expo account has build credits');
      log('white', '2. Verify EXPO_TOKEN is valid and not expired');
      log('white', '3. Try: npx expo prebuild --clear');
      log('white', '4. Check app.json configuration');
      log('white', '5. Ensure no restricted dependencies');
      log('white', '6. Try building locally first');
    },

    // Other issue
    () => {
      log('blue', '\n🤔 GENERAL HELP');
      log('white', 'For other issues:');
      log('white', '1. Check the full error message in logs');
      log('white', '2. Search for the specific error online');
      log('white', '3. Check GitHub Actions logs for details');
      log('white', '4. Try running commands locally first');
      log('white', '5. Check all dependencies are up to date');
      log('white', '6. Verify all required files exist');
    }
  ];

  if (solutions[issueIndex]) {
    solutions[issueIndex]();
  }
}

// Create environment template
async function createEnvTemplate() {
  const template = `# 🔐 DAMP Smart Drinkware - Environment Variables
# Copy this file to .env and fill in your actual values

# ===================================================
# 🔥 FIREBASE CONFIGURATION
# ===================================================
# Get these from: Firebase Console > Project Settings > General
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# ===================================================
# 💳 STRIPE CONFIGURATION
# ===================================================
# Get these from: Stripe Dashboard > Developers > API keys
# Use test keys for development, live keys for production
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
STRIPE_SECRET_KEY=sk_test_your-secret-key-here

# ===================================================
# 📱 EXPO CONFIGURATION
# ===================================================
# Get this from: Expo Dashboard > Account Settings > Access Tokens
EXPO_TOKEN=your-expo-token-here

# ===================================================
# 🔧 OPTIONAL ENHANCEMENTS
# ===================================================
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_DEBUG_MODE=true

# Notification webhooks (optional)
SLACK_WEBHOOK=https://hooks.slack.com/services/your-webhook-url
DISCORD_WEBHOOK=https://discord.com/api/webhooks/your-webhook-url

# Analytics (optional)
SENTRY_DSN=https://your-sentry-dsn-here
ANALYTICS_KEY=your-analytics-key-here
`;

  fs.writeFileSync('.env.template', template);
  log('green', '✅ Created .env.template file');
  log('white', '   Copy this to .env and fill in your values');
}

// Main interactive debugger
async function runInteractiveDebugger() {
  try {
    log('white', '\nWhat would you like to debug?');

    Object.entries(debugCategories).forEach(([num, category]) => {
      log('white', `${num}. ${category}`);
    });

    const choice = await question('\nSelect an option (1-7): ');

    switch (choice) {
      case '1':
        await debugEnvironmentFiles();
        break;
      case '2':
        await debugFirebase();
        break;
      case '3':
        await debugStripe();
        break;
      case '4':
        await debugExpo();
        break;
      case '5':
        await debugGitHubActions();
        break;
      case '6':
        await debugBuildIssues();
        break;
      case '7':
        await generalTroubleshooting();
        break;
      default:
        log('yellow', 'Invalid choice. Please run the script again.');
        break;
    }

    const runAgain = await question('\nWould you like to debug something else? (y/n): ');
    if (runAgain.toLowerCase() === 'y') {
      await runInteractiveDebugger();
    } else {
      log('green', '\n✅ Debug session complete!');
      log('white', 'Run this script again anytime you need help.');
    }

  } finally {
    rl.close();
  }
}

// Run the interactive debugger
if (require.main === module) {
  runInteractiveDebugger().catch(error => {
    log('red', `\n❌ Error during debugging: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  debugEnvironmentFiles,
  debugFirebase,
  debugStripe,
  debugExpo,
  debugGitHubActions,
  debugBuildIssues
};