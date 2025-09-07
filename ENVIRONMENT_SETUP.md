# 🔒 DAMP Smart Drinkware - Environment Variables Setup Guide

## 🚨 **CRITICAL SECURITY NOTICE**

Your current `.env` files contain **REAL SENSITIVE DATA** that could compromise your application security if accidentally committed to Git. This guide will help you secure your environment configuration for production use.

## 🔍 **Current Security Issues Identified**

### ❌ **Immediate Issues Found:**
1. **Firebase API Key Exposed** - Real API key found in `.env` file
2. **JWT Secrets in Version Control** - Sensitive security keys detected
3. **Production Secrets at Risk** - `.env.production` contains production configuration
4. **Multiple Unsecured `.env` Files** - Found in various project directories

### ✅ **Actions Taken:**
1. **Updated `.gitignore`** - Now properly excludes sensitive `.env` files
2. **Protected Environment Templates** - `.env.example` files can now be safely committed

## 📋 **Environment Files Structure**

### **Root Directory**
```
.env                    # ❌ NEVER COMMIT - Local development
.env.local             # ❌ NEVER COMMIT - Local overrides
.env.development       # ❌ NEVER COMMIT - Development environment
.env.staging           # ❌ NEVER COMMIT - Staging environment
.env.production        # ❌ NEVER COMMIT - Production environment
.env.example           # ✅ SAFE TO COMMIT - Template for developers
```

### **Backend Directory**
```
backend/.env           # ❌ NEVER COMMIT - Backend API secrets
backend/.env.example   # ✅ SAFE TO COMMIT - Backend template
```

### **Mobile App Directory**
```
mobile-app/Original DAMP Smart Drinkware App/.env  # ❌ NEVER COMMIT
mobile-app/app/.env                                 # ❌ NEVER COMMIT
```

## 🛠️ **Immediate Action Required**

### 1. **Secure Your Current `.env` Files**

```bash
# Create backup of current files (DO NOT COMMIT THESE)
cp .env .env.backup
cp .env.production .env.production.backup
cp backend/.env backend/.env.backup

# Remove sensitive data from version control history if needed
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' HEAD
```

### 2. **Create Safe Environment Templates**

Create these template files (safe to commit):

**`.env.example`** (Root directory):
```bash
# 🔒 DAMP Smart Drinkware - Environment Template
# Copy this to .env and replace all values

# 🔥 Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=damp-smart-drinkware.firebaseapp.com
VITE_FIREBASE_AUTH_DOMAIN=damp-smart-drinkware.firebaseapp.com
FIREBASE_PROJECT_ID=damp-smart-drinkware
VITE_FIREBASE_PROJECT_ID=damp-smart-drinkware
FIREBASE_STORAGE_BUCKET=damp-smart-drinkware.firebasestorage.app
VITE_FIREBASE_STORAGE_BUCKET=damp-smart-drinkware.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
FIREBASE_MEASUREMENT_ID=your_measurement_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# 💳 Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# 🔐 Security Keys (Generate with crypto.randomBytes)
JWT_SECRET=your_32_char_minimum_secret_here
ENCRYPTION_KEY=your_32_char_minimum_key_here
API_SECRET_KEY=your_32_char_minimum_api_key_here
ADMIN_KEY=your_32_char_minimum_admin_key_here

# 🌐 Application Configuration
VITE_APP_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3001
NODE_ENV=development
PORT=3000
```

### 3. **Generate Secure Keys**

Use this Node.js script to generate secure random keys:

```javascript
// generate-keys.js
const crypto = require('crypto');

console.log('🔐 Secure Key Generator for DAMP Smart Drinkware');
console.log('Copy these to your .env file (NEVER commit the .env file!)');
console.log('');
console.log(`JWT_SECRET=${crypto.randomBytes(32).toString('hex')}`);
console.log(`ENCRYPTION_KEY=${crypto.randomBytes(32).toString('hex')}`);
console.log(`API_SECRET_KEY=${crypto.randomBytes(32).toString('hex')}`);
console.log(`ADMIN_KEY=${crypto.randomBytes(32).toString('hex')}`);
console.log('');
console.log('🚨 IMPORTANT: Use different keys for development, staging, and production!');
```

