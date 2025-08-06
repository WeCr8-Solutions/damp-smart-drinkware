# Create voting documents using PowerShell Invoke-WebRequest
$baseUrl = "http://localhost:8080/v1/projects/damp-smart-drinkware/databases/(default)/documents"

# Create a simple test document first
$testDoc = @{
    fields = @{
        test = @{
            stringValue = "hello"
        }
    }
} | ConvertTo-Json -Depth 10

try {
    Write-Host "Creating test document..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "$baseUrl/test" -Method POST -Body $testDoc -ContentType "application/json"
    Write-Host "Test document created successfully!" -ForegroundColor Green
    Write-Host "Response: $($response.StatusCode)" -ForegroundColor Yellow
}
catch {
    Write-Host "Error creating test document: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}

Write-Host "`nCheck the Firestore emulator UI at: http://localhost:4000/firestore" -ForegroundColor Cyan