Write-Host "`n🔍 Checking Server Status...`n" -ForegroundColor Cyan

# Check Backend
try {
    $backend = Invoke-RestMethod -Uri "http://localhost:5001/api/guides" -Method GET -TimeoutSec 2
    Write-Host "✅ Backend: RUNNING on http://localhost:5001" -ForegroundColor Green
    Write-Host "   API Response: $($backend.success)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend: NOT RUNNING" -ForegroundColor Red
}

# Check Frontend
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:8081" -Method GET -TimeoutSec 2 -UseBasicParsing
    Write-Host "✅ Frontend: RUNNING on http://localhost:8081" -ForegroundColor Green
    Write-Host "   Status Code: $($frontend.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Frontend: NOT RUNNING" -ForegroundColor Red
}

Write-Host "`n📱 Open http://localhost:8081 in your browser!`n" -ForegroundColor Yellow
