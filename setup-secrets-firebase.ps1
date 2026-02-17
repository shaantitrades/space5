#!/usr/bin/env pwsh
# ==============================================================
# Script pour créer les secrets Firebase App Hosting
# Projet : convert-multimedia
# ==============================================================

$PROJECT = "convert-multimedia"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Configuration des secrets Firebase"     -ForegroundColor Cyan
Write-Host " Projet : $PROJECT"                      -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Vérification Firebase CLI ---
$fbVersion = npx firebase-tools --version 2>$null
if (-not $fbVersion) {
    Write-Host "ERREUR: Firebase CLI introuvable. Installez-le avec: npm i -g firebase-tools" -ForegroundColor Red
    exit 1
}
Write-Host "Firebase CLI v$fbVersion detecte" -ForegroundColor Green

# --- Secrets à créer (nom = valeur) ---
# ⚠️ REMPLACE les valeurs placeholder (sk_test_..., etc.) par tes vraies clés de PRODUCTION
$secrets = @{
    "DATABASE_URL"                       = "postgresql://postgres.poilochddyciosejieyy:Hababaumri11@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    "DIRECT_URL"                         = "postgresql://postgres:Hababaumri11@db.poilochddyciosejieyy.supabase.co:5432/postgres"
    "SUPABASE_SERVICE_ROLE_KEY"          = "sb_secret_0HZWpwOmvkBRUeOiRWHcXw_yM6EBTgz"
    "REDIS_URL"                          = "redis://localhost:6379"
    "STRIPE_SECRET_KEY"                  = "sk_test_..."
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = "pk_test_..."
    "UPLOADTHING_SECRET"                 = "sk_live_..."
    "UPLOADTHING_APP_ID"                 = "..."
    "ENCRYPTION_KEY"                     = "dev-encryption-key-32chars-minimum-local!!"
    "JWT_SECRET"                         = "dev-jwt-secret-32chars-minimum-local-dev-only!!"
    "NEXTAUTH_SECRET"                    = "dev-secret-key-32chars-minimum-local-dev-only!!"
    "GOOGLE_CLIENT_ID"                   = "dev-google-client-id"
    "GOOGLE_CLIENT_SECRET"               = "dev-google-client-secret"
}

Write-Host ""
Write-Host "Creation de $($secrets.Count) secrets dans Secret Manager..." -ForegroundColor Yellow
Write-Host ""

$success = 0
$failed  = 0

foreach ($name in $secrets.Keys) {
    $value = $secrets[$name]
    Write-Host "  -> $name ... " -NoNewline

    # Créer le secret (ignore l'erreur si déjà existant)
    $value | npx firebase-tools apphosting:secrets:set $name --project $PROJECT --force 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK" -ForegroundColor Green
        $success++
    } else {
        # Essai via gcloud si firebase CLI échoue
        Write-Host "tentative gcloud..." -NoNewline -ForegroundColor Yellow
        $value | gcloud secrets create $name --data-file=- --project=$PROJECT 2>$null
        if ($LASTEXITCODE -ne 0) {
            # Le secret existe peut-être déjà, ajouter une version
            $value | gcloud secrets versions add $name --data-file=- --project=$PROJECT 2>$null
        }
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK" -ForegroundColor Green
            $success++
        } else {
            Write-Host "ECHEC" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Resultats: $success OK / $failed echecs" -ForegroundColor $(if ($failed -gt 0) { "Yellow" } else { "Green" })
Write-Host "========================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "Pour les secrets en echec, creez-les manuellement:" -ForegroundColor Yellow
    Write-Host '  firebase apphosting:secrets:set <NOM> --project convert-multimedia' -ForegroundColor White
    Write-Host '  ou via la console: https://console.cloud.google.com/security/secret-manager?project=convert-multimedia' -ForegroundColor White
}

Write-Host ""
Write-Host "Ensuite, accordez l'acces au backend App Hosting pour chaque secret:" -ForegroundColor Yellow
Write-Host '  firebase apphosting:secrets:grantaccess --project convert-multimedia' -ForegroundColor White
Write-Host ""
Write-Host "Puis relancez le deploiement (push ou rollout manuel)." -ForegroundColor Green
