@echo off
REM Démarrage sécurisé du serveur dev OMNIVERSA
REM Attend que node_modules soit complet, puis lance le dev server

setlocal enabledelayedexpansion

cd /d "e:\space 5"

echo.
echo ========================================
echo OMNIVERSA - DEV SERVER
echo ========================================
echo.

REM Attendre que node_modules\next soit complet
echo Vérification de l'installation...
:check_next
if exist "node_modules\next\dist\bin\next.js" (
    goto next_ready
)
echo. Attente de Next.js...
timeout /t 3 /nobreak > nul
goto check_next

:next_ready
echo.
echo ✓ Installation complète détectée!
echo.
echo Démarrage du serveur de développement...
echo.
echo Accédez à: http://localhost:3000
echo.
echo Appuyez sur CTRL+C pour arrêter le serveur
echo.

npm run dev

exit /b 0
