# Script PowerShell pour nettoyer completement et reinstaller

Write-Host ""
Write-Host "Nettoyage complet en cours..." -ForegroundColor Cyan
Write-Host ""

# 1. Arreter tous les processus Node.js
Write-Host "1. Arret de tous les processus Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "OK - Processus Node.js arretes." -ForegroundColor Green
Write-Host ""

# 2. Supprimer node_modules
Write-Host "2. Suppression du dossier node_modules..." -ForegroundColor Yellow
if (Test-Path "E:\space 5\node_modules") {
    Remove-Item -Path "E:\space 5\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "OK - Dossier node_modules supprime." -ForegroundColor Green
} else {
    Write-Host "INFO - Le dossier node_modules n existe pas." -ForegroundColor Gray
}
Write-Host ""

# 3. Supprimer package-lock.json
Write-Host "3. Suppression de package-lock.json..." -ForegroundColor Yellow
if (Test-Path "E:\space 5\package-lock.json") {
    Remove-Item -Path "E:\space 5\package-lock.json" -Force
    Write-Host "OK - Fichier package-lock.json supprime." -ForegroundColor Green
} else {
    Write-Host "INFO - Le fichier package-lock.json n existe pas." -ForegroundColor Gray
}
Write-Host ""

# 4. Nettoyer le cache npm
Write-Host "4. Nettoyage du cache npm..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "OK - Cache npm nettoye." -ForegroundColor Green
Write-Host ""

# 5. Reinstaller les dependances
Write-Host "5. Installation des dependances..." -ForegroundColor Yellow
Write-Host "   Ceci peut prendre plusieurs minutes..." -ForegroundColor DarkYellow
Write-Host ""
cd "E:\space 5"
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK - Installation terminee avec succes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant lancer le serveur avec : npm run dev" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERREUR - L installation a echoue." -ForegroundColor Red
    Write-Host ""
    Write-Host "Essayez de redemarrer votre ordinateur et de relancer ce script." -ForegroundColor Yellow
    Write-Host ""
}
