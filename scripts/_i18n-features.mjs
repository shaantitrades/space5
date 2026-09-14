/**
 * Ajoute les traductions des nouvelles cartes "Fonctionnalites Phares".
 *
 * Les cartes inverifiables (IA-Powered, Securite Militaire, Workflows) ont ete
 * remplacees par des faits verifiables. Les intitules servant de cles i18n,
 * il faut fournir leur traduction, sinon les 9 autres langues afficheraient
 * du francais.
 *
 * Les cles sont inserees a la suite de la derniere entree de `home.features`
 * (remplacement cible), donc le reste du fichier reste intact.
 *
 * Usage : node scripts/_i18n-features.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

/** Derniere cle de home.features, identique dans toutes les langues */
const ANCHOR = '"100+ fichiers simultanément avec gestion de queue"';

const TRANSLATIONS = {
  en: {
    'Traitement immédiat': 'Instant processing',
    'Fichiers non conservés': 'Files are not retained',
    'Une cinquantaine d’outils': 'Around fifty tools',
    'La conversion démarre dès l’import, sans installation ni compte obligatoire':
      'Conversion starts as soon as the file is dropped — no installation, no account needed',
    'Traitement à la demande, aucune base documentaire, aucune revente de données':
      'Processed on demand: no document database, no data resold',
    'Interface et outils traduits dans 10 langues': 'Interface and tools translated into 10 languages',
    'PDF, images, vidéo, audio, archives et QR code réunis sur une seule plateforme':
      'PDF, images, video, audio, archives and QR codes on one platform',
    'Plusieurs fichiers traités en une seule fois': 'Several files processed in a single run',
  },
  es: {
    'Traitement immédiat': 'Procesamiento inmediato',
    'Fichiers non conservés': 'Archivos no conservados',
    'Une cinquantaine d’outils': 'Cerca de cincuenta herramientas',
    'La conversion démarre dès l’import, sans installation ni compte obligatoire':
      'La conversión empieza al soltar el archivo: sin instalación ni cuenta',
    'Traitement à la demande, aucune base documentaire, aucune revente de données':
      'Tratamiento bajo demanda: sin base documental y sin reventa de datos',
    'Interface et outils traduits dans 10 langues': 'Interfaz y herramientas traducidas a 10 idiomas',
    'PDF, images, vidéo, audio, archives et QR code réunis sur une seule plateforme':
      'PDF, imágenes, vídeo, audio, archivos y códigos QR en una sola plataforma',
    'Plusieurs fichiers traités en une seule fois': 'Varios archivos procesados de una vez',
  },
  de: {
    'Traitement immédiat': 'Sofortige Verarbeitung',
    'Fichiers non conservés': 'Dateien werden nicht gespeichert',
    'Une cinquantaine d’outils': 'Rund fünfzig Werkzeuge',
    'La conversion démarre dès l’import, sans installation ni compte obligatoire':
      'Die Konvertierung startet sofort — keine Installation, kein Konto nötig',
    'Traitement à la demande, aucune base documentaire, aucune revente de données':
      'Verarbeitung auf Anfrage: keine Dokumentdatenbank, kein Datenverkauf',
    'Interface et outils traduits dans 10 langues': 'Oberfläche und Werkzeuge in 10 Sprachen',
    'PDF, images, vidéo, audio, archives et QR code réunis sur une seule plateforme':
      'PDF, Bilder, Video, Audio, Archive und QR-Codes auf einer Plattform',
    'Plusieurs fichiers traités en une seule fois': 'Mehrere Dateien in einem Durchgang',
  },
  it: {
    'Traitement immédiat': 'Elaborazione immediata',
    'Fichiers non conservés': 'File non conservati',
    'Une cinquantaine d’outils': 'Circa cinquanta strumenti',
    'La conversion démarre dès l’import, sans installation ni compte obligatoire':
      'La conversione parte subito: nessuna installazione né account',
    'Traitement à la demande, aucune base documentaire, aucune revente de données':
      'Elaborazione su richiesta: nessun archivio documentale, nessuna rivendita di dati',
    'Interface et outils traduits dans 10 langues': 'Interfaccia e strumenti tradotti in 10 lingue',
    'PDF, images, vidéo, audio, archives et QR code réunis sur une seule plateforme':
      'PDF, immagini, video, audio, archivi e codici QR su un’unica piattaforma',
    'Plusieurs fichiers traités en une seule fois': 'Più file elaborati in una sola volta',
  },
  pt: {
    'Traitement immédiat': 'Processamento imediato',
    'Fichiers non conservés': 'Ficheiros não conservados',
    'Une cinquantaine d’outils': 'Cerca de cinquenta ferramentas',
    'La conversion démarre dès l’import, sans installation ni compte obligatoire':
      'A conversão começa logo após o envio: sem instalação nem conta',
    'Traitement à la demande, aucune base documentaire, aucune revente de données':
      'Processamento a pedido: sem base documental nem revenda de dados',
    'Interface et outils traduits dans 10 langues': 'Interface e ferramentas traduzidas em 10 idiomas',
    'PDF, images, vidéo, audio, archives et QR code réunis sur une seule plateforme':
      'PDF, imagens, vídeo, áudio, arquivos e códigos QR numa só plataforma',
    'Plusieurs fichiers traités en une seule fois': 'Vários ficheiros processados de uma só vez',
  },
  hi: {
    'Traitement immédiat': 'तुरंत प्रोसेसिंग',
    'Fichiers non conservés': 'फ़ाइलें सहेजी नहीं जातीं',
    'Une cinquantaine d’outils': 'लगभग पचास टूल',
    'La conversion démarre dès l’import, sans installation ni compte obligatoire':
      'फ़ाइल डालते ही कन्वर्ज़न शुरू — इंस्टॉल या अकाउंट की ज़रूरत नहीं',
    'Traitement à la demande, aucune base documentaire, aucune revente de données':
      'मांग पर प्रोसेसिंग: कोई दस्तावेज़ डेटाबेस नहीं, डेटा की बिक्री नहीं',
    'Interface et outils traduits dans 10 langues': 'इंटरफ़ेस और टूल 10 भाषाओं में',
    'PDF, images, vidéo, audio, archives et QR code réunis sur une seule plateforme':
      'PDF, इमेज, वीडियो, ऑडियो, आर्काइव और QR कोड — एक ही प्लेटफ़ॉर्म पर',
    'Plusieurs fichiers traités en une seule fois': 'एक बार में कई फ़ाइलें',
  },
  ru: {
    'Traitement immédiat': 'Мгновенная обработка',
    'Fichiers non conservés': 'Файлы не сохраняются',
    'Une cinquantaine d’outils': 'Около пятидесяти инструментов',
    'La conversion démarre dès l’import, sans installation ni compte obligatoire':
      'Конвертация начинается сразу: без установки и без аккаунта',
    'Traitement à la demande, aucune base documentaire, aucune revente de données':
      'Обработка по запросу: без базы документов и без продажи данных',
    'Interface et outils traduits dans 10 langues': 'Интерфейс и инструменты на 10 языках',
    'PDF, images, vidéo, audio, archives et QR code réunis sur une seule plateforme':
      'PDF, изображения, видео, аудио, архивы и QR-коды на одной платформе',
    'Plusieurs fichiers traités en une seule fois': 'Несколько файлов за один раз',
  },
  sv: {
    'Traitement immédiat': 'Omedelbar bearbetning',
    'Fichiers non conservés': 'Filer sparas inte',
    'Une cinquantaine d’outils': 'Cirka femtio verktyg',
    'La conversion démarre dès l’import, sans installation ni compte obligatoire':
      'Konverteringen startar direkt: ingen installation, inget konto',
    'Traitement à la demande, aucune base documentaire, aucune revente de données':
      'Bearbetning på begäran: ingen dokumentdatabas, ingen vidareförsäljning av data',
    'Interface et outils traduits dans 10 langues': 'Gränssnitt och verktyg på 10 språk',
    'PDF, images, vidéo, audio, archives et QR code réunis sur une seule plateforme':
      'PDF, bilder, video, ljud, arkiv och QR-koder på en plattform',
    'Plusieurs fichiers traités en une seule fois': 'Flera filer i en enda körning',
  },
  no: {
    'Traitement immédiat': 'Umiddelbar behandling',
    'Fichiers non conservés': 'Filer lagres ikke',
    'Une cinquantaine d’outils': 'Rundt femti verktøy',
    'La conversion démarre dès l’import, sans installation ni compte obligatoire':
      'Konverteringen starter med en gang: ingen installasjon, ingen konto',
    'Traitement à la demande, aucune base documentaire, aucune revente de données':
      'Behandling på forespørsel: ingen dokumentdatabase, ingen videresalg av data',
    'Interface et outils traduits dans 10 langues': 'Grensesnitt og verktøy på 10 språk',
    'PDF, images, vidéo, audio, archives et QR code réunis sur une seule plateforme':
      'PDF, bilder, video, lyd, arkiver og QR-koder på én plattform',
    'Plusieurs fichiers traités en une seule fois': 'Fler filer i én omgang',
  },
};

