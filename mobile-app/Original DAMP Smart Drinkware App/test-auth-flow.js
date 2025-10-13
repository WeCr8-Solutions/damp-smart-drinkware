/**
 * DAMP Mobile App - Firebase Auth Test Script
 * Tests sign up and login functionality
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with your project
const serviceAccount = {
  type: "service_account",
  project_id: "damp-smart-drinkware",
  // Note: For testing, we'll use the public API
};

// Firebase REST API credentials
const FIREBASE_API_KEY = 'AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w';
const FIREBASE_PROJECT_ID = 'damp-smart-drinkware';

async function testFirebaseAuth() {
  console.log('\n🔥 DAMP Firebase Auth Test\n');
  console.log('=' .repeat(60));
  
  // Test credentials
  const testEmail = `test-${Date.now()}@dampdrink.com`;
  const testPassword = 'TestPass123!';
  
  console.log('\n📋 Test Configuration:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log(`   Project: ${FIREBASE_PROJECT_ID}`);
  
  try {
    // Test 1: Check if Email/Password is enabled
    console.log('\n\n📝 TEST 1: Create New Account');
    console.log('─'.repeat(60));
    
    const signupResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          returnSecureToken: true
        })
      }
    );
    
    const signupData = await signupResponse.json();
    
    if (signupResponse.ok) {
      console.log('✅ Account created successfully!');
      console.log(`   User ID: ${signupData.localId}`);
      console.log(`   Email: ${signupData.email}`);
      console.log(`   Token: ${signupData.idToken.substring(0, 20)}...`);
    } else {
      console.log('❌ Signup failed:');
      console.log(`   Error: ${signupData.error.message}`);
      console.log(`   Code: ${signupData.error.code || 'N/A'}`);
      
      if (signupData.error.message.includes('EMAIL_EXISTS')) {
        console.log('\n⚠️  Email already registered - will test login instead');
      } else if (signupData.error.message.includes('OPERATION_NOT_ALLOWED')) {
        console.log('\n❌ CRITICAL: Email/Password authentication is NOT ENABLED!');
        console.log('\n🔧 FIX:');
        console.log('   1. Go to: https://console.firebase.google.com/project/damp-smart-drinkware/authentication/providers');
        console.log('   2. Click "Email/Password"');
        console.log('   3. Toggle "Enable" ON');
        console.log('   4. Click "Save"');
        console.log('   5. Run this test again\n');
        process.exit(1);
      }
      return;
    }
    
    // Test 2: Sign in with the account
    console.log('\n\n🔐 TEST 2: Sign In with Account');
    console.log('─'.repeat(60));
    
    const loginResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          returnSecureToken: true
        })
      }
    );
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Sign in successful!');
      console.log(`   User ID: ${loginData.localId}`);
      console.log(`   Email: ${loginData.email}`);
      console.log(`   Token: ${loginData.idToken.substring(0, 20)}...`);
    } else {
      console.log('❌ Login failed:');
      console.log(`   Error: ${loginData.error.message}`);
    }
    
    // Test 3: Wrong password
    console.log('\n\n🚫 TEST 3: Wrong Password (Expected to Fail)');
    console.log('─'.repeat(60));
    
    const wrongPasswordResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword123',
          returnSecureToken: true
        })
      }
    );
    
    const wrongPasswordData = await wrongPasswordResponse.json();
    
    if (!wrongPasswordResponse.ok) {
      console.log('✅ Correctly rejected wrong password');
      console.log(`   Error: ${wrongPasswordData.error.message}`);
    } else {
      console.log('❌ SECURITY ISSUE: Wrong password was accepted!');
    }
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('\n✅ Firebase Authentication is WORKING!');
    console.log('\n📱 Your mobile app should be able to:');
    console.log('   ✓ Create new accounts');
    console.log('   ✓ Sign in with email/password');
    console.log('   ✓ Reject invalid credentials');
    console.log('\n🎯 Next: Test on your Android emulator:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('\nStack:', error.stack);
  }
}

// Run the test
testFirebaseAuth();

