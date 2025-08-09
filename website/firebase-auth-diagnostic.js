/**
 * DAMP Smart Drinkware - Firebase Auth Diagnostic
 * Quick diagnostic script to test Firebase authentication
 */

console.log('🔧 Starting Firebase Auth Diagnostic...');

// Test Firebase Configuration
const testFirebaseConfig = () => {
    console.log('\n📋 Testing Firebase Configuration...');
    
    const config = {
        apiKey: "AIzaSyCGXLp2Xm1UtPZmjFBKjQDLNGz8J3tZQxs",
        authDomain: "damp-smart-drinkware.firebaseapp.com",
        projectId: "damp-smart-drinkware",
        storageBucket: "damp-smart-drinkware.firebasestorage.app",
        messagingSenderId: "309818614427",
        appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
        measurementId: "G-YW2BN4SVPQ"
    };
    
    console.log('✅ API Key:', config.apiKey ? 'Present' : 'Missing');
    console.log('✅ Auth Domain:', config.authDomain);
    console.log('✅ Project ID:', config.projectId);
    console.log('✅ App ID:', config.appId);
    
    return config;
};

// Test Firebase Services Availability
const testFirebaseServices = async () => {
    console.log('\n🔥 Testing Firebase Services...');
    
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
        if (window.firebaseServices) {
            console.log('✅ Firebase Services Available');
            console.log('📋 Available Services:', Object.keys(window.firebaseServices));
            
            if (window.firebaseServices.authService) {
                console.log('✅ Auth Service Available');
                console.log('📋 Auth Service Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.firebaseServices.authService)));
                return true;
            }
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.error('❌ Firebase Services not available after 5 seconds');
    return false;
};

// Test Authentication Flow
const testAuthFlow = async () => {
    console.log('\n🔐 Testing Authentication Flow...');
    
    if (!window.firebaseServices?.authService) {
        console.error('❌ Auth service not available');
        return false;
    }
    
    const authService = window.firebaseServices.authService;
    
    // Test with a dummy email
    const testEmail = `test-${Date.now()}@damptest.com`;
    const testPassword = 'test123456';
    
    try {
        console.log('🔄 Testing sign up with:', testEmail);
        
        const result = await authService.signUpWithEmail(testEmail, testPassword, {
            firstName: 'Test',
            lastName: 'User',
            displayName: 'Test User',
            newsletter: false,
            source: 'diagnostic'
        });
        
        console.log('📋 Sign up result:', result);
        
        if (result.success) {
            console.log('✅ Sign up successful!');
            
            // Try to sign out
            const signOutResult = await authService.signOut();
            console.log('📋 Sign out result:', signOutResult);
            
            return true;
        } else {
            console.error('❌ Sign up failed:', result.message);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Auth flow test error:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        return false;
    }
};

// Test Network Connectivity
const testNetworkConnectivity = async () => {
    console.log('\n🌐 Testing Network Connectivity...');
    
    const endpoints = [
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=test',
        'https://firestore.googleapis.com/v1/projects/damp-smart-drinkware/databases/(default)/documents/test',
        'https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, { method: 'HEAD' });
            console.log(`✅ ${endpoint}: ${response.status}`);
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }
};

// Run All Tests
const runDiagnostic = async () => {
    console.log('🚀 Running Firebase Auth Diagnostic...');
    console.log('═'.repeat(60));
    
    // Test 1: Configuration
    testFirebaseConfig();
    
    // Test 2: Services
    const servicesAvailable = await testFirebaseServices();
    
    if (servicesAvailable) {
        // Test 3: Auth Flow
        const authWorking = await testAuthFlow();
        
        // Test 4: Network
        await testNetworkConnectivity();
        
        console.log('\n' + '═'.repeat(60));
        console.log('🎯 Diagnostic Summary:');
        console.log('✅ Firebase Services:', servicesAvailable ? 'Available' : 'Not Available');
        console.log('✅ Authentication Flow:', authWorking ? 'Working' : 'Not Working');
        
        if (authWorking) {
            console.log('🎉 Firebase Authentication is working correctly!');
        } else {
            console.log('⚠️ Firebase Authentication has issues that need to be resolved.');
        }
    } else {
        console.log('\n❌ Cannot proceed with tests - Firebase services not available');
    }
};

// Auto-run diagnostic when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostic);
} else {
    runDiagnostic();
}

// Export for manual testing
window.runFirebaseAuthDiagnostic = runDiagnostic;
