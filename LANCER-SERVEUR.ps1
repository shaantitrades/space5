# ========================================
# SCRIPT DE DEMARRAGE OMNIVERSA
# ========================================
# Executez ce script dans PowerShell avec :
# PowerShell.exe -ExecutionPolicy Bypass -File "E:\space 5\LANCER-SERVEUR.ps1"
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   OMNIVERSA - Script de demarrage" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Aller dans le bon repertoire
Set-Location "E:\space 5"

# ETAPE 1 : Arreter les processus Node.js
Write-Host "[1/5] Arret des processus Node.js en cours..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "      OK - Processus arretes" -ForegroundColor Green
} else {
    Write-Host "      INFO - Aucun processus Node.js en cours" -ForegroundColor Gray
}
Start-Sleep -Seconds 2
Write-Host ""

# ETAPE 2 : Supprimer node_modules (si necessaire)
Write-Host "[2/5] Verification de node_modules..." -ForegroundColor Yellow
if (Test-Path ".\node_modules") {
    $size = (Get-ChildItem ".\node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "      Taille actuelle : $([math]::Round($size, 2)) MB" -ForegroundColor Gray
    
    $response = Read-Host "      Voulez-vous supprimer et reinstaller ? (O/N)"
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host "      Suppression en cours..." -ForegroundColor Yellow
        Remove-Item -Path ".\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path ".\package-lock.json" -Force -ErrorAction SilentlyContinue
        Write-Host "      OK - Supprime" -ForegroundColor Green
        $needInstall = $true
    } else {
        Write-Host "      OK - Conservation de node_modules" -ForegroundColor Green
        $needInstall = $false
    }
} else {
    Write-Host "      INFO - node_modules absent, installation necessaire" -ForegroundColor Gray
    $needInstall = $true
}
Write-Host ""

# ETAPE 3 : Nettoyer le cache npm
Write-Host "[3/5] Nettoyage du cache npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "      OK - Cache nettoye" -ForegroundColor Green
Write-Host ""

# ETAPE 4 : Installer les dependances (si necessaire)
if ($needInstall) {
    Write-Host "[4/5] Installation des dependances..." -ForegroundColor Yellow
    Write-Host "      PATIENCE : Ceci peut prendre 5-10 minutes..." -ForegroundColor DarkYellow
    Write-Host ""
    
    npm install --legacy-peer-deps
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "      OK - Installation terminee !" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "      ERREUR - Installation echouee" -ForegroundColor Red
        Write-Host "      Essayez de redemarrer votre PC et relancer ce script" -ForegroundColor Yellow
        Write-Host ""
        Pause
        exit 1
    }
} else {
    Write-Host "[4/5] Installation ignoree (node_modules present)" -ForegroundColor Gray
}
Write-Host ""

# ETAPE 5 : Lancer le serveur
Write-Host "[5/5] Demarrage du serveur Next.js..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Le serveur va demarrer maintenant" -ForegroundColor Green
Write-Host "   Ouvrez votre navigateur sur :" -ForegroundColor Green
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur CTRL+C pour arreter le serveur" -ForegroundColor Yellow
Write-Host ""

npm run dev
