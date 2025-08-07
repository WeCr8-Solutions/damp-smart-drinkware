#!/usr/bin/env node
/**
 * 🔥 DAMP Smart Drinkware - Firebase + Netlify Setup Automation
 * Automatically fetches Firebase config and sets up Netlify environment variables
 */

const { execSync, spawn } = require('child_process');
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
🔥 DAMP Smart Drinkware - Firebase + Netlify Setup
=================================================${colors.reset}`);

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  log('bright', '\n🔍 CHECKING FIREBASE CLI');
  log('blue', '========================');

  try {
    const version = execSync('firebase --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    log('green', `✅ Firebase CLI installed: ${version}`);
    return true;
  } catch (error) {
    log('red', '❌ Firebase CLI not found');
    log('white', '   Install with: npm install -g firebase-tools');
    log('white', '   Or: curl -sL https://firebase.tools | bash');
    return false;
  }
}

// Check if Netlify CLI is installed
function checkNetlifyCLI() {
  log('bright', '\n🌐 CHECKING NETLIFY CLI');
  log('blue', '=======================');

  try {
    const version = execSync('netlify --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    log('green', `✅ Netlify CLI installed: ${version}`);
    return true;
  } catch (error) {
    log('red', '❌ Netlify CLI not found');
    log('white', '   Install with: npm install -g netlify-cli');
    return false;
  }
}

// Login to Firebase
async function loginFirebase() {
  log('bright', '\n🔐 FIREBASE AUTHENTICATION');
  log('blue', '===========================');

  try {
    // Check if already logged in
    const currentUser = execSync('firebase auth:whoami', { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (!currentUser.includes('Error')) {
      log('green', `✅ Already logged in: ${currentUser}`);
      return true;
    }
  } catch (error) {
    // Not logged in, need to login
  }

  log('yellow', '⚠️  Not logged in to Firebase');
  const shouldLogin = await question('Would you like to login now? (y/n): ');
  
  if (shouldLogin.toLowerCase() === 'y') {
    try {
      log('cyan', 'Opening Firebase login in browser...');
      execSync('firebase login', { stdio: 'inherit' });
      log('green', '✅ Firebase login successful!');
      return true;
    } catch (error) {
      log('red', '❌ Firebase login failed');
      return false;
    }
  }
  
  return false;
}

// Login to Netlify
async function loginNetlify() {
  log('bright', '\n🌐 NETLIFY AUTHENTICATION');
  log('blue', '==========================');

  try {
    // Check if already logged in
    const status = execSync('netlify status', { encoding: 'utf8', stdio: 'pipe' });
    if (status.includes('Logged in')) {
      log('green', '✅ Already logged in to Netlify');
      return true;
    }
  } catch (error) {
    // Not logged in, need to login
  }

  log('yellow', '⚠️  Not logged in to Netlify');
  const shouldLogin = await question('Would you like to login now? (y/n): ');
  
  if (shouldLogin.toLowerCase() === 'y') {
    try {
      log('cyan', 'Opening Netlify login in browser...');
      execSync('netlify login', { stdio: 'inherit' });
      log('green', '✅ Netlify login successful!');
      return true;
    } catch (error) {
      log('red', '❌ Netlify login failed');
      return false;
    }
  }
  
  return false;
}

// Get Firebase projects
function getFirebaseProjects() {
  log('bright', '\n🔥 FIREBASE PROJECTS');
  log('blue', '====================');

  try {
    const projects = execSync('firebase projects:list --json', { encoding: 'utf8', stdio: 'pipe' });
    const parsed = JSON.parse(projects);
    
    if (parsed.length === 0) {
      log('yellow', '⚠️  No Firebase projects found');
      log('white', '   Create one at: https://console.firebase.google.com');
      return [];
    }

    log('green', '✅ Available Firebase projects:');
    parsed.forEach((project, index) => {
      log('white', `   ${index + 1}. ${project.displayName || project.projectId} (${project.projectId})`);
    });

    return parsed;
  } catch (error) {
    log('red', '❌ Error fetching Firebase projects');
    log('white', `   ${error.message}`);
    return [];
  }
}

// Select Firebase project
async function selectFirebaseProject(projects) {
  if (projects.length === 0) return null;
  
  if (projects.length === 1) {
    log('green', `✅ Using project: ${projects[0].projectId}`);
    return projects[0];
  }

  const choice = await question(`\nSelect a Firebase project (1-${projects.length}): `);
  const index = parseInt(choice) - 1;
  
  if (index >= 0 && index < projects.length) {
    const selected = projects[index];
    log('green', `✅ Selected: ${selected.projectId}`);
    return selected;
  } else {
    log('red', '❌ Invalid selection');
    return null;
  }
}

// Get Firebase web app config
function getFirebaseWebConfig(projectId) {
  log('bright', '\n🔧 FETCHING FIREBASE WEB CONFIG');
  log('blue', '================================');

  try {
    // First, get the web apps for this project
    const apps = execSync(`firebase apps:list --project=${projectId} --json`, { encoding: 'utf8', stdio: 'pipe' });
    const parsedApps = JSON.parse(apps);
    
    // Find web apps
    const webApps = parsedApps.filter(app => app.platform === 'WEB');
    
    if (webApps.length === 0) {
      log('yellow', '⚠️  No web apps found for this project');
      log('white', '   Create one in Firebase Console > Project Settings > General > Your apps');
      return null;
    }

    // Use the first web app
    const webApp = webApps[0];
    log('green', `✅ Found web app: ${webApp.displayName || webApp.appId}`);

    // Get the config for this web app
    const config = execSync(`firebase apps:sdkconfig --project=${projectId} --app=${webApp.appId} web --json`, { encoding: 'utf8', stdio: 'pipe' });
    const parsedConfig = JSON.parse(config);

    log('green', '✅ Firebase web config retrieved!');
    
    return {
      apiKey: parsedConfig.apiKey,
      authDomain: parsedConfig.authDomain,
      projectId: parsedConfig.projectId,
      storageBucket: parsedConfig.storageBucket,
      messagingSenderId: parsedConfig.messagingSenderId,
      appId: parsedConfig.appId,
      measurementId: parsedConfig.measurementId
    };
  } catch (error) {
    log('red', '❌ Error fetching Firebase config');
    log('white', `   ${error.message}`);
    return null;
  }
}

// Create environment variables
function createEnvironmentFiles(config, environment = 'development') {
  log('bright', '\n📝 CREATING ENVIRONMENT FILES');
  log('blue', '==============================');

  const envVars = {
    [`EXPO_PUBLIC_FIREBASE_API_KEY`]: config.apiKey,
    [`EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`]: config.authDomain,
    [`EXPO_PUBLIC_FIREBASE_PROJECT_ID`]: config.projectId,
    [`EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`]: config.storageBucket,
    [`EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`]: config.messagingSenderId,
    [`EXPO_PUBLIC_FIREBASE_APP_ID`]: config.appId,
    [`EXPO_PUBLIC_ENVIRONMENT`]: environment,
    [`EXPO_PUBLIC_APP_VERSION`]: '1.0.0',
    // Keep existing Supabase config if it exists
    [`EXPO_PUBLIC_SUPABASE_URL`]: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    [`EXPO_PUBLIC_SUPABASE_ANON_KEY`]: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  };

  // Add measurement ID if available
  if (config.measurementId) {
    envVars[`EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`] = config.measurementId;
  }

  // Create .env.netlify file
  const envContent = Object.entries(envVars)
    .filter(([key, value]) => value) // Only include non-empty values
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync('.env.netlify', envContent);
  log('green', '✅ Created .env.netlify');

  // Create .env.local if it doesn't exist
  if (!fs.existsSync('.env.local')) {
    fs.writeFileSync('.env.local', envContent);
    log('green', '✅ Created .env.local');
  }

  return envVars;
}

// Set up Netlify site
async function setupNetlifySite() {
  log('bright', '\n🌐 NETLIFY SITE SETUP');
  log('blue', '=====================');

  // Check if netlify site is already linked
  try {
    const siteInfo = execSync('netlify status', { encoding: 'utf8', stdio: 'pipe' });
    if (siteInfo.includes('Site name:')) {
      log('green', '✅ Netlify site already linked');
      return true;
    }
  } catch (error) {
    // Site not linked yet
  }

  const setupChoice = await question('Do you want to (1) link existing site or (2) create new site? (1/2): ');

  try {
    if (setupChoice === '1') {
      // Link existing site
      execSync('netlify link', { stdio: 'inherit' });
    } else {
      // Create new site
      const siteName = await question('Enter site name (or press Enter for auto-generated): ');
      const command = siteName ? `netlify sites:create --name ${siteName}` : 'netlify sites:create';
      execSync(command, { stdio: 'inherit' });
      execSync('netlify link', { stdio: 'inherit' });
    }
    
    log('green', '✅ Netlify site setup complete!');
    return true;
  } catch (error) {
    log('red', '❌ Netlify site setup failed');
    return false;
  }
}

// Set Netlify environment variables
async function setNetlifyEnvVars(envVars) {
  log('bright', '\n🔧 SETTING NETLIFY ENVIRONMENT VARIABLES');
  log('blue', '=========================================');

  try {
    for (const [key, value] of Object.entries(envVars)) {
      if (value) {
        log('cyan', `Setting ${key}...`);
        execSync(`netlify env:set ${key} "${value}"`, { stdio: 'pipe' });
        log('green', `✅ Set ${key}`);
      }
    }
    
    log('green', '\n✅ All environment variables set in Netlify!');
    return true;
  } catch (error) {
    log('red', '❌ Error setting environment variables');
    log('white', `   ${error.message}`);
    return false;
  }
}

// Deploy to Netlify
async function deployToNetlify() {
  log('bright', '\n🚀 DEPLOYING TO NETLIFY');
  log('blue', '========================');

  const shouldDeploy = await question('Would you like to deploy now? (y/n): ');
  
  if (shouldDeploy.toLowerCase() === 'y') {
    try {
      log('cyan', 'Building and deploying...');
      execSync('netlify deploy --build --prod', { stdio: 'inherit' });
      log('green', '✅ Deployment successful!');
      
      // Get site URL
      const status = execSync('netlify status', { encoding: 'utf8' });
      const urlMatch = status.match(/Site url:\s*(.+)/);
      if (urlMatch) {
        log('bright', `\n🌐 Your site is live at: ${urlMatch[1]}`);
      }
      
      return true;
    } catch (error) {
      log('red', '❌ Deployment failed');
      log('white', '   You can deploy later with: netlify deploy --build --prod');
      return false;
    }
  } else {
    log('cyan', 'Skipping deployment. Deploy later with: netlify deploy --build --prod');
    return true;
  }
}

// Main setup function
async function runSetup() {
  try {
    log('cyan', 'Welcome to the automated Firebase + Netlify setup!');
    log('white', 'This script will help you deploy your DAMP Smart Drinkware app automatically.\n');

    // Check prerequisites
    const hasFirebaseCLI = checkFirebaseCLI();
    const hasNetlifyCLI = checkNetlifyCLI();

    if (!hasFirebaseCLI || !hasNetlifyCLI) {
      log('red', '\n❌ Missing required CLI tools. Please install them first.');
      return;
    }

    // Authentication
    const firebaseAuth = await loginFirebase();
    const netlifyAuth = await loginNetlify();

    if (!firebaseAuth || !netlifyAuth) {
      log('red', '\n❌ Authentication required. Please login and try again.');
      return;
    }

    // Firebase setup
    const projects = getFirebaseProjects();
    const selectedProject = await selectFirebaseProject(projects);

    if (!selectedProject) {
      log('red', '\n❌ No Firebase project selected.');
      return;
    }

    const firebaseConfig = getFirebaseWebConfig(selectedProject.projectId);
    if (!firebaseConfig) {
      log('red', '\n❌ Could not retrieve Firebase configuration.');
      return;
    }

    // Environment setup
    const envVars = createEnvironmentFiles(firebaseConfig, 'production');

    // Netlify setup
    const netlifySetup = await setupNetlifySite();
    if (!netlifySetup) {
      log('red', '\n❌ Netlify site setup failed.');
      return;
    }

    const envSetup = await setNetlifyEnvVars(envVars);
    if (!envSetup) {
      log('red', '\n❌ Environment variables setup failed.');
      return;
    }

    // Final deployment
    await deployToNetlify();

    log('bright', '\n🎉 SETUP COMPLETE!');
    log('green', '==================');
    log('white', 'Your DAMP Smart Drinkware app is ready for production!');
    log('white', '\nNext steps:');
    log('white', '• Your Firebase config is automatically loaded');
    log('white', '• Environment variables are set in Netlify');
    log('white', '• Future deployments: git push (if auto-deploy enabled) or netlify deploy --prod');
    log('white', '\nNeed help? Run: npm run netlify:help');

  } catch (error) {
    log('red', `\n❌ Setup failed: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  runSetup();
}

module.exports = { 
  checkFirebaseCLI, 
  checkNetlifyCLI, 
  getFirebaseProjects, 
  getFirebaseWebConfig,
  createEnvironmentFiles 
};