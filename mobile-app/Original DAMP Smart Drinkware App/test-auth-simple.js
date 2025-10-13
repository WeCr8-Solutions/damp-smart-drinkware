#!/usr/bin/env node
/**
 * Simple Auth Test Script
 * Quick test of Firebase authentication without emulator
 * 
 * Usage: node test-auth-simple.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = require('./firebase-service-account.json');
} catch (error) {
  console.error('❌ Error: firebase-service-account.json not found');
  console.log('📝 To generate this file:');
  console.log('   1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('   2. Click "Generate new private key"');
  console.log('   3. Save as firebase-service-account.json in this directory');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const auth = admin.auth();

// Test configuration
const TEST_EMAIL = `test-${Date.now()}@damptest.com`;
const TEST_PASSWORD = 'TestPassword123!';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.bold}${colors.blue}${title}${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);
}

async function testSignUp() {
  section('TEST 1: Sign Up New User');
  
  try {
    log('📝', `Creating user: ${TEST_EMAIL}`, colors.yellow);
    
    const userRecord = await auth.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      emailVerified: false,
    });
    
    log('✅', `User created successfully!`, colors.green);
    log('👤', `UID: ${userRecord.uid}`);
    log('📧', `Email: ${userRecord.email}`);
    
    return userRecord;
  } catch (error) {
    log('❌', `Sign up failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function testGetUser(email) {
  section('TEST 2: Get User by Email');
  
  try {
    log('🔍', `Looking up user: ${email}`, colors.yellow);
    
    const userRecord = await auth.getUserByEmail(email);
    
    log('✅', `User found!`, colors.green);
    log('👤', `UID: ${userRecord.uid}`);
    log('📧', `Email: ${userRecord.email}`);
    log('🔐', `Email Verified: ${userRecord.emailVerified}`);
    log('📅', `Created: ${userRecord.metadata.creationTime}`);
    
    return userRecord;
  } catch (error) {
    log('❌', `Get user failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function testUpdateUser(uid) {
  section('TEST 3: Update User Profile');
  
  try {
    log('✏️', `Updating user display name...`, colors.yellow);
    
    const userRecord = await auth.updateUser(uid, {
      displayName: 'DAMP Test User',
      emailVerified: true
    });
    
    log('✅', `User updated successfully!`, colors.green);
    log('👤', `Display Name: ${userRecord.displayName}`);
    log('🔐', `Email Verified: ${userRecord.emailVerified}`);
    
    return userRecord;
  } catch (error) {
    log('❌', `Update user failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function testGenerateToken(uid) {
  section('TEST 4: Generate Custom Auth Token');
  
  try {
    log('🎫', `Generating custom token for UID: ${uid}`, colors.yellow);
    
    const customToken = await auth.createCustomToken(uid);
    
    log('✅', `Token generated successfully!`, colors.green);
    log('🔑', `Token (first 50 chars): ${customToken.substring(0, 50)}...`);
    log('💡', `This token can be used with signInWithCustomToken() in the app`);
    
    return customToken;
  } catch (error) {
    log('❌', `Token generation failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function testListUsers() {
  section('TEST 5: List All Users');
  
  try {
    log('📋', `Fetching user list...`, colors.yellow);
    
    const listUsersResult = await auth.listUsers(10);
    
    log('✅', `Found ${listUsersResult.users.length} users`, colors.green);
    
    listUsersResult.users.forEach((userRecord, index) => {
      console.log(`\n${colors.bold}User ${index + 1}:${colors.reset}`);
      console.log(`  UID: ${userRecord.uid}`);
      console.log(`  Email: ${userRecord.email || 'N/A'}`);
      console.log(`  Display Name: ${userRecord.displayName || 'N/A'}`);
      console.log(`  Created: ${userRecord.metadata.creationTime}`);
    });
    
    return listUsersResult;
  } catch (error) {
    log('❌', `List users failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function testDeleteUser(uid) {
  section('TEST 6: Delete Test User (Cleanup)');
  
  try {
    log('🗑️', `Deleting user with UID: ${uid}`, colors.yellow);
    
    await auth.deleteUser(uid);
    
    log('✅', `User deleted successfully!`, colors.green);
    log('🧹', `Test cleanup complete`);
    
  } catch (error) {
    log('❌', `Delete user failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function runAllTests() {
  console.log('\n');
  log('🚀', 'Starting Firebase Auth Tests', colors.bold + colors.blue);
  log('🔥', `Project: ${serviceAccount.project_id}`);
  log('📧', `Test Email: ${TEST_EMAIL}`);
  
  let testUser = null;
  
  try {
    // Run all tests in sequence
    testUser = await testSignUp();
    await testGetUser(TEST_EMAIL);
    await testUpdateUser(testUser.uid);
    await testGenerateToken(testUser.uid);
    await testListUsers();
    
    // Summary
    section('✅ ALL TESTS PASSED!');
    log('🎉', 'Authentication system is working correctly', colors.green);
    
    // Ask before cleanup
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n❓ Delete test user? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        await testDeleteUser(testUser.uid);
      } else {
        log('ℹ️', `Test user kept: ${TEST_EMAIL}`, colors.yellow);
        log('💡', `You can delete it manually from Firebase Console`);
      }
      rl.close();
      process.exit(0);
    });
    
  } catch (error) {
    section('❌ TEST FAILED');
    log('💥', `Error: ${error.message}`, colors.red);
    
    // Cleanup on failure
    if (testUser) {
      log('🧹', 'Attempting cleanup...', colors.yellow);
      try {
        await testDeleteUser(testUser.uid);
      } catch (cleanupError) {
        log('⚠️', `Cleanup failed: ${cleanupError.message}`, colors.yellow);
      }
    }
    
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testSignUp,
  testGetUser,
  testUpdateUser,
  testGenerateToken,
  testListUsers,
  testDeleteUser
};

