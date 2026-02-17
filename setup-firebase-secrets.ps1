# Script automatisé pour configurer tous les secrets Firebase App Hosting
# Usage: .\setup-firebase-secrets.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURATION SECRETS FIREBASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Firebase CLI est installé
try {
    $firebaseVersion = firebase --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Firebase CLI non trouvé"
    }
    Write-Host "[OK] Firebase CLI installé: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Firebase CLI n'est pas installé !" -ForegroundColor Red
    Write-Host "Installez-le avec: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Ce script va configurer les secrets depuis votre fichier .env.local" -ForegroundColor Yellow
Write-Host ""

# Lire le fichier .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "[ERREUR] Fichier .env.local introuvable !" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content ".env.local" -Raw

# Fonction pour extraire une valeur du .env
function Get-EnvValue {
    param([string]$Key,
        [string]$Content)
    
    if ($Content -match "(?m)^$Key\s*=\s*[`"']?([^`"'\r\n]+)[`"']?") {
        return $Matches[1].Trim('"').Trim("'")
    }
    return $null
}

# Extraire les valeurs
$secrets = @{
    "DATABASE_URL" = Get-EnvValue "DATABASE_URL" $envContent
    "DIRECT_URL" = Get-EnvValue "DIRECT_URL" $envContent
    "SUPABASE_SERVICE_ROLE_KEY" = Get-EnvValue "SUPABASE_SERVICE_ROLE_KEY" $envContent
    "REDIS_URL" = Get-EnvValue "REDIS_URL" $envContent
    "STRIPE_SECRET_KEY" = Get-EnvValue "STRIPE_SECRET_KEY" $envContent
    "UPLOADTHING_SECRET" = Get-EnvValue "UPLOADTHING_SECRET" $envContent
    "ENCRYPTION_KEY" = Get-EnvValue "ENCRYPTION_KEY" $envContent
    "JWT_SECRET" = Get-EnvValue "JWT_SECRET" $envContent
    "NEXTAUTH_SECRET" = Get-EnvValue "NEXTAUTH_SECRET" $envContent
    "GOOGLE_CLIENT_ID" = Get-EnvValue "GOOGLE_CLIENT_ID" $envContent
    "GOOGLE_CLIENT_SECRET" = Get-EnvValue "GOOGLE_CLIENT_SECRET" $envContent
}

Write-Host "Secrets trouvés dans .env.local:" -ForegroundColor Cyan
foreach ($key in $secrets.Keys) {
    if ($secrets[$key]) {
        $preview = $secrets[$key]
        if ($preview.Length -gt 40) {
            $preview = $preview.Substring(0, 40) + "..."
        }
        Write-Host "  ✓ $key = $preview" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ $key (manquant)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "ATTENTION: Certaines valeurs doivent être remplacées !" -ForegroundColor Red
Write-Host "  - REDIS_URL: localhost ne fonctionne pas en production" -ForegroundColor Yellow
Write-Host "  - STRIPE_SECRET_KEY: Clés de test" -ForegroundColor Yellow
Write-Host "  - UPLOADTHING_SECRET: Clés de test" -ForegroundColor Yellow
Write-Host "  - ENCRYPTION_KEY/JWT_SECRET/NEXTAUTH_SECRET: Clés de dev" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Voulez-vous continuer? (y/N)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "Annulé." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Configuration des secrets dans Firebase..." -ForegroundColor Cyan
Write-Host ""

$project = "convert-multimedia"
$successCount = 0
$errorCount = 0

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    
    if (-not $value -or $value -eq "..." -or $value -eq "") {
        Write-Host "  ⊘ $key (valeur vide, ignoré)" -ForegroundColor Yellow
        continue
    }
    
    try {
        Write-Host "  → Création de $key..." -ForegroundColor Gray -NoNewline
        
        # Créer un fichier temporaire avec la valeur
        $tempFile = [System.IO.Path]::GetTempFileName()
        Set-Content -Path $tempFile -Value $value -NoNewline
        
        # Créer le secret
        $output = firebase apphosting:secrets:set $key --project $project --data-file $tempFile 2>&1
        
        # Supprimer le fichier temporaire
        Remove-Item $tempFile -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✓ OK" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ✗ ERREUR" -ForegroundColor Red
            Write-Host "    $output" -ForegroundColor Red
            $errorCount++
        }
    } catch {
        Write-Host " ✗ ERREUR: $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Résumé: $successCount succès, $errorCount erreurs" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "✓ Secrets configurés avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Donnez les permissions au backend:" -ForegroundColor White
    Write-Host "   firebase apphosting:secrets:grantaccess --project $project" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Redéployez pour déclencher un nouveau build:" -ForegroundColor White
    Write-Host "   git commit --allow-empty -m 'Rebuild with secrets'" -ForegroundColor Gray
    Write-Host "   git push origin main" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Surveillez le déploiement:" -ForegroundColor White
    Write-Host "   https://console.firebase.google.com/project/$project/apphosting" -ForegroundColor Gray
    Write-Host ""
}

if ($errorCount -gt 0) {
    Write-Host "⚠ Certains secrets n'ont pas pu être configurés." -ForegroundColor Yellow
    Write-Host "Configurez-les manuellement via Firebase Console:" -ForegroundColor Yellow
    Write-Host "https://console.firebase.google.com/project/$project/apphosting" -ForegroundColor Gray
    Write-Host ""
}
