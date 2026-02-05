# Script de réparation complète pour OMNIVERSA

Write-Host "🔧 SOLUTION COMPLÈTE - Réparation de l'installation`n" -ForegroundColor Cyan

# Étape 1: Arrêter tous les processus Node.js
Write-Host "Étape 1: Arrêt des processus Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Processus arrêtés`n" -ForegroundColor Green

# Étape 2: Nettoyer node_modules avec retry
Write-Host "Étape 2: Nettoyage de node_modules..." -ForegroundColor Yellow
$maxRetries = 3
$retryCount = 0
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    try {
        if (Test-Path node_modules) {
            Remove-Item -Recurse -Force node_modules -ErrorAction Stop
        }
        if (Test-Path package-lock.json) {
            Remove-Item -Force package-lock.json -ErrorAction Stop
        }
        $success = $true
        Write-Host "✅ Nettoyage réussi`n" -ForegroundColor Green
    } catch {
        $retryCount++
        Write-Host "⚠️  Tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    }
}

if (-not $success) {
    Write-Host "❌ Impossible de supprimer node_modules (fichiers verrouillés)" -ForegroundColor Red
    Write-Host "💡 Solution: Redémarrez votre ordinateur ou fermez tous les programmes qui utilisent node_modules`n" -ForegroundColor Yellow
    exit 1
}

# Étape 3: Installation propre
Write-Host "Étape 3: Installation des dépendances..." -ForegroundColor Yellow
Write-Host "⏳ Cela peut prendre 3-5 minutes...`n" -ForegroundColor Gray

npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Installation réussie !`n" -ForegroundColor Green
    
    # Étape 4: Vérification
    Write-Host "Étape 4: Vérification..." -ForegroundColor Yellow
    if (Test-Path "node_modules\next") {
        Write-Host "✅ Next.js installé" -ForegroundColor Green
    } else {
        Write-Host "❌ Next.js non installé" -ForegroundColor Red
    }
    
    if (Test-Path "node_modules\.bin\next.cmd") {
        Write-Host "✅ Commande next disponible`n" -ForegroundColor Green
        Write-Host "🎉 Tout est prêt ! Vous pouvez maintenant lancer:" -ForegroundColor Cyan
        Write-Host "   npm run dev`n" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Commande next non disponible`n" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ Installation échouée`n" -ForegroundColor Red
    Write-Host "💡 Essayez de redémarrer votre ordinateur puis relancez ce script`n" -ForegroundColor Yellow
}
