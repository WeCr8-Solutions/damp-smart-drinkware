#!/usr/bin/env node

/**
 * 🔍 DAMP Smart Drinkware - Environment Variables Validator
 * Validates that all required environment variables are properly configured
 * Copyright 2025 WeCr8 Solutions LLC
 */

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
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

// Required environment variables for each environment
const requiredVariables = {
  development: {
    critical: [
      'FIREBASE_API_KEY',
      'VITE_FIREBASE_API_KEY',
      'FIREBASE_PROJECT_ID',
      'JWT_SECRET',
      'API_SECRET_KEY'
    ],
    important: [
      'STRIPE_SECRET_KEY',
      'VITE_STRIPE_PUBLISHABLE_KEY',
      'ADMIN_KEY',
      'ENCRYPTION_KEY'
    ],
    optional: [
      'GOOGLE_ANALYTICS_ID',
      'SENDGRID_API_KEY',
      'SENTRY_DSN'
    ]
  },
  staging: {
    critical: [
      'FIREBASE_API_KEY',
      'VITE_FIREBASE_API_KEY',
      'FIREBASE_PROJECT_ID',
      'JWT_SECRET',
      'API_SECRET_KEY',
      'STRIPE_SECRET_KEY',
      'VITE_STRIPE_PUBLISHABLE_KEY'
    ],
    important: [
      'ADMIN_KEY',
      'ENCRYPTION_KEY',
      'GOOGLE_ANALYTICS_ID'
    ],
    optional: [
      'SENDGRID_API_KEY',
      'SENTRY_DSN',
      'NEW_RELIC_LICENSE_KEY'
    ]
  },
  production: {
    critical: [
      'FIREBASE_API_KEY',
      'VITE_FIREBASE_API_KEY',
      'FIREBASE_PROJECT_ID',
      'JWT_SECRET',
      'API_SECRET_KEY',
      'STRIPE_SECRET_KEY',
      'VITE_STRIPE_PUBLISHABLE_KEY',
      'ADMIN_KEY',
      'ENCRYPTION_KEY'
    ],
    important: [
      'GOOGLE_ANALYTICS_ID',
      'SENTRY_DSN',
      'NEW_RELIC_LICENSE_KEY',
      'SENDGRID_API_KEY'
    ],
    optional: [
      'CLOUDFLARE_API_TOKEN',
      'MAILCHIMP_API_KEY'
    ]
  }
};

// Validation rules for specific variables
const validationRules = {
  FIREBASE_API_KEY: {
    minLength: 20,
    pattern: /^AIza/,
    description: 'Firebase API key should start with "AIza"'
  },
  JWT_SECRET: {
    minLength: 32,
    description: 'JWT secret must be at least 32 characters for security'
  },
  API_SECRET_KEY: {
    minLength: 32,
    description: 'API secret key must be at least 32 characters for security'
  },
  ADMIN_KEY: {
    minLength: 32,
    description: 'Admin key must be at least 32 characters for security'
  },
  ENCRYPTION_KEY: {
    minLength: 32,
    description: 'Encryption key must be at least 32 characters for security'
  },
  STRIPE_SECRET_KEY: {
    pattern: {
      development: /^sk_test_/,
      staging: /^sk_test_/,
      production: /^sk_live_/
    },
    description: 'Stripe secret key format should match environment (test/live)'
  },
  VITE_STRIPE_PUBLISHABLE_KEY: {
    pattern: {
      development: /^pk_test_/,
      staging: /^pk_test_/,
      production: /^pk_live_/
    },
    description: 'Stripe publishable key format should match environment (test/live)'
  },
  NODE_ENV: {
    allowedValues: ['development', 'staging', 'production', 'test'],
    description: 'NODE_ENV must be one of: development, staging, production, test'
  }
};

