#!/usr/bin/env node

/**
 * 🔐 DAMP Smart Drinkware - Secure Key Generator
 * Generates cryptographically secure keys for environment variables
 * Copyright 2025 WeCr8 Solutions LLC
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecret() {
  // JWT secrets should be longer for additional security
  return crypto.randomBytes(64).toString('hex');
}

function generateAPIKey() {
  // Generate a UUID-like API key
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(16).toString('hex');
  return `damp_${timestamp}_${randomPart}`;
}

function displayHeader() {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                🔐 SECURE KEY GENERATOR                       ║');
  console.log('║              DAMP Smart Drinkware                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);
}

function displaySecurityWarning() {
  console.log(`${colors.bold}${colors.red}`);
  console.log('🚨 CRITICAL SECURITY WARNING:');
  console.log(`${colors.reset}${colors.red}`);
  console.log('• These keys provide access to your application and data');
  console.log('• NEVER commit these keys to version control');
  console.log('• Use different keys for development, staging, and production');
  console.log('• Store production keys in secure environment variable systems');
  console.log('• Rotate keys regularly (monthly for high-security environments)');
  console.log(`${colors.reset}`);
  console.log('');
}

function generateEnvironmentKeys(environment = 'development') {
  const keys = {
    JWT_SECRET: generateJWTSecret(),
    ENCRYPTION_KEY: generateSecureKey(32),
    API_SECRET_KEY: generateSecureKey(32),
    ADMIN_KEY: generateSecureKey(32),
    SESSION_SECRET: generateSecureKey(24),
    WEBHOOK_SECRET: generateSecureKey(32),
    API_KEY: generateAPIKey()
  };

  return keys;
}

function displayKeys(keys, environment) {
  console.log(`${colors.bold}${colors.green}Generated Keys for ${environment.toUpperCase()} Environment:${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log('');

  Object.entries(keys).forEach(([key, value]) => {
    console.log(`${colors.bold}${key}${colors.reset}=${colors.yellow}${value}${colors.reset}`);
  });

  console.log('');
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
}

function saveToFile(keys, environment) {
  const filename = `.env.${environment}.generated`;
  const filepath = path.join(process.cwd(), filename);
  
  let content = `# 🔐 GENERATED SECURE KEYS FOR ${environment.toUpperCase()} ENVIRONMENT\n`;
  content += `# Generated on: ${new Date().toISOString()}\n`;
  content += `# ⚠️ NEVER commit this file to version control!\n\n`;

  Object.entries(keys).forEach(([key, value]) => {
    content += `${key}=${value}\n`;
  });

  content += '\n# 🚨 SECURITY REMINDERS:\n';
  content += '# 1. Copy these values to your actual .env file\n';
  content += '# 2. Delete this generated file after copying\n';
  content += '# 3. Use different keys for each environment\n';
  content += '# 4. Store production keys in secure CI/CD variables\n';
  
  try {
    fs.writeFileSync(filepath, content);
    console.log(`${colors.green}✅ Keys saved to: ${colors.bold}${filename}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Remember to delete this file after copying the keys!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Failed to save keys to file: ${error.message}${colors.reset}`);
  }
}

function displayUsageInstructions() {
  console.log(`${colors.bold}${colors.blue}📋 Usage Instructions:${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}1.${colors.reset} Copy the keys above to your ${colors.bold}.env${colors.reset} file`);
  console.log(`${colors.cyan}2.${colors.reset} Replace the placeholder values in your environment file`);
  console.log(`${colors.cyan}3.${colors.reset} ${colors.bold}NEVER${colors.reset} commit the ${colors.bold}.env${colors.reset} file to git`);
  console.log(`${colors.cyan}4.${colors.reset} Generate separate keys for staging and production`);
  console.log(`${colors.cyan}5.${colors.reset} Store production keys in your deployment platform's environment variables`);
  console.log('');
  
  console.log(`${colors.bold}${colors.blue}🚀 For Production Deployment:${colors.reset}`);
  console.log('');
  console.log(`${colors.magenta}GitHub Actions:${colors.reset}`);
  console.log(`  gh secret set JWT_SECRET --body "your-production-jwt-secret"`);
  console.log('');
  console.log(`${colors.magenta}Vercel:${colors.reset}`);
  console.log(`  vercel env add JWT_SECRET production`);
  console.log('');
  console.log(`${colors.magenta}Netlify:${colors.reset}`);
  console.log(`  netlify env:set JWT_SECRET "your-production-jwt-secret" --context production`);
  console.log('');
}

function displaySecurityChecklist() {
  console.log(`${colors.bold}${colors.blue}✅ Security Checklist:${colors.reset}`);
  console.log('');
  console.log(`${colors.green}□${colors.reset} Generated unique keys for this environment`);
  console.log(`${colors.green}□${colors.reset} Keys are minimum 32 characters (JWT is 64+)`);
  console.log(`${colors.green}□${colors.reset} Keys use cryptographically secure randomness`);
  console.log(`${colors.green}□${colors.reset} Will use different keys for each environment`);
  console.log(`${colors.green}□${colors.reset} Will store production keys in secure CI/CD variables`);
  console.log(`${colors.green}□${colors.reset} Will never commit .env files to version control`);
  console.log(`${colors.green}□${colors.reset} Will rotate keys regularly (monthly)`);
  console.log(`${colors.green}□${colors.reset} Will enable 2FA on all service accounts`);
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';
  const saveToFileFlag = args.includes('--save');
  const validEnvironments = ['development', 'staging', 'production', 'test'];

  if (!validEnvironments.includes(environment)) {
    console.error(`${colors.red}❌ Invalid environment. Use: ${validEnvironments.join(', ')}${colors.reset}`);
    process.exit(1);
  }

  displayHeader();
  displaySecurityWarning();

  const keys = generateEnvironmentKeys(environment);
  displayKeys(keys, environment);

  if (saveToFileFlag) {
    saveToFile(keys, environment);
    console.log('');
  }

  displayUsageInstructions();
  displaySecurityChecklist();

  // Special warning for production
  if (environment === 'production') {
    console.log(`${colors.bold}${colors.red}`);
    console.log('🚨 PRODUCTION ENVIRONMENT DETECTED!');
    console.log('');
    console.log('CRITICAL REMINDERS:');
    console.log('• Use these keys ONLY in secure production environment variables');
    console.log('• NEVER store production keys in .env files');
    console.log('• Enable all security monitoring and alerting');
    console.log('• Ensure SSL/TLS certificates are valid');
    console.log('• Test disaster recovery procedures');
    console.log(`${colors.reset}`);
  }
}

// Handle command line help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`${colors.bold}🔐 DAMP Smart Drinkware - Secure Key Generator${colors.reset}`);
  console.log('');
  console.log(`${colors.bold}Usage:${colors.reset}`);
  console.log('  node scripts/generate-secure-keys.js [environment] [--save]');
  console.log('');
  console.log(`${colors.bold}Environments:${colors.reset}`);
  console.log('  development (default)');
  console.log('  staging');
  console.log('  production');
  console.log('  test');
  console.log('');
  console.log(`${colors.bold}Options:${colors.reset}`);
  console.log('  --save    Save keys to .env.[environment].generated file');
  console.log('  --help    Show this help message');
  console.log('');
  console.log(`${colors.bold}Examples:${colors.reset}`);
  console.log('  node scripts/generate-secure-keys.js development');
  console.log('  node scripts/generate-secure-keys.js production --save');
  console.log('');
  process.exit(0);
}

// Run the key generator
main();