#!/bin/sh
# ============================================================
# Script de démarrage — Multi Convert
#
# RÈGLE D'OR : le site doit répondre le plus vite possible.
#
# 1. Le serveur Next.js est lance TOUT DE SUITE et la
#    preparation de la base se fait EN ARRIERE-PLAN. L'ancienne version
#    attendait la base (jusqu'a 60 essais x 5 s) AVANT de lancer le
#    serveur : l'app n'ecoutait donc pas encore sur le port 3000 et le
#    proxy repondait « 504 Gateway Timeout ».
# 2. Si la base est indisponible, le serveur continue quand meme
#    (mode degrade) : mieux vaut un site qui répond qu'un site absent.
# 3. Aucune etape bloquante ne doit se trouver avant le lancement du
#    serveur — c'est ce qui a provoque les 504 apres deploiement.
# ============================================================
set -e

# Horodatage des messages : permet de mesurer la fenetre d'indisponibilite
# pendant un deploiement (utile pour diagnostiquer un 504).
log() {
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"
}

log "🚀 Démarrage de Multi Convert..."

# CLI Prisma locale (v5) — évite que `npx prisma` télécharge Prisma v7 incompatible
PRISMA="node ./node_modules/prisma/build/index.js"
PORT="${PORT:-3000}"
export PORT

# Afficher l'hôte cible de la base (sans credentials) pour faciliter le diagnostic
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's#.*@([^/]+).*#\1#')
log "🗄️  Base de données cible : ${DB_HOST:-inconnue}"

# Sécurité : sans le bundle standalone, rien ne sert de continuer — l'erreur
# doit être explicite dans les logs plutôt qu'un conteneur qui « tourne » sans
# jamais répondre (ce qui provoque des 504 côté proxy).
if [ ! -f ./server.js ]; then
  log "❌ server.js introuvable : image incomplète (sortie standalone manquante). Arrêt."
  exit 1
fi

# Plafond memoire du runtime : sans lui, un pic du process Node pouvait faire
# tomber tout le VPS (OOM killer) et le site devenait injoignable.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}"

# ── 1) Le serveur démarre immédiatement ──────────────────────
log "🌐 Lancement du serveur sur le port ${PORT}..."
node server.js &
SERVER_PID=$!

# ── 2) Schéma / migrations Prisma en arrière-plan ────────────
(
  ATTEMPTS=0
  until $PRISMA db push --skip-generate >/tmp/db-push.log 2>&1; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "$ATTEMPTS" -eq 1 ]; then
      log "   Erreur de connexion :"
      tail -n 10 /tmp/db-push.log
    fi
    if [ "$ATTEMPTS" -ge 24 ]; then
      log "⚠️  Base indisponible après ~2 min — le serveur continue en mode dégradé"
      exit 0
    fi
    log "   La base n'est pas encore prête, nouvel essai dans 5s... ($ATTEMPTS/24)"
    sleep 5
  done

  log "✅ Schéma de base de données à jour"
  if [ -d ./prisma/migrations ]; then
    $PRISMA migrate deploy || log "⚠️  migrate deploy a échoué (schéma déjà appliqué)"
  fi
) &

# ── 3) Arrêt propre : on transmet les signaux au serveur ─────
trap 'log "🛑 Signal reçu — arrêt du serveur"; kill -TERM "$SERVER_PID" 2>/dev/null' TERM INT
wait "$SERVER_PID"
