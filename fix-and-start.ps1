# Script de reparation et demarrage automatique - OMNIVERSA
# Executez ce script dans PowerShell : .\fix-and-start.ps1

Write-Host ""
Write-Host "Reparation et demarrage d'OMNIVERSA..." -ForegroundColor Cyan
Write-Host ""

# Arreter tous les processus Node.js
Write-Host "1. Arret des processus Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Supprimer node_modules completement
Write-Host "2. Suppression de node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Supprimer package-lock.json
Write-Host "3. Suppression de package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

# Reinstaller Next.js proprement
Write-Host "4. Reinstallation de Next.js 14.2.0..." -ForegroundColor Yellow
npm install next@14.2.0 react@18.3.0 react-dom@18.3.0 --legacy-peer-deps --save-exact

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Erreur lors de l'installation. Essayez manuellement:" -ForegroundColor Red
    Write-Host "npm install --legacy-peer-deps" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Demarrer le serveur avec Turbopack desactive
Write-Host ""
Write-Host "5. Demarrage du serveur (sans Turbopack)..." -ForegroundColor Yellow
Write-Host ""
$env:NEXT_DISABLE_TURBO = '1'
npx next dev --no-turbo
