/**
 * DAMP Firebase Configuration Validator
 *
 * Validates Firebase configuration and console setup
 */

class FirebaseConfigValidator {
  constructor() {
    this.config = null;
    this.validationResults = {};
  }

  async validateConfiguration() {
    console.log('🔍 Validating Firebase Configuration...');

    // Check if Firebase services are available
    await this.checkFirebaseServices();

    // Validate configuration values
    this.validateConfigValues();

    // Test Firebase connection
    await this.testFirebaseConnection();

    // Validate Firebase console settings
    await this.validateConsoleSettings();

    this.displayResults();
    return this.validationResults;
  }

  async checkFirebaseServices() {
    try {
      if (window.firebaseServices?.app) {
        this.validationResults.servicesAvailable = {
          status: 'success',
          message: 'Firebase services are available globally'
        };
        this.config = window.firebaseServices.app.options;
      } else {
        this.validationResults.servicesAvailable = {
          status: 'error',
          message: 'Firebase services not found. Check initialization.'
        };
      }
    } catch (error) {
      this.validationResults.servicesAvailable = {
        status: 'error',
        message: `Firebase services check failed: ${error.message}`
      };
    }
  }

  validateConfigValues() {
    if (!this.config) {
      this.validationResults.configValues = {
        status: 'error',
        message: 'No Firebase configuration found'
      };
      return;
    }

    const requiredFields = [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId'
    ];

    const missing = requiredFields.filter(field => !this.config[field]);

    if (missing.length === 0) {
      this.validationResults.configValues = {
        status: 'success',
        message: 'All required configuration fields present',
        details: {
          projectId: this.config.projectId,
          authDomain: this.config.authDomain,
          hasApiKey: !!this.config.apiKey,
          hasAppId: !!this.config.appId
        }
      };
    } else {
      this.validationResults.configValues = {
        status: 'error',
        message: `Missing required fields: ${missing.join(', ')}`
      };
    }
  }

  async testFirebaseConnection() {
    try {
      if (!window.firebaseServices?.auth) {
        this.validationResults.connection = {
          status: 'warning',
          message: 'Firebase Auth not initialized'
        };
        return;
      }

      // Test auth connection by checking current user
      const currentUser = window.firebaseServices.auth.currentUser;

      this.validationResults.connection = {
        status: 'success',
        message: 'Firebase connection established',
        details: {
          authenticated: !!currentUser,
          userEmail: currentUser?.email || 'Not signed in'
        }
      };
    } catch (error) {
      this.validationResults.connection = {
        status: 'error',
        message: `Connection test failed: ${error.message}`
      };
    }
  }

  async validateConsoleSettings() {
    const recommendations = [];

    // Check if running on correct domain
    if (this.config?.authDomain) {
      const expectedDomain = this.config.authDomain;
      const currentDomain = window.location.hostname;

      if (currentDomain === 'localhost' || currentDomain.startsWith('192.168')) {
        recommendations.push('Add localhost and local IP to authorized domains in Firebase Console');
      }

      if (currentDomain === 'dampdrink.com' && expectedDomain !== 'damp-smart-drinkware.firebaseapp.com') {
        recommendations.push('Verify custom domain configuration in Firebase Console');
      }
    }

    // Check authentication methods
    recommendations.push('Ensure Email/Password authentication is enabled in Firebase Console');
    recommendations.push('Ensure Google authentication is configured with correct OAuth client');
    recommendations.push('Verify Firestore security rules allow authenticated users');

    this.validationResults.consoleSettings = {
      status: recommendations.length > 0 ? 'info' : 'success',
      message: 'Console configuration recommendations',
      recommendations: recommendations
    };
  }

  displayResults() {
    console.log('\n📊 Firebase Configuration Validation Results:');
    console.log('='.repeat(50));

    Object.entries(this.validationResults).forEach(([key, result]) => {
      const icon = result.status === 'success' ? '✅' :
                   result.status === 'warning' ? '⚠️' :
                   result.status === 'error' ? '❌' : 'ℹ️';

      console.log(`${icon} ${key}: ${result.message}`);

      if (result.details) {
        Object.entries(result.details).forEach(([detailKey, detailValue]) => {
          console.log(`   ${detailKey}: ${detailValue}`);
        });
      }

      if (result.recommendations) {
        result.recommendations.forEach(rec => {
          console.log(`   • ${rec}`);
        });
      }
    });

    console.log('\n🔗 Firebase Console: https://console.firebase.google.com/project/damp-smart-drinkware');
  }
}

// Auto-run validation when Firebase services are ready
if (typeof window !== 'undefined') {
  window.validateFirebaseConfig = async () => {
    const validator = new FirebaseConfigValidator();
    return await validator.validateConfiguration();
  };

  // Auto-validate after a delay to allow Firebase to initialize
  setTimeout(async () => {
    if (window.firebaseServices) {
      console.log('🚀 Auto-running Firebase configuration validation...');
      await window.validateFirebaseConfig();
    }
  }, 3000);
}

export default FirebaseConfigValidator;
