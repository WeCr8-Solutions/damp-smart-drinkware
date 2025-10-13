# 🔐 DAMP Mobile App - Firebase Auth Diagnostic Guide

## ❌ **Issue**: "An unexpected error occurred" when signing up/logging in

---

## 🔍 **Diagnosis Steps**

### **Step 1: Check Firebase Console Logs**

When you try to sign up or log in, look at:
1. **Terminal/Console output** (where Expo is running)
2. **Android Emulator logs** (if testing on Android)
3. **Browser DevTools Console** (if testing on web)

Look for these new detailed logs:
```
🔐 Attempting sign in... { email: '...', hasAuth: true }
❌ Sign in error: FirebaseError: ...
Error code: auth/user-not-found
Error message: Firebase: Error (auth/user-not-found).
```

---

## 🛠️ **Common Firebase Auth Errors & Solutions**

### **Error: "Firebase disabled"**
```
Error message: Firebase disabled
```
**Cause**: Firebase not initialized properly  
**Solution**: Check if `.env` file exists and has correct values

**Fix**:
```bash
cd "mobile-app/Original DAMP Smart Drinkware App"
cat .env
```
Verify you see:
```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAKkZ...
EXPO_PUBLIC_FIREBASE_ENABLED=true
```

---

### **Error: "auth/operation-not-allowed"**
```
Error code: auth/operation-not-allowed
Error message: Email/password sign-up is not enabled
```

**Cause**: Email/Password authentication not enabled in Firebase Console  
**Solution**: Enable it in Firebase Console

**Fix**:
1. Go to: https://console.firebase.google.com/project/damp-smart-drinkware/authentication/providers
2. Click "Email/Password"
3. Enable "Email/Password" (first toggle)
4. Click "Save"
5. Try signing up again in the app

---

### **Error: "auth/invalid-api-key"**
```
Error code: auth/invalid-api-key
```
**Cause**: Wrong Firebase API key in `.env`  
**Solution**: Verify API key matches Firebase Console

**Fix**:
1. Go to: https://console.firebase.google.com/project/damp-smart-drinkware/settings/general
2. Scroll to "Web API Key"
3. Should be: `AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w`
4. Update `.env` if different
5. Restart Expo server

---

### **Error: "auth/network-request-failed"**
```
Error code: auth/network-request-failed
```
**Cause**: No internet connection or Firebase blocked  
**Solution**: Check network and firewall

**Fix**:
```bash
# Test Firebase connection
ping firebase.google.com

# Check if you can reach Firebase
curl https://identitytoolkit.googleapis.com/
```

---

### **Error: "auth/too-many-requests"**
```
Error code: auth/too-many-requests
```
**Cause**: Too many failed sign-in attempts  
**Solution**: Wait 15 minutes or reset from Firebase Console

---

## 📱 **Testing Firebase Auth on Android**

### **Check Android Emulator Logs**:
```bash
# In a new terminal, watch Android logs
adb logcat | findstr -i firebase

# Or filter for errors only
adb logcat *:E | findstr -i firebase
```

---

## 🧪 **Quick Auth Test**

### **Test 1: Create Account**
```
1. Open app on emulator
2. Navigate to Sign Up
3. Enter:
   - Email: test@dampdrink.com
   - Password: test123456
   - Confirm: test123456
4. Tap "Create Account"
5. Watch terminal for logs
```

**Expected**:
```
📝 Attempting account creation... { email: 'test@dampdrink.com', hasAuth: true }
✅ Account created successfully! test@dampdrink.com
```

**If Error**:
```
❌ Signup error: FirebaseError: ...
Error code: auth/[error-code]
Error message: [Detailed message]
```

### **Test 2: Sign In**
```
1. Navigate to Sign In
2. Use same credentials
3. Tap "Sign In"
4. Watch logs
```

---

## ✅ **Verification Checklist**

- [ ] `.env` file exists in mobile app directory
- [ ] `EXPO_PUBLIC_FIREBASE_ENABLED=true`
- [ ] Firebase API key matches console
- [ ] Email/Password enabled in Firebase Console
- [ ] App can reach firebase.google.com
- [ ] Terminal shows detailed error logs
- [ ] Emulator has internet access

---

## 🔧 **Emergency Fix: Test with Mock User**

If Firebase keeps failing, test the app flow with mock auth:

**Temporarily bypass auth**:
1. Open app
2. Should go straight to main tabs (when not logged in)
3. Test product screens without auth
4. Verify navigation and UI

---

## 📞 **What to Report**

When you see the error, share these from terminal:
1. The `❌ Sign in error:` line
2. The `Error code:` line
3. The `Error message:` line
4. Your test email and whether it's a new account or existing

---

## 🎯 **Next Steps**

**RIGHT NOW**:
1. Try to sign up/log in again
2. Immediately check your terminal output
3. Look for the `❌` error logs
4. Copy the error code and message
5. Share with me so I can fix it!

---

**What error code do you see in the terminal?** 🔍

