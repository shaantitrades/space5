@echo off
REM Démarrage final OMNIVERSA - sans attendre
cd /d "e:\space 5"

echo.
echo ========================================
echo OMNIVERSA - DEV SERVER (FINAL)
echo ========================================
echo.

REM Vérifier node_modules existe
if not exist "node_modules" (
    echo Erreur: node_modules manquant!
    echo Exécutez: npm install
    exit /b 1
)

REM Installer les packages manquants si nécessaire
echo Vérification des packages critiques...
if not exist "node_modules\next" (
    echo Installation de Next.js...
    npm install next@14.2.0 --force
)

if not exist "node_modules\typescript" (
    echo Installation de TypeScript...
    npm install typescript
)

echo.
echo ✓ Lancement du serveur...
echo Accédez à: http://localhost:3000
echo.

npm run dev
