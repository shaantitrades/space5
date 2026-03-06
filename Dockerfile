# ============================================================
# Multi Convert — Dockerfile optimisé pour Coolify / VPS
# ============================================================
FROM node:20-alpine AS base

# ---- Stage 1 : Dépendances ----
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl python3 make g++ vips-dev
WORKDIR /app
# Force development pour que npm installe TOUTES les dépendances (incl. devDependencies)
ENV NODE_ENV=development

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Installation + génération du client Prisma
RUN npm install --legacy-peer-deps
RUN npx prisma generate

# ---- Stage 2 : Build ----
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl vips-dev
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
# Valeurs factices pour éviter les erreurs de validation au build
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV DIRECT_URL="postgresql://build:build@localhost:5432/build"
ENV REDIS_URL="redis://localhost:6379"
ENV NEXTAUTH_SECRET="build-secret-placeholder-32chars-minimum-xx"
ENV JWT_SECRET="build-jwt-secret-placeholder-32chars-minimumx"
ENV ENCRYPTION_KEY="0000000000000000000000000000000000000000000000000000000000000000"
ENV GOOGLE_CLIENT_ID="build-placeholder"
ENV GOOGLE_CLIENT_SECRET="build-placeholder"
# Skip env validation stricte pendant le build Next.js
ENV NEXT_BUILD_PHASE=1
# Augmenter la mémoire Node.js pour éviter les OOM pendant le build
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build > /tmp/build.log 2>&1 ; \
    EXIT_CODE=$? ; \
    if [ $EXIT_CODE -ne 0 ]; then \
        echo "=== NEXT.JS BUILD FAILED ===" ; \
        cat /tmp/build.log ; \
        exit $EXIT_CODE ; \
    fi

# ---- Stage 3 : Production ----
FROM base AS runner
RUN apk add --no-cache openssl vips
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
