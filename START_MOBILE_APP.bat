@echo off
cls
echo.
echo ============================================
echo   DAMP Mobile App - Android Test Launcher
echo ============================================
echo.

REM Kill any running Node processes
echo [1/4] Killing existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
echo       Done!
echo.

REM Navigate to mobile app directory
echo [2/4] Navigating to mobile app directory...
cd /d "%~dp0mobile-app\Original DAMP Smart Drinkware App"
echo       Current directory: %CD%
echo.

REM Verify app.json exists
if not exist "app.json" (
    echo ERROR: app.json not found! Wrong directory!
    echo Current location: %CD%
    pause
    exit /b 1
)
echo [3/4] Verified app.json exists - we're in the right place!
echo.

REM Start Expo
echo [4/4] Starting Expo dev server for Android...
echo       This will open your Android emulator automatically
echo.
echo ============================================
echo.
npx expo start --android

