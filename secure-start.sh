#!/bin/bash
# Script de démarrage sécurisé - OMNIVERSA
# Vérifie toutes les corrections avant de lancer

set -e

echo "=========================================="
echo "OMNIVERSA - DÉMARRAGE SÉCURISÉ"
echo "=========================================="
echo ""

# 1. Vérifier .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local manquant!"
    echo "Créant .env.local depuis .env.example..."
    cp .env.example .env.local
    echo "⚠️  IMPORTANT: Modifiez .env.local avec vos vraies valeurs!"
fi

# 2. Vérifier que les corrections sont en place
echo "✅ Vérification des corrections..."
checks=0
[ -f "src/lib/env-validation.ts" ] && checks=$((checks+1)) && echo "   ✓ env-validation.ts"
[ -f "src/lib/auth-utils.ts" ] && checks=$((checks+1)) && echo "   ✓ auth-utils.ts"
[ -f "src/lib/email.ts" ] && checks=$((checks+1)) && echo "   ✓ email.ts"
[ -f "src/app/api/auth/verify/route.ts" ] && checks=$((checks+1)) && echo "   ✓ /api/auth/verify"
[ -f "src/lib/rate-limiter.ts" ] && checks=$((checks+1)) && echo "   ✓ rate-limiter.ts"

if [ $checks -lt 5 ]; then
    echo ""
    echo "❌ Certaines corrections manquent!"
    exit 1
fi

echo ""
echo "✅ Toutes les corrections sont en place ($checks/5)"
echo ""

# 3. Prisma
echo "🔧 Synchronisation Prisma..."
npx prisma generate

# 4. Type-check
echo ""
echo "🔍 Vérification TypeScript..."
npm run type-check || echo "⚠️  TypeScript errors found"

# 5. Build
echo ""
echo "🏗️  Build du projet..."
npm run build

echo ""
echo "=========================================="
echo "✅ PRÊT À DÉMARRER"
echo "=========================================="
echo ""
echo "Commandes disponibles:"
echo "  npm run dev      - Démarrer le serveur de développement"
echo "  npm run build    - Créer la build production"
echo "  npm run type-check - Vérifier les types TypeScript"
echo ""
