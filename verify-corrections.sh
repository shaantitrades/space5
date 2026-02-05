#!/bin/bash
# 🔍 SCRIPT DE VÉRIFICATION POST-CORRECTION - OMNIVERSA

echo "=================================================="
echo "✅ VÉRIFICATION POST-CORRECTION"
echo "=================================================="
echo ""

PASSED=0
FAILED=0

# ========== 1. Vérifier env-validation.ts ==========
echo "[1] Vérifier src/lib/env-validation.ts..."
if [ -f "src/lib/env-validation.ts" ]; then
  if grep -q "getEnv()" src/lib/env-validation.ts; then
    echo "✅ PASS: env-validation.ts créé correctement"
    ((PASSED++))
  else
    echo "❌ FAIL: env-validation.ts manque getEnv()"
    ((FAILED++))
  fi
else
  echo "❌ FAIL: src/lib/env-validation.ts manquant"
  ((FAILED++))
fi

# ========== 2. Vérifier auth.ts modifications ==========
echo "[2] Vérifier modifications src/lib/auth.ts..."
if grep -q "import { env } from" src/lib/auth.ts; then
  echo "✅ PASS: env importé dans auth.ts"
  ((PASSED++))
else
  echo "❌ FAIL: env pas importé dans auth.ts"
  ((FAILED++))
fi

if grep -q "as any" src/lib/auth.ts; then
  echo "❌ FAIL: Encore des 'as any' dans auth.ts"
  ((FAILED++))
else
  echo "✅ PASS: Pas de 'as any' dans auth.ts"
  ((PASSED++))
fi

# ========== 3. Vérifier email.ts ==========
echo "[3] Vérifier src/lib/email.ts..."
if [ -f "src/lib/email.ts" ]; then
  if grep -q "sendVerificationEmail" src/lib/email.ts; then
    echo "✅ PASS: email.ts créé avec sendVerificationEmail"
    ((PASSED++))
  else
    echo "❌ FAIL: sendVerificationEmail manquant"
    ((FAILED++))
  fi
else
  echo "❌ FAIL: src/lib/email.ts manquant"
  ((FAILED++))
fi

# ========== 4. Vérifier auth types ==========
echo "[4] Vérifier src/lib/types/auth.ts..."
if [ -f "src/lib/types/auth.ts" ]; then
  if grep -q "CustomJWT" src/lib/types/auth.ts; then
    echo "✅ PASS: Types stricts créés"
    ((PASSED++))
  else
    echo "❌ FAIL: CustomJWT manquant"
    ((FAILED++))
  fi
else
  echo "❌ FAIL: src/lib/types/auth.ts manquant"
  ((FAILED++))
fi

# ========== 5. Vérifier signup.ts modifications ==========
echo "[5] Vérifier modifications signup route..."
if grep -q "sendVerificationEmail" src/app/api/auth/signup/route.ts; then
  echo "✅ PASS: Email verification ajoutée au signup"
  ((PASSED++))
else
  echo "❌ FAIL: sendVerificationEmail pas dans signup"
  ((FAILED++))
fi

if grep -q "signupSchema.parse" src/app/api/auth/signup/route.ts; then
  echo "✅ PASS: Validation Zod ajoutée au signup"
  ((PASSED++))
else
  echo "❌ FAIL: Zod validation pas dans signup"
  ((FAILED++))
fi

# ========== 6. Vérifier verify route ==========
echo "[6] Vérifier route /api/auth/verify..."
if [ -f "src/app/api/auth/verify/route.ts" ]; then
  echo "✅ PASS: Route de vérification créée"
  ((PASSED++))
else
  echo "❌ FAIL: Route /api/auth/verify manquante"
  ((FAILED++))
fi

# ========== 7. Vérifier docker-compose ==========
echo "[7] Vérifier docker-compose.yml..."
if grep -q 'DATABASE_URL=${DATABASE_URL}' docker-compose.yml; then
  echo "✅ PASS: Secrets sécurisés dans docker-compose"
  ((PASSED++))
else
  echo "❌ FAIL: Secrets hardcoded dans docker-compose"
  ((FAILED++))
fi

# ========== 8. Vérifier rate-limiter ==========
echo "[8] Vérifier src/lib/rate-limiter.ts..."
if [ -f "src/lib/rate-limiter.ts" ]; then
  if grep -q "rateLimit" src/lib/rate-limiter.ts; then
    echo "✅ PASS: Rate limiter créé"
    ((PASSED++))
  else
    echo "❌ FAIL: Rate limiter vide"
    ((FAILED++))
  fi
else
  echo "❌ FAIL: src/lib/rate-limiter.ts manquant"
  ((FAILED++))
fi

# ========== RÉSUMÉ ==========
echo ""
echo "=================================================="
echo "📊 RÉSUMÉ"
echo "=================================================="
echo "✅ PASSED: $PASSED"
echo "❌ FAILED: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 EXCELLENTES! Tous les changements ont été appliqués!"
  echo ""
  echo "Maintenant, exécutez:"
  echo "  npm run type-check   (vérifier les types)"
  echo "  npm run build        (compiler)"
  echo "  npm run dev          (tester localement)"
  exit 0
else
  echo "❌ $FAILED changement(s) manquant(s)!"
  exit 1
fi
