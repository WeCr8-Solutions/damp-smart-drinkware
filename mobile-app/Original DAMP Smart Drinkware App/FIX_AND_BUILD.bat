@echo off
echo.
echo ========================================
echo   DAMP Mobile App - Complete Fix
echo ========================================
echo.
echo This will:
echo 1. Navigate to the correct directory
echo 2. Clean and regenerate native project
echo 3. Build the APK with all modules
echo 4. Install on emulator
echo 5. Start Metro bundler
echo.
echo Total time: ~5-7 minutes
echo.
echo ========================================
echo.

cd /d "%~dp0"
echo Current Directory: %CD%
echo.

echo Step 1: Cleaning native project...
echo.
npx expo prebuild --clean --platform android
echo.

echo Step 2: Building and installing APK...
echo.
npx expo run:android

