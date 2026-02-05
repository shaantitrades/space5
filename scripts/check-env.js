/**
 * Script de vérification des variables d'environnement
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration OMNIVERSA...\n');

const requiredVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'NEXT_PUBLIC_APP_URL',
];

const optionalVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'UPLOADTHING_SECRET',
  'UPLOADTHING_APP_ID',
  'ENCRYPTION_KEY',
  'JWT_SECRET',
];

// Charger .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  });
} else {
  console.log('❌ Fichier .env.local non trouvé\n');
  console.log('💡 Créez-le avec: cp .env.example .env.local\n');
  process.exit(1);
}

// Vérifier les variables requises
console.log('📋 Variables requises:');
let allRequiredPresent = true;
requiredVars.forEach((varName) => {
  if (envVars[varName] && envVars[varName] !== '') {
    console.log(`  ✅ ${varName}`);
  } else {
    console.log(`  ❌ ${varName} - MANQUANTE`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 Variables optionnelles:');
optionalVars.forEach((varName) => {
  if (envVars[varName] && envVars[varName] !== '' && !envVars[varName].includes('...')) {
    console.log(`  ✅ ${varName}`);
  } else {
    console.log(`  ⚠️  ${varName} - Non configurée`);
  }
});

// Vérifications spéciales
console.log('\n🔐 Vérifications de sécurité:');
if (envVars.ENCRYPTION_KEY && envVars.ENCRYPTION_KEY.length < 32) {
  console.log('  ⚠️  ENCRYPTION_KEY devrait faire au moins 32 caractères');
}
if (envVars.ENCRYPTION_KEY === 'change-this-to-a-32-char-key-in-production') {
  console.log('  ⚠️  ENCRYPTION_KEY utilise la valeur par défaut - CHANGEZ-LA !');
}
if (envVars.JWT_SECRET === 'change-this-to-a-secure-jwt-secret-in-production') {
  console.log('  ⚠️  JWT_SECRET utilise la valeur par défaut - CHANGEZ-LA !');
}

console.log('\n📊 Résumé:');
if (allRequiredPresent) {
  console.log('✅ Toutes les variables requises sont présentes');
  console.log('💡 Vous pouvez lancer: npm run dev\n');
} else {
  console.log('❌ Certaines variables requises sont manquantes');
  console.log('💡 Éditez .env.local pour les ajouter\n');
  process.exit(1);
}