function displayHeader() {
  console.log(`${colors.bold}${colors.blue}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║            🔍 ENVIRONMENT VALIDATOR                          ║');
  console.log('║              DAMP Smart Drinkware                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);
}

function loadEnvironmentFile(envFile) {
  try {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      const lines = content.split('\n');

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            // Only set if not already set in process.env
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
      return true;
    }
  } catch (error) {
    console.warn(`${colors.yellow}⚠️  Warning: Could not load ${envFile}: ${error.message}${colors.reset}`);
  }
  return false;
}

function validateVariable(key, value, environment) {
  const rule = validationRules[key];
  if (!rule) return { isValid: true };

  const issues = [];

  // Check minimum length
  if (rule.minLength && value.length < rule.minLength) {
    issues.push(`Must be at least ${rule.minLength} characters (current: ${value.length})`);
  }

  // Check pattern
  if (rule.pattern) {
    let pattern = rule.pattern;
    if (typeof pattern === 'object') {
      pattern = pattern[environment] || pattern.development;
    }
    if (!pattern.test(value)) {
      issues.push(rule.description);
    }
  }

  // Check allowed values
  if (rule.allowedValues && !rule.allowedValues.includes(value)) {
    issues.push(`${rule.description} (current: ${value})`);
  }

  // Check for placeholder values
  if (value.includes('your_') || value.includes('_here') || value === 'your-secure-key-here') {
    issues.push('Contains placeholder value - replace with actual value');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

function checkEnvironmentVariables(environment) {
  const config = requiredVariables[environment] || requiredVariables.development;
  const results = {
    critical: { missing: [], invalid: [], valid: [] },
    important: { missing: [], invalid: [], valid: [] },
    optional: { missing: [], invalid: [], valid: [] }
  };

  ['critical', 'important', 'optional'].forEach(priority => {
    config[priority].forEach(key => {
      const value = process.env[key];

      if (!value) {
        results[priority].missing.push(key);
      } else {
        const validation = validateVariable(key, value, environment);
        if (validation.isValid) {
          results[priority].valid.push(key);
        } else {
          results[priority].invalid.push({ key, issues: validation.issues });
        }
      }
    });
  });

  return results;
}

function displayResults(results, environment) {
  console.log(`${colors.bold}Environment Validation Results for ${environment.toUpperCase()}:${colors.reset}`);
  console.log('');

  let hasErrors = false;
  let hasWarnings = false;

  // Critical Variables
  console.log(`${colors.bold}${colors.red}🔴 CRITICAL Variables:${colors.reset}`);
  if (results.critical.valid.length > 0) {
    console.log(`${colors.green}  ✅ Valid (${results.critical.valid.length}): ${results.critical.valid.join(', ')}${colors.reset}`);
  }
  if (results.critical.missing.length > 0) {
    console.log(`${colors.red}  ❌ Missing (${results.critical.missing.length}): ${results.critical.missing.join(', ')}${colors.reset}`);
    hasErrors = true;
  }
  if (results.critical.invalid.length > 0) {
    console.log(`${colors.red}  ⚠️  Invalid (${results.critical.invalid.length}):${colors.reset}`);
    results.critical.invalid.forEach(item => {
      console.log(`${colors.red}     ${item.key}: ${item.issues.join(', ')}${colors.reset}`);
    });
    hasErrors = true;
  }
  console.log('');

  // Important Variables
  console.log(`${colors.bold}${colors.yellow}🟡 IMPORTANT Variables:${colors.reset}`);
  if (results.important.valid.length > 0) {
    console.log(`${colors.green}  ✅ Valid (${results.important.valid.length}): ${results.important.valid.join(', ')}${colors.reset}`);
  }
  if (results.important.missing.length > 0) {
    console.log(`${colors.yellow}  ⚠️  Missing (${results.important.missing.length}): ${results.important.missing.join(', ')}${colors.reset}`);
    hasWarnings = true;
  }
  if (results.important.invalid.length > 0) {
    console.log(`${colors.yellow}  ⚠️  Invalid (${results.important.invalid.length}):${colors.reset}`);
    results.important.invalid.forEach(item => {
      console.log(`${colors.yellow}     ${item.key}: ${item.issues.join(', ')}${colors.reset}`);
    });
    hasWarnings = true;
  }
  console.log('');

  // Optional Variables
  console.log(`${colors.bold}${colors.blue}🔵 OPTIONAL Variables:${colors.reset}`);
  if (results.optional.valid.length > 0) {
    console.log(`${colors.green}  ✅ Valid (${results.optional.valid.length}): ${results.optional.valid.join(', ')}${colors.reset}`);
  }
  if (results.optional.missing.length > 0) {
    console.log(`${colors.cyan}  ℹ️  Missing (${results.optional.missing.length}): ${results.optional.missing.join(', ')}${colors.reset}`);
  }
  if (results.optional.invalid.length > 0) {
    console.log(`${colors.blue}  ⚠️  Invalid (${results.optional.invalid.length}):${colors.reset}`);
    results.optional.invalid.forEach(item => {
      console.log(`${colors.blue}     ${item.key}: ${item.issues.join(', ')}${colors.reset}`);
    });
  }
  console.log('');

  return { hasErrors, hasWarnings };
}

function displayRecommendations(environment) {
  console.log(`${colors.bold}${colors.cyan}💡 RECOMMENDATIONS:${colors.reset}`);
  console.log('');

  if (environment === 'production') {
    console.log(`${colors.yellow}🚀 Production Environment Detected:${colors.reset}`);
    console.log('  • Ensure all secrets are stored in secure CI/CD environment variables');
    console.log('  • Verify Stripe keys are LIVE keys (sk_live_, pk_live_)');
    console.log('  • Disable debug mode and console logging');
    console.log('  • Enable rate limiting and security headers');
    console.log('  • Verify SSL/TLS certificates are valid');
    console.log('');
  }

  console.log(`${colors.cyan}🔐 Security Best Practices:${colors.reset}`);
  console.log('  • Use the key generator: node scripts/generate-secure-keys.js');
  console.log('  • Never commit .env files to version control');
  console.log('  • Use different keys for each environment');
  console.log('  • Rotate keys regularly (monthly for production)');
  console.log('  • Enable 2FA on all service accounts');
  console.log('');

  console.log(`${colors.cyan}🛠️  Fix Missing Variables:${colors.reset}`);
  console.log('  • Copy .env.example to .env');
  console.log('  • Replace placeholder values with real values');
  console.log('  • Check ENVIRONMENT_SETUP.md for detailed instructions');
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  const environment = process.env.NODE_ENV || args[0] || 'development';
  const strictMode = args.includes('--strict');

  displayHeader();

  // Load environment files
  const envFiles = [
    '.env',
    `.env.${environment}`,
    `.env.local`,
    `.env.${environment}.local`
  ];

  console.log(`${colors.bold}Loading environment files:${colors.reset}`);
  envFiles.forEach(file => {
    const loaded = loadEnvironmentFile(file);
    const status = loaded ? '✅' : '❌';
    const filePath = path.resolve(file);
    console.log(`  ${status} ${file} ${loaded ? '' : '(not found)'}`);
  });
  console.log('');

  console.log(`${colors.bold}Detected Environment: ${colors.green}${environment.toUpperCase()}${colors.reset}`);
  console.log('');

  const results = checkEnvironmentVariables(environment);
  const { hasErrors, hasWarnings } = displayResults(results, environment);

  displayRecommendations(environment);

  // Summary
  console.log(`${colors.bold}${'='.repeat(60)}${colors.reset}`);

  if (hasErrors) {
    console.log(`${colors.red}${colors.bold}❌ VALIDATION FAILED${colors.reset}`);
    console.log(`${colors.red}Critical issues found. Application may not work correctly.${colors.reset}`);
    if (!process.env.CI) {
      console.log(`${colors.cyan}Run with --fix to get automatic fixes where possible.${colors.reset}`);
    }
    process.exit(1);
  } else if (hasWarnings && strictMode) {
    console.log(`${colors.yellow}${colors.bold}⚠️  VALIDATION WARNING${colors.reset}`);
    console.log(`${colors.yellow}Important variables missing. Some features may not work.${colors.reset}`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`${colors.yellow}${colors.bold}⚠️  VALIDATION WARNING${colors.reset}`);
    console.log(`${colors.yellow}Important variables missing, but continuing...${colors.reset}`);
  } else {
    console.log(`${colors.green}${colors.bold}✅ VALIDATION PASSED${colors.reset}`);
    console.log(`${colors.green}All required environment variables are properly configured!${colors.reset}`);
  }
}

// Handle command line help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`${colors.bold}🔍 DAMP Smart Drinkware - Environment Validator${colors.reset}`);
  console.log('');
  console.log(`${colors.bold}Usage:${colors.reset}`);
  console.log('  node scripts/validate-environment.js [environment] [options]');
  console.log('');
  console.log(`${colors.bold}Environments:${colors.reset}`);
  console.log('  development (default)');
  console.log('  staging');
  console.log('  production');
  console.log('  test');
  console.log('');
  console.log(`${colors.bold}Options:${colors.reset}`);
  console.log('  --strict  Fail on warnings (useful for CI/CD)');
  console.log('  --help    Show this help message');
  console.log('');
  console.log(`${colors.bold}Examples:${colors.reset}`);
  console.log('  node scripts/validate-environment.js development');
  console.log('  node scripts/validate-environment.js production --strict');
  console.log('');
  process.exit(0);
}

// Run the validator
main();