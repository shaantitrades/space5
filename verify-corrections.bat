@echo off
REM Script de vérification post-correction - OMNIVERSA

echo ================================================== 
echo VERIFICATION POST-CORRECTION
echo ==================================================
echo.

setlocal enabledelayedexpansion

set PASSED=0
set FAILED=0

REM ========== 1. Vérifier env-validation.ts ==========
echo [1] Verifier src/lib/env-validation.ts...

if exist "src\lib\env-validation.ts" (
  findstr /M "getEnv" src\lib\env-validation.ts >nul && (
    echo [OK] env-validation.ts cree correctement
    set /a PASSED+=1
  ) || (
    echo [X] env-validation.ts incomplet
    set /a FAILED+=1
  )
) else (
  echo [X] src/lib/env-validation.ts MANQUANT
  set /a FAILED+=1
)

REM ========== 2. Vérifier auth.ts ==========
echo [2] Verifier modifications src/lib/auth.ts...

findstr "import.*env.*from" src\lib\auth.ts >nul && (
  echo [OK] env importe dans auth.ts
  set /a PASSED+=1
) || (
  echo [X] env pas importe
  set /a FAILED+=1
)

findstr "as any" src\lib\auth.ts >nul && (
  echo [X] Encore des 'as any' dans auth.ts
  set /a FAILED+=1
) || (
  echo [OK] Pas de 'as any'
  set /a PASSED+=1
)

REM ========== 3. Vérifier email.ts ==========
echo [3] Verifier src/lib/email.ts...

if exist "src\lib\email.ts" (
  findstr /M "sendVerificationEmail" src\lib\email.ts >nul && (
    echo [OK] email.ts cree avec sendVerificationEmail
    set /a PASSED+=1
  ) || (
    echo [X] sendVerificationEmail manquant
    set /a FAILED+=1
  )
) else (
  echo [X] src/lib/email.ts MANQUANT
  set /a FAILED+=1
)

REM ========== 4. Vérifier auth types ==========
echo [4] Verifier src/lib/types/auth.ts...

if exist "src\lib\types\auth.ts" (
  findstr /M "CustomJWT" src\lib\types\auth.ts >nul && (
    echo [OK] Types stricts crees
    set /a PASSED+=1
  ) || (
    echo [X] CustomJWT manquant
    set /a FAILED+=1
  )
) else (
  echo [X] src/lib/types/auth.ts MANQUANT
  set /a FAILED+=1
)

REM ========== 5. Vérifier signup modifications ==========
echo [5] Verifier modifications signup route...

findstr "sendVerificationEmail" src\app\api\auth\signup\route.ts >nul && (
  echo [OK] Email verification ajoutee
  set /a PASSED+=1
) || (
  echo [X] sendVerificationEmail manquant
  set /a FAILED+=1
)

findstr "signupSchema.parse" src\app\api\auth\signup\route.ts >nul && (
  echo [OK] Validation Zod ajoutee
  set /a PASSED+=1
) || (
  echo [X] Zod validation manquante
  set /a FAILED+=1
)

REM ========== 6. Vérifier verify route ==========
echo [6] Verifier route /api/auth/verify...

if exist "src\app\api\auth\verify\route.ts" (
  echo [OK] Route de verification creee
  set /a PASSED+=1
) else (
  echo [X] Route /api/auth/verify MANQUANTE
  set /a FAILED+=1
)

REM ========== 7. Vérifier docker-compose ==========
echo [7] Verifier docker-compose.yml...

findstr "DATABASE_URL=${DATABASE_URL}" docker-compose.yml >nul && (
  echo [OK] Secrets securises
  set /a PASSED+=1
) || (
  echo [X] Secrets hardcodes
  set /a FAILED+=1
)

REM ========== 8. Vérifier rate-limiter ==========
echo [8] Verifier src/lib/rate-limiter.ts...

if exist "src\lib\rate-limiter.ts" (
  findstr /M "rateLimit" src\lib\rate-limiter.ts >nul && (
    echo [OK] Rate limiter cree
    set /a PASSED+=1
  ) || (
    echo [X] Rate limiter vide
    set /a FAILED+=1
  )
) else (
  echo [X] src/lib/rate-limiter.ts MANQUANT
  set /a FAILED+=1
)

REM ========== RÉSUMÉ ==========
echo.
echo ==================================================
echo RESUME
echo ==================================================
echo [OK] PASSED: %PASSED%
echo [X] FAILED: %FAILED%
echo.

if %FAILED% equ 0 (
  echo [SUCCESS] Tous les changements ont ete appliques!
  echo.
  echo Maintenant executez:
  echo   npm run type-check   (verifier les types)
  echo   npm run build        (compiler)
  echo   npm run dev          (tester localement)
  exit /b 0
) else (
  echo [FAILED] %FAILED% changement(s) manquant(s)!
  exit /b 1
)

endlocal
