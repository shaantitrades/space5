@echo off
REM Wait for npm install to complete and then run type-check
echo.
echo ========================================
echo OMNIVERSA - INSTALLATION & TYPE-CHECK
echo ========================================
echo.

cd /d "e:\space 5"

echo Attendant npm install...
:wait_loop
if exist "node_modules\typescript\lib\tsc.js" (
    goto install_done
)
timeout /t 5 /nobreak
goto wait_loop

:install_done
echo.
echo ✓ npm install termine!
echo.
echo Verifying TypeScript...
node node_modules\typescript\bin\tsc --version
if errorlevel 1 (
    echo ✗ TypeScript verification failed
    exit /b 1
)

echo.
echo ✓ TypeScript OK!
echo.
echo Running type-check...
npm run type-check
if errorlevel 1 (
    echo ✗ Type-check failed
    exit /b 1
)

echo.
echo ========================================
echo ✓ ALL CHECKS PASSED!
echo ========================================
echo.
echo Next steps:
echo  - npm run build   (production build)
echo  - npm run dev     (development server)
echo.

exit /b 0
