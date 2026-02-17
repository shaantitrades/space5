# Configuration des secrets Firebase avec vos valeurs Supabase
# Les valeurs Supabase sont BONNES - on les garde !

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURATION SECRETS FIREBASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Votre base Supabase est correctement configuree !" -ForegroundColor Green
Write-Host ""

# Verifier Firebase CLI
try {
    $null = firebase --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw }
} catch {
    Write-Host "[ERREUR] Firebase CLI non installe !" -ForegroundColor Red
    Write-Host "Installation : npm install -g firebase-tools" -ForegroundColor Yellow
    Write-Host "Puis lancez : firebase login" -ForegroundColor Yellow
    exit 1
}

$project = "convert-multimedia"

Write-Host "ÉTAPE 1 : Configuration des secrets Supabase (valeurs OK)" -ForegroundColor Cyan
Write-Host ""

# Secrets Supabase - Valeurs depuis .env.local
$supabaseSecrets = @{
    "DATABASE_URL" = "postgresql://postgres.poilochddyciosejieyy:Hababaumri11@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    "DIRECT_URL" = "postgresql://postgres:Hababaumri11@db.poilochddyciosejieyy.supabase.co:5432/postgres"
    "SUPABASE_SERVICE_ROLE_KEY" = "sb_secret_0HZWpwOmvkBRUeOiRWHcXw_yM6EBTgz"
}

foreach ($key in $supabaseSecrets.Keys) {
    Write-Host "  → Configuration de $key..." -ForegroundColor Gray
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $supabaseSecrets[$key] -NoNewline
    
    firebase apphosting:secrets:set $key --project $project --data-file $tempFile 2>&1 | Out-Null
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ OK" -ForegroundColor Green
    } else {
        Write-Host "    ✗ ERREUR" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "ÉTAPE 2 : Redis - VOUS DEVEZ UTILISER UN REDIS DISTANT" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ⚠ localhost:6379 ne fonctionne PAS en production !" -ForegroundColor Red
Write-Host ""
Write-Host "  Option recommandée : Upstash Redis (gratuit)" -ForegroundColor Cyan
Write-Host "  1. Créez un compte : https://console.upstash.com" -ForegroundColor White
Write-Host "  2. Créez une base Redis" -ForegroundColor White
Write-Host "  3. Copiez 'UPSTASH_REDIS_REST_URL'" -ForegroundColor White
Write-Host "  4. Configurez-le :" -ForegroundColor White
Write-Host "     firebase apphosting:secrets:set REDIS_URL --project $project" -ForegroundColor Gray
Write-Host ""

$redisUrl = Read-Host "Avez-vous une URL Redis distante? (Entrée pour ignorer)"
if ($redisUrl -and $redisUrl -ne "") {
    Write-Host "  → Configuration de REDIS_URL..." -ForegroundColor Gray
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $redisUrl -NoNewline
    
    firebase apphosting:secrets:set REDIS_URL --project $project --data-file $tempFile 2>&1 | Out-Null
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ OK" -ForegroundColor Green
    }
} else {
    Write-Host "  ⊘ Redis ignoré - configurez-le plus tard" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "ÉTAPE 3 : Génération des clés de sécurité" -ForegroundColor Cyan
Write-Host ""

Write-Host "  Génération de 3 clés sécurisées..." -ForegroundColor Gray
$encryptionKey = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$jwtSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$nextAuthSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

Write-Host "  ✓ Clés générées" -ForegroundColor Green

$securityKeys = @{
    "ENCRYPTION_KEY" = $encryptionKey
    "JWT_SECRET" = $jwtSecret
    "NEXTAUTH_SECRET" = $nextAuthSecret
}

foreach ($key in $securityKeys.Keys) {
    Write-Host "  → Configuration de $key..." -ForegroundColor Gray
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $securityKeys[$key] -NoNewline
    
    firebase apphosting:secrets:set $key --project $project --data-file $tempFile 2>&1 | Out-Null
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ OK" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "ÉTAPE 4 : Secrets optionnels (Stripe, UploadThing, Google)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Configurez-les manuellement si nécessaire :" -ForegroundColor Yellow
Write-Host "  - STRIPE_SECRET_KEY (clé live, commence par sk_live_)" -ForegroundColor White
Write-Host "  - UPLOADTHING_SECRET (depuis uploadthing.com)" -ForegroundColor White
Write-Host "  - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (OAuth)" -ForegroundColor White
Write-Host ""
Write-Host "  Commande : firebase apphosting:secrets:set NOM_SECRET --project $project" -ForegroundColor Gray
Write-Host ""

Write-Host "ÉTAPE 5 : Donner les permissions au backend" -ForegroundColor Cyan
Write-Host ""
Write-Host "  → Configuration des permissions..." -ForegroundColor Gray
firebase apphosting:secrets:grantaccess --project $project 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✓ Permissions OK" -ForegroundColor Green
} else {
    Write-Host "    ⚠ Exécutez manuellement:" -ForegroundColor Yellow
    Write-Host "      firebase apphosting:secrets:grantaccess --project $project" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Configuration terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Prochaines étapes :" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configurez Redis (IMPORTANT) :" -ForegroundColor Yellow
Write-Host "   - Créez un compte Upstash : https://console.upstash.com" -ForegroundColor White
Write-Host "   - Configurez avec : firebase apphosting:secrets:set REDIS_URL --project $project" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Redéployez pour rebuilder avec les secrets :" -ForegroundColor Yellow
Write-Host "   git commit --allow-empty -m 'Rebuild with secrets'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Surveillez le déploiement :" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/$project/apphosting" -ForegroundColor Gray
Write-Host ""

Write-Host "Clés générées (sauvegardez-les) :" -ForegroundColor Cyan
Write-Host "  ENCRYPTION_KEY=$encryptionKey" -ForegroundColor DarkGray
Write-Host "  JWT_SECRET=$jwtSecret" -ForegroundColor DarkGray
Write-Host "  NEXTAUTH_SECRET=$nextAuthSecret" -ForegroundColor DarkGray
Write-Host ""
