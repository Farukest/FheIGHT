# FHEIGHT Server Start Script
# Kullanim: powershell -ExecutionPolicy Bypass -File start-servers.ps1

Write-Host "=== FHEIGHT Server Starter ===" -ForegroundColor Cyan

# 1. Portlari temizle
Write-Host "`n[1/4] Portlar temizleniyor..." -ForegroundColor Yellow
3000..3008 | ForEach-Object {
    Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { taskkill /PID $_ /F /T 2>$null }
}
8000..8008 | ForEach-Object {
    Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { taskkill /PID $_ /F /T 2>$null }
}
18000..18008 | ForEach-Object {
    Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { taskkill /PID $_ /F /T 2>$null }
}
Write-Host "Portlar temizlendi." -ForegroundColor Green

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

# Dev Server (sessiz)
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$projectPath'; npm run dev"

Write-Host "`n[4/5] Sunucular baslatildi!" -ForegroundColor Green

# 5. JS Build (Browserify)
Write-Host "`n[5/5] JS build yapiliyor (npx gulp js)..." -ForegroundColor Yellow
Set-Location $projectPath
npx gulp js

Write-Host "`nTamamlandi!" -ForegroundColor Green
Write-Host "`nSunucular:" -ForegroundColor Cyan
Write-Host "  API Server:    http://localhost:3000" -ForegroundColor White
Write-Host "  Game Server:   http://localhost:18000 (Single Player)" -ForegroundColor White
Write-Host "  Dev Server:    http://localhost:3001  <-- BURAYI AC" -ForegroundColor Green
Write-Host "`nTarayicida http://localhost:3001 adresini ac." -ForegroundColor Yellow


