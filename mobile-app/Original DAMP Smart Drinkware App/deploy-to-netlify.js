#!/usr/bin/env node
/**
 * 🚀 DAMP Smart Drinkware - One-Command Netlify Deployment
 * Automatically sets up Firebase, configures Netlify, and deploys your app
 */

const { execSync } = require('child_process');
const fs = require('fs');

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
🚀 DAMP Smart Drinkware - One-Command Netlify Deployment
=======================================================${colors.reset}`);

function checkPrerequisites() {
  log('bright', '\n🔍 CHECKING PREREQUISITES');
  log('blue', '=========================');

  const requirements = [
    { name: 'Node.js', command: 'node --version', install: 'Install from https://nodejs.org' },
    { name: 'npm', command: 'npm --version', install: 'Comes with Node.js' },
    { name: 'Firebase CLI', command: 'firebase --version', install: 'npm install -g firebase-tools' },
    { name: 'Netlify CLI', command: 'netlify --version', install: 'npm install -g netlify-cli' }
  ];

  let allGood = true;

  requirements.forEach(req => {
    try {
      const version = execSync(req.command, { encoding: 'utf8', stdio: 'pipe' }).trim();
      log('green', `✅ ${req.name}: ${version}`);
    } catch (error) {
      log('red', `❌ ${req.name}: Not found`);
      log('white', `   Install: ${req.install}`);
      allGood = false;
    }
  });

  return allGood;
}

function runCommand(command, description, options = {}) {
  log('cyan', `\n🔧 ${description}`);
  log('blue', '='.repeat(description.length + 4));

  try {
    if (options.silent) {
      execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    } else {
      execSync(command, { stdio: 'inherit' });
    }
    log('green', `✅ ${description} completed`);
    return true;
  } catch (error) {
    log('red', `❌ ${description} failed`);
    if (options.continueOnError) {
      log('yellow', '⚠️  Continuing anyway...');
      return true;
    }
    return false;
  }
}

function deployToNetlify() {
  log('bright', '\n🎯 STARTING DEPLOYMENT PROCESS');
  log('blue', '===============================');

  // Check prerequisites
  if (!checkPrerequisites()) {
    log('red', '\n❌ Prerequisites not met. Please install missing tools and try again.');
    process.exit(1);
  }

  // Install dependencies if needed
  if (!fs.existsSync('node_modules')) {
    runCommand('npm install', 'Installing dependencies');
  }

  // Run the comprehensive setup
  if (!runCommand('node scripts/setup-firebase-netlify.js', 'Setting up Firebase and Netlify integration')) {
    log('red', '\n❌ Setup failed. Check the error messages above.');
    process.exit(1);
  }

  log('bright', '\n🎉 DEPLOYMENT COMPLETE!');
  log('green', '=======================');
  log('white', 'Your DAMP Smart Drinkware app should now be live on Netlify!');
  log('white', '\nUseful commands:');
  log('white', '• npm run netlify:status    - Check deployment status');
  log('white', '• npm run netlify:logs      - View deployment logs');
  log('white', '• npm run netlify:deploy    - Deploy again');
  log('white', '• npm run netlify:preview   - Deploy preview version');

  log('cyan', '\n📚 For more help: npm run netlify:help');
}

// Check if running as main script
if (require.main === module) {
  deployToNetlify();
}

module.exports = { deployToNetlify, checkPrerequisites };