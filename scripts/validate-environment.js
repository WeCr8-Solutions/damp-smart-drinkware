#!/usr/bin/env node

/**
 * DAMP Smart Drinkware - Environment Validation
 * Ensures all required environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for different environments
const ENV_REQUIREMENTS = {
  development: [
    'NODE_ENV',
    'PORT',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID'
  ],
  production: [
    'NODE_ENV',
    'PORT',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID',
    'CORS_ORIGINS'
  ]
};

// Patterns that indicate insecure values
const INSECURE_PATTERNS = [
  /your_.*_here/i,
  /placeholder/i,
  /example/i,
  /test_key_replace/i,
];

function validateEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const requiredVars = ENV_REQUIREMENTS[nodeEnv] || ENV_REQUIREMENTS.development;
  
  console.log(`🔧 Validating environment for: ${nodeEnv}\n`);
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check for required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    
    if (!value) {
      console.log(`❌ Missing required environment variable: ${varName}`);
      hasErrors = true;
      continue;
    }
    
    // Check for placeholder values
    if (INSECURE_PATTERNS.some(pattern => pattern.test(value))) {
      console.log(`⚠️  Environment variable ${varName} appears to contain a placeholder value`);
      hasWarnings = true;
      continue;
    }
    
    // Specific validations
    if (varName.includes('STRIPE') && nodeEnv === 'production' && value.startsWith('sk_test_')) {
      console.log(`⚠️  Using test Stripe key in production: ${varName}`);
      hasWarnings = true;
    }
    
    if (varName.includes('FIREBASE_API_KEY') && value === 'AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w') {
      console.log(`🚨 CRITICAL: Firebase API key appears to be the exposed key from your codebase!`);
      console.log(`   This key needs to be rotated immediately!`);
      hasErrors = true;
    }
    
    console.log(`✅ ${varName}: Set and appears valid`);
  }
  
  // Check for .env file presence
  const envFiles = ['.env', '.env.local', `.env.${nodeEnv}`, `.env.${nodeEnv}.local`];
  const existingEnvFiles = envFiles.filter(file => fs.existsSync(file));
  
  if (existingEnvFiles.length === 0) {
    console.log(`\n⚠️  No .env files found. Create one of: ${envFiles.join(', ')}`);
    hasWarnings = true;
  } else {
    console.log(`\n📁 Found environment files: ${existingEnvFiles.join(', ')}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('🚨 Environment validation FAILED - Fix errors before deploying');
    return false;
  } else if (hasWarnings) {
    console.log('⚠️  Environment validation passed with warnings');
    return true;
  } else {
    console.log('✅ Environment validation passed');
    return true;
  }
}

function createEnvTemplate() {
  const templatePath = path.join(process.cwd(), '.env.example');
  
  if (fs.existsSync(templatePath)) {
    console.log('📝 .env.example already exists');
    return;
  }
  
  const template = `# DAMP Smart Drinkware - Environment Variables
# Copy this file to .env and fill in your actual values
# NEVER commit .env files to your repository!

# Application
NODE_ENV=development
PORT=3000

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Firebase (get from Firebase Console > Project Settings)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789000
FIREBASE_APP_ID=1:123456789000:web:abcdef123456

# Database (if using)
DATABASE_URL=your_database_url_here

# Email Service
EMAIL_SERVICE_API_KEY=your_email_service_api_key_here
EMAIL_FROM_ADDRESS=support@dampdrink.com

# Security
ADMIN_KEY=your-secure-admin-key-here
CORS_ORIGINS=https://dampdrink.com,https://www.dampdrink.com

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
`;

  fs.writeFileSync(templatePath, template);
  console.log('📝 Created .env.example template');
}

// Main execution
if (require.main === module) {
  createEnvTemplate();
  const isValid = validateEnvironment();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateEnvironment, createEnvTemplate }; 