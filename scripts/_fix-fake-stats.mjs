/**
 * Remplace les statistiques invérifiables du hero par des faits vérifiables.
 *
 * Avant : "2M+ fichiers convertis", "4.9/5", "Certifié GDPR"
 *         -> aucune de ces trois affirmations n'est mesurable ni démontrable.
 * Après : "Aucune installation", "10 langues", "HTTPS"
 *         -> vérifiables dans le produit lui-même.
 *
 * Le fichier français n'a pas de section `home` : les textes de repli
 * codés dans hero-fixed.tsx (en français) s'appliquent. Les 9 autres
 * langues ont leur propre traduction.
 *
 * Usage : node scripts/_fix-fake-stats.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const TRANSLATIONS = {
  en: {
    noInstall: '🖥️ No installation required',
    languages: '🌍 Available in 10 languages',
    https: '🔒 Encrypted connection (HTTPS)',
  },
  fr: {
    noInstall: '🖥️ Aucune installation',
    languages: '🌍 Disponible en 10 langues',
    https: '🔒 Connexion chiffrée (HTTPS)',
  },
  es: {
    noInstall: '🖥️ Sin instalación',
    languages: '🌍 Disponible en 10 idiomas',
    https: '🔒 Conexión cifrada (HTTPS)',
  },
  de: {
    noInstall: '🖥️ Keine Installation nötig',
    languages: '🌍 In 10 Sprachen verfügbar',
    https: '🔒 Verschlüsselte Verbindung (HTTPS)',
  },
  it: {
    noInstall: '🖥️ Nessuna installazione',
    languages: '🌍 Disponibile in 10 lingue',
    https: '🔒 Connessione cifrata (HTTPS)',
  },
  pt: {
    noInstall: '🖥️ Sem instalação',
    languages: '🌍 Disponível em 10 idiomas',
    https: '🔒 Ligação encriptada (HTTPS)',
  },
  hi: {
    noInstall: '🖥️ इंस्टॉल की ज़रूरत नहीं',
    languages: '🌍 10 भाषाओं में उपलब्ध',
    https: '🔒 एन्क्रिप्टेड कनेक्शन (HTTPS)',
  },
  ru: {
    noInstall: '🖥️ Без установки',
    languages: '🌍 Доступно на 10 языках',
    https: '🔒 Шифрованное соединение (HTTPS)',
  },
  sv: {
    noInstall: '🖥️ Ingen installation',
    languages: '🌍 Tillgängligt på 10 språk',
    https: '🔒 Krypterad anslutning (HTTPS)',
  },
  no: {
    noInstall: '🖥️ Ingen installasjon',
    languages: '🌍 Tilgjengelig på 10 språk',
    https: '🔒 Kryptert tilkobling (HTTPS)',
  },
};

let modified = 0;
let skipped = 0;

for (const [locale, values] of Object.entries(TRANSLATIONS)) {
  const file = path.join('messages', `${locale}.json`);
  if (!fs.existsSync(file)) {
    console.warn(`- ${locale}: fichier absent`);
    continue;
  }

  const raw = fs.readFileSync(file, 'utf8');
  // Bloc `"stats": { ... }` : aucune accolade imbriquee, le motif est sur.
  const pattern = /"stats":\s*\{[^}]*\}/;

  if (!pattern.test(raw)) {
    skipped++;
    console.log(`- ${locale}: pas de section home.stats (ignore)`);
    continue;
  }

  const indent = '      ';
  const replacement =
    `"stats": {\n` +
    `${indent}  "noInstall": ${JSON.stringify(values.noInstall)},\n` +
    `${indent}  "languages": ${JSON.stringify(values.languages)},\n` +
    `${indent}  "https": ${JSON.stringify(values.https)}\n` +
    `${indent}}`;

  const next = raw.replace(pattern, replacement);

  // Verification : le fichier reste un JSON valide
  try {
    JSON.parse(next);
  } catch (error) {
    console.error(`- ${locale}: JSON invalide apres modification, fichier ignore`);
    continue;
  }

  fs.writeFileSync(file, next, 'utf8');
  modified++;
  console.log(`- ${locale}: statistiques remplacees`);
}

console.log(`\n${modified} fichier(s) modifie(s), ${skipped} ignore(s).`);
