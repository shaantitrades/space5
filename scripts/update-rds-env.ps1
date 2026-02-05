# Script pour mettre à jour DATABASE_URL avec les informations AWS RDS

param(
    [Parameter(Mandatory=$false)]
    [string]$Username = "postgres",
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "omniversa",
    
    [Parameter(Mandatory=$false)]
    [string]$Endpoint = "database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com",
    
    [Parameter(Mandatory=$false)]
    [string]$Port = "5432"
)

Write-Host "🔧 Mise à jour de DATABASE_URL pour AWS RDS..." -ForegroundColor Cyan

# Construire la DATABASE_URL
$databaseUrl = "postgresql://${Username}:${Password}@${Endpoint}:${Port}/${DatabaseName}"

# Vérifier si .env.local existe
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Fichier .env.local non trouvé" -ForegroundColor Red
    exit 1
}

# Lire le contenu
$content = Get-Content $envFile -Raw

# Remplacer DATABASE_URL
if ($content -match "DATABASE_URL=") {
    $content = $content -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$databaseUrl`""
    Write-Host "✅ DATABASE_URL mise à jour" -ForegroundColor Green
} else {
    # Ajouter DATABASE_URL si elle n'existe pas
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
Write-Host "💡 Pour tester la connexion:" -ForegroundColor Cyan
Write-Host "   npm run db:test"
Write-Host ""
