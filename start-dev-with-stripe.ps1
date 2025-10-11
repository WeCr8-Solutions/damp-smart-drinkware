# DAMP Smart Drinkware - Local Stripe Testing with Netlify Dev
# This script starts Netlify Dev for local Stripe checkout testing

Write-Host "🚀 Starting DAMP Smart Drinkware with Netlify Dev..." -ForegroundColor Cyan
Write-Host ""

# Check if Netlify CLI is installed
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue
if (-not $netlifyInstalled) {
    Write-Host "❌ Netlify CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Netlify CLI globally..." -ForegroundColor Yellow
    npm install -g netlify-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Netlify CLI" -ForegroundColor Red
        Write-Host "Please install manually: npm install -g netlify-cli" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Netlify CLI installed successfully!" -ForegroundColor Green
}

# Check if project is linked
Write-Host "🔗 Checking Netlify project link..." -ForegroundColor Cyan
$netlifyConfig = Test-Path ".netlify/state.json"
if (-not $netlifyConfig) {
    Write-Host "⚠️ Project not linked to Netlify" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Linking project..." -ForegroundColor Yellow
    netlify link
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link project" -ForegroundColor Red
        Write-Host "Please link manually: netlify link" -ForegroundColor Yellow
        exit 1
    }
}

# Check if Stripe key is set
Write-Host "🔑 Checking Stripe environment variables..." -ForegroundColor Cyan
$envList = netlify env:list 2>&1 | Out-String

if ($envList -notmatch "STRIPE_SECRET_KEY") {
    Write-Host "⚠️ STRIPE_SECRET_KEY not set!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please set your Stripe test secret key:" -ForegroundColor Yellow
    Write-Host "netlify env:set STRIPE_SECRET_KEY sk_test_YOUR_KEY_HERE" -ForegroundColor White
    Write-Host ""
    Write-Host "Get your test key from: https://dashboard.stripe.com/test/apikeys" -ForegroundColor Cyan
    Write-Host ""
    
    $setKey = Read-Host "Would you like to set it now? (y/n)"
    if ($setKey -eq "y" -or $setKey -eq "Y") {
        $stripeKey = Read-Host "Enter your Stripe test secret key (sk_test_...)"
        netlify env:set STRIPE_SECRET_KEY $stripeKey
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to set Stripe key" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Stripe key set successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Skipping Stripe key setup - checkout will not work" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Stripe key is configured" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 Starting Netlify Dev" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local access:" -ForegroundColor Yellow
Write-Host "  • http://localhost:8888/pages/pre-sale-funnel.html" -ForegroundColor White
Write-Host ""
Write-Host "Network access:" -ForegroundColor Yellow
Write-Host "  • http://192.168.1.6:8888/pages/pre-sale-funnel.html" -ForegroundColor White
Write-Host ""
Write-Host "Netlify Functions:" -ForegroundColor Yellow
Write-Host "  • http://localhost:8888/.netlify/functions/create-checkout-session" -ForegroundColor White
Write-Host ""
Write-Host "Test with Stripe test card: 4242 4242 4242 4242" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host ""

# Start Netlify Dev
# Note: Netlify Dev automatically binds to 0.0.0.0, no --host flag needed
netlify dev

