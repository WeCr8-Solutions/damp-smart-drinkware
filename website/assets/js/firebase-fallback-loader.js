/**
 * DAMP Smart Drinkware - Firebase Fallback Loader
 * Handles Firebase loading with fallback for module resolution issues
 */

class FirebaseFallbackLoader {
    constructor() {
        this.loadAttempts = 0;
        this.maxAttempts = 3;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    async loadFirebase() {
        if (this.isLoaded) {
            return window.firebaseServices;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this.attemptLoad();
        return this.loadPromise;
    }

    async attemptLoad() {
        console.log('🔄 Loading Firebase services...');

        // Method 1: Try ES6 modules (modern browsers)
        try {
            await this.loadModernFirebase();
            if (window.firebaseServices) {
                this.isLoaded = true;
                console.log('✅ Firebase loaded via ES6 modules');
                return window.firebaseServices;
            }
        } catch (error) {
            console.warn('⚠️ ES6 module loading failed:', error);
        }

        // Method 2: Try compatibility scripts (fallback)
        try {
            await this.loadCompatFirebase();
            if (window.firebaseServices) {
                this.isLoaded = true;
                console.log('✅ Firebase loaded via compatibility scripts');
                return window.firebaseServices;
            }
        } catch (error) {
            console.warn('⚠️ Compatibility script loading failed:', error);
        }

        // Method 3: Mock services (final fallback)
        console.warn('⚠️ Firebase loading failed, using mock services');
        this.createMockServices();
        return window.firebaseServices;
    }

    async loadModernFirebase() {
        // Check if already loaded by firebase-modern-setup.js
        if (window.firebaseServices && window.firebaseServices.authService) {
            return window.firebaseServices;
        }

        // Dynamic import with timeout
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Module load timeout')), 10000)
        );

        const moduleLoad = import('/assets/js/firebase-modern-setup.js');

        await Promise.race([moduleLoad, timeout]);

        // Wait a bit for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!window.firebaseServices) {
            throw new Error('Firebase services not initialized after module load');
        }

        return window.firebaseServices;
    }

    async loadCompatFirebase() {
        return new Promise((resolve, reject) => {
            // Load Firebase SDK via script tags
            const scripts = [
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
            ];

            let loadedScripts = 0;
            const totalScripts = scripts.length;

            scripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    loadedScripts++;
                    if (loadedScripts === totalScripts) {
                        // Initialize Firebase with compat API
                        this.initCompatFirebase();
                        resolve(window.firebaseServices);
                    }
                };
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });

            // Timeout
            setTimeout(() => reject(new Error('Script loading timeout')), 15000);
        });
    }

    initCompatFirebase() {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase compat not available');
        }

        const firebaseConfig = {
            apiKey: "AIzaSyCGXLp2Xm1UtPZmjFBKjQDLNGz8J3tZQxs",
            authDomain: "damp-smart-drinkware.firebaseapp.com",
            projectId: "damp-smart-drinkware",
            storageBucket: "damp-smart-drinkware.firebasestorage.app",
            messagingSenderId: "309818614427",
            appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
            measurementId: "G-YW2BN4SVPQ"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        // Create auth service compatible with modern version
        const authService = {
            currentUser: null,
            listeners: [],

            async signUpWithEmail(email, password, userData = {}) {
                try {
                    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                    const user = userCredential.user;

                    if (userData.displayName) {
                        await user.updateProfile({ displayName: userData.displayName });
                    }

                    if (userData.firstName || userData.lastName) {
                        await db.collection('users').doc(user.uid).set({
                            email: user.email,
                            displayName: userData.displayName || '',
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            newsletter: userData.newsletter || false,
                            source: userData.source || 'website',
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }

                    await user.sendEmailVerification();
                    return { success: true, user: user, message: 'Account created successfully! Please check your email to verify your account.' };
                } catch (error) {
                    return { success: false, message: this.getErrorMessage(error.code) };
                }
            },

            async signInWithEmail(email, password) {
                try {
                    const userCredential = await auth.signInWithEmailAndPassword(email, password);
                    return { success: true, user: userCredential.user, message: 'Welcome back!' };
                } catch (error) {
                    return { success: false, message: this.getErrorMessage(error.code) };
                }
            },

            async signOut() {
                try {
                    await auth.signOut();
                    return { success: true, message: 'Signed out successfully.' };
                } catch (error) {
                    return { success: false, message: this.getErrorMessage(error.code) };
                }
            },

            onAuthStateChange(callback) {
                this.listeners.push(callback);
                const unsubscribe = auth.onAuthStateChanged(callback);
                return unsubscribe;
            },

            getErrorMessage(errorCode) {
                switch (errorCode) {
                    case 'auth/email-already-in-use': return 'This email is already in use.';
                    case 'auth/invalid-email': return 'Invalid email address.';
                    case 'auth/weak-password': return 'Password is too weak. Please use at least 6 characters.';
                    case 'auth/user-not-found': return 'No user found with this email.';
                    case 'auth/wrong-password': return 'Incorrect password.';
                    default: return 'An unexpected authentication error occurred. Please try again.';
                }
            }
        };

        // Set up auth state listener
        auth.onAuthStateChanged((user) => {
            authService.currentUser = user;
            authService.listeners.forEach(callback => callback(user));
        });

        // Create global services object
        window.firebaseServices = {
            authService: authService,
            db: db,
            analytics: null // Analytics handled separately
        };
    }

    createMockServices() {
        console.log('🔄 Creating mock Firebase services');

        const mockAuthService = {
            currentUser: null,
            listeners: [],

            async signUpWithEmail(email, password, userData = {}) {
                console.log('Mock signup:', { email, userData });
                return { success: false, message: 'Firebase services are currently unavailable. Please try again later.' };
            },

            async signInWithEmail(email, password) {
                console.log('Mock signin:', { email });
                return { success: false, message: 'Firebase services are currently unavailable. Please try again later.' };
            },

            async signOut() {
                return { success: true, message: 'Signed out (mock).' };
            },

            onAuthStateChange(callback) {
                this.listeners.push(callback);
                setTimeout(() => callback(null), 0);
                return () => {
                    this.listeners = this.listeners.filter(listener => listener !== callback);
                };
            }
        };

        window.firebaseServices = {
            authService: mockAuthService,
            db: null,
            analytics: null
        };
    }

    // Check if Firebase is ready
    isReady() {
        return this.isLoaded && window.firebaseServices && window.firebaseServices.authService;
    }

    // Get current status
    getStatus() {
        return {
            loaded: this.isLoaded,
            attempts: this.loadAttempts,
            services: window.firebaseServices ? Object.keys(window.firebaseServices) : [],
            ready: this.isReady()
        };
    }
}

// Create global instance
window.firebaseFallbackLoader = new FirebaseFallbackLoader();

// Auto-load on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.firebaseFallbackLoader.loadFirebase();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseFallbackLoader;
}
