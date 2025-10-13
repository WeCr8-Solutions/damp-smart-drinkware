@echo off
echo.
echo ========================================
echo   DAMP Smart Drinkware - Expo Start
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
echo Scan QR code with Expo Go app
echo.
npx expo start

