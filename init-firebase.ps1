# Script d'initialisation Firebase
# Usage: .\init-firebase.ps1 -ProjectId YOUR-PROJECT-ID

param(
    [string]$ProjectId = ""
)

Write-Host "🔥 Configuration Firebase Hosting" -ForegroundColor Cyan

# Vérifier si Firebase CLI est installée
Write-Host "`nVérification de Firebase CLI..." -ForegroundColor Yellow
firebase --version

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase CLI n'est pas installée" -ForegroundColor Red
    Write-Host "Installation de Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

# Demander le Project ID si non fourni
if ([string]::IsNullOrEmpty($ProjectId)) {
    Write-Host "`n📋 Allez sur: https://console.firebase.google.com" -ForegroundColor Yellow
    Write-Host "Créez un nouveau projet ou sélectionnez un existant" -ForegroundColor Yellow
    $ProjectId = Read-Host "Entrez votre ID de projet Firebase"
}

# Créer/mettre à jour .firebaserc
Write-Host "`n⚙️ Configuration du fichier .firebaserc..." -ForegroundColor Yellow

$firebaseConfig = @"
{
  "projects": {
    "default": "$ProjectId"
  }
}
"@

$firebaseConfig | Set-Content -Path ".firebaserc"
Write-Host "✅ .firebaserc créé avec le projet: $ProjectId" -ForegroundColor Green

# Vérifier la structure du projet
Write-Host "`n📁 Vérification de la structure du projet..." -ForegroundColor Yellow

if (!(Test-Path "firebase.json")) {
    Write-Host "⚠️ firebase.json non trouvé" -ForegroundColor Yellow
    Write-Host "Création de firebase.json..." -ForegroundColor Yellow
    # Le fichier est déjà créé dans le répertoire racine
}

if (!(Test-Path "next.config.js")) {
    Write-Host "❌ next.config.js non trouvé" -ForegroundColor Red
    Write-Host "Ce n'est pas un projet Next.js valide" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Structure du projet vérifiée" -ForegroundColor Green

# Authentification Firebase
Write-Host "`n🔐 Authentification Firebase..." -ForegroundColor Yellow
Write-Host "Un navigateur va s'ouvrir pour vous connecter" -ForegroundColor Yellow

firebase login

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Authentification réussie" -ForegroundColor Green
} else {
    Write-Host "❌ Authentification échouée" -ForegroundColor Red
    exit 1
}

# Afficher les commandes disponibles
Write-Host "`n✨ Configuration terminée!" -ForegroundColor Green
Write-Host "`n📖 Commandes disponibles:" -ForegroundColor Cyan
Write-Host "  npm run build           - Construire l'application" -ForegroundColor Gray
Write-Host "  npm run firebase:deploy - Déployer sur Firebase Hosting" -ForegroundColor Gray
Write-Host "  .\deploy-firebase.ps1   - Script de déploiement (optionnel)" -ForegroundColor Gray
Write-Host "  firebase hosting:sites:list - Voir les sites déployés" -ForegroundColor Gray

Write-Host "`n🚀 Pour déployer maintenant:" -ForegroundColor Yellow
Write-Host "  npm run firebase:deploy" -ForegroundColor Cyan
