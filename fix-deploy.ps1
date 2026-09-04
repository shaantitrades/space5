# ============================================================
# fix-deploy.ps1 — Correction déploiement Multi Convert
# Exécute ce script dans PowerShell (en administrateur si besoin)
# Usage: .\fix-deploy.ps1
# ============================================================

$ErrorActionPreference = "Continue"
Set-Location "d:\space 5"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX DEPLOIEMENT MULTI CONVERT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ──── ÉTAPE 1 : Nettoyage ────
Write-Host "[1/3] Nettoyage node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "  Suppression de node_modules (peut prendre 1-2 min)..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "  OK: node_modules supprimé" -ForegroundColor Green
} else {
    Write-Host "  node_modules déjà absent" -ForegroundColor Green
}

if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    Write-Host "  OK: package-lock.json supprimé" -ForegroundColor Green
}

Write-Host ""

# ──── ÉTAPE 2 : Installation propre ────
Write-Host "[2/3] Installation des dépendances (npm install)..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre 3-5 minutes (sharp, prisma, tesseract.js compilent)..." -ForegroundColor Gray
npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERREUR: npm install a échoué (code $LASTEXITCODE)" -ForegroundColor Red
    Write-Host "  Vérifie que Node.js >=20 est installé: node -v" -ForegroundColor Red
    exit 1
}
Write-Host "  OK: dépendances installées" -ForegroundColor Green

# Vérifier le lockfile
if (Test-Path package-lock.json) {
    Write-Host "  OK: package-lock.json créé" -ForegroundColor Green
} else {
    Write-Host "  ATTENTION: package-lock.json non créé !" -ForegroundColor Red
}

Write-Host ""

# ──── ÉTAPE 3 : Test du build ────
Write-Host "[3/3] Test du build Next.js..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre 2-4 minutes..." -ForegroundColor Gray
$env:CI = "true"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ATTENTION: Le build a échoué (code $LASTEXITCODE)" -ForegroundColor Red
    Write-Host "  Voir le rapport AUDIT-DEPLOIEMENT-RAPPORT.md pour les détails" -ForegroundColor Red
} else {
    Write-Host "  OK: Build réussi !" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NETTOYAGE + INSTALL TERMINÉS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ──── RAPPEL : Commandes Git ────
Write-Host "=== COMMANDES GIT (à exécuter ensuite) ===" -ForegroundColor Magenta
Write-Host ""
Write-Host "  git remote -v" -ForegroundColor White
Write-Host "  git add package-lock.json package.json Dockerfile docker-compose.coolify.yml next.config.js src/lib/prisma.ts .dockerignore AUDIT-DEPLOIEMENT-RAPPORT.md" -ForegroundColor White
Write-Host "  git status" -ForegroundColor White
Write-Host '  git commit -m "fix: critical deployment - lockfile, postgres, prisma, swcMinify"' -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "Repo: https://github.com/shaantitrades/space5.git" -ForegroundColor Gray
Write-Host ""