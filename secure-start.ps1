#!/usr/bin/env pwsh
# Script de démarrage sécurisé - OMNIVERSA (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "OMNIVERSA - DÉMARRAGE SÉCURISÉ" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local manquant!" -ForegroundColor Red
    Write-Host "Créant .env.local depuis .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "⚠️  IMPORTANT: Modifiez .env.local avec vos vraies valeurs!" -ForegroundColor Yellow
}

# 2. Vérifier que les corrections sont en place
Write-Host "✅ Vérification des corrections..." -ForegroundColor Green
$checks = 0

@(
    "src/lib/env-validation.ts",
    "src/lib/auth-utils.ts", 
    "src/lib/email.ts",
    "src/app/api/auth/verify/route.ts",
    "src/lib/rate-limiter.ts"
) | ForEach-Object {
    if (Test-Path $_) {
        $checks++
        Write-Host "   ✓ $_" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $_ MANQUANT!" -ForegroundColor Red
    }
}

if ($checks -lt 5) {
    Write-Host ""
    Write-Host "❌ Certaines corrections manquent!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Toutes les corrections sont en place ($checks/5)" -ForegroundColor Green
Write-Host ""

# 3. npm install si node_modules manque
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install a échoué!" -ForegroundColor Red
        exit 1
    }
}

# 4. Prisma
Write-Host "🔧 Synchronisation Prisma..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Prisma generation warning" -ForegroundColor Yellow
}

# 5. Type-check
Write-Host ""
Write-Host "🔍 Vérification TypeScript..." -ForegroundColor Cyan
npm run type-check 2>&1 | Select-Object -Last 20
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  TypeScript errors found" -ForegroundColor Yellow
}

# 6. Build
Write-Host ""
Write-Host "🏗️  Build du projet..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build a échoué!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ PRÊT À DÉMARRER" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Commandes disponibles:" -ForegroundColor Yellow
Write-Host "  npm run dev       - Démarrer le serveur de développement"
Write-Host "  npm run build     - Créer la build production"
Write-Host "  npm run type-check - Vérifier les types TypeScript"
Write-Host ""
