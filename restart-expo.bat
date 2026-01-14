@echo off
echo Stopping all Node/Expo processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM expo.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo Clearing Metro bundler cache...
cd /d C:\Users\PK\TOURISN_SW\frontend
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo

echo Starting Expo with cleared cache...
npx expo start --clear