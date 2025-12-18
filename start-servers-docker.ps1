# FHEIGHT Docker Restart Script
# Kullanim: powershell -ExecutionPolicy Bypass -File start-servers-docker.ps1

Write-Host "=== FHEIGHT Docker Restart ===" -ForegroundColor Cyan

# 1. Container'lari durdur (db haric)
Write-Host "`n[1/3] Container'lar durduruluyor (db haric)..." -ForegroundColor Yellow
$containers = @("fheight-source-redis-1", "fheight-source-api-1", "fheight-source-game-1", "fheight-source-worker-1", "fheight-source-sp-1")
foreach ($container in $containers) {
    docker stop $container 2>$null
    Write-Host "  $container durduruldu" -ForegroundColor Gray
}

# 2. Container'lari baslat
Write-Host "`n[2/3] Container'lar baslatiliyor..." -ForegroundColor Yellow
foreach ($container in $containers) {
    docker start $container 2>$null
    Write-Host "  $container baslatildi" -ForegroundColor Green
}

# 3. JS Build
Write-Host "`n[3/3] JS build yapiliyor (gulp js)..." -ForegroundColor Yellow
$projectPath = "C:\Users\Farukest-Working\Desktop\PROJECT\FHEIGHT\fheight-source"
Set-Location $projectPath
npx gulp js

Write-Host "`n=== TAMAMLANDI ===" -ForegroundColor Green
Write-Host "`nCalisanlar:" -ForegroundColor Cyan
Write-Host "  db-1       : PostgreSQL (5432)" -ForegroundColor White
Write-Host "  redis-1    : Redis (6379)" -ForegroundColor White
Write-Host "  api-1      : API Server (3000)" -ForegroundColor White
Write-Host "  sp-1       : Single Player (8000)" -ForegroundColor White
Write-Host "  game-1     : Multiplayer (8001)" -ForegroundColor White
Write-Host "  worker-1   : Kue Job Processor" -ForegroundColor White
Write-Host "`nTarayicida: http://localhost:3000" -ForegroundColor Green
