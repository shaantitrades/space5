/**
 * Script de démarrage alternatif pour éviter les problèmes Turbopack
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de Multi Convert...\n');

// Désactiver Turbopack avec variable d'environnement
process.env.NEXT_DISABLE_TURBO = '1';

// Lancer Next.js
const nextProcess = spawn('npx', ['next', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NEXT_DISABLE_TURBO: '1',
  },
});

nextProcess.on('error', (error) => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  process.exit(code || 0);
});
