@echo off
REM Script de vérification de sécurité pour Windows
REM Utilisation: verify-security.ps1 ou double-cliquez sur ce fichier

echo.
echo ============================================
echo AUDIT DE SECURITE OMNIVERSA
echo ============================================
echo.

setlocal enabledelayedexpansion

set PASSED=0
set ERRORS=0
set WARNINGS=0

REM ========================================
REM 1. VERIFIER LES SECRETS HARDCODES
REM ========================================
echo [1] Verification des secrets hardcodes...

findstr /R "password.*=.*\"" src\*.ts src\*.tsx src\app\*.ts src\app\*.tsx 2>nul | findstr /V "passwordHash" >nul && (
  echo [X] ERREUR: Passwords hardcodes trouves
  set /a ERRORS+=1
) || (
  echo [OK] Aucun password hardcode trouve
  set /a PASSED+=1
)

REM ========================================
REM 2. VERIFIER LES "as any"
REM ========================================
echo [2] Verification des 'as any'...

findstr /R /S "as any" src\*.ts src\*.tsx >nul && (
  echo [X] ERREUR: 'as any' trouve - type safety compromise
  set /a ERRORS+=1
) || (
  echo [OK] Aucun 'as any' trouve
  set /a PASSED+=1
)

REM ========================================
REM 3. VERIFIER LES TODOS
REM ========================================
echo [3] Verification des TODO comments...

findstr /R /S "TODO\|FIXME" src\*.ts src\*.tsx >nul && (
  echo [!] ATTENTION: TODO/FIXME comments trouves
  set /a WARNINGS+=1
) || (
  echo [OK] Aucun TODO/FIXME trouve
  set /a PASSED+=1
)

REM ========================================
REM 4. VERIFIER DOCKER
REM ========================================
echo [4] Verification des secrets Docker...

findstr "password=" docker-compose.yml >nul && (
  echo [X] ERREUR: Passwords hardcodes dans docker-compose.yml
  set /a ERRORS+=1
) || (
  echo [OK] Pas de passwords hardcodes dans Docker
  set /a PASSED+=1
)

REM ========================================
REM 5. VERIFIER PRISMA
REM ========================================
echo [5] Verification du schema Prisma...

findstr "password.*String" prisma\schema.prisma | findstr /V "passwordHash" >nul && (
  echo [X] ERREUR: Champ 'password' en plain text dans Prisma
  set /a ERRORS+=1
) || (
  echo [OK] Pas de champ password en plain text
  set /a PASSED+=1
)

REM ========================================
REM 6. VERIFIER .ENV
REM ========================================
echo [6] Verification du fichier .env...

if exist ".env.local" (
  findstr "GOOGLE_CLIENT_ID=" .env.local >nul && (
    echo [OK] .env.local existe et contient les variables
    set /a PASSED+=1
  ) || (
    echo [!] ATTENTION: .env.local existe mais manque des variables
    set /a WARNINGS+=1
  )
) else (
  echo [X] ERREUR: .env.local introuvable
  set /a ERRORS+=1
)

REM ========================================
REM RESUME
REM ========================================
echo.
echo ============================================
echo RESUME
echo ============================================
echo [OK] Passes: %PASSED%
echo [X] Errors: %ERRORS%
echo [!] Warnings: %WARNINGS%
echo.

if %ERRORS% equ 0 (
  if %WARNINGS% equ 0 (
    echo [SUCCESS] Aucun probleme trouve! Pret pour la production!
    exit /b 0
  ) else (
    echo [WARNING] %WARNINGS% attention(s) trouvees. Adressez-les avant la production.
    exit /b 1
  )
) else (
  echo [CRITICAL] %ERRORS% erreur(s) critique(s) trouvees!
  echo.
  echo Lisez ces documents pour les solutions:
  echo 1. AUDIT-SECURITE-COMPLETE.md
  echo 2. PLAN-CORRECTION-CODE.md
  echo 3. CHECKLIST-IMPLEMENTATION.md
  exit /b 2
)

endlocal
