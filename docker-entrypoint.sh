#!/bin/sh
# ============================================================
# Script de démarrage — Multi Convert
#
# IMPORTANT : le serveur Next.js est lance TOUT DE SUITE et la
# preparation de la base se fait EN ARRIERE-PLAN. L'ancienne version
# attendait la base (jusqu'a 60 essais x 5 s) AVANT de lancer le
# serveur : l'app n'ecoutait donc pas encore sur le port 3000 et le
# proxy repondait « 504 Gateway Timeout ».
# ============================================================
set -e

echo "🚀 Démarrage de Multi Convert..."

# CLI Prisma locale (v5) — évite que `npx prisma` télécharge Prisma v7 incompatible
PRISMA="node ./node_modules/prisma/build/index.js"
PORT="${PORT:-3000}"

# Afficher l'hôte cible de la base (sans credentials) pour faciliter le diagnostic
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's#.*@([^/]+).*#\1#')
echo "🗄️  Base de données cible : ${DB_HOST:-inconnue}"

# ── 1) Le serveur démarre immédiatement ──────────────────────
echo "🌐 Lancement du serveur sur le port ${PORT}..."
node server.js &
SERVER_PID=$!

# ── 2) Schéma / migrations Prisma en arrière-plan ────────────
(
  ATTEMPTS=0
  until $PRISMA db push --skip-generate >/tmp/db-push.log 2>&1; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "$ATTEMPTS" -eq 1 ]; then
      echo "   Erreur de connexion :"
      tail -n 10 /tmp/db-push.log
    fi
    if [ "$ATTEMPTS" -ge 24 ]; then
      echo "⚠️  Base indisponible après ~2 min — le serveur continue en mode dégradé"
      exit 0
    fi
    echo "   La base n'est pas encore prête, nouvel essai dans 5s... ($ATTEMPTS/24)"
    sleep 5
  done

  echo "✅ Schéma de base de données à jour"
  if [ -d ./prisma/migrations ]; then
    $PRISMA migrate deploy || echo "⚠️  migrate deploy a échoué (schéma déjà appliqué)"
  fi
) &

# ── 3) Arrêt propre : on transmet les signaux au serveur ─────
trap 'kill -TERM "$SERVER_PID" 2>/dev/null' TERM INT
wait "$SERVER_PID"
