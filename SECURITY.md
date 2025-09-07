# DAMP Smart Drinkware - Security Guide

## 🔒 Security Overview

This document outlines the security practices and procedures for the DAMP Smart Drinkware project to prevent secrets from being exposed and maintain secure development practices.

## 🚨 IMMEDIATE ACTIONS REQUIRED

### Critical Security Issue Found
- **Firebase API Key Exposed**: `AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w` was found hardcoded in multiple files
- **Action Required**: This key must be rotated immediately in the Firebase Console

### Steps to Rotate Firebase Key:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `damp-smart-drinkware`
3. Go to Project Settings > General > Your apps
4. Under "Web API Key", click "Regenerate"
5. Update your `.env` files with the new key
6. **DO NOT** commit the new key to the repository

## 🛡️ Secret Management System

### Environment Variables Structure

#### Client-Safe Variables (Safe for browser/mobile app):
```bash
# Firebase Configuration
FIREBASE_API_KEY=your_new_firebase_api_key
FIREBASE_AUTH_DOMAIN=damp-smart-drinkware.firebaseapp.com
FIREBASE_PROJECT_ID=damp-smart-drinkware
FIREBASE_STORAGE_BUCKET=damp-smart-drinkware.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=309818614427
FIREBASE_APP_ID=1:309818614427:web:db15a4851c05e58aa25c3e
FIREBASE_MEASUREMENT_ID=G-YW2BN4SVPQ

# Stripe Public Keys (Safe for client-side)
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

#### Server-Only Variables (NEVER expose to client):
```bash
# Stripe Secret Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database
DATABASE_URL=your_database_connection_string

# API Keys
EMAIL_SERVICE_API_KEY=your_email_api_key
ADMIN_KEY=your_secure_admin_key

# Security
CORS_ORIGINS=https://dampdrink.com,https://www.dampdrink.com
```

### File Structure for Environment Variables

```
# Development
.env                    # Local development (gitignored)
.env.local             # Local overrides (gitignored)
.env.example           # Template file (committed)

# Production
.env.production        # Production values (gitignored)
backend/config-template.env  # Backend template (committed)
```

## 🔧 Security Tools Setup

### 1. Install Security Dependencies
```bash
npm run install-security
```

### 2. Setup Pre-commit Hooks
```bash
npm run setup-hooks
```

### 3. Run Security Scans
```bash
# Scan entire repository for secrets
npm run scan-secrets

# Scan only staged files (used by pre-commit hook)
npm run scan-secrets-staged

# Validate environment setup
npm run validate-env

# Complete security check
npm run security-check
```

## 🚀 Secure Build Process

### Development Build
```bash
# Validate environment and build with secure injection
node scripts/build-with-env.js build
```

### Production Deployment
```bash
NODE_ENV=production npm run security-check
NODE_ENV=production node scripts/build-with-env.js build
```

## 📋 Security Checklist

### Before Every Commit:
- [ ] No hardcoded secrets in source code
- [ ] All secrets are in `.env` files (which are .gitignored)
- [ ] Pre-commit hooks are passing
- [ ] Environment variables are properly categorized (client-safe vs server-only)

### Before Every Deploy:
- [ ] Environment validation passes
- [ ] All production secrets are rotated and secure
- [ ] No test keys in production environment
- [ ] CORS origins are properly configured
- [ ] Security scan shows no issues

### Monthly Security Review:
- [ ] Rotate all API keys and secrets
- [ ] Review access logs for unusual activity
- [ ] Update security dependencies
- [ ] Audit environment variable usage

## 🔍 Secret Detection Patterns

The security system detects these patterns:

### High-Risk Patterns:
- Firebase API Keys: `AIza[0-9A-Za-z-_]{35}`
- AWS Access Keys: `AKIA[0-9A-Z]{16}`
- Stripe Secret Keys: `sk_(test|live)_[0-9a-zA-Z]{24,}`
- Database URLs with credentials: `mongodb://user:pass@`

### Allowed Patterns (Placeholders):
- `your_*_key_here`
- `placeholder`
- `example`
- Template files and documentation

## 🚨 Incident Response

### If Secrets Are Accidentally Committed:

1. **Immediately rotate the exposed secrets**
2. **Remove from git history**:
   ```bash
   # Remove from all commits (DESTRUCTIVE)
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch path/to/file-with-secret' \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push to remove from remote**:
   ```bash
   git push origin --force --all
   ```
4. **Notify team members to re-clone repository**
5. **Document the incident and improve preventive measures**

### If Secrets Are Found in Production Logs:
1. **Immediately rotate the exposed secrets**
2. **Update logging configuration to prevent future exposure**
3. **Audit access logs for potential misuse**
4. **Update monitoring alerts**

## 🔒 Best Practices

### Development:
- Use `.env` files for all secrets
- Never hardcode secrets in source code
- Use placeholder values in committed code
- Regularly run security scans
- Keep secrets management tools updated

### Production:
- Use environment-specific secret management (AWS Secrets Manager, Azure Key Vault, etc.)
- Implement secret rotation schedules
- Monitor secret access and usage
- Use least-privilege access principles
- Audit secret access regularly

### Team Guidelines:
- All team members must set up pre-commit hooks
- Security scans must pass before code review
- Environment variables must be documented
- Security incidents must be reported immediately
- Regular security training and awareness

## 📞 Security Contacts

- **Security Issues**: [Report security issues immediately]
- **Emergency Rotation**: [Emergency contact for secret rotation]
- **Security Team**: [Team responsible for security oversight]

## 📚 Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Git Secrets Prevention](https://git-secret.io/)

---

**Remember: Security is everyone's responsibility. When in doubt, ask the security team!**