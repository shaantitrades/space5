#!/usr/bin/env pwsh
# Script de deploiement Firebase App Hosting
# Utilisation : .\deploy-apphosting.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOIEMENT FIREBASE APP HOSTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ID = "convert-multimedia"

# 1. Verification Firebase CLI
Write-Host "1. Verification Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>$null
if (-not $firebaseVersion) {
    Write-Host "   [ERREUR] Firebase CLI non installe" -ForegroundColor Red
    Write-Host "   Installez avec: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}
Write-Host "   [OK] Firebase CLI: $firebaseVersion" -ForegroundColor Green

# 2. Verification authentification
Write-Host ""
Write-Host "2. Verification authentification..." -ForegroundColor Yellow
$authCheck = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ATTENTION] Non authentifie" -ForegroundColor Yellow
    Write-Host "   Lancement de l'authentification..." -ForegroundColor Cyan
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERREUR] Authentification echouee" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   [OK] Authentifie" -ForegroundColor Green

# 3. Verification du projet
Write-Host ""
Write-Host "3. Verification du projet Firebase..." -ForegroundColor Yellow
Write-Host "   Projet: $PROJECT_ID" -ForegroundColor Cyan

# 4. Test du build local
Write-Host ""
Write-Host "4. Test du build local (recommande)..." -ForegroundColor Yellow
$response = Read-Host "   Voulez-vous tester le build localement ? (o/N)"
if ($response -eq "o" -or $response -eq "O" -or $response -eq "oui") {
    Write-Host "   Lancement du build..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERREUR] Build local echoue" -ForegroundColor Red
        Write-Host "   Corrigez les erreurs avant de deployer" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "   [OK] Build local reussi" -ForegroundColor Green
}

# 5. Deploiement
Write-Host ""
Write-Host "5. Deploiement sur App Hosting..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Options de deploiement:" -ForegroundColor Cyan
Write-Host "   1. Via GitHub (recommande) - Push sur main" -ForegroundColor White
Write-Host "   2. Via CLI - Creer un backend" -ForegroundColor White
Write-Host "   3. Annuler" -ForegroundColor White
Write-Host ""

$choice = Read-Host "   Votre choix (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "   [INFO] Deploiement via GitHub:" -ForegroundColor Cyan
        Write-Host "   1. Commitez vos changements: git add . && git commit -m 'Deploy'" -ForegroundColor White
        Write-Host "   2. Pushez sur GitHub: git push origin main" -ForegroundColor White
        Write-Host "   3. Firebase declenchera automatiquement le build" -ForegroundColor White
        Write-Host ""
        Write-Host "   Suivi du deploiement:" -ForegroundColor Cyan
        Write-Host "   https://console.firebase.google.com/project/$PROJECT_ID/apphosting" -ForegroundColor White
        Write-Host ""
    }
    "2" {
        Write-Host ""
        Write-Host "   [INFO] Creation d'un backend App Hosting..." -ForegroundColor Cyan
        Write-Host ""
        firebase apphosting:backends:create --project $PROJECT_ID
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "   [OK] Backend cree avec succes" -ForegroundColor Green
            Write-Host ""
            Write-Host "   Prochaines etapes:" -ForegroundColor Cyan
            Write-Host "   1. Configurez le repo GitHub dans Firebase Console" -ForegroundColor White
            Write-Host "   2. Les deploiements seront automatiques sur chaque push" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "   [ERREUR] Echec de creation du backend" -ForegroundColor Red
            Write-Host "   Verifiez que le projet existe et que vous avez les permissions" -ForegroundColor Yellow
            exit 1
        }
    }
    "3" {
        Write-Host ""
        Write-Host "   [INFO] Deploiement annule" -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "   [ERREUR] Choix invalide" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   DEPLOIEMENT LANCE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Console Firebase:" -ForegroundColor Cyan
Write-Host "https://console.firebase.google.com/project/$PROJECT_ID/apphosting" -ForegroundColor White
Write-Host ""

exit 0
