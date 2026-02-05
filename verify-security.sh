#!/bin/bash
# 🔍 SCRIPT DE VÉRIFICATION AUTOMATIQUE - OMNIVERSA
# Utilisation: bash verify-security.sh

echo "🔍 AUDIT DE SÉCURITÉ AUTOMATIQUE - OMNIVERSA"
echo "=============================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0
PASSED=0

# Fonction d'alerte
check_fail() {
  echo -e "${RED}❌ FAIL:${NC} $1"
  ((ERRORS++))
}

check_warn() {
  echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
  ((WARNINGS++))
}

check_pass() {
  echo -e "${GREEN}✅ PASS:${NC} $1"
  ((PASSED++))
}

# ========================================
# 1. VÉRIFIER LES SECRETS HARDCODED
# ========================================
echo -e "${BLUE}1️⃣  CHECKING FOR HARDCODED SECRETS${NC}"
echo ""

if grep -r "password.*=.*\"" src/ --include="*.ts" --include="*.tsx" | grep -v "passwordHash" | grep -v "passwordRegex" | head -5 | grep -q .; then
  check_fail "Found potential hardcoded passwords in code"
else
  check_pass "No obvious hardcoded passwords found"
fi

if grep -r "process.env.* || \"" src/ --include="*.ts" --include="*.tsx" | grep -q .; then
  check_fail "Found process.env with empty string defaults - should throw!"
  grep -r "process.env.* || \"" src/ --include="*.ts" --include="*.tsx" | head -3
else
  check_pass "No process.env with empty defaults"
fi

# ========================================
# 2. VÉRIFIER LES TYPES ANY
# ========================================
echo ""
echo -e "${BLUE}2️⃣  CHECKING FOR 'as any' TYPE CASTS${NC}"
echo ""

ANY_COUNT=$(grep -r "as any" src/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $ANY_COUNT -gt 0 ]; then
  check_fail "Found $ANY_COUNT instances of 'as any' - type safety compromised"
  echo "Examples:"
  grep -r "as any" src/ --include="*.ts" --include="*.tsx" | head -5
else
  check_pass "No 'as any' type casts found"
fi

# ========================================
# 3. VÉRIFIER LES COMMENTAIRES TODO
# ========================================
echo ""
echo -e "${BLUE}3️⃣  CHECKING FOR TODO COMMENTS${NC}"
echo ""

