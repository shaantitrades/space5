# ============================================================
# Multi Convert — Dockerfile minimal (Next.js standalone + Prisma)
# Optimisé pour Coolify / VPS faible (2–4 Go RAM)
# Étages : base -> deps -> builder -> runner
# ============================================================

# ---------- Base commune ----------
FROM node:20-alpine AS base
# libc6-compat : compatibilité glibc (engines Prisma) — openssl : requis par Prisma
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---------- 1) deps : dépendances de PRODUCTION uniquement ----------
FROM base AS deps
COPY package.json ./
COPY prisma ./prisma/

# eslint / prettier ne servent PAS au build (eslint.ignoreDuringBuilds=true)
# Utiliser une version stable de npm (v9) dans l'image pour éviter des bugs
# observés avec npm@11 (semver Invalid Version lors de l'installation).
RUN npm install -g npm@9
# => on n'installe QUE les dépendances de production (moins de paquets, moins de RAM)
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

# Génération du client Prisma (CLI locale v5 — évite que `npx` télécharge une v7 incompatible)
RUN node ./node_modules/prisma/build/index.js generate

# ---------- 2) builder : compilation Next.js ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* sont inlinées au build — surchargeables via les build-args Coolify
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG NEXT_PUBLIC_VERSION=1.0.0

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=true \
    NEXT_BUILD_PHASE=1

# Limite le heap Node pour éviter l'OOM sur un petit VPS.
# 2048 = OK pour 4 Go ; baissez à 1024–1536 sur un VPS 2 Go si OOM.
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN npm run build

# ---------- 3) runner : image finale ----------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Output standalone + fichiers statiques
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# node_modules de production (client + CLI Prisma + engines + modules natifs externalisés)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs prisma ./prisma

# Script de démarrage (migrations + lancement)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["./docker-entrypoint.sh"]
