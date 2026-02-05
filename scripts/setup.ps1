# Script de configuration initiale pour OMNIVERSA (PowerShell)

Write-Host "🚀 Configuration de OMNIVERSA..." -ForegroundColor Cyan

# Vérifier Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion détecté" -ForegroundColor Green
    
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 20) {
        Write-Host "❌ Node.js version 20+ requis. Version actuelle: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js n'est pas installé. Veuillez installer Node.js 20+" -ForegroundColor Red
    exit 1
}

# Installer les dépendances
Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
npm install

# Créer .env.local si n'existe pas
if (-not (Test-Path .env.local)) {
    Write-Host "📝 Création du fichier .env.local..." -ForegroundColor Yellow
    Copy-Item .env.example .env.local
    Write-Host "⚠️  Veuillez éditer .env.local avec vos clés API" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local existe déjà" -ForegroundColor Green
}

# Vérifier Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker détecté" -ForegroundColor Green
    
    $containers = docker ps --format "{{.Names}}" | Select-String "omniversa"
    if ($containers) {
        Write-Host "⚠️  Des conteneurs Docker sont déjà en cours d'exécution" -ForegroundColor Yellow
    } else {
        Write-Host "🐳 Démarrage des services Docker (PostgreSQL, Redis)..." -ForegroundColor Yellow
        docker-compose up -d postgres redis
        Write-Host "⏳ Attente du démarrage de PostgreSQL..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
} catch {
    Write-Host "⚠️  Docker n'est pas installé. Vous devrez démarrer PostgreSQL et Redis manuellement" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Éditer .env.local avec vos clés API"
Write-Host "2. Lancer: npm run dev"
Write-Host "3. Ouvrir: http://localhost:3000"
Write-Host ""
