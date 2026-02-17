# Script de déploiement Firebase Hosting
# Prérequis: Firebase CLI installée et authentifiée

Write-Host "🚀 Déploiement Firebase Hosting" -ForegroundColor Cyan

# Vérifier si Firebase CLI est installée
Write-Host "Vérification de Firebase CLI..." -ForegroundColor Yellow
firebase --version

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase CLI n'est pas installée" -ForegroundColor Red
    Write-Host "Installez-la avec: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Étape 1: Nettoyer les builds précédents
Write-Host "`n📁 Nettoyage des builds précédents..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}
if (Test-Path ".firebase") {
    Remove-Item -Path ".firebase" -Recurse -Force
}

# Étape 2: Construire l'application
Write-Host "`n🔨 Construction de l'application Next.js..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ La construction a échoué" -ForegroundColor Red
    exit 1
}

# Étape 3: Déployer sur Firebase
Write-Host "`n📤 Déploiement sur Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Déploiement réussi!" -ForegroundColor Green
    Write-Host "Votre application est disponible sur votre URL Firebase" -ForegroundColor Green
} else {
    Write-Host "`n❌ Le déploiement a échoué" -ForegroundColor Red
    exit 1
}
