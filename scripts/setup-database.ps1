# Script de configuration de la base de données OMNIVERSA

Write-Host "`n🗄️  CONFIGURATION DE LA BASE DE DONNÉES OMNIVERSA`n" -ForegroundColor Cyan

# Étape 1: Installer Prisma
Write-Host "📦 Installation de Prisma..." -ForegroundColor Yellow
npm install @prisma/client prisma --save

# Étape 2: Générer le client Prisma
Write-Host "`n🔧 Génération du client Prisma..." -ForegroundColor Yellow
npx prisma generate

# Étape 3: Pousser le schéma vers la base de données
Write-Host "`n🚀 Création des tables dans la base de données..." -ForegroundColor Yellow
Write-Host "⚠️  Cela va créer toutes les tables dans votre base PostgreSQL AWS RDS" -ForegroundColor Magenta
$confirm = Read-Host "Voulez-vous continuer? (o/n)"

if ($confirm -eq "o" -or $confirm -eq "O") {
    npx prisma db push
    
    Write-Host "`n✅ Base de données configurée avec succès!" -ForegroundColor Green
    Write-Host "`n📊 Vous pouvez maintenant:" -ForegroundColor Cyan
    Write-Host "  1. Visualiser la base: npm run db:studio" -ForegroundColor Gray
    Write-Host "  2. Créer une migration: npm run db:migrate" -ForegroundColor Gray
    Write-Host "  3. Démarrer le serveur: npm run dev`n" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Configuration annulée" -ForegroundColor Red
}
