/**
 * Firebase Initialization Manager
 * Ensures proper loading and initialization order
 *
 * @fileoverview Manages Firebase initialization and service availability
 * @author WeCr8 Solutions LLC
 * @version 1.0.0
 */

class FirebaseInitManager {
    constructor() {
        this.initialized = false;
        this.services = {};
        this.loadCallbacks = [];
        this.init();
    }

    async init() {
        try {
            console.log('🔄 Initializing Firebase services...');

            // Initialize Firebase from firebase-services.js
            const firebaseModule = await import('./firebase-services.js');
            const firebase = await firebaseModule.initializeFirebase();

            if (!firebase) {
                throw new Error('Firebase initialization failed');
            }

            // Import auth service
            const { default: DAMPAuthService } = await import('./auth-service.js');

            // Create auth service instance
            this.services.authService = new DAMPAuthService(
                firebase.auth,
                firebase.db,
                firebase.analytics
            );

            // Store services globally for backward compatibility
            window.firebaseServices = this.services;
            window.firebase = firebase;

            this.initialized = true;

            console.log('✅ Firebase services initialized successfully');
            console.log('✅ Auth service available at window.firebaseServices.authService');

            // Notify all waiting callbacks
            this.loadCallbacks.forEach(callback => callback(this.services));
            this.loadCallbacks = [];

            return this.services;

        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            throw error;
        }
    }

    /**
     * Wait for Firebase to be ready
     */
    whenReady(callback) {
        if (this.initialized) {
            callback(this.services);
        } else {
            this.loadCallbacks.push(callback);
        }
    }

    /**
     * Get auth service
     */
    getAuthService() {
        return this.services.authService;
    }

    /**
     * Check if Firebase is ready
     */
    isReady() {
        return this.initialized;
    }
}

// Create singleton instance
const firebaseManager = new FirebaseInitManager();

// Export for use in other modules
export default firebaseManager;

// Make available globally
window.firebaseManager = firebaseManager;

