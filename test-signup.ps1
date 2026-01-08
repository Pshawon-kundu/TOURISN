Write-Host "Testing Signup Endpoint..."
Write-Host "========================"

$email = "testuser$(Get-Random)@example.com"
$body = @{
    email = $email
    firstName = "Test"
    lastName = "User"
    role = "user"
    phone = "1234567890"
} | ConvertTo-Json

Write-Host "`nRequest Body:"
Write-Host $body

try {
    Write-Host "`nSending POST request to http://localhost:5001/api/auth/signup..."
    
    $response = Invoke-WebRequest -Uri "http://localhost:5001/api/auth/signup" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body
    
    Write-Host "`n✅ SUCCESS - Status Code: $($response.StatusCode)"
    Write-Host "`nResponse:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "`n❌ ERROR"
    Write-Host $_.Exception.Message
    
    if ($_.Exception.Response) {
        Write-Host "`nResponse Status: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $content = $reader.ReadToEnd()
        Write-Host "Response Body:"
        Write-Host $content
        $reader.Close()
    }
}

Write-Host "`n========================"
Write-Host "Test Complete"