let modified = 0;

for (const [locale, entries] of Object.entries(TRANSLATIONS)) {
  const file = path.join('messages', `${locale}.json`);
  if (!fs.existsSync(file)) {
    console.warn(`- ${locale}: fichier absent`);
    continue;
  }

  const raw = fs.readFileSync(file, 'utf8');

  // Ligne de la derniere entree de home.features (cle identique partout)
  const escaped = ANCHOR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(\\s*)(${escaped}):\\s*("[^"]*")`);
  const match = raw.match(pattern);

  if (!match) {
    console.warn(`- ${locale}: ancre introuvable, ignore`);
    continue;
  }

  const indent = match[1];
  const additions = Object.entries(entries)
    .map(([key, value]) => `${indent}${JSON.stringify(key)}: ${JSON.stringify(value)}`)
    .join(',\n');

  // On ajoute une virgule a l'ancre, puis les nouvelles entrees
  const replacement = `${match[1]}${match[2]}: ${match[3]},\n${additions}`;
  const next = raw.replace(pattern, replacement);

  try {
    JSON.parse(next);
  } catch {
    console.error(`- ${locale}: JSON invalide apres modification, ignore`);
    continue;
  }

  fs.writeFileSync(file, next, 'utf8');
  modified++;
  console.log(`- ${locale}: ${Object.keys(entries).length} traductions ajoutees`);
}

console.log(`\n${modified} fichier(s) modifie(s).`);
