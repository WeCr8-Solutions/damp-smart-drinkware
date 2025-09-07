/**
 * Environment Configuration Injector
 * Injects client-safe environment variables into window object
 */

// Client-safe environment variables
// These are safe to expose to the client-side
window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w",
    authDomain: "damp-smart-drinkware.firebaseapp.com",
    projectId: "damp-smart-drinkware",
    storageBucket: "damp-smart-drinkware.firebasestorage.app",
    messagingSenderId: "309818614427",
    appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
    measurementId: "G-YW2BN4SVPQ",
    databaseURL: "https://damp-smart-drinkware-default-rtdb.firebaseio.com"
};

// Additional DAMP configuration for compatibility
window.DAMP_CONFIG = {
    firebase: window.FIREBASE_CONFIG,
    app: {
        name: "DAMP Smart Drinkware",
        version: "1.0.0",
        environment: "development"
    },
    features: {
        voting: true,
        customerVoting: true,
        publicVoting: true,
        analytics: true
    },
    analytics: {
        gaId: "G-YW2BN4SVPQ"
    },
    adsense: {
        clientId: "ca-pub-3639153716376265",
        enabled: true,
        autoAds: true,
        testMode: false,
        adFormats: {
            banner: "728x90",
            rectangle: "300x250",
            mobile: "320x50",
            responsive: "auto"
        },
        placements: {
            homepage: ["after-hero", "between-features", "before-testimonials"],
            productPages: ["after-specifications", "before-cta"],
            contentPages: ["mid-content", "before-footer"],
            ecommerce: ["cart-sidebar", "success-celebration"]
        }
    }
};

// Debug logging
console.log('🌐 Environment configuration loaded:', {
    hasFirebaseConfig: !!window.FIREBASE_CONFIG,
    hasFirebaseApiKey: !!window.FIREBASE_CONFIG?.apiKey,
    projectId: window.FIREBASE_CONFIG?.projectId,
    environment: window.DAMP_CONFIG?.app?.environment
});

// Validate Firebase configuration
if (window.FIREBASE_CONFIG?.apiKey && !window.FIREBASE_CONFIG.apiKey.includes('your_')) {
    console.log('✅ Firebase API key configured - voting system will use Firebase');
} else {
    console.warn('⚠️ Firebase API key not properly configured - voting system will use fallback mode');
}