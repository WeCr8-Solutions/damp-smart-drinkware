# DAMP Smart Drinkware - Manual Netlify Deploy Script
# This script builds and deploys the site using Netlify CLI
# Use this if you want to keep the repo private without upgrading

Write-Host "🚀 DAMP Smart Drinkware - Netlify Manual Deploy" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Netlify CLI is installed
Write-Host "📦 Checking Netlify CLI..." -ForegroundColor Yellow
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue

if (-not $netlifyInstalled) {
    Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Red
    npm install -g netlify-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Netlify CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Netlify CLI installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Netlify CLI found" -ForegroundColor Green
}

Write-Host ""

# Check if logged in
Write-Host "🔐 Checking Netlify authentication..." -ForegroundColor Yellow
$authStatus = netlify status 2>&1

if ($authStatus -match "Not logged in") {
    Write-Host "❌ Not logged in to Netlify" -ForegroundColor Red
    Write-Host "🔑 Opening browser for authentication..." -ForegroundColor Yellow
    netlify login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Authentication failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Already authenticated" -ForegroundColor Green
}

Write-Host ""

# Check if site is linked
Write-Host "🔗 Checking site link..." -ForegroundColor Yellow
$linkStatus = netlify status 2>&1

if ($linkStatus -match "No site configured") {
    Write-Host "❌ Site not linked" -ForegroundColor Red
    Write-Host "🔗 Linking to existing site..." -ForegroundColor Yellow
    netlify link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link site" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Site linked successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Site already linked" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🎯 Ready to deploy!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Deploy to production? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Cyan
Write-Host ""

# Deploy to production
netlify deploy --prod --dir=website --functions=netlify/functions

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your site is now live at: https://dampdrink.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Visit https://dampdrink.com to verify deployment" -ForegroundColor White
    Write-Host "  2. Check browser console for any errors" -ForegroundColor White
    Write-Host "  3. Test cart and checkout functionality" -ForegroundColor White
    Write-Host "  4. Monitor GA4 analytics dashboard" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check that all files are committed" -ForegroundColor White
    Write-Host "  2. Verify Netlify authentication: netlify status" -ForegroundColor White
    Write-Host "  3. Check Netlify site link: netlify unlink && netlify link" -ForegroundColor White
    Write-Host "  4. Review Netlify logs: netlify watch" -ForegroundColor White
    Write-Host ""
    exit 1
}

