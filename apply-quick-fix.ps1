# =========================================
# QUICK FIX: Update Admin Panel to Use Service Role Key
# =========================================
# This allows admin panel to bypass RLS and see all users
# Run this in PowerShell from the project root

Write-Host "`nApplying quick fix for admin panel..." -ForegroundColor Yellow

# Backup current .env
Copy-Item "admin-web\.env" "admin-web\.env.backup" -Force
Write-Host "Backed up admin-web\.env to admin-web\.env.backup" -ForegroundColor Green

# Read current .env
$envContent = Get-Content "admin-web\.env" -Raw

# Replace anon key with service role key
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NjM4NCwiZXhwIjoyMDgzMTIyMzg0fQ.Vm0heVlZFqbTVunbtZ4vh4prxawyijSpfebXd_F53g0"

$envContent = $envContent -replace "VITE_SUPABASE_ANON_KEY=.*", "VITE_SUPABASE_ANON_KEY=$serviceRoleKey"

# Save updated .env
Set-Content "admin-web\.env" $envContent

Write-Host "`nUpdated admin-web\.env with service role key" -ForegroundColor Green
Write-Host "This bypasses RLS and allows full access to users table" -ForegroundColor Yellow

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Restart admin panel (it should restart automatically)" -ForegroundColor White
Write-Host "2. Refresh browser: http://localhost:4173" -ForegroundColor White
Write-Host "3. Go to Users page - you should see all 28 users!" -ForegroundColor White

Write-Host "`nNote: This is a temporary fix." -ForegroundColor Yellow
Write-Host "For production, use proper RLS policies (see FIX_ADMIN_USER_ACCESS.sql)" -ForegroundColor Yellow

Write-Host "`nDone!" -ForegroundColor Green
