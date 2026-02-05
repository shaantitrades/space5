# ========================================
# OMNIVERSA - SOLUTION ANTI-BLOCAGE
# ========================================
# Ce script utilise Yarn au lieu de npm pour eviter les blocages Windows
# Executez avec : PowerShell.exe -ExecutionPolicy Bypass -File "E:\space 5\DEMARRAGE-RAPIDE.ps1"
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   OMNIVERSA - Demarrage Rapide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "E:\space 5"

# ETAPE 1 : Arreter Node.js
Write-Host "[1/6] Arret des processus..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "      OK" -ForegroundColor Green
Write-Host ""

# ETAPE 2 : Supprimer node_modules PROPREMENT
Write-Host "[2/6] Suppression de node_modules..." -ForegroundColor Yellow
if (Test-Path ".\node_modules") {
    # Methode Windows pour eviter les erreurs de verrouillage
    cmd /c "rd /s /q node_modules" 2>&1 | Out-Null
    Start-Sleep -Seconds 1
}
if (Test-Path ".\package-lock.json") {
    Remove-Item ".\package-lock.json" -Force -ErrorAction SilentlyContinue
}
if (Test-Path ".\yarn.lock") {
    Remove-Item ".\yarn.lock" -Force -ErrorAction SilentlyContinue
}
Write-Host "      OK - Nettoye" -ForegroundColor Green
Write-Host ""

# ETAPE 3 : Verifier Yarn
Write-Host "[3/6] Verification de Yarn..." -ForegroundColor Yellow
$yarnVersion = yarn --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      OK - Yarn $yarnVersion installe" -ForegroundColor Green
} else {
    Write-Host "      Installation de Yarn..." -ForegroundColor Yellow
    npm install -g yarn
    if ($LASTEXITCODE -eq 0) {
        Write-Host "      OK - Yarn installe" -ForegroundColor Green
    } else {
        Write-Host "      ERREUR - Impossible d'installer Yarn" -ForegroundColor Red
        Pause
        exit 1
    }
}
Write-Host ""

# ETAPE 4 : Nettoyer les caches
Write-Host "[4/6] Nettoyage des caches..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
yarn cache clean 2>&1 | Out-Null
Write-Host "      OK" -ForegroundColor Green
Write-Host ""

# ETAPE 5 : Installation avec Yarn (plus rapide et plus stable que npm)
Write-Host "[5/6] Installation avec Yarn..." -ForegroundColor Yellow
Write-Host "      Ceci devrait prendre 2-5 minutes maximum" -ForegroundColor DarkYellow
Write-Host ""

$installStart = Get-Date
yarn install

if ($LASTEXITCODE -eq 0) {
    $installEnd = Get-Date
    $duration = ($installEnd - $installStart).TotalMinutes
    Write-Host ""
    Write-Host "      OK - Installation terminee en $([math]::Round($duration, 1)) minutes !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "      ERREUR - Installation echouee" -ForegroundColor Red
    Write-Host ""
    Write-Host "      SI LE PROBLEME PERSISTE :" -ForegroundColor Yellow
    Write-Host "      1. Verifiez que vous avez desactive l'antivirus" -ForegroundColor Yellow
    Write-Host "      2. Executez PowerShell en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host "      3. Verifiez que le disque E:\ n'est pas plein" -ForegroundColor Yellow
    Write-Host ""
    Pause
    exit 1
}
Write-Host ""

# ETAPE 6 : Lancer le serveur
Write-Host "[6/6] Demarrage du serveur..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   SERVEUR PRET !" -ForegroundColor Green
Write-Host "   Ouvrez : http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur CTRL+C pour arreter" -ForegroundColor Yellow
Write-Host ""

yarn dev
