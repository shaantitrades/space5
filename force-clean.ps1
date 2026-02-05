# Script de nettoyage force - Supprime node_modules meme si verrouille
# Executez ce script dans PowerShell : .\force-clean.ps1

Write-Host ""
Write-Host "Nettoyage force de node_modules..." -ForegroundColor Cyan
Write-Host ""

# Arreter TOUS les processus Node.js
Write-Host "1. Arret de tous les processus Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name npx -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5

# Supprimer node_modules avec retry
Write-Host "2. Suppression de node_modules (avec retry)..." -ForegroundColor Yellow
$maxRetries = 5
$retryCount = 0

while ($retryCount -lt $maxRetries -and (Test-Path "node_modules")) {
    $retryCount++
    Write-Host "   Tentative $retryCount/$maxRetries..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

if (Test-Path "node_modules") {
    Write-Host "   Impossible de supprimer node_modules completement" -ForegroundColor Yellow
    Write-Host "   Mais on continue quand meme..." -ForegroundColor Yellow
} else {
    Write-Host "   node_modules supprime avec succes!" -ForegroundColor Green
}

# Supprimer package-lock.json
Write-Host "3. Suppression de package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "   package-lock.json supprime!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Nettoyage termine!" -ForegroundColor Green
Write-Host ""
Write-Host "Maintenant executez:" -ForegroundColor Cyan
Write-Host "  npm install --legacy-peer-deps" -ForegroundColor Yellow
Write-Host ""
