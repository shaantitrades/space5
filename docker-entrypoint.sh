#!/bin/sh
# ============================================================
# Script de démarrage — Multi Convert
# Exécute les migrations Prisma puis lance le serveur Next.js
# ============================================================
set -e

echo "🚀 Démarrage de Multi Convert..."

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
until npx prisma db push --skip-generate 2>/dev/null || \
      node -e "require('@prisma/client')" 2>/dev/null; do
  echo "   La base de données n'est pas encore prête, nouvelle tentative dans 5s..."
  sleep 5
done

# Appliquer les migrations Prisma
echo "📦 Application des migrations Prisma..."
npx prisma migrate deploy || {
  echo "⚠️  migrate deploy a échoué, tentative avec db push..."
  npx prisma db push --skip-generate
}

echo "✅ Base de données prête"
echo "🌐 Lancement du serveur sur le port ${PORT:-3000}..."

exec node server.js
