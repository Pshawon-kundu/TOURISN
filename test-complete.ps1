# =========================================
# TOURISN COMPLETE INTEGRATION TEST
# Tests: Frontend, Backend, Database, Admin Panel
# =========================================

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "TOURISN COMPLETE SYSTEM TEST" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

# Test 1: Backend Health
Write-Host "`n[1/8] Testing Backend Server..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -UseBasicParsing -TimeoutSec 5
    if ($backend.StatusCode -eq 200) {
        Write-Host "   PASS - Backend running on port 5001" -ForegroundColor Green
        $testsPassed++
    }
} catch {
    Write-Host "   FAIL - Backend not responding" -ForegroundColor Red
    Write-Host "   Start with: cd backend; npm start" -ForegroundColor Yellow
    $testsFailed++
}

# Test 2: Admin Panel
Write-Host "`n[2/8] Testing Admin Panel..." -ForegroundColor Yellow
try {
    $admin = Invoke-WebRequest -Uri "http://localhost:4173" -UseBasicParsing -TimeoutSec 5
    if ($admin.StatusCode -eq 200) {
        Write-Host "   PASS - Admin panel accessible at http://localhost:4173" -ForegroundColor Green
        $testsPassed++
    }
} catch {
    Write-Host "   FAIL - Admin panel not running" -ForegroundColor Red
    Write-Host "   Start with: cd admin-web; npm run dev" -ForegroundColor Yellow
    $testsFailed++
}

# Test 3: Frontend (Expo)
Write-Host "`n[3/8] Testing Frontend Server..." -ForegroundColor Yellow
$frontendRunning = $false
$ports = @(8081, 19000, 19001, 19002)
foreach ($port in $ports) {
    try {
        $test = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($test.StatusCode -eq 200) {
            Write-Host "   PASS - Frontend running on port $port" -ForegroundColor Green
            $frontendRunning = $true
            $testsPassed++
            break
        }
    } catch {
        # Continue checking other ports
    }
}
if (-not $frontendRunning) {
    Write-Host "   FAIL - Frontend not detected on common ports" -ForegroundColor Red
    Write-Host "   Start with: cd frontend; npm run dev" -ForegroundColor Yellow
    $testsFailed++
}

# Test 4: Supabase Connection
Write-Host "`n[4/8] Testing Supabase Connection..." -ForegroundColor Yellow
try {
    $supabaseUrl = "https://evsogczcljdxvqvlbefi.supabase.co/rest/v1/"
    $headers = @{
        "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDYzODQsImV4cCI6MjA4MzEyMjM4NH0.Rv0P3Mtz5GpHH4UsUP2X2dX9pYM5HzNtgQ2HDn8hxY4"
    }
    $test = Invoke-WebRequest -Uri $supabaseUrl -Headers $headers -UseBasicParsing -TimeoutSec 5
    Write-Host "   PASS - Supabase database accessible" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "   FAIL - Cannot connect to Supabase" -ForegroundColor Red
    $testsFailed++
}

# Test 5: Backend Auth Endpoint
Write-Host "`n[5/8] Testing Auth Endpoints..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test@test.com"
        password = "test123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 5 2>&1
    
    # Expected to fail with "user not found" which means endpoint is working
    if ($response -match "user" -or $response -match "400" -or $response -match "401") {
        Write-Host "   PASS - Auth endpoints responding correctly" -ForegroundColor Green
        $testsPassed++
    }
} catch {
    if ($_.Exception.Message -match "user" -or $_.Exception.Message -match "400" -or $_.Exception.Message -match "401") {
        Write-Host "   PASS - Auth endpoints responding correctly" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   FAIL - Auth endpoints not responding" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 6: Database Tables
Write-Host "`n[6/8] Testing Database Schema..." -ForegroundColor Yellow
if (Test-Path "test-schema.js") {
    try {
        $schemaTest = node test-schema.js 2>&1
        if ($schemaTest -match "users: Table exists" -and $schemaTest -match "transport_bookings: Table exists") {
            Write-Host "   PASS - All required tables exist" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "   FAIL - Some tables missing" -ForegroundColor Red
            $testsFailed++
        }
    } catch {
        Write-Host "   FAIL - Could not verify schema" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "   SKIP - test-schema.js not found" -ForegroundColor Yellow
}

# Test 7: CORS Configuration
Write-Host "`n[7/8] Testing CORS..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:4173"
    }
    $cors = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -Headers $headers -UseBasicParsing -TimeoutSec 5
    if ($cors.Headers['Access-Control-Allow-Credentials'] -eq 'true') {
        Write-Host "   PASS - CORS configured correctly" -ForegroundColor Green
        $testsPassed++
    }
} catch {
    Write-Host "   FAIL - CORS not configured" -ForegroundColor Red
    $testsFailed++
}

# Test 8: Environment Variables
Write-Host "`n[8/8] Testing Environment Configuration..." -ForegroundColor Yellow
$envOk = $true

if (Test-Path "backend\.env") {
    $backendEnv = Get-Content "backend\.env" -Raw
    if ($backendEnv -match "SUPABASE_URL" -and $backendEnv -match "SUPABASE_ANON_KEY" -and $backendEnv -match "PORT=5001") {
        Write-Host "   PASS - Backend environment configured" -ForegroundColor Green
    } else {
        Write-Host "   FAIL - Backend .env incomplete" -ForegroundColor Red
        $envOk = $false
    }
} else {
    Write-Host "   FAIL - Backend .env missing" -ForegroundColor Red
    $envOk = $false
}

if (Test-Path "frontend\.env") {
    $frontendEnv = Get-Content "frontend\.env" -Raw
    if ($frontendEnv -match "EXPO_PUBLIC_SUPABASE_URL" -and $frontendEnv -match "EXPO_PUBLIC_API_URL") {
        Write-Host "   PASS - Frontend environment configured" -ForegroundColor Green
    } else {
        Write-Host "   FAIL - Frontend .env incomplete" -ForegroundColor Red
        $envOk = $false
    }
} else {
    Write-Host "   FAIL - Frontend .env missing" -ForegroundColor Red
    $envOk = $false
}

if ($envOk) {
    $testsPassed++
} else {
    $testsFailed++
}

# Summary
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White

if ($testsFailed -eq 0) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "System is fully operational" -ForegroundColor Green
} else {
    Write-Host "`nSOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host "Review errors above and fix issues" -ForegroundColor Yellow
}

# Service URLs
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "SERVICE URLS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Backend API:    http://localhost:5001/api" -ForegroundColor White
Write-Host "Admin Panel:    http://localhost:4173" -ForegroundColor White
Write-Host "Frontend:       http://localhost:8081 (or check expo output)" -ForegroundColor White
Write-Host "Supabase:       https://evsogczcljdxvqvlbefi.supabase.co" -ForegroundColor White

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "QUICK COMMANDS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Start Backend:  cd backend; npm start" -ForegroundColor White
Write-Host "Start Admin:    cd admin-web; npm run dev" -ForegroundColor White
Write-Host "Start Frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host "Test Supabase:  cd backend; node ..\test-supabase.js" -ForegroundColor White
Write-Host "`n=========================================" -ForegroundColor Cyan
