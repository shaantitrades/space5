/**
 * Script de test de connexion simplifié (sans pg)
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');

console.log('🔍 Vérification de la configuration DATABASE_URL...\n');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL non trouvée dans .env.local');
  process.exit(1);
}

// Parser l'URL
try {
  const url = new URL(databaseUrl.replace('postgresql://', 'https://'));
  console.log('📋 Configuration détectée:');
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Port: ${url.port || '5432'}`);
  console.log(`   Database: ${url.pathname.replace('/', '')}`);
  console.log(`   User: ${url.username}`);
  console.log(`   Password: ${url.password ? '***' : 'non défini'}\n`);
  
  // Vérifier le format
  if (databaseUrl.includes('database-1.cabkaqe8y6p4.us-east-1.rds.amazonaws.com')) {
    console.log('✅ Format de l\'URL correct (AWS RDS détecté)');
  } else {
    console.log('⚠️  URL ne semble pas pointer vers AWS RDS');
  }
  
  console.log('\n💡 Pour tester la connexion réelle, installez pg:');
  console.log('   npm install pg @types/pg');
  console.log('\n💡 Ou testez avec psql:');
  console.log(`   psql "${databaseUrl}"`);
  
} catch (error) {
  console.error('❌ Erreur de parsing de DATABASE_URL:', error.message);
  console.log('\nFormat attendu:');
  console.log('postgresql://username:password@host:port/database');
  process.exit(1);
}
