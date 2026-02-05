/**
 * Script de test de connexion à AWS RDS PostgreSQL
 */

require('dotenv').config({ path: '.env.local' });

const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('rds.amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🔌 Tentative de connexion à AWS RDS...\n');
    
    await client.connect();
    console.log('✅ Connexion réussie !\n');

    // Tester une requête simple
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('📊 Informations de la base de données:');
    console.log(`   Version: ${result.rows[0].version.split(',')[0]}`);
    console.log(`   Base de données: ${result.rows[0].current_database}`);
    console.log(`   Utilisateur: ${result.rows[0].current_user}\n`);

    // Vérifier si la base omniversa existe
    const dbCheck = await client.query(
      "SELECT datname FROM pg_database WHERE datname = 'omniversa'"
    );
    
    if (dbCheck.rows.length === 0) {
      console.log('⚠️  La base de données "omniversa" n\'existe pas encore.');
      console.log('💡 Créez-la avec: CREATE DATABASE omniversa;\n');
    } else {
      console.log('✅ La base de données "omniversa" existe.\n');
    }

    await client.end();
    console.log('✅ Test terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur de connexion:\n');
    console.error(`   Message: ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solutions possibles:');
      console.log('   1. Vérifiez que la base de données est accessible publiquement');
      console.log('   2. Vérifiez le Security Group dans AWS (port 5432)');
      console.log('   3. Utilisez un tunnel SSH si la DB est dans un VPC privé');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Vérifiez que l\'endpoint RDS est correct dans DATABASE_URL');
    } else if (error.message.includes('password authentication failed')) {
      console.log('💡 Vérifiez le nom d\'utilisateur et le mot de passe');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('💡 La base de données spécifiée n\'existe pas');
      console.log('   Créez-la avec: CREATE DATABASE omniversa;');
    }
    
    await client.end().catch(() => {});
    process.exit(1);
  }
}

testConnection();