TODO_COUNT=$(grep -r "TODO\|FIXME\|BUG\|HACK" src/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
  check_warn "Found $TODO_COUNT TODO/FIXME/BUG comments in code"
  echo "Top 5 TODOs:"
  grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" | head -5
else
  check_pass "No TODOs found"
fi

# ========================================
# 4. VÉRIFIER LES CONSOLE.LOGS
# ========================================
echo ""
echo -e "${BLUE}4️⃣  CHECKING FOR CONSOLE.LOG IN PRODUCTION CODE${NC}"
echo ""

CONSOLE_COUNT=$(grep -r "console.log\|console.error\|console.warn" src/app/api src/lib --include="*.ts" --include="*.tsx" | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
  check_warn "Found $CONSOLE_COUNT console statements in API/lib code"
else
  check_pass "No console logs in production code"
fi

# ========================================
# 5. VÉRIFIER DOCKER SECRETS
# ========================================
echo ""
echo -e "${BLUE}5️⃣  CHECKING DOCKER SECRETS${NC}"
echo ""

if grep -q "password=" docker-compose.yml; then
  check_fail "Found hardcoded passwords in docker-compose.yml"
  grep "password=" docker-compose.yml
else
  check_pass "No hardcoded passwords in docker-compose.yml"
fi

# ========================================
# 6. VÉRIFIER PRISMA SCHEMA
# ========================================
echo ""
echo -e "${BLUE}6️⃣  CHECKING PRISMA SCHEMA${NC}"
echo ""

if grep -q "password.*String\?" prisma/schema.prisma; then
  check_fail "Plain text 'password' field still in Prisma schema (should only have passwordHash)"
else
  check_pass "No plain text password field in Prisma schema"
fi

if grep -q "passwordHash" prisma/schema.prisma; then
  check_pass "passwordHash field present"
else
  check_fail "passwordHash field missing - where are passwords being stored?"
fi

# ========================================
# 7. VÉRIFIER TSCONFIG
# ========================================
echo ""
echo -e "${BLUE}7️⃣  CHECKING TYPESCRIPT CONFIGURATION${NC}"
echo ""

if grep -q '"strict": true' tsconfig.json; then
  check_pass "TypeScript strict mode enabled"
else
  check_warn "TypeScript strict mode not enabled"
fi

if grep -q '"noImplicitAny": true' tsconfig.json; then
  check_pass "noImplicitAny enabled"
else
  check_fail "noImplicitAny not enabled - implicit any allowed!"
fi

# ========================================
# 8. VÉRIFIER ESLINT
# ========================================
echo ""
echo -e "${BLUE}8️⃣  CHECKING ESLINT CONFIGURATION${NC}"
echo ""

if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || grep -q "eslint" package.json; then
  check_pass "ESLint is configured"
else
  check_warn "ESLint not configured - consider adding it"
fi

# ========================================
# 9. VÉRIFIER TESTS
# ========================================
echo ""
echo -e "${BLUE}9️⃣  CHECKING TEST CONFIGURATION${NC}"
echo ""

if grep -q "jest\|vitest" package.json; then
  check_pass "Test framework configured"
else
  check_warn "No test framework found - consider adding Jest or Vitest"
fi

if [ -d "src/__tests__" ]; then
  TEST_FILES=$(find src/__tests__ -name "*.test.ts" -o -name "*.spec.ts" | wc -l)
  if [ $TEST_FILES -gt 0 ]; then
    check_pass "Found $TEST_FILES test files"
  else
    check_warn "Test directory exists but no test files found"
  fi
else
  check_warn "No __tests__ directory found"
fi

# ========================================
# 10. VÉRIFIER .ENV
# ========================================
echo ""
echo -e "${BLUE}🔟 CHECKING .ENV FILES${NC}"
echo ""

if [ -f ".env.local" ]; then
  if grep -q "GOOGLE_CLIENT_ID=" .env.local; then
    check_pass ".env.local exists and has GOOGLE_CLIENT_ID"
  else
    check_fail ".env.local missing critical variables"
  fi
else
  check_fail ".env.local not found - copy from .env.example and configure"
fi

if grep -q ".env.local" .gitignore 2>/dev/null; then
  check_pass ".env.local is in .gitignore"
else
  check_fail ".env.local NOT in .gitignore - secrets could be exposed!"
fi

# ========================================
# 11. VÉRIFIER DÉPENDANCES SÉCURITÉ
# ========================================
echo ""
echo -e "${BLUE}11️⃣ CHECKING DEPENDENCIES FOR VULNERABILITIES${NC}"
echo ""

if command -v npm &> /dev/null; then
  VULNS=$(npm audit 2>/dev/null | grep -c "vulnerabilities" || echo "0")
  if [ "$VULNS" = "0" ]; then
    check_pass "No known vulnerabilities in npm packages"
  else
    check_warn "Run 'npm audit' to check for vulnerabilities"
  fi
else
  echo "npm not found - skipping audit"
fi

# ========================================
# 12. VÉRIFIER BUILD
# ========================================
echo ""
echo -e "${BLUE}1️⃣2️⃣ CHECKING BUILD${NC}"
echo ""

echo "Attempting to build..."
if npm run build > /tmp/build.log 2>&1; then
  check_pass "Build successful"
else
  check_fail "Build failed - check logs with: npm run build"
  tail -20 /tmp/build.log
fi

# ========================================
# 13. VÉRIFIER TYPE CHECK
# ========================================
echo ""
echo -e "${BLUE}1️⃣3️⃣ CHECKING TYPES${NC}"
echo ""

if npm run type-check > /tmp/typecheck.log 2>&1; then
  check_pass "TypeScript type-check passed"
else
  check_fail "TypeScript errors found"
  tail -20 /tmp/typecheck.log
fi

# ========================================
# RÉSUMÉ
# ========================================
echo ""
echo "=============================================="
echo -e "${BLUE}📊 RÉSUMÉ DE L'AUDIT${NC}"
echo "=============================================="
echo ""

TOTAL=$((PASSED + ERRORS + WARNINGS))

echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ ERRORS: $ERRORS${NC}"
echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS${NC}"
echo -e "${BLUE}📊 TOTAL: $TOTAL${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}🎉 EXCELLENT! No critical errors found!${NC}"
  if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✨ You're ready for production!${NC}"
    exit 0
  else
    echo -e "${YELLOW}⚠️  But $WARNINGS warnings should be addressed before production${NC}"
    exit 1
  fi
else
  echo -e "${RED}🔴 CRITICAL ISSUES FOUND! Fix them before production:${NC}"
  echo ""
  echo "Read these documents for solutions:"
  echo "1. AUDIT-SECURITE-COMPLETE.md - Detailed analysis"
  echo "2. PLAN-CORRECTION-CODE.md - Code examples to fix issues"
  echo "3. CHECKLIST-IMPLEMENTATION.md - Step-by-step implementation"
  exit 2
fi
