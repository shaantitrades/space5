#!/usr/bin/env pwsh
# Démarrage du dev server - OMNIVERSA
# Cette version relie npm install + dev server

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OMNIVERSA - DEV SERVER (Plan B)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "e:\space 5"

# Vérifier si node_modules existe du tout
if (-not (Test-Path "node_modules")) {
    Write-Host "❌ node_modules manquant!" -ForegroundColor Red
    Write-Host "Lancement de npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install échoué!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✓ Installation détectée" -ForegroundColor Green
Write-Host ""
Write-Host "Démarrage du serveur de développement..." -ForegroundColor Cyan
Write-Host "Accédez à: http://localhost:3000" -ForegroundColor Green
Write-Host "Appuyez sur CTRL+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

# Lancer le dev server
npm run dev

exit 0
