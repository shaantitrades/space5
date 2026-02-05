@echo off
REM Vérification complète de toutes les corrections
REM Omniversa Security Audit - All Fixes Validation

echo.
echo ========================================
echo OMNIVERSA - SECURITY FIXES VERIFICATION
echo ========================================
echo.

setlocal enabledelayedexpansion
set "passed=0"
set "failed=0"

REM 1. Vérifier env-validation.ts existe
if exist "src\lib\env-validation.ts" (
    echo [OK] env-validation.ts existe
    set /a "passed+=1"
) else (
    echo [X] env-validation.ts MANQUANT
    set /a "failed+=1"
)

REM 2. Vérifier auth-utils.ts existe
if exist "src\lib\auth-utils.ts" (
    echo [OK] auth-utils.ts existe
    set /a "passed+=1"
) else (
    echo [X] auth-utils.ts MANQUANT
    set /a "failed+=1"
)

REM 3. Vérifier email.ts existe
if exist "src\lib\email.ts" (
    echo [OK] email.ts existe
    set /a "passed+=1"
) else (
    echo [X] email.ts MANQUANT
    set /a "failed+=1"
)

REM 4. Vérifier /api/auth/verify existe
if exist "src\app\api\auth\verify\route.ts" (
    echo [OK] /api/auth/verify route existe
    set /a "passed+=1"
) else (
    echo [X] /api/auth/verify route MANQUANTE
    set /a "failed+=1"
)

REM 5. Vérifier rate-limiter.ts existe
if exist "src\lib\rate-limiter.ts" (
    echo [OK] rate-limiter.ts existe
    set /a "passed+=1"
) else (
    echo [X] rate-limiter.ts MANQUANT
    set /a "failed+=1"
)

REM 6. Vérifier .env.example existe
if exist ".env.example" (
    echo [OK] .env.example existe
    set /a "passed+=1"
) else (
    echo [X] .env.example MANQUANT
    set /a "failed+=1"
)

REM 7. Vérifier node_modules existe (npm install)
if exist "node_modules" (
    echo [OK] node_modules existe (npm install complete)
    set /a "passed+=1"
) else (
    echo [WARN] node_modules n'existe pas encore - npm install en cours
    set /a "failed+=1"
)

REM 8. Vérifier nodemailer dans package.json
findstr /M "nodemailer" package.json >nul
if !errorlevel! equ 0 (
    echo [OK] nodemailer ajoutee a package.json
    set /a "passed+=1"
) else (
    echo [X] nodemailer NOT in package.json
    set /a "failed+=1"
)

echo.
echo ========================================
echo VERIFICATION SUMMARY
echo ========================================
echo [OK] PASSED: %passed%
echo [X] FAILED: %failed%
echo ========================================

if %failed% gtr 0 (
    exit /b 1
) else (
    exit /b 0
)
