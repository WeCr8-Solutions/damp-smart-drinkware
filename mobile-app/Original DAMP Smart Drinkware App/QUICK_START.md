# 🚀 DAMP Mobile App - QUICK START

## ⚡ **Fastest Way to Test**

### **Method 1: PowerShell Script** (Recommended)
```powershell
# From ANY directory, run:
cd "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\mobile-app\Original DAMP Smart Drinkware App"
.\Start-Android.ps1
```

### **Method 2: Batch File**
```powershell
# Double-click this file in File Explorer:
mobile-app\Original DAMP Smart Drinkware App\START_ANDROID.bat
```

### **Method 3: Manual Commands**
```powershell
# 1. Navigate to mobile app
cd "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\mobile-app\Original DAMP Smart Drinkware App"

# 2. Verify you're in the right place
ls app.json

# 3. Start Expo
npx expo start --android
```

---

## ✅ **Success Checklist**

You'll know it's working when you see:

```
✅ Starting project at ...mobile-app\Original DAMP Smart Drinkware App
✅ Starting Metro Bundler
✅ QR code displays
✅ › Opening on Android...
✅ › Building JavaScript bundle...
✅ App opens on your emulator
```

---

## ❌ **Common Issue: Wrong Directory**

If you see:
```
Starting project at C:\Users\Zach\Documents\Projects\damp-smart-drinkware
CommandError: Required property 'android.package' is not found
```

**This means you're in the MAIN project root, not the mobile app folder!**

**Solution**: Use the full path:
```powershell
cd "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\mobile-app\Original DAMP Smart Drinkware App"
```

---

## 🎯 **The Key Issue**

Your project structure is:
```
damp-smart-drinkware/          ← Main website project
├── website/
├── package.json              ← Website dependencies
└── mobile-app/
    └── Original DAMP Smart Drinkware App/    ← Mobile app project
        ├── app.json          ← Mobile app config
        ├── package.json      ← Mobile app dependencies
        └── app/              ← Mobile app code
```

**Expo MUST run from the mobile app folder**, not the main project root!

---

## 🔧 **Kill All Node Processes First**

If port 8081 is in use:
```powershell
taskkill /F /IM node.exe
```

---

## 📱 **Once It Starts**

You'll see a QR code and can press:
- **`a`** - Open Android (auto-triggered)
- **`w`** - Open web browser  
- **`r`** - Reload app
- **`j`** - Open debugger

---

**TRY THIS NOW**:
```powershell
cd "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\mobile-app\Original DAMP Smart Drinkware App"
npx expo start --android
```

And watch for `Starting project at` - it MUST show the mobile-app path!

