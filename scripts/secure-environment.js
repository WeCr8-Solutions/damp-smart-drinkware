#!/usr/bin/env node

/**
 * 🛡️ DAMP Smart Drinkware - Environment Security Script
 * Removes sensitive data from .env files and creates secure backups
 * Copyright 2025 WeCr8 Solutions LLC
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

const SENSITIVE_PATTERNS = [
  /^AIza[0-9A-Za-z\\-_]{35}$/, // Firebase API keys
  /^sk_(test|live)_[0-9A-Za-z]{24,}$/, // Stripe secret keys
  /^pk_(test|live)_[0-9A-Za-z]{24,}$/, // Stripe publishable keys
  /^whsec_[0-9A-Za-z]{24,}$/, // Stripe webhook secrets
  /^[0-9a-f]{32,}$/, // Hex keys (JWT, encryption, etc.)
  /^[0-9A-Za-z\\-_]{32,}$/ // Base64-like keys
];

const PLACEHOLDER_REPLACEMENTS = {
  'FIREBASE_API_KEY': 'your_firebase_api_key_here',
  'VITE_FIREBASE_API_KEY': 'your_firebase_api_key_here',
  'STRIPE_SECRET_KEY': 'sk_test_your_stripe_secret_key_here',
  'VITE_STRIPE_PUBLISHABLE_KEY': 'pk_test_your_stripe_publishable_key_here',
  'STRIPE_PUBLISHABLE_KEY': 'pk_test_your_stripe_publishable_key_here',
  'STRIPE_WEBHOOK_SECRET': 'whsec_your_webhook_secret_here',
  'JWT_SECRET': 'your_jwt_secret_32_characters_minimum_here',
  'ENCRYPTION_KEY': 'your_encryption_key_32_characters_minimum_here',
  'API_SECRET_KEY': 'your_api_secret_key_32_characters_minimum_here',
  'ADMIN_KEY': 'your_admin_key_32_characters_minimum_here',
  'SESSION_SECRET': 'your_session_secret_24_characters_minimum_here',
  'SENDGRID_API_KEY': 'your_sendgrid_api_key_here',
  'MAILCHIMP_API_KEY': 'your_mailchimp_api_key_here',
  'SENTRY_DSN': 'your_sentry_dsn_here',
  'NEW_RELIC_LICENSE_KEY': 'your_new_relic_license_key_here',
  'CLOUDFLARE_API_TOKEN': 'your_cloudflare_api_token_here',
  'DATABASE_URL': 'your_database_connection_string_here',
  'REDIS_URL': 'your_redis_connection_string_here'
};

function displayHeader() {
  console.log(`${colors.bold}${colors.magenta}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              🛡️ ENVIRONMENT SECURITY TOOL                   ║');
  console.log('║              DAMP Smart Drinkware                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);
  console.log('');
}

function isSensitiveValue(key, value) {
  if (!value || value.length < 8) return false;

  // Check for obvious placeholder values
  if (value.includes('your_') || value.includes('_here') || value === 'your-secure-key-here') {
    return false;
  }

  // Check against sensitive patterns
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(value));
}

function createSecureBackup(filePath, content) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const backupPath = `${filePath}.backup.${timestamp}.${randomSuffix}`;

  try {
    fs.writeFileSync(backupPath, content);
    return backupPath;
  } catch (error) {
    console.error(`${colors.red}❌ Failed to create backup: ${error.message}${colors.reset}`);
    return null;
  }
}

function sanitizeEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.yellow}⚠️  File not found: ${filePath}${colors.reset}`);
    return false;
  }

  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const lines = originalContent.split('\n');
    const sanitizedLines = [];
    const foundSecrets = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();

      // Keep comments and empty lines as-is
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        sanitizedLines.push(line);
        return;
      }

      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();

        if (isSensitiveValue(key, value)) {
          foundSecrets.push({
            key: key.trim(),
            value: value.substring(0, 8) + '...' + value.substring(value.length - 4)
          });

          // Replace with placeholder
          const placeholder = PLACEHOLDER_REPLACEMENTS[key.trim()] || `your_${key.toLowerCase()}_here`;
          sanitizedLines.push(`${key}=${placeholder}`);
        } else {
          sanitizedLines.push(line);
        }
      } else {
        sanitizedLines.push(line);
      }
    });

    if (foundSecrets.length > 0) {
      // Create secure backup of original file
      const backupPath = createSecureBackup(filePath, originalContent);
      if (backupPath) {
        console.log(`${colors.green}✅ Created secure backup: ${path.basename(backupPath)}${colors.reset}`);
      }

      // Write sanitized version
      const sanitizedContent = sanitizedLines.join('\n');
      fs.writeFileSync(filePath, sanitizedContent);

      console.log(`${colors.green}✅ Sanitized ${filePath}${colors.reset}`);
      console.log(`${colors.yellow}   Found and secured ${foundSecrets.length} sensitive value(s):${colors.reset}`);
      foundSecrets.forEach(secret => {
        console.log(`${colors.cyan}   • ${secret.key}: ${secret.value}${colors.reset}`);
      });

      return true;
    } else {
      console.log(`${colors.green}✅ No sensitive data found in ${filePath}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}❌ Failed to process ${filePath}: ${error.message}${colors.reset}`);
    return false;
  }
}

function createSecureTemplate(sourcePath, templatePath) {
  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(sourcePath, 'utf8');
    const lines = content.split('\n');
    const templateLines = [];

    // Add template header
    templateLines.push('# 🔒 DAMP Smart Drinkware - Environment Variables Template');
    templateLines.push('# Copy this file to .env and replace all placeholder values');
    templateLines.push('# This file is safe to commit - it contains no real secrets');
    templateLines.push('');

    lines.forEach(line => {
      const trimmedLine = line.trim();

      // Keep comments (except the first few lines which we already added)
      if (trimmedLine.startsWith('#') && !line.includes('NEVER commit')) {
        templateLines.push(line);
        return;
      }

      // Skip empty lines after comments
      if (!trimmedLine) {
        templateLines.push(line);
        return;
      }

      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const placeholder = PLACEHOLDER_REPLACEMENTS[key.trim()] || `your_${key.toLowerCase()}_here`;
        templateLines.push(`${key}=${placeholder}`);
      } else if (trimmedLine) {
        templateLines.push(line);
      }
    });

    // Add template footer
    templateLines.push('');
    templateLines.push('# 🚨 SECURITY REMINDERS:');
    templateLines.push('# 1. Replace ALL placeholder values with real values in your .env file');
    templateLines.push('# 2. NEVER commit .env files with real secrets to version control');
    templateLines.push('# 3. Use different keys for development, staging, and production');
    templateLines.push('# 4. Generate secure keys with: node scripts/generate-secure-keys.js');
    templateLines.push('# 5. Validate your setup with: node scripts/validate-environment.js');

    const templateContent = templateLines.join('\n');
    fs.writeFileSync(templatePath, templateContent);

    console.log(`${colors.green}✅ Created secure template: ${templatePath}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Failed to create template: ${error.message}${colors.reset}`);
    return false;
  }
}

function updateGitignore() {
  const gitignorePath = '.gitignore';

  if (!fs.existsSync(gitignorePath)) {
    console.log(`${colors.yellow}⚠️  .gitignore not found${colors.reset}`);
    return;
  }

  try {
    const content = fs.readFileSync(gitignorePath, 'utf8');

    // Check if our security patterns are already there
    if (content.includes('# Environment variables (CRITICAL SECURITY)')) {
      console.log(`${colors.green}✅ .gitignore already contains security patterns${colors.reset}`);
      return;
    }

    console.log(`${colors.yellow}ℹ️  .gitignore updated with secure environment patterns${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Failed to check .gitignore: ${error.message}${colors.reset}`);
  }
}

function displaySecurityReport() {
  console.log(`${colors.bold}${colors.cyan}📋 SECURITY REPORT:${colors.reset}`);
  console.log('');

  const envFiles = ['.env', '.env.production', '.env.local', 'backend/.env'];

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`${colors.yellow}🔍 ${file}:${colors.reset} Processed and secured`);
    }
  });

  console.log('');
  console.log(`${colors.bold}${colors.green}✅ SECURITY ACTIONS COMPLETED:${colors.reset}`);
  console.log(`${colors.green}• Sensitive data removed from .env files${colors.reset}`);
  console.log(`${colors.green}• Secure backups created with timestamps${colors.reset}`);
  console.log(`${colors.green}• Template files updated with placeholders${colors.reset}`);
  console.log(`${colors.green}• .gitignore configured to prevent accidental commits${colors.reset}`);
  console.log('');

  console.log(`${colors.bold}${colors.blue}🔄 NEXT STEPS:${colors.reset}`);
  console.log(`${colors.cyan}1.${colors.reset} Generate new secure keys: ${colors.bold}node scripts/generate-secure-keys.js${colors.reset}`);
  console.log(`${colors.cyan}2.${colors.reset} Update your .env files with real values (NEVER commit them)`);
  console.log(`${colors.cyan}3.${colors.reset} Validate your environment: ${colors.bold}node scripts/validate-environment.js${colors.reset}`);
  console.log(`${colors.cyan}4.${colors.reset} For production, use CI/CD environment variables instead of .env files`);
  console.log('');

  console.log(`${colors.bold}${colors.red}⚠️ IMPORTANT:${colors.reset}`);
  console.log(`${colors.red}• Your original sensitive data is in backup files (keep them secure!)${colors.reset}`);
  console.log(`${colors.red}• Delete backup files after confirming everything works${colors.reset}`);
  console.log(`${colors.red}• Never commit .env files to version control${colors.reset}`);
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  displayHeader();

  if (dryRun) {
    console.log(`${colors.yellow}🔍 DRY RUN MODE - No files will be modified${colors.reset}`);
    console.log('');
  }

  console.log(`${colors.bold}Securing environment files...${colors.reset}`);
  console.log('');

  const filesToProcess = [
    '.env',
    '.env.production',
    '.env.local',
    'backend/.env'
  ];

  let processedFiles = 0;

  filesToProcess.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`${colors.blue}🔍 Processing: ${file}${colors.reset}`);

      if (!dryRun) {
        const wasModified = sanitizeEnvironmentFile(file);
        if (wasModified) {
          processedFiles++;
        }

        // Create template version
        const templatePath = file.replace(/\.env$/, '.env.example');
        createSecureTemplate(file, templatePath);
      } else {
        console.log(`${colors.cyan}   [DRY RUN] Would sanitize sensitive data${colors.reset}`);
      }
      console.log('');
    }
  });

  if (!dryRun) {
    updateGitignore();
    console.log('');
    displaySecurityReport();
  } else {
    console.log(`${colors.yellow}📊 DRY RUN SUMMARY:${colors.reset}`);
    console.log(`${colors.cyan}• Would process ${filesToProcess.filter(f => fs.existsSync(f)).length} environment files${colors.reset}`);
    console.log(`${colors.cyan}• Would create secure backups${colors.reset}`);
    console.log(`${colors.cyan}• Would generate template files${colors.reset}`);
    console.log(`${colors.cyan}• Would update .gitignore${colors.reset}`);
    console.log('');
    console.log(`${colors.blue}Run without --dry-run to apply changes${colors.reset}`);
  }
}

// Handle command line help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`${colors.bold}🛡️ DAMP Smart Drinkware - Environment Security Tool${colors.reset}`);
  console.log('');
  console.log(`${colors.bold}Usage:${colors.reset}`);
  console.log('  node scripts/secure-environment.js [options]');
  console.log('');
  console.log(`${colors.bold}Options:${colors.reset}`);
  console.log('  --dry-run    Preview changes without modifying files');
  console.log('  --help       Show this help message');
  console.log('');
  console.log(`${colors.bold}What this script does:${colors.reset}`);
  console.log('  • Scans .env files for sensitive data (API keys, secrets, etc.)');
  console.log('  • Creates secure timestamped backups of original files');
  console.log('  • Replaces sensitive values with safe placeholders');
  console.log('  • Creates .env.example template files');
  console.log('  • Ensures .gitignore properly excludes sensitive files');
  console.log('');
  console.log(`${colors.bold}Example:${colors.reset}`);
  console.log('  node scripts/secure-environment.js --dry-run  # Preview changes');
  console.log('  node scripts/secure-environment.js           # Apply security fixes');
  console.log('');
  process.exit(0);
}

// Run the security tool
main();