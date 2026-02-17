// Diagnostic Next.js simple
const fs = require('fs');
const path = require('path');

console.log('=== DIAGNOSTIC NEXT.JS ===\n');

const appDirResolution = [
  './app',
  './src/app',
  path.join(__dirname, 'app'),
  path.join(__dirname, 'src', 'app'),
];

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
console.log('\nVérification des répertoires app:');

appDirResolution.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`  ${dir}: ${exists ? '✓ EXISTS' : '✗ NOT FOUND'}`);
  if (exists) {
    try {
      const files = fs.readdirSync(dir);
      console.log(`    Files: ${files.join(', ')}`);
    } catch (e) {
      console.log(`    Error reading: ${e.message}`);
    }
  }
});

console.log('\nVérification next.config.js:');
try {
  const nextConfig = require('./next.config.js');
  console.log('  ✓ next.config.js chargé');
} catch (e) {
  console.log(`  ✗ Erreur: ${e.message}`);
}

console.log('\nVérification i18n.ts:');
try {
  const i18nExists = fs.existsSync('./i18n.ts');
  console.log(`  ${i18nExists ? '✓ EXISTS' : '✗ NOT FOUND'}`);
} catch (e) {
  console.log(`  ✗ Erreur: ${e.message}`);
}

console.log('\n=== FIN ===');
