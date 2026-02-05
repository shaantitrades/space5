# Script pour mettre à jour la configuration RDS dans .env.local

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "omniversa",
    
    [Parameter(Mandatory=$false)]
    [string]$Endpoint = "database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com",
    
    [Parameter(Mandatory=$false)]
    [string]$Port = "5432"
)

Write-Host "🔧 Mise à jour de la configuration RDS..." -ForegroundColor Cyan

# Construire la DATABASE_URL
$databaseUrl = "postgresql://${Username}:${Password}@${Endpoint}:${Port}/${DatabaseName}"

# Lire le fichier .env.local
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Fichier .env.local non trouvé" -ForegroundColor Red
    exit 1
}

# Lire le contenu
$content = Get-Content $envFile -Raw

# Remplacer ou ajouter DATABASE_URL
if ($content -match "DATABASE_URL=") {
    $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=`"$databaseUrl`""
    Write-Host "✅ DATABASE_URL mise à jour" -ForegroundColor Green
} else {
    $content = "DATABASE_URL=`"$databaseUrl`"`n" + $content
    Write-Host "✅ DATABASE_URL ajoutée" -ForegroundColor Green
}

# Écrire le fichier
$content | Set-Content $envFile -NoNewline

Write-Host ""
Write-Host "✅ Configuration mise à jour !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 DATABASE_URL configurée:" -ForegroundColor Yellow
Write-Host "   $databaseUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Rappel:" -ForegroundColor Yellow
Write-Host "  - Assurez-vous que la base de données est accessible publiquement OU"
Write-Host "  - Utilisez un tunnel SSH pour vous connecter"
Write-Host ""
Write-Host "💡 Pour tester la connexion:" -ForegroundColor Cyan
Write-Host "   npm run setup"
Write-Host ""
