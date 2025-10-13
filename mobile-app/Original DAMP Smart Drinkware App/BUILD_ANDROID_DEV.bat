@echo off
echo ========================================
echo DAMP Mobile App - Start Development Build
echo ========================================
echo.
echo This will:
echo 1. Start Metro bundler (from correct directory)
echo 2. Connect to the installed APK on your emulator
echo 3. Enable hot reload for instant updates
echo.
echo If APK is not installed, run:
echo   npx expo run:android
echo.
echo ========================================
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.
npx expo start --dev-client

pause

