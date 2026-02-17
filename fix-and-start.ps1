# Script de reparation et demarrage - Multi Convert
# Executez : .\fix-and-start.ps1

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  REPARATION ET DEMARRAGE SERVEUR" -ForegroundColor Cyan  
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "e:\space 5"

# 1. Arreter processus
Write-Host "1. Arret des processus Node..." -ForegroundColor Yellow
Get-Process node, npm -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Nettoyer caches
Write-Host "2. Nettoyage des caches..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   [OK] Cache .next supprime" -ForegroundColor Green
}
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache  
    Write-Host "   [OK] Cache node_modules supprime" -ForegroundColor Green
}

# 3. Verifier next-intl (LE PROBLEME PRINCIPAL)
Write-Host "3. Verification de next-intl..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules\next-intl")) {
    Write-Host "   [ATTENTION] next-intl MANQUANT - Installation..." -ForegroundColor Red
    Write-Host ""
    Write-Host "   Ceci peut prendre quelques minutes..." -ForegroundColor Cyan
    npm install
    
    if (Test-Path "node_modules\next-intl") {
        Write-Host "   [OK] next-intl installe avec succes" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] ECHEC installation next-intl" -ForegroundColor Red
        Write-Host "   Essayez manuellement: npm install" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "   [OK] next-intl present" -ForegroundColor Green
}

# 4. Diagnostic
Write-Host ""
Write-Host "4. Diagnostic..." -ForegroundColor Yellow
if (Test-Path "diagnose.js") {
    node diagnose.js
}

# 5. Demarrer serveur
Write-Host ""
Write-Host "5. Demarrage du serveur..." -ForegroundColor Cyan
Write-Host ""
Write-Host "   ====================================" -ForegroundColor Green
Write-Host "   Serveur disponible sur:" -ForegroundColor Green  
Write-Host "   http://localhost:3000" -ForegroundColor Green
Write-Host "   ====================================" -ForegroundColor Green
Write-Host ""
Write-Host "   Appuyez sur CTRL+C pour arreter" -ForegroundColor Yellow
Write-Host ""

npm run dev
