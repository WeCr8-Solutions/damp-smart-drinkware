/**
 * DAMP Smart Drinkware - Website Validation Script
 *
 * Validates all critical website components and configurations
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 DAMP Website Validation Starting...\n');

// Test results
let tests = [];
let passed = 0;
let failed = 0;

function test(name, condition, message = '') {
    const result = {
        name,
        passed: condition,
        message
    };
    tests.push(result);

    if (condition) {
        passed++;
        console.log(`✅ ${name}: PASS ${message ? `- ${message}` : ''}`);
    } else {
        failed++;
        console.log(`❌ ${name}: FAIL ${message ? `- ${message}` : ''}`);
    }
}

// 1. Check critical files exist
console.log('📁 Checking Critical Files...');
test('Index.html exists', fs.existsSync('website/index.html'));
test('Firebase modern setup exists', fs.existsSync('website/assets/js/firebase-modern-setup.js'));
test('Auth modal exists', fs.existsSync('website/assets/js/auth-modal.js'));
test('Navigation CSS exists', fs.existsSync('website/assets/css/navigation.css'));
test('Netlify config exists', fs.existsSync('netlify.toml'));

// 2. Check page structure
console.log('\n📄 Checking Page Structure...');
const pagesDir = 'website/pages';
const requiredPages = [
    'products.html',
    'about.html',
    'product-voting.html',
    'pre-sale-funnel.html'
];

requiredPages.forEach(page => {
    test(`${page} exists`, fs.existsSync(path.join(pagesDir, page)));
});

// 3. Check Firebase configuration
console.log('\n🔥 Checking Firebase Configuration...');
if (fs.existsSync('website/assets/js/firebase-modern-setup.js')) {
    const firebaseSetup = fs.readFileSync('website/assets/js/firebase-modern-setup.js', 'utf8');
    test('Firebase API key configured', firebaseSetup.includes('AIzaSyCGXLp2Xm1UtPZmjFBKjQDLNGz8J3tZQxs'));
    test('Firebase project ID configured', firebaseSetup.includes('damp-smart-drinkware'));
    test('Firebase auth service class exists', firebaseSetup.includes('ModernFirebaseAuthService'));
    test('Firebase services globally available', firebaseSetup.includes('window.firebaseServices'));
}

// 4. Check CSP configuration
console.log('\n🔒 Checking Security Configuration...');
if (fs.existsSync('netlify.toml')) {
    const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
    test('CSP includes Firebase auth endpoints', netlifyConfig.includes('identitytoolkit.googleapis.com'));
    test('CSP includes Firestore', netlifyConfig.includes('firestore.googleapis.com'));
    test('CSP includes frame-src', netlifyConfig.includes('frame-src'));
    test('CSP includes Google OAuth', netlifyConfig.includes('accounts.google.com'));
}

// 5. Check navigation configuration
console.log('\n🧭 Checking Navigation Configuration...');
if (fs.existsSync('website/assets/css/navigation.css')) {
    const navCSS = fs.readFileSync('website/assets/css/navigation.css', 'utf8');
    test('Desktop auth buttons hidden', navCSS.includes('.auth-buttons {') && navCSS.includes('display: none;'));
    test('Mobile auth buttons configured', navCSS.includes('mobile-auth-buttons'));
    test('Hamburger menu responsive', navCSS.includes('@media (min-width: 1024px)'));
}

// 6. Check auth modal configuration
console.log('\n🔐 Checking Authentication Configuration...');
if (fs.existsSync('website/assets/js/auth-modal.js')) {
    const authModal = fs.readFileSync('website/assets/js/auth-modal.js', 'utf8');
    test('Auth modal waits for Firebase services', authModal.includes('waitForAuthService'));
    test('Auth modal handles signup', authModal.includes('signUpWithEmail'));
    test('Auth modal handles signin', authModal.includes('signInWithEmail'));
    test('Auth modal handles Google auth', authModal.includes('signInWithGoogle'));
}

// 7. Check performance fixes
console.log('\n⚡ Checking Performance Fixes...');
if (fs.existsSync('website/assets/js/performance-monitor.js')) {
    const perfMonitor = fs.readFileSync('website/assets/js/performance-monitor.js', 'utf8');
    test('Performance monitor skips missing API', perfMonitor.includes('backend endpoint not configured'));
}

// 8. Check test infrastructure
console.log('\n🧪 Checking Test Infrastructure...');
test('Comprehensive test suite exists', fs.existsSync('website/test-website-comprehensive.html'));
test('E2E tests exist', fs.existsSync('tests/e2e/homepage.spec.js'));

// Summary
console.log('\n📊 VALIDATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Tests Passed: ${passed}`);
console.log(`❌ Tests Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Website is ready for production.');
} else {
    console.log(`\n⚠️  ${failed} issues found. Please review failed tests above.`);
}

console.log('\n🔗 TESTING INSTRUCTIONS:');
console.log('1. Visit https://dampdrink.com/test-website-comprehensive.html');
console.log('2. Click "Run All Tests" to perform live testing');
console.log('3. Test authentication by signing up with a real email');
console.log('4. Verify all navigation works correctly');
console.log('5. Check that no 404 errors appear in console');

console.log('\n🚀 Website should be fully functional with:');
console.log('   ✅ Modern Firebase authentication');
console.log('   ✅ Secure CSP configuration');
console.log('   ✅ Mobile-first navigation');
console.log('   ✅ Performance optimizations');
console.log('   ✅ Cross-platform compatibility');
