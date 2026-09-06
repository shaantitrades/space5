#!/bin/sh
# ============================================================
# Script de démarrage — Multi Convert
# Exécute les migrations Prisma puis lance le serveur Next.js
# ============================================================
set -e

echo "🚀 Démarrage de Multi Convert..."

# CLI Prisma locale (v5) — évite que `npx prisma` télécharge Prisma v7 incompatible
PRISMA="node ./node_modules/prisma/build/index.js"

# Afficher l'hôte cible de la base (sans credentials) pour faciliter le diagnostic
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's#.*@([^/]+).*#\1#')
echo "🗄️  Base de données cible : ${DB_HOST:-inconnue}"

# Attendre que la base de données soit prête (max ~5 minutes)
echo "⏳ Attente de la base de données..."
ATTEMPTS=0
DB_OK=false
while [ "$ATTEMPTS" -lt 60 ]; do
  if $PRISMA db push --skip-generate >/tmp/db-push.log 2>&1; then
    DB_OK=true
    break
  fi
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -eq 1 ]; then
    echo "   Erreur de connexion :"
    tail -n 10 /tmp/db-push.log
  fi
  echo "   La base de données n'est pas encore prête, nouvelle tentative dans 5s... ($ATTEMPTS/60)"
  sleep 5
done

if [ "$DB_OK" = true ]; then
  # Appliquer les migrations Prisma
  echo "📦 Application des migrations Prisma..."
  $PRISMA migrate deploy || {
    echo "⚠️  migrate deploy a échoué, tentative avec db push..."
    $PRISMA db push --skip-generate
  }
  echo "✅ Base de données prête"
else
  echo "⚠️  Base de données indisponible — démarrage en mode dégradé (sans base de données)"
fi
echo "🌐 Lancement du serveur sur le port ${PORT:-3000}..."

exec node server.js
