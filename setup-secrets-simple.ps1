$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host "   CONFIGURATION SECRETS FIREBASE"
Write-Host "========================================"
Write-Host ""

Write-Host "[OK] Votre base Supabase est prete!" -ForegroundColor Green
Write-Host ""

# Verifier Firebase CLI
try {
    $null = firebase --version 2>&1
} catch {
    Write-Host "[ERREUR] Firebase CLI non installe!" -ForegroundColor Red
    Write-Host "Installation: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

$project = "convert-multimedia"

Write-Host "ETAPE 1: Configuration Supabase" -ForegroundColor Cyan
Write-Host ""

# Secrets Supabase
$secrets = @{
    "DATABASE_URL" = "postgresql://postgres.poilochddyciosejieyy:Hababaumri11@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    "DIRECT_URL" = "postgresql://postgres:Hababaumri11@db.poilochddyciosejieyy.supabase.co:5432/postgres"
    "SUPABASE_SERVICE_ROLE_KEY" = "sb_secret_0HZWpwOmvkBRUeOiRWHcXw_yM6EBTgz"
}

foreach ($key in $secrets.Keys) {
    Write-Host "Configuring $key..." -NoNewline
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $secrets[$key] -NoNewline
    
    $null = firebase apphosting:secrets:set $key --project $project --data-file $tempFile 2>&1
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host " ERREUR" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "ETAPE 2: Generation cles de securite" -ForegroundColor Cyan
Write-Host ""

$encryptionKey = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$jwtSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$nextAuthSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

$securityKeys = @{
    "ENCRYPTION_KEY" = $encryptionKey
    "JWT_SECRET" = $jwtSecret
    "NEXTAUTH_SECRET" = $nextAuthSecret
}

foreach ($key in $securityKeys.Keys) {
    Write-Host "Configuring $key..." -NoNewline
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $securityKeys[$key] -NoNewline
    
    $null = firebase apphosting:secrets:set $key --project $project --data-file $tempFile 2>&1
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host " ERREUR" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "ETAPE 3: Permissions" -ForegroundColor Cyan
Write-Host ""
Write-Host "Grant access..." -NoNewline
$null = firebase apphosting:secrets:grantaccess --project $project 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " ERREUR" -ForegroundColor Yellow
    Write-Host "Executez manuellement: firebase apphosting:secrets:grantaccess --project $project"
}

Write-Host ""
Write-Host "========================================"
Write-Host "Configuration terminee!"
Write-Host "========================================"
Write-Host ""

Write-Host "ATTENTION: Redis pointe vers localhost!" -ForegroundColor Yellow
Write-Host "Vous devez configurer un Redis distant (Upstash recommande)" -ForegroundColor Yellow
Write-Host "1. Creez un compte: https://console.upstash.com"
Write-Host "2. Configurez: firebase apphosting:secrets:set REDIS_URL --project $project"
Write-Host ""

Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "1. Configurez Redis (IMPORTANT)"
Write-Host "2. Redeployez: git commit --allow-empty -m 'Rebuild' && git push"
Write-Host "3. Surveillez: https://console.firebase.google.com/project/$project/apphosting"
Write-Host ""

Write-Host "Cles generees (sauvegardez-les):"
Write-Host "ENCRYPTION_KEY=$encryptionKey" -ForegroundColor DarkGray
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor DarkGray
Write-Host "NEXTAUTH_SECRET=$nextAuthSecret" -ForegroundColor DarkGray
Write-Host ""
