# 🚀 DAMP Mobile App - Quick Start Guide

**Last Updated:** January 13, 2026  
**Status:** ✅ Development Build Installed & Ready

---

## ✅ What's Already Done

1. ✅ **expo-dev-client** installed
2. ✅ **Native Android APK built** (6m 45s build time)
3. ✅ **APK installed on Pixel_5_API_35 emulator**
4. ✅ **Metro config fixed** (no more Haste collisions)
5. ✅ **All dependencies configured**

---

## 🎯 How to Start the App

### **Option 1: Use the Batch File (Easiest)**

1. Navigate to the mobile app folder
2. Double-click `BUILD_ANDROID_DEV.bat`
3. Wait for Metro to start (shows QR code)
4. Open the **DAMP Smart Drinkware** app on your emulator
5. The app connects to Metro automatically!

### **Option 2: Manual Command**

```bash
cd "mobile-app\Original DAMP Smart Drinkware App"
npx expo start --dev-client
```

Then tap the DAMP app icon on your emulator.

---

## 📱 Verify the App Works

### **1. Check Metro Connection**
After opening the app, you should see in the terminal:
```
› Connected to device
```

### **2. Test Authentication**
- Sign up with a test email (e.g., `test@damp.com`)
- Password: any 6+ characters
- You should reach the Home screen

### **3. Test Navigation**
- Tap each of the 3 main tabs (Home, Zones, Settings)
- Open Settings → test Product Voting, DAMP Store, etc.
- All back buttons should work

### **4. Test Hot Reload**
- Edit any `.tsx` file (e.g., change a button label)
- Press `Ctrl+S` to save
- The app should refresh automatically!

---

## 🔧 Common Issues & Fixes

### **Issue 1: "Unable to resolve ../../App"**

**Cause:** Metro started from the wrong directory (project root)

**Fix:**
```bash
# Kill Metro
taskkill /F /IM node.exe

# Navigate to mobile app directory
cd "mobile-app\Original DAMP Smart Drinkware App"

# Start Metro from here
npx expo start --dev-client
```

### **Issue 2: "Metro Haste module naming collision"**

**Cause:** `.netlify` folder in mobile app directory

**Fix:**
```bash
cd "mobile-app\Original DAMP Smart Drinkware App"
Remove-Item -Path ".netlify" -Recurse -Force
npx expo start --dev-client --clear
```

### **Issue 3: App won't connect to Metro**

**Cause:** Firewall or network issue

**Fix:**
1. Check if port 8081 is open
2. Verify emulator is running
3. Restart Metro bundler
4. Shake device → "Reload"

### **Issue 4: Need to rebuild APK**

**When:** After adding new native modules or changing `app.json`

**How:**
```bash
cd "mobile-app\Original DAMP Smart Drinkware App"
npx expo run:android
```

---

## 📊 Development Workflow

### **Daily Development:**

1. **Start Metro** (once per session)
   ```bash
   .\BUILD_ANDROID_DEV.bat
   ```

2. **Open app on emulator** (tap the icon)

3. **Edit code** → **Save** → **Auto-refresh!** ⚡

4. **Debug in terminal** (all `console.log()` appear there)

### **When to Rebuild APK:**

- ✅ **Never for code changes** (hot reload handles it!)
- ⚠️ **Only when:**
  - Adding new native dependencies
  - Changing `app.json` settings
  - Updating Android permissions
  - Modifying native code

---

## 🎨 Key Features Now Working

### ✅ **Authentication**
- Email/Password sign up
- Email/Password sign in
- Sign out
- Firebase Auth integration

### ✅ **Navigation**
- 3-tab layout (Home, Zones, Settings)
- Settings sections:
  - Account (Profile, Subscription, Privacy)
  - Devices & Zones
  - Preferences (Notifications, Theme, Language)
  - Community (Voting, Store)
  - Help & Support

### ✅ **Developer Tools**
- Hot reload (instant updates)
- Console logging
- React DevTools (press `j` in Metro)
- Network inspector

---

## 📝 Useful Commands

```bash
# Start Metro (connects to APK)
npx expo start --dev-client

# Rebuild APK (if needed)
npx expo run:android

# Clear Metro cache
npx expo start --dev-client --clear

# Open React DevTools
Press 'j' in Metro terminal

# Reload app manually
Press 'r' in Metro terminal
# Or shake device → "Reload"
```

---

## 🐛 Debugging Tips

### **View Logs:**
- Metro terminal shows all `console.log()`
- Look for errors in red text
- Warnings in yellow text

### **React DevTools:**
```bash
# In Metro terminal, press 'j'
# Opens Chrome DevTools for React inspection
```

### **Network Requests:**
- All fetch/API calls appear in Metro logs
- Check Firebase Auth responses
- Verify API endpoints

### **Component State:**
- Use React DevTools
- Inspect component hierarchy
- View props and state

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Metro shows "Connected to device"
2. ✅ Login screen displays correctly
3. ✅ Sign up/sign in works
4. ✅ Navigation tabs work smoothly
5. ✅ Code changes trigger instant refresh
6. ✅ No errors in Metro console
7. ✅ All buttons respond to taps

---

## 📚 Documentation

- **Full Setup Guide:** `EXPO_DEV_CLIENT_SETUP_COMPLETE.md`
- **Build Success Details:** `DEV_BUILD_SUCCESS.md`
- **Navigation Flow:** `docs/NAVIGATION_FLOW.md`
- **Auth Testing:** `AUTH_TESTING_GUIDE.md`

---

## 🚨 Current Status

**Everything is ready! Just:**

1. Run `BUILD_ANDROID_DEV.bat`
2. Wait for Metro to start
3. Tap the DAMP app icon on your emulator
4. Start coding and see instant updates! 🚀

---

**Need Help?** Check the documentation files or review the terminal logs for specific errors.

**Happy Coding!** 🎉
