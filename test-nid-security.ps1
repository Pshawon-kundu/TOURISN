$headers = @{
    'Content-Type' = 'application/json'
    'X-User-Email' = 'shawonkundu5@gmail.com'
}

$body = @{
    userId = 'test-user-123'
    nidNumber = '123456789010'
    dateOfBirth = '1995-01-01'
    nidImageBase64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
} | ConvertTo-Json

Write-Host "`nTesting NID Verification with FAKE NID: 123456789010`n" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/nid/verify' -Method POST -Headers $headers -Body $body
    Write-Host "❌ SECURITY ISSUE: Fake NID was ACCEPTED!" -ForegroundColor Red
    Write-Host "Response:" -ForegroundColor Red
    $response | Format-List
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "HTTP Status: $statusCode"
    
    try {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error Message: $($errorResponse.message)"
        
        if ($errorResponse.message -match 'Invalid NID|fake|actual|enter your actual') {
            Write-Host "`n✅ SUCCESS: Fake NID was properly REJECTED!" -ForegroundColor Green
            Write-Host "The security fix is working correctly." -ForegroundColor Green
        } else {
            Write-Host "`n⚠️ Different error: $($errorResponse.message)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Error Details: $($_.ErrorDetails.Message)"
    }
}
