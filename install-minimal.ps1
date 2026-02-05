# Installation minimale - Seulement ce qui est necessaire pour demarrer

Write-Host ""
Write-Host "Installation minimale de Next.js..." -ForegroundColor Cyan
Write-Host ""

# Arreter tous les processus
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Nettoyer le cache
Write-Host "1. Nettoyage du cache..." -ForegroundColor Yellow
npm cache clean --force

# Supprimer seulement le dossier next
Write-Host "2. Suppression de Next.js corrompu..." -ForegroundColor Yellow
if (Test-Path "node_modules\next") {
    Remove-Item -Recurse -Force "node_modules\next" -ErrorAction SilentlyContinue
}

# Installer Next.js completement
Write-Host "3. Installation de Next.js 14.2.0..." -ForegroundColor Yellow
npm install next@14.2.0 react@18.3.0 react-dom@18.3.0 --legacy-peer-deps --save-exact --no-audit --no-fund --prefer-offline

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Installation terminee!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Demarrez maintenant avec:" -ForegroundColor Cyan
    Write-Host "  npx next dev`n" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Erreur lors de l'installation" -ForegroundColor Red
    Write-Host ""
}
