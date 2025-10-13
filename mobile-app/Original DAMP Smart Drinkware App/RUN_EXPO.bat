@echo off
echo ========================================
echo DAMP Mobile App - Starting Expo
echo ========================================
echo.
echo Current Directory: %CD%
echo.
echo Starting Expo Metro Bundler...
echo.

REM Start Expo from this directory
npx expo start --clear

echo.
echo ========================================
echo Expo has stopped
echo ========================================
pause

