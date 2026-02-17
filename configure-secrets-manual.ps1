# Configuration manuelle des secrets Firebase
# Exécutez chaque commande une par une après avoir remplacé les valeurs

Write-Host "=== CONFIGURATION SECRETS FIREBASE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Connectez-vous à Firebase:" -ForegroundColor Yellow
Write-Host "   firebase login" -ForegroundColor White
Write-Host ""
Write-Host "2. Créez chaque secret avec ces commandes:" -ForegroundColor Yellow
Write-Host ""

# Supabase
Write-Host "# Supabase Database" -ForegroundColor Green
Write-Host 'firebase apphosting:secrets:set DATABASE_URL --project convert-multimedia --data-file=- <<< "postgresql://postgres.poilochddyciosejieyy:Hababaumri11@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"' -ForegroundColor White
Write-Host ""
Write-Host 'firebase apphosting:secrets:set DIRECT_URL --project convert-multimedia --data-file=- <<< "postgresql://postgres:Hababaumri11@db.poilochddyciosejieyy.supabase.co:5432/postgres"' -ForegroundColor White
Write-Host ""
Write-Host 'firebase apphosting:secrets:set SUPABASE_SERVICE_ROLE_KEY --project convert-multimedia --data-file=- <<< "sb_secret_0HZWpwOmvkBRUeOiRWHcXw_yM6EBTgz"' -ForegroundColor White
Write-Host ""

# Redis
Write-Host "# Redis (REMPLACER par URL distant en production)" -ForegroundColor Green
Write-Host 'firebase apphosting:secrets:set REDIS_URL --project convert-multimedia --data-file=- <<< "redis://VOTRE_REDIS_DISTANT"' -ForegroundColor White
Write-Host ""

# Stripe
Write-Host "# Stripe (REMPLACER par vraies clés)" -ForegroundColor Green
Write-Host 'firebase apphosting:secrets:set STRIPE_SECRET_KEY --project convert-multimedia --data-file=- <<< "VOTRE_CLE_STRIPE"' -ForegroundColor White
Write-Host ""

# UploadThing
Write-Host "# UploadThing (REMPLACER par vraies clés)" -ForegroundColor Green
Write-Host 'firebase apphosting:secrets:set UPLOADTHING_SECRET --project convert-multimedia --data-file=- <<< "VOTRE_CLE_UPLOADTHING"' -ForegroundColor White
Write-Host ""

# Security Keys - À GÉNÉRER
Write-Host "# Clés de sécurité (GÉNÉRER NOUVELLES CLÉS avec OpenSSL)" -ForegroundColor Red
Write-Host "# COMMANDE: openssl rand -base64 32" -ForegroundColor Red
Write-Host 'firebase apphosting:secrets:set ENCRYPTION_KEY --project convert-multimedia --data-file=- <<< "NOUVELLE_CLE_32_CHARS"' -ForegroundColor White
Write-Host ""
Write-Host 'firebase apphosting:secrets:set JWT_SECRET --project convert-multimedia --data-file=- <<< "NOUVELLE_CLE_32_CHARS"' -ForegroundColor White
Write-Host ""
Write-Host 'firebase apphosting:secrets:set NEXTAUTH_SECRET --project convert-multimedia --data-file=- <<< "NOUVELLE_CLE_32_CHARS"' -ForegroundColor White
Write-Host ""

# Google OAuth
Write-Host "# Google OAuth (si utilisé)" -ForegroundColor Green
Write-Host 'firebase apphosting:secrets:set GOOGLE_CLIENT_ID --project convert-multimedia --data-file=- <<< "VOTRE_GOOGLE_CLIENT_ID"' -ForegroundColor White
Write-Host ""
Write-Host 'firebase apphosting:secrets:set GOOGLE_CLIENT_SECRET --project convert-multimedia --data-file=- <<< "VOTRE_GOOGLE_CLIENT_SECRET"' -ForegroundColor White
Write-Host ""

Write-Host "3. Donnez les permissions au backend:" -ForegroundColor Yellow
Write-Host "   firebase apphosting:secrets:grantaccess --project convert-multimedia" -ForegroundColor White
Write-Host ""

Write-Host "4. Redéployez (Firebase rebuildera automatiquement):" -ForegroundColor Yellow
Write-Host "   git commit --allow-empty -m 'Trigger rebuild'; git push origin main" -ForegroundColor White
Write-Host ""

Write-Host "=== IMPORTANT ===" -ForegroundColor Red
Write-Host "- REDIS_URL: Utilisez Upstash Redis (https://upstash.com) pour production" -ForegroundColor Yellow
Write-Host "- STRIPE: Remplacez par clés live (commencent par 'sk_live_')" -ForegroundColor Yellow
Write-Host "- UPLOADTHING: Remplacez par vraies clés de votre compte" -ForegroundColor Yellow
Write-Host "- SECURITY KEYS: GÉNÉR NOUVELLES clés avec 'openssl rand -base64 32'" -ForegroundColor Yellow
