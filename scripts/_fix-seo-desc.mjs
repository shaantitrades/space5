/**
 * Corrige les descriptions d’outils SEO : « fonctionne dans votre navigateur »
 * pouvait laisser croire à un traitement 100 % local, ce qui est inexact.
 *
 * Usage : node scripts/_fix-seo-desc.mjs
 */
import fs from 'node:fs';

const FILE = 'src/config/seo.ts';
let src = fs.readFileSync(FILE, 'utf8');

const PAIRS = [
  [
    'Runs in your browser, supports batch processing, and your files are deleted right after processing.',
    'Online tool with batch processing. Your files are deleted right after processing.',
  ],
  [
    'Fonctionne dans votre navigateur, gère le traitement par lot, et vos fichiers sont supprimés juste après l’opération.',
    'Outil en ligne avec traitement par lot. Vos fichiers sont supprimés juste après l’opération.',
  ],
  [
    'Funciona en tu navegador, admite procesamiento por lotes y tus archivos se eliminan justo después de la operación.',
    'Herramienta en línea con procesamiento por lotes. Tus archivos se eliminan justo después de la operación.',
  ],
  [
    'Läuft im Browser, unterstützt Stapelverarbeitung, und Ihre Dateien werden direkt nach der Verarbeitung gelöscht.',
    'Online-Tool mit Stapelverarbeitung. Ihre Dateien werden direkt nach der Verarbeitung gelöscht.',
  ],
  [
    'Funziona nel browser, supporta l’elaborazione in batch e i tuoi file vengono eliminati subito dopo l’operazione.',
    'Strumento online con elaborazione in batch. I tuoi file vengono eliminati subito dopo l’operazione.',
  ],
  [
    'Funciona no navegador, suporta processamento em lote e os seus ficheiros são eliminados logo após a operação.',
    'Ferramenta online com processamento em lote. Os seus ficheiros são eliminados logo após a operação.',
  ],
  [
    'यह ब्राउज़र में चलता है, बैच प्रोसेसिंग का समर्थन करता है, और प्रोसेसिंग के तुरंत बाद आपकी फ़ाइलें हटा दी जाती हैं।',
    'ऑनलाइन टूल, बैच प्रोसेसिंग के साथ। प्रोसेसिंग के तुरंत बाद आपकी फ़ाइलें हटा दी जाती हैं।',
  ],
  [
    'Работает в браузере, поддерживает пакетную обработку, а ваши файлы удаляются сразу после операции.',
    'Онлайн-инструмент с пакетной обработкой. Ваши файлы удаляются сразу после операции.',
  ],
  [
    'Körs i webbläsaren, stöder batchbearbetning och dina filer raderas direkt efter åtgärden.',
    'Onlineverktyg med batchbearbetning. Dina filer raderas direkt efter åtgärden.',
  ],
  [
    'Kjører i nettleseren, støtter batchbehandling, og filene dine slettes rett etter operasjonen.',
    'Nettverktøy med batchbehandling. Filene dine slettes rett etter operasjonen.',
  ],
];

let failures = 0;

for (const [from, to] of PAIRS) {
  const count = src.split(from).length - 1;
  if (count !== 1) {
    failures++;
    console.error(`❌ ${count} occurrence(s) pour : ${from.slice(0, 60)}…`);
    continue;
  }
  src = src.replace(from, to);
  console.log(`✅ ${to.slice(0, 70)}…`);
}

if (failures > 0) {
  console.error(`\n❌ ${failures} remplacement(s) en échec — fichier NON écrit.`);
  process.exit(1);
}

// Garde-fou : plus aucune mention trompeuse de traitement local
const banned = ['Runs in your browser', 'dans votre navigateur', 'en tu navegador', 'im Browser'];
const leaks = src
  .split(/\r?\n/)
  .map((line, index) => ({ line, index: index + 1 }))
  .filter(({ line }) => banned.some((term) => line.includes(term)));

if (leaks.length > 0) {
  console.error('\n❌ Mentions trompeuses restantes — fichier NON écrit :');
  leaks.forEach(({ index, line }) => console.error(`  ligne ${index}: ${line.trim().slice(0, 100)}`));
  process.exit(1);
}

fs.writeFileSync(FILE, src, 'utf8');
console.log('\n✅ Descriptions SEO corrigées (10 langues).');
