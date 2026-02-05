/**
 * Script pour créer la base de données "omniversa" dans AWS RDS
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function createDatabase() {
  // Se connecter à la base de données "postgres" (base par défaut)
  const adminClient = new Client({
    connectionString: process.env.DATABASE_URL.replace('/omniversa', '/postgres'),
    ssl: process.env.DATABASE_URL?.includes('rds.amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🔌 Connexion à AWS RDS...\n');
    await adminClient.connect();
    console.log('✅ Connecté à la base de données postgres\n');

    // Vérifier si la base existe déjà
    const checkResult = await adminClient.query(
      "SELECT datname FROM pg_database WHERE datname = 'omniversa'"
    );

    if (checkResult.rows.length > 0) {
      console.log('ℹ️  La base de données "omniversa" existe déjà.\n');
      await adminClient.end();
      process.exit(0);
    }

    // Créer la base de données
    console.log('📝 Création de la base de données "omniversa"...');
    await adminClient.query('CREATE DATABASE omniversa');
    console.log('✅ Base de données "omniversa" créée avec succès !\n');

    await adminClient.end();

    // Tester la connexion à la nouvelle base
    console.log('🧪 Test de la connexion à la base "omniversa"...\n');
    const testClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('rds.amazonaws.com') 
        ? { rejectUnauthorized: false } 
        : false,
    });

    await testClient.connect();
    const result = await testClient.query('SELECT current_database(), version()');
    console.log('✅ Connexion réussie !');
    console.log(`   Base de données: ${result.rows[0].current_database}`);
    console.log(`   Version: ${result.rows[0].version.split(',')[0]}\n`);

    await testClient.end();
    console.log('🎉 Tout est prêt ! Vous pouvez maintenant initialiser le schéma avec:');
    console.log('   npm run db:init\n');

  } catch (error) {
    console.error('\n❌ Erreur:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️  La base de données existe déjà.\n');
    } else if (error.message.includes('permission denied')) {
      console.log('💡 Vous n\'avez pas les permissions pour créer une base de données.');
      console.log('   Utilisez AWS RDS Query Editor à la place.\n');
    }
    
    await adminClient.end().catch(() => {});
    process.exit(1);
  }
}

createDatabase();
