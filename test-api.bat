@echo off
echo Testing Guide Registration API...
echo.

curl -X POST http://localhost:5001/api/guides/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"testguide%RANDOM%@test.com\",\"password\":\"test123456\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"phone\":\"+8801700000000\",\"bio\":\"Expert guide\",\"specialties\":\"Cultural Tours\",\"languages\":\"English\",\"yearsOfExperience\":5,\"certifications\":\"\",\"nidNumber\":\"1234567890123\",\"nidImageUrl\":\"\",\"city\":\"Dhaka\",\"district\":\"Dhaka\",\"perHourRate\":500}"

echo.
echo.
echo Check backend console for logs
echo Check Supabase tables: users, guides, guide_verifications
pause
