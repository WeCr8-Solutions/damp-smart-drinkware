# Firebase Emulator Data Import Script for DAMP Voting System
# Imports voting data directly into the local Firestore emulator

$FIRESTORE_EMULATOR = "http://localhost:8080"
$PROJECT_ID = "damp-smart-drinkware"

Write-Host "🚀 Importing DAMP Voting Data into Firebase Emulator..." -ForegroundColor Green

# Function to make HTTP requests to Firestore emulator
function Import-Document {
    param(
        [string]$Collection,
        [string]$DocumentId,
        [string]$JsonFile
    )
    
    $url = "$FIRESTORE_EMULATOR/v1/projects/$PROJECT_ID/databases/(default)/documents/$Collection"
    $body = Get-Content $JsonFile -Raw
    
    # Create document with specific ID
    $documentUrl = "$url/$DocumentId"
    
    try {
        $response = Invoke-RestMethod -Uri $documentUrl -Method Patch -Body $body -ContentType "application/json"
        Write-Host "✅ Created $Collection/$DocumentId" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Failed to create $Collection/$DocumentId : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Import voting collection documents
Write-Host "`n📋 Importing voting collection..." -ForegroundColor Cyan
Import-Document -Collection "voting" -DocumentId "productVoting" -JsonFile "firebase-import-data/voting-productVoting.json"
Import-Document -Collection "voting" -DocumentId "settings" -JsonFile "firebase-import-data/voting-settings.json"

# Import stats collection documents  
Write-Host "`n📊 Importing stats collection..." -ForegroundColor Cyan
Import-Document -Collection "stats" -DocumentId "global" -JsonFile "firebase-import-data/stats-global.json"

Write-Host "`n🎉 Data import completed!" -ForegroundColor Green
Write-Host "`n🔗 Access your data:" -ForegroundColor Cyan
Write-Host "  • Emulator UI: http://localhost:4000/firestore" -ForegroundColor White
Write-Host "  • Test Voting: http://localhost:5000/test-voting-system.html" -ForegroundColor White
Write-Host "`n💡 Next steps:" -ForegroundColor Cyan
Write-Host "  • Open the Emulator UI to verify data was imported" -ForegroundColor White
Write-Host "  • Test the voting system on your website" -ForegroundColor White