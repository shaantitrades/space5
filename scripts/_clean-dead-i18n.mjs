/**
 * Supprime les cles de traduction devenues orphelines.
 *
 * Les cartes de la page d'accueil ont ete remplacees par des faits
 * verifiables. Les anciennes cles restaient dans les fichiers de traduction
 * (non affichees, mais toujours presentes dans le depot et donc dans toute
 * recherche de type "audit").
 *
 * Usage : node scripts/_clean-dead-i18n.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

/** Cles qui ne doivent plus exister : elles portent des affirmations inverifiables */
const DEAD_KEYS = [
  'IA-Powered',
  'Suggestions automatiques, amélioration qualité intelligente',
  'Sécurité Militaire',
  'Chiffrement, geo-blocking, protection fraude, RGPD',
  'Workflows',
  'Pipelines visuels automatisés pour conversions complexes',
  '100+ fichiers simultanément avec gestion de queue',
];

const LOCALES = ['en', 'fr', 'es', 'de', 'it', 'pt', 'hi', 'ru', 'sv', 'no'];

let totalRemoved = 0;

for (const locale of LOCALES) {
  const file = path.join('messages', `${locale}.json`);
  if (!fs.existsSync(file)) continue;

  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const features = json?.home?.features;

  if (!features || typeof features !== 'object') {
    console.log(`- ${locale}: pas de home.features`);
    continue;
  }

  let removed = 0;
  for (const key of DEAD_KEYS) {
    if (Object.prototype.hasOwnProperty.call(features, key)) {
      delete features[key];
      removed++;
    }
  }

  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  totalRemoved += removed;
  console.log(`- ${locale}: ${removed} cle(s) supprimee(s)`);
}

console.log(`\n${totalRemoved} cle(s) supprimee(s) au total.`);
