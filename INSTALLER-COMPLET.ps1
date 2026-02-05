# OMNIVERSA - Installation Complète TOUTES Fonctionnalités
# Exécutez ce script APRÈS un redémarrage du PC

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OMNIVERSA - Installation Complète" -ForegroundColor Cyan
Write-Host "  PDF + Images + Vidéo + Audio" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Arrêter les processus
Write-Host "[1/4] Arrêt des processus Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Étape 2: Naviguer vers le projet
Write-Host "[2/4] Navigation vers le projet..." -ForegroundColor Yellow
cd "E:\space 5"

# Étape 3: Nettoyer le cache Yarn
Write-Host "[3/4] Nettoyage du cache..." -ForegroundColor Yellow
yarn cache clean

# Étape 4: Installation complète
Write-Host "[4/4] Installation de TOUTES les dépendances..." -ForegroundColor Yellow
Write-Host "      Ceci prendra 5-10 minutes" -ForegroundColor Gray
Write-Host ""

Write-Host "  > Installation des dépendances de base..." -ForegroundColor Cyan
yarn install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   ERREUR lors de l'installation de base" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "  > Installation des modules PDF..." -ForegroundColor Cyan
yarn add pdfjs-dist tesseract.js pdf-parse mammoth docx xlsx jszip

Write-Host ""
Write-Host "  > Installation des modules FFmpeg..." -ForegroundColor Cyan
yarn add fluent-ffmpeg @ffmpeg-installer/ffmpeg
yarn add -D @types/fluent-ffmpeg

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   SUCCÈS - Installation terminée !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Modules installés:" -ForegroundColor Cyan
    Write-Host "  ✓ PDF & Documents (pdf-lib, tesseract.js, mammoth, docx, xlsx)" -ForegroundColor Green
    Write-Host "  ✓ Images (sharp - déjà installé)" -ForegroundColor Green
    Write-Host "  ✓ Vidéo & Audio (fluent-ffmpeg)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pages disponibles:" -ForegroundColor Cyan
    Write-Host "  • /pdf - Outils PDF" -ForegroundColor White
    Write-Host "  • /images - Outils Images" -ForegroundColor White
    Write-Host "  • /media - Outils Vidéo & Audio" -ForegroundColor White
    Write-Host ""
    Write-Host "Lancez maintenant le serveur avec:" -ForegroundColor Cyan
    Write-Host "  yarn dev" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   ERREUR lors de l'installation" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Si l'erreur persiste:" -ForegroundColor Yellow
    Write-Host "1. Redémarrez votre PC" -ForegroundColor White
    Write-Host "2. Relancez ce script" -ForegroundColor White
    Write-Host ""
}

Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
