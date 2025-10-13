# 📱 Android Studio Emulator - Testing Guide for DAMP App

## 🔄 **How to Reload Changes in Emulator**

### **Method 1: Press `r` in Expo Terminal** (Fastest)
```
1. Go to your PowerShell/Terminal where Expo is running
2. Press the 'r' key
3. Emulator app will reload immediately
```

### **Method 2: Shake Gesture in Emulator**
```
1. In Android Studio, go to emulator controls (right side)
2. Click the "More" button (⋮)
3. Click "Virtual sensors"
4. Or use keyboard shortcut: Ctrl+M (Windows) or Cmd+M (Mac)
5. Select "Reload"
```

### **Method 3: Double R in Emulator**
```
1. Click on the emulator window
2. Press 'r' key twice quickly (double-tap R)
3. App reloads
```

### **Method 4: From Expo Dev Menu**
```
1. On emulator, press: Ctrl+M (Windows) or Cmd+M (Mac)
2. Or shake the emulator (⋮ → Virtual sensors → Shake)
3. Expo Dev menu appears
4. Tap "Reload"
```

---

## 🖥️ **How to See Emulator Logs in Android Studio**

### **Option 1: Logcat Window** (Best for Detailed Logs)

**Open Logcat**:
```
1. In Android Studio
2. Go to: View → Tool Windows → Logcat
3. Or click "Logcat" tab at bottom of IDE
4. Or press: Alt+6 (Windows) / Cmd+6 (Mac)
```

**Filter for DAMP App Logs**:
```
1. In Logcat search box at top, enter:
   package:com.damp.smartdrinkware

2. Or filter by tag:
   tag:ReactNativeJS

3. Or search for Firebase:
   Firebase

4. Or search for errors only:
   level:error
```

**Logcat Filters**:
| Filter | What It Shows |
|--------|---------------|
| `package:com.damp.smartdrinkware` | Only DAMP app logs |
| `tag:ReactNativeJS` | JavaScript console.log outputs |
| `tag:ExpoKit` | Expo-specific logs |
| `Firebase` | Firebase-related logs |
| `level:error` | Errors only |
| `level:warn` | Warnings and errors |

---

### **Option 2: Terminal ADB Logcat** (Raw Logs)

**In a NEW terminal/PowerShell**:
```powershell
# Show all logs from emulator
adb logcat

# Filter for DAMP app only
adb logcat | Select-String "com.damp"

# Filter for Firebase
adb logcat | Select-String "Firebase"

# Filter for React Native (your console.logs)
adb logcat | Select-String "ReactNativeJS"

# Show errors only
adb logcat *:E

# Clear old logs and start fresh
adb logcat -c
adb logcat
```

---

### **Option 3: Expo Terminal** (Simplest)

Your Expo terminal (where you see the QR code) will show:
```
Logs for your project will appear below...

LOG  📝 Attempting account creation... {"email":"test@dampdrink.com","hasAuth":true}
LOG  ✅ Account created successfully! test@dampdrink.com

ERROR ❌ Signup error: [Error object]
ERROR Error code: auth/operation-not-allowed
ERROR Error message: Firebase: Error (auth/operation-not-allowed).
```

---

## 📊 **What Each Log Source Shows**

### **Expo Terminal** (Best for Development):
- ✅ Your `console.log()` statements
- ✅ React errors
- ✅ Metro bundler status
- ✅ Hot reload notifications

### **Android Studio Logcat** (Best for System Issues):
- ✅ Native crashes
- ✅ Permission errors
- ✅ Android system logs
- ✅ Low-level debugging

### **ADB Logcat** (Best for Automation):
- ✅ Raw device logs
- ✅ Can filter with grep/findstr
- ✅ Can save to file
- ✅ Full control

---

## 🎯 **Complete Testing Workflow**

### **Setup**:
```
1. Open Android Studio
2. Open Logcat window (Alt+6)
3. Set filter: package:com.damp.smartdrinkware
4. Keep Expo terminal visible
5. Keep emulator window visible
```

### **Test Loop**:
```
1. Make code change in editor
2. Press 'r' in Expo terminal (reload)
3. Test feature in emulator
4. Watch logs in:
   - Expo terminal (console.logs)
   - Android Studio Logcat (system logs)
5. Repeat
```

---

## 🔍 **Finding Specific Logs**

### **For Firebase Auth Errors**:

**Android Studio Logcat**:
```
Filter: Firebase
Look for: ERROR level messages
```

**Expo Terminal**:
```
Look for:
📝 Attempting account creation...
❌ Signup error:
Error code: auth/...
```

**ADB Command**:
```powershell
adb logcat | Select-String "auth/"
```

---

## 🧪 **Test Your Auth NOW**

### **Step-by-Step**:

**1. Prepare Windows**:
```
- Android Studio → Logcat window open
- Expo terminal → visible
- Emulator → DAMP app running
```

**2. Reload App**:
```
- In Expo terminal, press: r
- Wait 2-3 seconds for reload
```

**3. Test Sign Up**:
```
- On emulator: Navigate to Sign Up
- Enter email: zach+mobiletest@wecr8.info
- Enter password: DampTest123!
- Tap "Create Account"
```

**4. Watch ALL Logs**:

**Expo Terminal should show**:
```
📝 Attempting account creation... {"email":"...","hasAuth":true}
```

**Android Studio Logcat should show**:
```
ReactNativeJS: 📝 Attempting account creation...
ReactNativeJS: ✅ Account created successfully!
OR
ReactNativeJS: ❌ Signup error:
ReactNativeJS: Error code: auth/...
```

---

## 🎨 **Android Studio Logcat Pro Tips**

### **Save Logs to File**:
```
Right-click in Logcat → Save As... → DAMP_test_logs.txt
```

### **Create Custom Filters**:
```
1. Click "+ Edit Filter Configuration"
2. Name: "DAMP App"
3. Package Name: com.damp.smartdrinkware
4. Tag: ReactNativeJS
5. Save
```

### **Clear Old Logs**:
```
Click the "Clear Logcat" button (trash icon)
Or: adb logcat -c
```

### **Pause/Resume Logs**:
```
Click the "Pause" button (||) to freeze logs
Click again to resume
```

---

## ⚡ **Quick Reference**

### **Reload App**:
- Expo Terminal: Press `r`
- Emulator: Press Ctrl+M → Reload
- Or: Double-tap `r` on keyboard

### **View Logs**:
- Android Studio: Alt+6 → Logcat
- ADB: `adb logcat`
- Expo: Look at terminal output

### **Debug Menu**:
- Emulator: Ctrl+M (Windows) or Cmd+M (Mac)
- Shows: Reload, Debug, Element Inspector

---

## 🎯 **Your Next Action**

**DO THIS NOW**:

1. **Press `r` in your Expo terminal** (reload app with new error logging code)
2. **Open Android Studio Logcat** (Alt+6)
3. **Filter Logcat**: Type `ReactNativeJS` in search
4. **In emulator**: Try to sign up with:
   - Email: `zach+test@wecr8.info`
   - Password: `DampTest123!`
5. **Watch BOTH**:
   - Expo terminal for `📝` logs
   - Logcat for `ReactNativeJS` logs

---

**After you reload and try to sign up, what do you see in the Expo terminal?** 

Does it show `hasAuth: true` or `hasAuth: false`? 🔍

