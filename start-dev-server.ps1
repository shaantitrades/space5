#!/usr/bin/env pwsh
# Démarrage du serveur dev OMNIVERSA

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OMNIVERSA - DEV SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "e:\space 5"

# Attendre que Next.js soit installé
Write-Host "Vérification de l'installation..." -ForegroundColor Yellow
$maxWait = 120  # 2 minutes max
$elapsed = 0

while ($elapsed -lt $maxWait) {
    if (Test-Path "node_modules\next\dist\bin\next.js") {
        Write-Host ""
        Write-Host "✓ Installation complète détectée!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Démarrage du serveur de développement..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Accédez à: http://localhost:3000" -ForegroundColor Green
        Write-Host "Appuyez sur CTRL+C pour arrêter le serveur" -ForegroundColor Yellow
        Write-Host ""
        
        npm run dev
        exit 0
    }
    
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 2
    $elapsed += 2
}

Write-Host ""
Write-Host "❌ Installation timeout - Next.js n'est pas prêt" -ForegroundColor Red
Write-Host "Essayez: npm install" -ForegroundColor Yellow
exit 1
