#!/usr/bin/env pwsh
# Script de configuration automatique des secrets Firebase App Hosting
# Lit .env.local et configure les secrets dans Firebase
# Utilisation : .\configure-secrets.ps1

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   CONFIGURATION SECRETS FIREBASE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ID = "convert-multimedia"
$ENV_FILE = ".env.local"

# Vérification Firebase CLI
Write-Host "1. Verification Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>$null
if (-not $firebaseVersion) {
    Write-Host "   [ERREUR] Firebase CLI non installe" -ForegroundColor Red
    Write-Host "   Installez avec: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}
Write-Host "   [OK] Firebase CLI: $firebaseVersion" -ForegroundColor Green

# Vérification du fichier .env.local
Write-Host ""
Write-Host "2. Verification du fichier .env.local..." -ForegroundColor Yellow
if (-not (Test-Path $ENV_FILE)) {
    Write-Host "   [ERREUR] Fichier .env.local introuvable" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Fichier trouve" -ForegroundColor Green

# Liste des secrets à configurer (depuis apphosting.yaml)
$SECRETS = @(
    @{ Name = "DATABASE_URL"; Description = "URL de connexion Supabase (pooler)" },
    @{ Name = "DIRECT_URL"; Description = "URL directe Supabase (migrations)" },
    @{ Name = "SUPABASE_SERVICE_ROLE_KEY"; Description = "Cle admin Supabase" },
    @{ Name = "REDIS_URL"; Description = "URL Redis (Upstash recommande)" },
    @{ Name = "STRIPE_SECRET_KEY"; Description = "Cle secrete Stripe LIVE" },
    @{ Name = "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"; Description = "Cle publique Stripe LIVE" },
    @{ Name = "UPLOADTHING_SECRET"; Description = "Cle secrete UploadThing" },
    @{ Name = "UPLOADTHING_APP_ID"; Description = "ID app UploadThing" },
    @{ Name = "ENCRYPTION_KEY"; Description = "Cle de chiffrement (generer nouvelle!)" },
    @{ Name = "JWT_SECRET"; Description = "Secret JWT (generer nouvelle!)" },
    @{ Name = "NEXTAUTH_SECRET"; Description = "Secret NextAuth (generer nouvelle!)" },
    @{ Name = "GOOGLE_CLIENT_ID"; Description = "ID client Google OAuth" },
    @{ Name = "GOOGLE_CLIENT_SECRET"; Description = "Secret client Google OAuth" }
)

# Lecture du fichier .env.local
Write-Host ""
Write-Host "3. Lecture des variables depuis .env.local..." -ForegroundColor Yellow
$envContent = Get-Content $ENV_FILE -Raw
$envVars = @{}

foreach ($line in Get-Content $ENV_FILE) {
    # Ignorer les commentaires et lignes vides
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        continue
    }
    
    # Parser KEY=VALUE
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Retirer les guillemets si présents
        $value = $value -replace '^"(.*)"$', '$1'
        $envVars[$key] = $value
    }
}

Write-Host "   [OK] $($envVars.Count) variables trouvees" -ForegroundColor Green

# Affichage des secrets trouvés
Write-Host ""
Write-Host "4. Secrets detectes dans .env.local:" -ForegroundColor Yellow
$foundSecrets = @()
foreach ($secret in $SECRETS) {
    if ($envVars.ContainsKey($secret.Name) -and $envVars[$secret.Name] -ne "") {
        Write-Host "   [OK] $($secret.Name)" -ForegroundColor Green
        $foundSecrets += $secret
    } else {
        Write-Host "   [MANQUANT] $($secret.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "   Total: $($foundSecrets.Count)/$($SECRETS.Count) secrets trouves" -ForegroundColor Cyan

# Avertissement sécurité
Write-Host ""
Write-Host "============================================" -ForegroundColor Red
Write-Host "   AVERTISSEMENT SECURITE" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  Ce script va envoyer vos secrets a Firebase." -ForegroundColor Yellow
Write-Host "⚠️  Pour la PRODUCTION, vous devez :" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Generer de NOUVELLES cles de securite" -ForegroundColor White
Write-Host "      (ENCRYPTION_KEY, JWT_SECRET, NEXTAUTH_SECRET)" -ForegroundColor White
Write-Host ""
Write-Host "   2. Utiliser les cles LIVE Stripe (pas test)" -ForegroundColor White
Write-Host ""
Write-Host "   3. Verifier que DATABASE_URL pointe vers" -ForegroundColor White
Write-Host "      une base de PRODUCTION (pas dev)" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Voulez-vous continuer ? (oui/NON)"
if ($confirm -ne "oui") {
    Write-Host ""
    Write-Host "[INFO] Configuration annulee" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Configuration manuelle recommandee :" -ForegroundColor Cyan
    Write-Host "https://console.firebase.google.com/project/$PROJECT_ID/apphosting" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Avertissement backend ID
Write-Host ""
Write-Host "⚠️  IMPORTANT : Vous devez avoir cree un backend App Hosting" -ForegroundColor Yellow
Write-Host ""
Write-Host "Si pas encore fait :" -ForegroundColor Cyan
Write-Host "  1. Allez sur Firebase Console > App Hosting" -ForegroundColor White
Write-Host "  2. Creez un nouveau backend" -ForegroundColor White
Write-Host "  3. Notez le Backend ID" -ForegroundColor White
Write-Host ""

$backendId = Read-Host "Entrez votre Backend ID (ex: space5)"
if (-not $backendId) {
    Write-Host "[ERREUR] Backend ID requis" -ForegroundColor Red
    exit 1
}

# Configuration des secrets
Write-Host ""
Write-Host "5. Configuration des secrets dans Firebase..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($secret in $foundSecrets) {
    $secretName = $secret.Name
    $secretValue = $envVars[$secretName]
    
    Write-Host "   Configuration de $secretName..." -ForegroundColor Cyan
    
    # Créer un fichier temporaire avec la valeur
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $secretValue -NoNewline
    
    # Configurer le secret via Firebase CLI
    $cmd = "firebase apphosting:secrets:set $secretName --backend $backendId --data-file `"$tempFile`" --project $PROJECT_ID --force"
    
    try {
        Invoke-Expression $cmd 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "      [OK] $secretName configure" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "      [ERREUR] Echec pour $secretName" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "      [ERREUR] Exception: $_" -ForegroundColor Red
        $failCount++
    }
    
    # Nettoyer le fichier temporaire
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

# Résumé
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   CONFIGURATION TERMINEE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "   Succes: $successCount/$($foundSecrets.Count)" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "   Echecs: $failCount" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Configurez manuellement les secrets en echec :" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Verifiez dans Firebase Console :" -ForegroundColor Cyan
Write-Host "https://console.firebase.google.com/project/$PROJECT_ID/apphosting" -ForegroundColor White
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Cyan
Write-Host "  1. Verifiez que tous les secrets sont bien configures" -ForegroundColor White
Write-Host "  2. Mettez a jour NEXT_PUBLIC_APP_URL dans apphosting.yaml" -ForegroundColor White
Write-Host "  3. Commitez et pushez pour deployer" -ForegroundColor White
Write-Host ""

exit 0
