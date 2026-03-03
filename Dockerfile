# ============================================================
# Multi Convert — Dockerfile optimisé pour Coolify / VPS
# ============================================================
FROM node:20-alpine AS base

# ---- Stage 1 : Dépendances ----
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Installation + génération du client Prisma
RUN npm install
RUN npx prisma generate

# ---- Stage 2 : Build ----
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement nécessaires au build (NEXT_PUBLIC_*)
# Surchargeables via les build-args Coolify
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG NEXT_PUBLIC_VERSION=1.0.0

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true

RUN npm run build

# ---- Stage 3 : Production ----
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Fichiers publics & output standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Schéma Prisma + client généré pour les migrations runtime
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --chown=nextjs:nodejs prisma ./prisma

# Script de démarrage (migrations + lancement)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["./docker-entrypoint.sh"]
