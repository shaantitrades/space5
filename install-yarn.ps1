# Installation de Yarn (alternative a npm)
# Yarn est souvent plus rapide et plus fiable que npm

Write-Host ""
Write-Host "Installation de Yarn..." -ForegroundColor Cyan
Write-Host ""

# Installer Yarn globalement
npm install -g yarn

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Yarn installe avec succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Maintenant utilisez:" -ForegroundColor Yellow
    Write-Host "  yarn install" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Erreur lors de l'installation de Yarn" -ForegroundColor Red
    Write-Host ""
}
