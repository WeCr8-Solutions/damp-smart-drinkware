# 🧪 Testing Authentication in Emulator

## 📱 **Step 1: Launch Android Emulator**

Once Expo Metro Bundler loads, you'll see a menu. Press:

```
› Press a │ open Android
```

This will:
- Launch your Android emulator (if not already running)
- Install the Expo Go app
- Load the DAMP app

---

## 🧪 **Step 2: Test Sign Up Flow**

1. **Wait for app to load** - You should see the DAMP logo and auth screens
2. **Tap "Sign Up"** or "Create Account" link
3. **Enter test credentials:**
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. **Tap "Sign Up" button**
5. **Watch Logcat** for these messages:
   ```
   📝 Attempting account creation... { email: 'test@example.com' }
   ✅ Account created successfully! test@example.com
   ```
6. **Expected:** Should see success message and redirect to main app

---

## 🧪 **Step 3: Test Sign In Flow**

1. **Sign out** (if there's a sign-out button in the app)
2. **Go back to Sign In screen**
3. **Enter credentials:**
   - Email: `test@example.com`
   - Password: `password123`
4. **Tap "Sign In" button**
5. **Watch Logcat** for:
   ```
   🔐 Attempting sign in... { email: 'test@example.com' }
   ✅ Sign in successful! test@example.com
   ```
6. **Expected:** Should authenticate and redirect to main app

---

## 🔍 **How to View Logs**

### **Option 1: In Terminal**
The Expo Metro Bundler will show logs directly in your terminal window.

### **Option 2: Android Studio Logcat**
1. Open **Android Studio**
2. Click **Logcat** tab at bottom
3. Filter by: `ReactNativeJS`
4. Watch for auth-related console.log messages

---

## ✅ **What to Look For**

### **Success Indicators:**
- ✅ No Firebase initialization errors
- ✅ Auth screens render properly
- ✅ Form inputs are responsive
- ✅ Success message displays: "Account created successfully!"
- ✅ Redirect to main app after auth
- ✅ Console logs show user email

### **Common Issues:**
- ❌ **"Firebase disabled"** → Check `.env` file has correct Firebase credentials
- ❌ **"Module not found"** → Run `npm install` in mobile app directory
- ❌ **Blank screen** → Check Metro bundler terminal for errors
- ❌ **"An unexpected error occurred"** → Check Firebase Auth is enabled in console

---

## 🐛 **If Something Goes Wrong**

1. **Check the terminal** for Metro bundler errors
2. **Check Android Studio Logcat** for detailed error messages
3. **Reload the app** - Press `r` in the Expo terminal to reload
4. **Clear cache** - Press `Shift + r` for hard reload
5. **Restart everything:**
   ```bash
   # Stop Expo (Ctrl+C in terminal)
   # Then restart:
   npx expo start --clear
   ```

---

## 📊 **Expected Test Results**

| Test Case | Expected Result |
|-----------|----------------|
| Sign up with valid email/password | ✅ Success, redirect to app |
| Sign up with invalid email | ❌ Error: "Invalid email address format" |
| Sign up with weak password (< 6 chars) | ❌ Error: "Password must be at least 6 characters long" |
| Sign up with mismatched passwords | ❌ Error: "Passwords do not match" |
| Sign in with correct credentials | ✅ Success, redirect to app |
| Sign in with wrong password | ❌ Error: "Incorrect password" |
| Sign in with non-existent email | ❌ Error: "No account found with this email" |

---

**Status:** 🟢 Ready to test! Watch the terminal and emulator.

