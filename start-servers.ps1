# FHEIGHT Server Start Script
# Kullanim: powershell -ExecutionPolicy Bypass -File start-servers.ps1

Write-Host "=== FHEIGHT Server Starter ===" -ForegroundColor Cyan

# 1. TUM NODE PROCESSLERINI OLDUR (Worker dahil!)
Write-Host "`n[1/4] Tum Node processleri durduruluyor..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "Tum Node processleri durduruldu." -ForegroundColor Green

# 2. Redis kontrol
Write-Host "`n[2/4] Redis kontrol ediliyor..." -ForegroundColor Yellow
docker start redis-fheight 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Redis baslatildi." -ForegroundColor Green
} else {
    Write-Host "Redis zaten calisiyor veya bulunamadi." -ForegroundColor Yellow
}

# 3. Bekle
Start-Sleep -Seconds 2

# 4. Sunuculari baslat
Write-Host "`n[3/4] Sunucular baslatiliyor..." -ForegroundColor Yellow
$projectPath = "C:\Users\Farukest-Working\Desktop\PROJECT\FHEIGHT\fheight-source"

# API Server (sessiz)
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$projectPath'; node -r dotenv/config ./bin/api"

# Single Player Server (sessiz)
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$projectPath'; node -r dotenv/config ./bin/single_player"

# Multiplayer Game Server (port 8001 - GAME_PORT)
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$projectPath'; node -r dotenv/config ./bin/game"

# Worker (Kue job processor - oyun sonu islemleri icin ZORUNLU)
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$projectPath'; node -r dotenv/config ./bin/worker"

# Dev Server (sessiz)
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$projectPath'; npm run dev"

Write-Host "`n[4/5] Sunucular baslatildi!" -ForegroundColor Green

# 5. JS Build (Browserify)
Write-Host "`n[5/5] JS build yapiliyor (npx gulp js)..." -ForegroundColor Yellow
Set-Location $projectPath
npx gulp js

Write-Host "`nTamamlandi!" -ForegroundColor Green
Write-Host "`nSunucular:" -ForegroundColor Cyan
Write-Host "  API Server:         http://localhost:3000" -ForegroundColor White
Write-Host "  Single Player:      http://localhost:8000" -ForegroundColor White
Write-Host "  Multiplayer Game:   http://localhost:8001" -ForegroundColor White
Write-Host "  Worker:             Kue job processor" -ForegroundColor White
Write-Host "  Dev Server:         http://localhost:3001  <-- BURAYI AC" -ForegroundColor Green
Write-Host "`nTarayicida http://localhost:3001 adresini ac." -ForegroundColor Yellow


