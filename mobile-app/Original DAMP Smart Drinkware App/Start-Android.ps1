# DAMP Smart Drinkware - Start Android Emulator Test
# PowerShell script to ensure correct directory and start Expo

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DAMP Smart Drinkware - Android Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory (where this .ps1 file is located)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Current directory: $PWD" -ForegroundColor Green
Write-Host ""

# Verify app.json exists
if (Test-Path "app.json") {
    Write-Host "✅ Found app.json - we're in the correct directory!" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: app.json not found! Wrong directory!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Killing any existing Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Write-Host ""

Write-Host "Starting Expo dev server for Android..." -ForegroundColor Cyan
Write-Host "This will automatically open on your Android emulator" -ForegroundColor Cyan
Write-Host ""

npx expo start --android

