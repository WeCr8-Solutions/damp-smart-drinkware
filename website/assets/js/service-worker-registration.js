/**
 * DAMP Smart Drinkware - Service Worker Registration
 * Handles registration of both main service worker and Firebase messaging service worker
 */

class ServiceWorkerManager {
    constructor() {
        this.swRegistration = null;
        this.messagingSwRegistration = null;
        this.isSupported = 'serviceWorker' in navigator;
    }

    async initialize() {
        if (!this.isSupported) {
            console.log('Service Workers not supported in this browser');
            return false;
        }

        try {
            // Register main service worker
            await this.registerMainServiceWorker();

            // Register Firebase messaging service worker
            await this.registerMessagingServiceWorker();

            console.log('✅ All service workers registered successfully');
            return true;
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            return false;
        }
    }

    async registerMainServiceWorker() {
        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('✅ Main Service Worker registered with scope:', this.swRegistration.scope);

            // Handle updates
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                console.log('🔄 New Service Worker installing...');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🔄 New Service Worker installed, refresh to activate');
                        // Optionally show update notification to user
                        this.notifyUserOfUpdate();
                    }
                });
            });

            return this.swRegistration;
        } catch (error) {
            console.error('❌ Main Service Worker registration failed:', error);
            throw error;
        }
    }

    async registerMessagingServiceWorker() {
        try {
            // Only register Firebase messaging SW if Firebase is available
            if (typeof window.firebaseServices === 'undefined') {
                console.log('ℹ️ Firebase not available, skipping messaging service worker');
                return null;
            }

            this.messagingSwRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/firebase-cloud-messaging-push-scope'
            });

            console.log('✅ Firebase Messaging Service Worker registered with scope:', this.messagingSwRegistration.scope);
            return this.messagingSwRegistration;
        } catch (error) {
            console.warn('⚠️ Firebase Messaging Service Worker registration failed:', error);
            // Don't throw here as this is optional
            return null;
        }
    }

    notifyUserOfUpdate() {
        // Simple notification - can be enhanced with custom UI
        if (confirm('A new version of the app is available. Refresh to update?')) {
            window.location.reload();
        }
    }

    async unregisterAll() {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            const promises = registrations.map(registration => registration.unregister());
            await Promise.all(promises);
            console.log('✅ All service workers unregistered');
        } catch (error) {
            console.error('❌ Failed to unregister service workers:', error);
        }
    }

    // Get registration status
    getStatus() {
        return {
            supported: this.isSupported,
            mainSW: !!this.swRegistration,
            messagingSW: !!this.messagingSwRegistration,
            active: !!navigator.serviceWorker.controller
        };
    }
}

// Create global instance
window.serviceWorkerManager = new ServiceWorkerManager();

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.serviceWorkerManager.initialize();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceWorkerManager;
}
