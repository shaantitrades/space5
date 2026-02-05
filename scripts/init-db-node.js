/**
 * Script d'initialisation du schéma de base de données avec Node.js
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('rds.amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🔌 Connexion à la base de données...\n');
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Exécution du script d\'initialisation...\n');

    // Exécuter le script SQL
    await client.query(sql);

    console.log('✅ Schéma initialisé avec succès !\n');

    // Vérifier les tables créées
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📊 Tables créées:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    console.log('\n🎉 Initialisation terminée !\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Certains objets existent déjà. C\'est normal si vous réexécutez le script.\n');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

initSchema();
