$headers = @{
    'Content-Type' = 'application/json'
}

Write-Host "`n=== Testing NID Security with Multiple Fake Patterns ===`n" -ForegroundColor Cyan

# Test 1: 12-digit fake NID (123456789010)
Write-Host "Test 1: 12-digit fake NID (123456789010)" -ForegroundColor Yellow
$body1 = @{
    userId = 'test-user-1'
    nidNumber = '123456789010'
    dateOfBirth = '1995-01-01'
    nidImageBase64 = 'data:image/jpeg;base64,test'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/nid/verify' -Method POST -Headers $headers -Body $body1
    Write-Host "  ❌ ACCEPTED (BAD!)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ✅ REJECTED: $($errorResponse.message)" -ForegroundColor Green
}

# Test 2: 10-digit sequential (1234567890)
Write-Host "`nTest 2: 10-digit sequential (1234567890)" -ForegroundColor Yellow
$body2 = @{
    userId = 'test-user-2'
    nidNumber = '1234567890'
    dateOfBirth = '1995-01-01'
    nidImageBase64 = 'data:image/jpeg;base64,test'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/nid/verify' -Method POST -Headers $headers -Body $body2
    Write-Host "  ❌ ACCEPTED (BAD!)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ✅ REJECTED: $($errorResponse.message)" -ForegroundColor Green
}

# Test 3: 10-digit all 1s (1111111111)
Write-Host "`nTest 3: 10-digit all 1s (1111111111)" -ForegroundColor Yellow
$body3 = @{
    userId = 'test-user-3'
    nidNumber = '1111111111'
    dateOfBirth = '1995-01-01'
    nidImageBase64 = 'data:image/jpeg;base64,test'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/nid/verify' -Method POST -Headers $headers -Body $body3
    Write-Host "  ❌ ACCEPTED (BAD!)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ✅ REJECTED: $($errorResponse.message)" -ForegroundColor Green
}

# Test 4: Valid format (simulating real NID - 10 digits, not fake pattern)
Write-Host "`nTest 4: Valid-looking NID (9876543210)" -ForegroundColor Yellow
$body4 = @{
    userId = 'test-user-4'
    nidNumber = '9876543210'
    dateOfBirth = '1995-01-01'
    nidImageBase64 = 'data:image/jpeg;base64,test'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/nid/verify' -Method POST -Headers $headers -Body $body4
    if ($response.status -eq 'pending_review') {
        Write-Host "  ✅ ACCEPTED with manual review (GOOD!)" -ForegroundColor Green
        Write-Host "     Status: $($response.status)" -ForegroundColor Cyan
    } else {
        $jsonResponse = $response | ConvertTo-Json -Depth 2
        Write-Host "  ℹ️ Response: $jsonResponse" -ForegroundColor Cyan
    }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ⚠️ Unexpected rejection: $($errorResponse.message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
