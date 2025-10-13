# 📱 Testing DAMP App on Android Studio Emulator

## ✅ **Quick Start**

Since you already have Android Studio emulator running:

### **Step 1: Navigate to Mobile App Directory**
```bash
cd "mobile-app/Original DAMP Smart Drinkware App"
```

### **Step 2: Start Expo from Correct Directory**
```bash
npx expo start --clear --android
```

### **Step 3: Expo Will Auto-Connect**
The `--android` flag will automatically connect to your running emulator!

---

## 🎯 **Alternative Method**

### **Method 1: Start and Auto-Open**
```bash
# From mobile app directory:
npx expo start --clear --android
```

### **Method 2: Start Then Press 'a'**
```bash
# Start the dev server
npx expo start --clear

# When prompted, press 'a' to open Android
```

### **Method 3: Use npm Script**
```bash
npm run android:dev
```

---

## 🔍 **Verifying Android Emulator**

Check if your emulator is detected:
```bash
adb devices
```

Expected output:
```
List of devices attached
emulator-5554   device
```

---

## 🐛 **If Android Doesn't Connect**

### **Issue: "No devices found"**
```bash
# Restart ADB
adb kill-server
adb start-server
adb devices
```

### **Issue: "Emulator offline"**
```bash
# Cold boot the emulator
# In Android Studio: Tools → Device Manager → Cold Boot Now
```

### **Issue: Expo not detecting emulator**
```bash
# Set Android environment variables
# Add to your system PATH:
# C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools
# C:\Users\YourName\AppData\Local\Android\Sdk\emulator
```

---

## 🚀 **What to Test**

Once the app loads on your Android emulator:

### **1. Home Screen**
- [ ] App launches without crash
- [ ] Home tab displays
- [ ] Navigation bar visible

### **2. Products**
- [ ] Navigate to Store/Products
- [ ] 4 products display (Handle, Sleeve, Bottom, Baby)
- [ ] Product images load
- [ ] Prices show correctly

### **3. Device Management**
- [ ] Navigate to Devices tab
- [ ] "Add Device" button visible
- [ ] Tap Add Device
- [ ] Permission dialog appears for Bluetooth
- [ ] Grant permission
- [ ] Device wizard opens

### **4. Voting**
- [ ] Navigate to Voting tab
- [ ] 4 product options display
- [ ] Can tap to vote
- [ ] Vote counts update

### **5. Settings**
- [ ] Navigate to Settings
- [ ] Account options visible
- [ ] Sign in button works
- [ ] App info displays

---

## ⚡ **Quick Commands**

```bash
# Start and auto-open on Android
npx expo start --clear --android

# Just start dev server
npx expo start --clear

# Check Android devices
adb devices

# Restart if needed
adb kill-server && adb start-server
```

---

## 📊 **Expected Performance**

On Android Emulator:
- **First Load**: 10-30 seconds (building bundle)
- **Subsequent Loads**: 3-5 seconds (cached)
- **Hot Reload**: ~1 second

---

## 🎉 **Success Checklist**

- [ ] Expo dev server starts from correct directory
- [ ] Android emulator detected by ADB
- [ ] App installs on emulator
- [ ] App opens without crash
- [ ] All 5 tabs navigate correctly
- [ ] Firebase connects (check console logs)
- [ ] No red error screens

---

**Ready to test!** Just run:
```bash
cd "mobile-app/Original DAMP Smart Drinkware App"
npx expo start --clear --android
```