Run with: `node generate-keys.js`

## 🏗️ **Environment-Specific Configuration**

### **Development Environment** (`.env`)
```bash
NODE_ENV=development
PORT=3000
VITE_APP_ENVIRONMENT=development

# Use TEST Stripe keys
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Development-specific settings
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_CONSOLE_LOGS=true
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=false
```

### **Staging Environment** (`.env.staging`)
```bash
NODE_ENV=staging
PORT=3000
VITE_APP_ENVIRONMENT=staging

# Use TEST Stripe keys
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Staging-specific settings
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_CONSOLE_LOGS=false
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
```

### **Production Environment** (`.env.production`)
```bash
NODE_ENV=production
PORT=443
VITE_APP_ENVIRONMENT=production

# Use LIVE Stripe keys
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Production-specific settings
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_CONSOLE_LOGS=false
GENERATE_SOURCEMAP=false
LOG_LEVEL=error
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=50
```

## 🚀 **Deployment Best Practices**

### **1. Use CI/CD Environment Variables**

Instead of `.env.production` files, use your deployment platform's environment variables:

**GitHub Actions:**
```yaml
env:
  FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

**Vercel:**
```bash
vercel env add FIREBASE_API_KEY production
vercel env add STRIPE_SECRET_KEY production
```

**Netlify:**
```bash
netlify env:set FIREBASE_API_KEY "your-key" --context production
netlify env:set STRIPE_SECRET_KEY "your-key" --context production
```

### **2. Environment Validation**

Create `scripts/validate-env.js`:
```javascript
const requiredVars = [
  'FIREBASE_API_KEY',
  'STRIPE_SECRET_KEY',
  'JWT_SECRET',
  'ADMIN_KEY'
];

function validateEnvironment() {
  const missing = requiredVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
}

validateEnvironment();
```

Add to package.json:
```json
{
  "scripts": {
    "validate-env": "node scripts/validate-env.js",
    "start": "npm run validate-env && your-start-command"
  }
}
```

## 🔐 **Security Checklist**

### ✅ **Before Committing:**
- [ ] All `.env` files are in `.gitignore`
- [ ] No real API keys in any committed files
- [ ] All secrets use placeholder values in templates
- [ ] Generated secure random keys (32+ characters)
- [ ] Different keys for each environment

### ✅ **Before Deploying:**
- [ ] Production uses live Stripe keys (`sk_live_`, `pk_live_`)
- [ ] Firebase security rules are properly configured
- [ ] Rate limiting is enabled and configured
- [ ] Debug mode and console logs are disabled
- [ ] All monitoring and alerting is set up
- [ ] SSL/TLS certificates are valid

### ✅ **Ongoing Security:**
- [ ] Rotate API keys monthly
- [ ] Monitor for unauthorized access
- [ ] Use secrets management systems (AWS Secrets Manager, etc.)
- [ ] Enable 2FA on all service accounts
- [ ] Regular security audits

## 🆘 **Emergency Response**

If your environment variables were accidentally committed:

### **1. Immediate Action**
```bash
# Remove from current commit
git rm .env
git commit -m "Remove accidentally committed .env file"

# Remove from Git history
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' HEAD

# Force push (⚠️ DANGEROUS - coordinate with team)
git push --force-with-lease
```

### **2. Rotate All Compromised Keys**
- [ ] Generate new Firebase API keys
- [ ] Generate new Stripe keys
- [ ] Generate new JWT secrets
- [ ] Generate new admin keys
- [ ] Update all deployment environments
- [ ] Monitor for unauthorized access

## 📚 **Additional Resources**

- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Stripe API Security](https://stripe.com/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Environment Variables Security](https://owasp.org/www-project-cheat-sheets/cheatsheets/Environment_Variable_Security_Cheat_Sheet.html)

---

## 🚨 **REMEMBER: NEVER commit real secrets to version control!**

This setup guide ensures your DAMP Smart Drinkware application environment is secure and production-ready while maintaining developer experience with proper templates and documentation.