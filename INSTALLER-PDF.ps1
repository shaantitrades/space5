# OMNIVERSA - Installation des dépendances PDF
# Exécutez ce script APRÈS un redémarrage du PC

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OMNIVERSA - Installation PDF Tools" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Arrêter les processus
Write-Host "[1/3] Arret des processus Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Étape 2: Naviguer vers le projet
Write-Host "[2/3] Navigation vers le projet..." -ForegroundColor Yellow
cd "E:\space 5"

# Étape 3: Installation avec Yarn
Write-Host "[3/3] Installation des dependances PDF..." -ForegroundColor Yellow
Write-Host "      Ceci devrait prendre 2-3 minutes" -ForegroundColor Gray
Write-Host ""

yarn add pdfjs-dist tesseract.js pdf-parse mammoth docx xlsx jszip

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   SUCCES - Installation terminee !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
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
    Write-Host "1. Redemarrez votre PC" -ForegroundColor White
    Write-Host "2. Relancez ce script" -ForegroundColor White
    Write-Host ""
}

Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
