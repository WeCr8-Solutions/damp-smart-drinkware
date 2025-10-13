@echo off
cls
echo.
echo ========================================
echo   DAMP Mobile App - Metro Bundler
echo ========================================
echo.
echo Starting Metro from the CORRECT directory...
echo.
cd /d "%~dp0"
echo Current Directory: %CD%
echo.
echo This directory should end with:
echo "mobile-app\Original DAMP Smart Drinkware App"
echo.
pause
echo.
echo Starting Metro Bundler...
echo.
npx expo start --dev-client --clear

