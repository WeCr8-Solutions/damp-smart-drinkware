# 🧪 Authentication Testing Guide

Complete guide for testing Firebase Authentication in the DAMP mobile app.

---

## 📋 **Available Test Scripts**

### **1. Jest Unit Tests** (Recommended)
Full test suite with sign up, sign in, error handling, and state management.

```bash
npm run test:auth
```

**What it tests:**
- ✅ Sign up with valid credentials
- ✅ Sign up with invalid email format
- ✅ Sign up with weak password
- ✅ Sign up with duplicate email
- ✅ Sign in with correct credentials
- ✅ Sign in with wrong password
- ✅ Sign in with non-existent email
- ✅ Get current user
- ✅ Sign out
- ✅ Auth state observer

**Expected output:**
```
PASS  tests/auth/auth-flow.test.ts
  Auth Service - Sign Up
    ✓ should create a new user account with valid credentials (2342ms)
    ✓ should reject sign up with invalid email format (156ms)
    ✓ should reject sign up with weak password (178ms)
    ✓ should reject duplicate email registration (2456ms)
  Auth Service - Sign In
    ✓ should sign in with correct credentials (1234ms)
    ✓ should reject sign in with wrong password (234ms)
    ✓ should reject sign in with non-existent email (198ms)
  Auth Service - User State
    ✓ should get current user when signed in (45ms)
    ✓ should sign out successfully (123ms)
    ✓ should return null when no user is signed in (12ms)
  Auth Service - Auth State Observer
    ✓ should observe auth state changes (3456ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

---

### **2. Simple Admin Test** (For Backend Testing)
Tests Firebase Admin SDK functionality (requires service account).

```bash
npm run test:auth:simple
```

**Prerequisites:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to: **Project Settings → Service Accounts**
3. Click **"Generate new private key"**
4. Save as `firebase-service-account.json` in the mobile app directory

**What it tests:**
- ✅ Create user via Admin SDK
- ✅ Get user by email
- ✅ Update user profile
- ✅ Generate custom auth token
- ✅ List all users
- ✅ Delete user (cleanup)

**Expected output:**
```
🚀 Starting Firebase Auth Tests
🔥 Project: damp-smart-drinkware

============================================================
TEST 1: Sign Up New User
============================================================

📝 Creating user: test-1234567890@damptest.com
✅ User created successfully!
👤 UID: abc123xyz456
📧 Email: test-1234567890@damptest.com

============================================================
TEST 2: Get User by Email
============================================================

🔍 Looking up user: test-1234567890@damptest.com
✅ User found!
👤 UID: abc123xyz456
📧 Email: test-1234567890@damptest.com
🔐 Email Verified: false
📅 Created: Mon, 13 Jan 2025 12:34:56 GMT

... (more test results)

============================================================
✅ ALL TESTS PASSED!
============================================================

🎉 Authentication system is working correctly

❓ Delete test user? (y/n):
```

---

## 🎯 **Quick Start: Run Tests Now**

### **Option 1: Run Full Test Suite**
```bash
cd "mobile-app/Original DAMP Smart Drinkware App"
npm run test:auth
```

### **Option 2: Run Single Test File**
```bash
npm run test:auth:flow
```

### **Option 3: Run Admin Tests**
```bash
# First, download service account JSON from Firebase Console
npm run test:auth:simple
```

---

## 🔧 **Manual Testing in Emulator**

If you prefer to test manually in the Android emulator:

### **Step 1: Start Expo**
```bash
cd "mobile-app/Original DAMP Smart Drinkware App"
npx expo start --clear
```

### **Step 2: Open Android Emulator**
Press `a` when the Metro Bundler menu appears.

### **Step 3: Test Sign Up**
1. Navigate to Sign Up screen
2. Enter:
   - Email: `manual-test@damptest.com`
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`
3. Tap "Sign Up"
4. Watch for success message
5. Check terminal logs for:
   ```
   📝 Attempting account creation...
   ✅ Account created successfully! manual-test@damptest.com
   ```

### **Step 4: Test Sign In**
1. Sign out (if sign-out button available)
2. Navigate to Sign In screen
3. Enter:
   - Email: `manual-test@damptest.com`
   - Password: `TestPassword123!`
4. Tap "Sign In"
5. Watch for successful authentication

---

## 🐛 **Troubleshooting Tests**

### **Error: "Firebase disabled"**
```bash
# Check .env file
cat .env | grep FIREBASE

# Should show:
EXPO_PUBLIC_FIREBASE_ENABLED=true
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
# ... other Firebase config
```

**Fix:** Ensure all Firebase environment variables are set in `.env`.

---

### **Error: "Cannot find module '@/services/auth'"**
```bash
# Install dependencies
npm install

# Clear cache
npm run test -- --clearCache
```

**Fix:** Run `npm install` to ensure all dependencies are installed.

---

### **Error: "auth/operation-not-allowed"**
This means Email/Password auth is not enabled in Firebase.

**Fix:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to: **Authentication → Sign-in method**
3. Enable **Email/Password**
4. Save changes

---

### **Tests taking too long**
```bash
# Run with increased timeout
npm run test:auth -- --testTimeout=30000
```

---

## 📊 **Expected Test Results**

### **All Tests Passing:**
```
✅ 11 tests passed
✅ Auth sign up working
✅ Auth sign in working
✅ Error handling correct
✅ State management functional
```

### **Common Test Failures:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Firebase disabled` | Missing `.env` config | Add Firebase credentials to `.env` |
| `auth/operation-not-allowed` | Email auth not enabled | Enable in Firebase Console |
| `Module not found` | Dependencies missing | Run `npm install` |
| `Timeout exceeded` | Slow network/Firebase | Increase timeout with `--testTimeout` |
| `User already exists` | Test ran multiple times | Delete test users in Firebase Console |

---

## 🎯 **Next Steps After Tests Pass**

1. ✅ **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add authentication testing suite"
   ```

2. ✅ **Update PRE_LAUNCH_CHECKLIST.md** - Check off auth tests

3. ✅ **Test on physical device** - Deploy to real Android/iOS device

4. ✅ **Add CI/CD** - Integrate tests into GitHub Actions or CI pipeline

5. ✅ **Monitor Firebase Console** - Check for any auth errors in production

---

## 📝 **Test Coverage Summary**

| Feature | Unit Tests | Integration Tests | Manual Tests |
|---------|-----------|-------------------|--------------|
| Sign Up | ✅ | ✅ | ✅ |
| Sign In | ✅ | ✅ | ✅ |
| Sign Out | ✅ | ✅ | ✅ |
| Error Handling | ✅ | ✅ | ✅ |
| Auth State | ✅ | ✅ | ✅ |
| Password Reset | ⏳ TODO | ⏳ TODO | ⏳ TODO |
| Google Sign-In | ⏳ TODO | ⏳ TODO | ⏳ TODO |
| Profile Updates | ⏳ TODO | ⏳ TODO | ⏳ TODO |

---

**Status:** 🟢 **Ready to test!** Run `npm run test:auth` now.

