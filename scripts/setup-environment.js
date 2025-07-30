#!/usr/bin/env node

/**
 * DAMP Smart Drinkware - Environment Setup Script
 * Helps users configure their environment variables securely
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EnvironmentSetup {
    constructor() {
        this.rootDir = process.cwd();
        this.envPath = path.join(this.rootDir, '.env');
        this.examplePath = path.join(this.rootDir, '.env.example');
        this.productionPath = path.join(this.rootDir, '.env.production');
    }

    run() {
        console.log('🚀 DAMP Smart Drinkware - Environment Setup');
        console.log('==========================================\n');

        // Check if .env already exists
        if (fs.existsSync(this.envPath)) {
            console.log('📄 Existing .env file found');
            this.analyzeExistingEnv();
        } else {
            console.log('📝 Creating new .env file from template');
            this.createEnvFromTemplate();
        }

        // Generate secure keys
        this.generateSecureKeys();

        // Validate configuration
        this.validateConfiguration();

        // Show next steps
        this.showNextSteps();
    }

    analyzeExistingEnv() {
        console.log('\n🔍 Analyzing existing environment configuration...\n');

        const envContent = fs.readFileSync(this.envPath, 'utf-8');
        const lines = envContent.split('\n');
        
        const issues = [];
        const warnings = [];
        const configured = [];

        // Key patterns to check
        const criticalKeys = [
            'FIREBASE_API_KEY',
            'STRIPE_SECRET_KEY',
            'STRIPE_PUBLISHABLE_KEY'
        ];

        const securityKeys = [
            'JWT_SECRET',
            'ADMIN_KEY',
            'API_SECRET_KEY'
        ];

        lines.forEach(line => {
            if (line.includes('=') && !line.startsWith('#')) {
                const [key, value] = line.split('=');
                
                if (criticalKeys.includes(key.trim())) {
                    if (value && !value.includes('your_') && !value.includes('_here')) {
                        configured.push(`✅ ${key}: Configured`);
                    } else {
                        issues.push(`❌ ${key}: Not configured (placeholder value)`);
                    }
                }

                if (securityKeys.includes(key.trim())) {
                    if (value && value.length >= 32 && !value.includes('your_')) {
                        configured.push(`✅ ${key}: Strong key configured`);
                    } else if (value && !value.includes('your_')) {
                        warnings.push(`⚠️  ${key}: Key too short (minimum 32 characters recommended)`);
                    } else {
                        issues.push(`❌ ${key}: Not configured (placeholder value)`);
                    }
                }
            }
        });

        // Display results
        if (configured.length > 0) {
            console.log('✅ Configured:');
            configured.forEach(item => console.log(`   ${item}`));
            console.log();
        }

        if (warnings.length > 0) {
            console.log('⚠️  Warnings:');
            warnings.forEach(item => console.log(`   ${item}`));
            console.log();
        }

        if (issues.length > 0) {
            console.log('❌ Issues found:');
            issues.forEach(item => console.log(`   ${item}`));
            console.log();
        }
    }

    createEnvFromTemplate() {
        if (!fs.existsSync(this.examplePath)) {
            console.error('❌ .env.example file not found!');
            process.exit(1);
        }

        // Copy template to .env
        const templateContent = fs.readFileSync(this.examplePath, 'utf-8');
        fs.writeFileSync(this.envPath, templateContent);
        
        console.log('✅ Created .env file from template');
    }

    generateSecureKeys() {
        console.log('\n🔐 Generating secure keys...\n');

        const envContent = fs.readFileSync(this.envPath, 'utf-8');
        let updatedContent = envContent;

        // Keys to generate
        const keysToGenerate = [
            { key: 'JWT_SECRET', length: 64 },
            { key: 'ADMIN_KEY', length: 64 },
            { key: 'API_SECRET_KEY', length: 64 },
            { key: 'ENCRYPTION_KEY', length: 64 }
        ];

        keysToGenerate.forEach(({ key, length }) => {
            const pattern = new RegExp(`${key}=your_.*_here.*`, 'g');
            if (pattern.test(updatedContent)) {
                const secureKey = this.generateSecureKey(length);
                updatedContent = updatedContent.replace(pattern, `${key}=${secureKey}`);
                console.log(`✅ Generated secure ${key} (${length} characters)`);
            } else {
                console.log(`ℹ️  ${key} already configured, skipping generation`);
            }
        });

        // Write updated content
        fs.writeFileSync(this.envPath, updatedContent);
    }

    generateSecureKey(length = 64) {
        return crypto.randomBytes(length).toString('hex').substring(0, length);
    }

    validateConfiguration() {
        console.log('\n🔍 Validating configuration...\n');

        const envContent = fs.readFileSync(this.envPath, 'utf-8');
        const config = this.parseEnvFile(envContent);

        // Validation checks
        const checks = [
            {
                name: 'Firebase API Key',
                check: () => config.FIREBASE_API_KEY && !config.FIREBASE_API_KEY.includes('your_'),
                message: 'Set your Firebase API key from Firebase Console'
            },
            {
                name: 'Stripe Keys',
                check: () => config.STRIPE_SECRET_KEY && config.STRIPE_PUBLISHABLE_KEY && 
                           !config.STRIPE_SECRET_KEY.includes('your_') && 
                           !config.STRIPE_PUBLISHABLE_KEY.includes('your_'),
                message: 'Set your Stripe keys from Stripe Dashboard'
            },
            {
                name: 'Security Keys',
                check: () => config.JWT_SECRET && config.JWT_SECRET.length >= 32,
                message: 'Security keys should be at least 32 characters long'
            },
            {
                name: 'Voting System Support',
                check: () => config.VITE_ENABLE_VOTING === 'true',
                message: 'Voting system is enabled in feature flags'
            }
        ];

        checks.forEach(({ name, check, message }) => {
            if (check()) {
                console.log(`✅ ${name}: Valid`);
            } else {
                console.log(`❌ ${name}: ${message}`);
            }
        });
    }

    parseEnvFile(content) {
        const config = {};
        const lines = content.split('\n');
        
        lines.forEach(line => {
            if (line.includes('=') && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                config[key.trim()] = valueParts.join('=').trim();
            }
        });

        return config;
    }

    showNextSteps() {
        console.log('\n🎯 Next Steps:\n');
        
        console.log('1. 🔥 Configure Firebase:');
        console.log('   - Go to https://console.firebase.google.com/');
        console.log('   - Select your "damp-smart-drinkware" project');
        console.log('   - Go to Project Settings > General > Your apps');
        console.log('   - Copy the API key and update FIREBASE_API_KEY in .env');
        console.log();

        console.log('2. 💳 Configure Stripe:');
        console.log('   - Go to https://dashboard.stripe.com/apikeys');
        console.log('   - Copy your publishable key (pk_test_...) to STRIPE_PUBLISHABLE_KEY');
        console.log('   - Copy your secret key (sk_test_...) to STRIPE_SECRET_KEY');
        console.log('   - Set up webhook endpoint and copy secret to STRIPE_WEBHOOK_SECRET');
        console.log();

        console.log('3. 🧪 Test the Voting System:');
        console.log('   - Start your development server');
        console.log('   - Navigate to /website/test-voting-system.html');
        console.log('   - Run the diagnostic tests');
        console.log('   - Test both public and customer voting modes');
        console.log();

        console.log('4. 🚀 For Production:');
        console.log('   - Copy .env.production and configure with LIVE keys');
        console.log('   - Use secure secret management (AWS Secrets Manager, etc.)');
        console.log('   - Enable Firebase security rules');
        console.log('   - Switch Stripe to live mode');
        console.log();

        console.log('📚 Documentation:');
        console.log('   - Voting System: VOTING_SYSTEM_FIX_README.md');
        console.log('   - Security Guide: SECURITY.md');
        console.log('   - Firebase Setup: FIREBASE_SETUP_GUIDE.md');
        console.log();

        console.log('✅ Environment setup complete!');
        console.log('🔐 Remember: Never commit .env files with real secrets to version control');
    }
}

// Run the setup
if (require.main === module) {
    try {
        const setup = new EnvironmentSetup();
        setup.run();
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

module.exports = EnvironmentSetup; 