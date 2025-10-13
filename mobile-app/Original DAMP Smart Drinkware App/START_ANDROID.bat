@echo off
echo.
echo ========================================
echo   DAMP Smart Drinkware - Android Test
echo ========================================
echo.
echo Navigating to mobile app directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Killing any existing Node processes...
taskkill /F /IM node.exe 2>nul
echo.
echo Starting Expo dev server...
echo This will open the app on your Android emulator
echo.
npx expo start --android

