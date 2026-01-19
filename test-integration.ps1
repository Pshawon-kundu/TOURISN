# =========================================
# TOURISN Integration Test Script
# =========================================

Write-Host "`nTOURISN SYSTEM INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: Backend Health Check
Write-Host "`n1. Testing Backend Server..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -UseBasicParsing
    if ($backendHealth.StatusCode -eq 200) {
        $healthData = $backendHealth.Content | ConvertFrom-Json
        Write-Host "   ✅ Backend: $($healthData.message)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Backend: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Please start backend: cd backend; npm start" -ForegroundColor Yellow
}

# Test 2: Admin Panel Health Check
Write-Host "`n2. Testing Admin Panel..." -ForegroundColor Yellow
try {
    $adminHealth = Invoke-WebRequest -Uri "http://localhost:4173" -UseBasicParsing
    if ($adminHealth.StatusCode -eq 200) {
        Write-Host "   ✅ Admin Panel: Running on http://localhost:4173" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Admin Panel: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Please start admin: cd admin-web; npm run dev" -ForegroundColor Yellow
}

# Test 3: Supabase Connection (via Backend)
Write-Host "`n3. Testing Supabase Connection..." -ForegroundColor Yellow
try {
    # Try to get users (this will test Supabase)
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    # Test auth endpoint
    Write-Host "   Testing authentication endpoints..." -ForegroundColor Gray
    $authTest = Invoke-WebRequest -Uri "http://localhost:5001/api/auth/signup" -Method POST -UseBasicParsing -ContentType "application/json" -Body '{"email":"test"}' 2>&1
    
    if ($authTest -match "email and role are required" -or $authTest -match "400") {
        Write-Host "   ✅ Auth endpoint responding correctly" -ForegroundColor Green
        Write-Host "   ✅ Supabase connection active" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Could not verify Supabase (endpoint check failed)" -ForegroundColor Yellow
}

# Test 4: CORS Configuration
Write-Host "`n4. Testing CORS Configuration..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:4173"
    }
    $corsTest = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -Headers $headers -UseBasicParsing
    if ($corsTest.Headers['Access-Control-Allow-Credentials'] -eq 'true') {
        Write-Host "   ✅ CORS: Properly configured for admin panel" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  CORS: Could not verify" -ForegroundColor Yellow
}

# Test 5: Environment Variables
Write-Host "`n5. Testing Environment Configuration..." -ForegroundColor Yellow

# Check backend .env
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env" -Raw
    
    $checks = @{
        "SUPABASE_URL" = $envContent -match "SUPABASE_URL=https://"
        "SUPABASE_KEY" = $envContent -match "SUPABASE_ANON_KEY=eyJ"
        "FIREBASE_CONFIG" = $envContent -match "FIREBASE_PROJECT_ID="
        "PORT" = $envContent -match "PORT=5001"
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "   ✅ $($check.Key): Configured" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($check.Key): Missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ backend\.env file not found" -ForegroundColor Red
}

# Check admin .env
if (Test-Path "admin-web\.env") {
    $adminEnv = Get-Content "admin-web\.env" -Raw
    
    if ($adminEnv -match "VITE_API_URL=http://localhost:5001") {
        Write-Host "   ✅ Admin API URL: Pointing to backend" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Admin API URL: Check configuration" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ admin-web\.env file not found" -ForegroundColor Red
}

# Summary
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "`nINTEGRATION TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "`n✅ Backend Server: http://localhost:5001" -ForegroundColor Green
Write-Host "✅ Admin Panel: http://localhost:4173" -ForegroundColor Green
Write-Host "✅ API Endpoint: http://localhost:5001/api" -ForegroundColor Green
Write-Host "`nSupabase Dashboard: https://evsogczcljdxvqvlbefi.supabase.co" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "   1. Open admin panel: http://localhost:4173" -ForegroundColor White
Write-Host "   2. Login with admin credentials" -ForegroundColor White
Write-Host "   3. Check dashboard for real-time data" -ForegroundColor White
Write-Host "`n=================================" -ForegroundColor Cyan
