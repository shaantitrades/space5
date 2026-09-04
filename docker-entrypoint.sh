#!/bin/sh
# ============================================================
# Script de démarrage — Multi Convert
# Exécute les migrations Prisma puis lance le serveur Next.js
# ============================================================
set -e

echo "🚀 Démarrage de Multi Convert..."

# CLI Prisma locale (v5) — évite que `npx prisma` télécharge Prisma v7 incompatible
PRISMA="node ./node_modules/prisma/build/index.js"

# Attendre que la base de données soit prête (max ~5 minutes)
echo "⏳ Attente de la base de données..."
ATTEMPTS=0
until $PRISMA db push --skip-generate >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 60 ]; then
    echo "❌ Base de données indisponible après 60 tentatives"
    exit 1
  fi
  echo "   La base de données n'est pas encore prête, nouvelle tentative dans 5s... ($ATTEMPTS/60)"
  sleep 5
done

# Appliquer les migrations Prisma
echo "📦 Application des migrations Prisma..."
$PRISMA migrate deploy || {
  echo "⚠️  migrate deploy a échoué, tentative avec db push..."
  $PRISMA db push --skip-generate
}

echo "✅ Base de données prête"
echo "🌐 Lancement du serveur sur le port ${PORT:-3000}..."

exec node server.js
