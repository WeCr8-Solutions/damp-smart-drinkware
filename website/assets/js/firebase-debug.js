/**
 * DAMP Smart Drinkware - Firebase Debug Script
 * Simple debug version to identify authentication issues
 */

console.log('🔧 Firebase Debug Script Starting...');

// Check if Firebase services are available
const checkFirebaseServices = () => {
    console.log('\n🔍 Checking Firebase Services...');
    console.log('window.firebaseServices:', !!window.firebaseServices);
    
    if (window.firebaseServices) {
        console.log('Available services:', Object.keys(window.firebaseServices));
        console.log('Auth service:', !!window.firebaseServices.authService);
        
        if (window.firebaseServices.authService) {
            console.log('Auth service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.firebaseServices.authService)));
        }
    }
    
    return !!window.firebaseServices?.authService;
};

// Simple sign-up test
const testSignUp = async (email, password) => {
    console.log('\n🧪 Testing Sign Up...');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    
    try {
        if (!window.firebaseServices?.authService) {
            throw new Error('Auth service not available');
        }
        
        const result = await window.firebaseServices.authService.signUpWithEmail(email, password, {
            firstName: 'Debug',
            lastName: 'Test',
            displayName: 'Debug Test',
            newsletter: false,
            source: 'debug'
        });
        
        console.log('🎯 Sign up result:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Sign up test failed:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        return { success: false, message: error.message };
    }
};

// Check Firebase initialization status
const checkFirebaseInit = () => {
    console.log('\n🔥 Checking Firebase Initialization...');
    
    // Check if Firebase CDN scripts are loaded
    const scripts = document.querySelectorAll('script[src*="firebase"]');
    console.log('Firebase scripts found:', scripts.length);
    scripts.forEach(script => console.log('  -', script.src));
    
    // Check if Firebase globals are available
    console.log('Firebase globals:');
    console.log('  - firebase (compat):', typeof firebase);
    console.log('  - window.firebaseServices:', typeof window.firebaseServices);
    
    // Check modern Firebase imports
    if (window.firebaseServices) {
        console.log('Firebase services object:', window.firebaseServices);
    }
};

// Run comprehensive debug
const runDebug = async () => {
    console.log('🚀 Starting Firebase Debug Session...');
    console.log('═'.repeat(50));
    
    // Step 1: Check initialization
    checkFirebaseInit();
    
    // Step 2: Wait for services
    let attempts = 0;
    while (!window.firebaseServices?.authService && attempts < 50) {
        console.log(`⏳ Waiting for Firebase services... (${attempts + 1}/50)`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    // Step 3: Check services
    const servicesReady = checkFirebaseServices();
    
    if (servicesReady) {
        // Step 4: Test sign up with debug email
        const debugEmail = `debug-${Date.now()}@damptest.com`;
        const debugPassword = 'debug123456';
        
        console.log('\n🧪 Testing with debug credentials...');
        const result = await testSignUp(debugEmail, debugPassword);
        
        console.log('\n' + '═'.repeat(50));
        console.log('🎯 Debug Summary:');
        console.log('✅ Services Ready:', servicesReady);
        console.log('✅ Sign Up Test:', result.success ? 'PASSED' : 'FAILED');
        console.log('📋 Message:', result.message);
        
        if (!result.success) {
            console.log('\n🔍 Troubleshooting Steps:');
            console.log('1. Check Firebase Console for project settings');
            console.log('2. Verify Email/Password authentication is enabled');
            console.log('3. Check authorized domains include dampdrink.com');
            console.log('4. Review browser network tab for failed requests');
            console.log('5. Check if ad blockers are interfering');
        }
        
    } else {
        console.error('❌ Firebase services not ready - cannot test sign up');
    }
};

// Auto-run debug on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runDebug, 2000); // Wait 2 seconds for Firebase to load
    });
} else {
    setTimeout(runDebug, 2000);
}

// Export debug functions
window.debugFirebaseAuth = runDebug;
window.testFirebaseSignUp = testSignUp;
window.checkFirebaseServices = checkFirebaseServices;
