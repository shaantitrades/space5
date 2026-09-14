/**
 * 🌍 SEO LOCALISÉ — Multi Convert
 *
 * Source unique pour :
 * - titres / descriptions par défaut, par langue
 * - jeux de mots-clés complets (tête de gondole + longue traîne)
 * - noms localisés des catégories d’outils
 * - motifs de génération des métadonnées par outil
 *
 * Règle : aucune promesse non vérifiable ici (pas de « 100 % local »,
 * pas de « sans limite de taille », pas d’avis inventés).
 */

export type ToolCategory =
  | 'transformation'
  | 'assemblage'
  | 'authentification'
  | 'conversion'
  | 'optimisation'
  | 'personnalisation'
  | 'production'
  | 'reparation';

export interface LocalizedSeo {
  /** Code ISO pour hreflang / <html lang> */
  hreflang: string;
  /** Code Open Graph (langue_TERRITOIRE) */
  ogLocale: string;
  defaultTitle: string;
  defaultDescription: string;
  /** Mots-clés principaux : intentions de recherche larges */
  keywords: string[];
  /** Longue traîne : requêtes précises à forte intention */
  longTail: string[];
  /** Nom localisé de chaque catégorie d’outil */
  categories: Record<ToolCategory, string>;
  /** Titre d’un outil — {name} remplacé par le nom localisé */
  toolTitlePattern: string;
  /** Description d’un outil — {intro} remplacé par la description localisée */
  toolDescPattern: string;
  /** Motifs de mots-clés d’un outil — {name} remplacé */
  toolKeywordPatterns: string[];
  /** Motifs de mots-clés de catégorie — {category} remplacé */
  categoryKeywordPatterns: string[];
}

export const SEO_LOCALES = ['en', 'fr', 'es', 'de', 'it', 'pt', 'hi', 'ru', 'sv', 'no'] as const;
export type SeoLocale = (typeof SEO_LOCALES)[number];
export const SEO_DEFAULT_LOCALE: SeoLocale = 'en';

export const SEO: Record<SeoLocale, LocalizedSeo> = {
  // =========================================================================
  // ENGLISH
  // =========================================================================
  en: {
    hreflang: 'en',
    ogLocale: 'en_US',
    defaultTitle: 'Multi Convert — Free online converter for PDF, image, video and audio',
    defaultDescription:
      'Convert PDF, Word, Excel, images, video and audio online. Merge, split, compress, watermark, sign and OCR your files, with batch processing and no software to install.',
    keywords: [
      'file converter',
      'online converter',
      'convert pdf',
      'pdf converter',
      'pdf to word',
      'pdf to excel',
      'pdf to images',
      'jpg to pdf',
      'word to pdf',
      'excel to pdf',
      'images to pdf',
      'merge pdf',
      'split pdf',
      'compress pdf',
      'pdf compressor',
      'pdf editor',
      'sign pdf',
      'protect pdf',
      'redact pdf',
      'bates numbering',
      'ocr online',
      'text recognition',
      'image converter',
      'webp converter',
      'avif converter',
      'png to jpg',
      'resize image',
      'compress image',
      'favicon generator',
      'video converter',
      'mp4 converter',
      'audio converter',
      'mp3 converter',
      'extract audio',
      'create zip online',
      'qr code generator',
      'batch convert files',
      'free online tools',
    ],
    longTail: [
      'convert pdf to word free online',
      'compress pdf without losing quality',
      'merge several pdf files into one',
      'jpg to pdf converter without sign up',
      'reduce image size for website',
      'convert scanned pdf to text',
      'extract text from image online',
      'convert video to mp4 online free',
      'bulk convert images to webp',
      'add watermark to pdf online',
      'split pdf into separate pages',
      'convert word to pdf keeping formatting',
    ],
    categories: {
      transformation: 'Transformation',
      assemblage: 'Merging',
      authentification: 'Security',
      conversion: 'Conversion',
      optimisation: 'Optimisation',
      personnalisation: 'Customisation',
      production: 'Production',
      reparation: 'Repair',
    },
    toolTitlePattern: '{name} — free online tool, no install',
    toolDescPattern:
      '{intro} Online tool with batch processing. Your files are deleted right after processing.',
    toolKeywordPatterns: [
      '{name}',
      '{name} online',
      '{name} free',
      'online {name}',
      '{name} no installation',
      '{name} without sign up',
    ],
    categoryKeywordPatterns: ['{category} tools', 'online {category} tools', 'free {category} tools'],
  },

  // =========================================================================
  // FRANÇAIS
  // =========================================================================
  fr: {
    hreflang: 'fr',
    ogLocale: 'fr_FR',
    defaultTitle: 'Multi Convert — Convertisseur de fichiers en ligne gratuit (PDF, image, vidéo, audio)',
    defaultDescription:
      'Convertissez vos PDF, Word, Excel, images, vidéos et fichiers audio en ligne. Fusionnez, divisez, compressez, filigranez, signez et occérisez vos documents, par lot et sans rien installer.',
    keywords: [
      'convertisseur de fichiers',
      'convertisseur en ligne',
      'convertir pdf',
      'convertisseur pdf',
      'pdf en word',
      'pdf en excel',
      'pdf en images',
      'jpg en pdf',
      'word en pdf',
      'excel en pdf',
      'images en pdf',
      'fusionner pdf',
      'diviser pdf',
      'compresser pdf',
      'réduire taille pdf',
      'éditeur pdf',
      'signer pdf',
      'protéger pdf',
      'caviarder pdf',
      'numérotation bates',
      'ocr en ligne',
      'reconnaissance de texte',
      'convertisseur image',
      'convertir en webp',
      'convertir en avif',
      'png en jpg',
      'redimensionner image',
      'compresser image',
      'générateur de favicon',
      'convertisseur vidéo',
      'convertir en mp4',
      'convertisseur audio',
      'convertir en mp3',
      'extraire audio',
      'créer un zip en ligne',
      'générateur de qr code',
      'convertir par lot',
      'outils en ligne gratuits',
    ],
    longTail: [
      'convertir un pdf en word gratuit en ligne',
      'compresser un pdf sans perte de qualité',
      'fusionner plusieurs pdf en un seul',
      'convertir jpg en pdf sans inscription',
      'réduire le poids d’une image pour le web',
      'convertir un pdf scanné en texte',
      'extraire le texte d’une image en ligne',
      'convertir une vidéo en mp4 gratuitement',
      'convertir plusieurs images en webp',
      'ajouter un filigrane sur un pdf en ligne',
      'diviser un pdf en plusieurs pages',
      'convertir word en pdf en gardant la mise en page',
    ],
    categories: {
      transformation: 'Transformation',
      assemblage: 'Assemblage',
      authentification: 'Sécurité',
      conversion: 'Conversion',
      optimisation: 'Optimisation',
      personnalisation: 'Personnalisation',
      production: 'Production',
      reparation: 'Réparation',
    },
    toolTitlePattern: '{name} — outil en ligne gratuit, sans installation',
    toolDescPattern:
      '{intro} Outil en ligne avec traitement par lot. Vos fichiers sont supprimés juste après l’opération.',
    toolKeywordPatterns: [
      '{name}',
      '{name} en ligne',
      '{name} gratuit',
      'convertir {name}',
      '{name} sans installation',
      '{name} sans inscription',
    ],
    categoryKeywordPatterns: ['outils de {category}', 'outils {category} en ligne', 'outils {category} gratuits'],
  },

  // =========================================================================
  // ESPAÑOL
  // =========================================================================
  es: {
    hreflang: 'es',
    ogLocale: 'es_ES',
    defaultTitle: 'Multi Convert — Conversor de archivos online gratis (PDF, imagen, vídeo y audio)',
    defaultDescription:
      'Convierte PDF, Word, Excel, imágenes, vídeo y audio online. Une, divide, comprime, marca con agua, firma y aplica OCR a tus documentos, por lotes y sin instalar nada.',
    keywords: [
      'conversor de archivos',
      'conversor online',
      'convertir pdf',
      'conversor pdf',
      'pdf a word',
      'pdf a excel',
      'pdf a imágenes',
      'jpg a pdf',
      'word a pdf',
      'excel a pdf',
      'imágenes a pdf',
      'unir pdf',
      'combinar pdf',
      'dividir pdf',
      'separar pdf',
      'comprimir pdf',
      'reducir tamaño pdf',
      'editor pdf',
      'firmar pdf',
      'proteger pdf',
      'censurar pdf',
      'numeración bates',
      'ocr online',
      'reconocimiento de texto',
      'conversor de imágenes',
      'convertir a webp',
      'convertir a avif',
      'png a jpg',
      'redimensionar imagen',
      'comprimir imagen',
      'generador de favicon',
      'conversor de vídeo',
      'convertir a mp4',
      'conversor de audio',
      'convertir a mp3',
      'extraer audio',
      'crear zip online',
      'generador de código qr',
      'convertir por lotes',
      'herramientas online gratis',
    ],
    longTail: [
      'convertir pdf a word gratis online',
      'comprimir pdf sin perder calidad',
      'unir varios pdf en uno solo',
      'convertir jpg a pdf sin registrarse',
      'reducir el peso de una imagen para web',
      'convertir un pdf escaneado a texto',
      'extraer el texto de una imagen online',
      'convertir un vídeo a mp4 gratis',
      'convertir varias imágenes a webp',
      'añadir marca de agua a un pdf online',
      'dividir un pdf en varias páginas',
      'convertir word a pdf manteniendo el formato',
    ],
    categories: {
      transformation: 'Transformación',
      assemblage: 'Unión de archivos',
      authentification: 'Seguridad',
      conversion: 'Conversión',
      optimisation: 'Optimización',
      personnalisation: 'Personalización',
      production: 'Producción',
      reparation: 'Reparación',
    },
    toolTitlePattern: '{name} — herramienta online gratis, sin instalación',
    toolDescPattern:
      '{intro} Herramienta en línea con procesamiento por lotes. Tus archivos se eliminan justo después de la operación.',
    toolKeywordPatterns: [
      '{name}',
      '{name} online',
      '{name} gratis',
      'convertir {name}',
      '{name} sin instalar',
      '{name} sin registro',
    ],
    categoryKeywordPatterns: [
      'herramientas de {category}',
      'herramientas {category} online',
      'herramientas {category} gratis',
    ],
  },

  // =========================================================================
  // DEUTSCH
  // =========================================================================
  de: {
    hreflang: 'de',
    ogLocale: 'de_DE',
    defaultTitle: 'Multi Convert — Kostenloser Online-Konverter für PDF, Bilder, Video und Audio',
    defaultDescription:
      'Konvertieren Sie PDF, Word, Excel, Bilder, Videos und Audio online. Zusammenfügen, teilen, komprimieren, mit Wasserzeichen versehen, signieren und OCR – in Stapeln und ohne Installation.',
    keywords: [
      'dateikonverter',
      'dateien konvertieren',
      'online konverter',
      'pdf konvertieren',
      'pdf konverter',
      'pdf in word',
      'pdf in excel',
      'pdf in bilder',
      'jpg in pdf',
      'word in pdf',
      'excel in pdf',
      'bilder in pdf',
      'pdf zusammenfügen',
      'pdf verbinden',
      'pdf teilen',
      'pdf trennen',
      'pdf komprimieren',
      'pdf verkleinern',
      'pdf bearbeiten',
      'pdf signieren',
      'pdf schützen',
      'pdf schwärzen',
      'bates nummerierung',
      'ocr online',
      'texterkennung',
      'bildkonverter',
      'in webp umwandeln',
      'in avif umwandeln',
      'png in jpg',
      'bild skalieren',
      'bild komprimieren',
      'favicon generator',
      'video konverter',
      'in mp4 umwandeln',
      'audio konverter',
      'in mp3 umwandeln',
      'audio extrahieren',
      'zip online erstellen',
      'qr code generator',
      'stapelverarbeitung',
      'kostenlose online tools',
    ],
    longTail: [
      'pdf in word umwandeln kostenlos online',
      'pdf komprimieren ohne qualitätsverlust',
      'mehrere pdf zu einer datei zusammenfügen',
      'jpg in pdf umwandeln ohne anmeldung',
      'bildgröße für web reduzieren',
      'gescanntes pdf in text umwandeln',
      'text aus einem bild extrahieren online',
      'video kostenlos in mp4 umwandeln',
      'mehrere bilder in webp umwandeln',
      'wasserzeichen zu pdf hinzufügen online',
      'pdf in einzelne seiten aufteilen',
      'word in pdf umwandeln ohne formatverlust',
    ],
    categories: {
      transformation: 'Umwandlung',
      assemblage: 'Zusammenfügen',
      authentification: 'Sicherheit',
      conversion: 'Konvertierung',
      optimisation: 'Optimierung',
      personnalisation: 'Anpassung',
      production: 'Produktion',
      reparation: 'Reparatur',
    },
    toolTitlePattern: '{name} — kostenloses Online-Tool, ohne Installation',
    toolDescPattern:
      '{intro} Online-Tool mit Stapelverarbeitung. Ihre Dateien werden direkt nach der Verarbeitung gelöscht.',
    toolKeywordPatterns: [
      '{name}',
      '{name} online',
      '{name} kostenlos',
      '{name} ohne installation',
      '{name} ohne anmeldung',
    ],
    categoryKeywordPatterns: ['{category} tools', '{category} online tools', 'kostenlose {category} tools'],
  },

  // =========================================================================
  // ITALIANO
  // =========================================================================
  it: {
    hreflang: 'it',
    ogLocale: 'it_IT',
    defaultTitle: 'Multi Convert — Convertitore di file online gratuito (PDF, immagini, video e audio)',
    defaultDescription:
      'Converti PDF, Word, Excel, immagini, video e audio online. Unisci, dividi, comprimi, applica filigrane, firma e usa l’OCR sui tuoi documenti, in batch e senza installare nulla.',
    keywords: [
      'convertitore di file',
      'convertire file online',
      'convertitore online',
      'convertire pdf',
      'convertitore pdf',
      'pdf in word',
      'pdf in excel',
      'pdf in immagini',
      'jpg in pdf',
      'word in pdf',
      'excel in pdf',
      'immagini in pdf',
      'unire pdf',
      'unisci pdf',
      'dividere pdf',
      'separare pdf',
      'comprimere pdf',
      'ridurre dimensioni pdf',
      'editore pdf',
      'firmare pdf',
      'proteggere pdf',
      'oscurare pdf',
      'numerazione bates',
      'ocr online',
      'riconoscimento testo',
      'convertitore immagini',
      'convertire in webp',
      'convertire in avif',
      'png in jpg',
      'ridimensionare immagine',
      'comprimere immagine',
      'generatore favicon',
      'convertitore video',
      'convertire in mp4',
      'convertitore audio',
      'convertire in mp3',
      'estrarre audio',
      'creare zip online',
      'generatore codice qr',
      'conversione in batch',
      'strumenti online gratuiti',
    ],
    longTail: [
      'convertire pdf in word gratis online',
      'comprimere pdf senza perdere qualità',
      'unire più pdf in un unico file',
      'convertire jpg in pdf senza registrazione',
      'ridurre il peso di un’immagine per il web',
      'convertire un pdf scansionato in testo',
      'estrarre il testo da un’immagine online',
      'convertire un video in mp4 gratis',
      'convertire più immagini in webp',
      'aggiungere filigrana a un pdf online',
      'dividere un pdf in più pagine',
      'convertire word in pdf mantenendo la formattazione',
    ],
    categories: {
      transformation: 'Trasformazione',
      assemblage: 'Unione file',
      authentification: 'Sicurezza',
      conversion: 'Conversione',
      optimisation: 'Ottimizzazione',
      personnalisation: 'Personalizzazione',
      production: 'Produzione',
      reparation: 'Riparazione',
    },
    toolTitlePattern: '{name} — strumento online gratuito, senza installazione',
    toolDescPattern:
      '{intro} Strumento online con elaborazione in batch. I tuoi file vengono eliminati subito dopo l’operazione.',
    toolKeywordPatterns: [
      '{name}',
      '{name} online',
      '{name} gratis',
      'convertire {name}',
      '{name} senza installazione',
      '{name} senza registrazione',
    ],
    categoryKeywordPatterns: [
      'strumenti {category}',
      'strumenti {category} online',
      'strumenti {category} gratuiti',
    ],
  },

  // =========================================================================
  // PORTUGUÊS
  // =========================================================================
  pt: {
    hreflang: 'pt',
    ogLocale: 'pt_PT',
    defaultTitle: 'Multi Convert — Conversor de ficheiros online grátis (PDF, imagem, vídeo e áudio)',
    defaultDescription:
      'Converta PDF, Word, Excel, imagens, vídeo e áudio online. Una, divida, comprima, aplique marcas de água, assine e use OCR nos seus documentos, em lote e sem instalar nada.',
    keywords: [
      'conversor de arquivos',
      'conversor de ficheiros',
      'converter arquivos online',
      'conversor online',
      'converter pdf',
      'conversor pdf',
      'pdf para word',
      'pdf para excel',
      'pdf para imagens',
      'jpg para pdf',
      'word para pdf',
      'excel para pdf',
      'imagens para pdf',
      'unir pdf',
      'juntar pdf',
      'dividir pdf',
      'separar pdf',
      'comprimir pdf',
      'reduzir tamanho pdf',
      'editor pdf',
      'assinar pdf',
      'proteger pdf',
      'censurar pdf',
      'numeração bates',
      'ocr online',
      'reconhecimento de texto',
      'conversor de imagens',
      'converter para webp',
      'converter para avif',
      'png para jpg',
      'redimensionar imagem',
      'comprimir imagem',
      'gerador de favicon',
      'conversor de vídeo',
      'converter para mp4',
      'conversor de áudio',
      'converter para mp3',
      'extrair áudio',
      'criar zip online',
      'gerador de qr code',
      'conversão em lote',
      'ferramentas online grátis',
    ],
    longTail: [
      'converter pdf para word grátis online',
      'comprimir pdf sem perder qualidade',
      'unir vários pdf num só arquivo',
      'converter jpg para pdf sem registo',
      'reduzir o tamanho de uma imagem para web',
      'converter pdf digitalizado em texto',
      'extrair texto de uma imagem online',
      'converter vídeo para mp4 grátis',
      'converter várias imagens para webp',
      'adicionar marca de água a um pdf online',
      'dividir um pdf em várias páginas',
      'converter word para pdf mantendo a formatação',
    ],
    categories: {
      transformation: 'Transformação',
      assemblage: 'Junção de ficheiros',
      authentification: 'Segurança',
      conversion: 'Conversão',
      optimisation: 'Otimização',
      personnalisation: 'Personalização',
      production: 'Produção',
      reparation: 'Reparação',
    },
    toolTitlePattern: '{name} — ferramenta online grátis, sem instalação',
    toolDescPattern:
      '{intro} Ferramenta online com processamento em lote. Os seus ficheiros são eliminados logo após a operação.',
    toolKeywordPatterns: [
      '{name}',
      '{name} online',
      '{name} grátis',
      'converter {name}',
      '{name} sem instalação',
      '{name} sem registo',
    ],
    categoryKeywordPatterns: [
      'ferramentas de {category}',
      'ferramentas {category} online',
      'ferramentas {category} grátis',
    ],
  },

  // =========================================================================
  // हिन्दी (HINDI)
  // =========================================================================
  hi: {
    hreflang: 'hi',
    ogLocale: 'hi_IN',
    defaultTitle: 'Multi Convert — मुफ़्त ऑनलाइन फ़ाइल कन्वर्टर (PDF, इमेज, वीडियो, ऑडियो)',
    defaultDescription:
      'PDF, Word, Excel, इमेज, वीडियो और ऑडियो ऑनलाइन कन्वर्ट करें। फ़ाइलें मर्ज, स्प्लिट, कंप्रेस, वॉटरमार्क, साइन और OCR करें — बैच में, बिना कुछ इंस्टॉल किए।',
    keywords: [
      'फ़ाइल कन्वर्टर',
      'ऑनलाइन कन्वर्टर',
      'पीडीएफ कन्वर्टर',
      'pdf को word में',
      'pdf को excel में',
      'pdf को इमेज में',
      'jpg को pdf में',
      'word को pdf में',
      'excel को pdf में',
      'इमेज को pdf में',
      'pdf मर्ज करें',
      'pdf जोड़ें',
      'pdf अलग करें',
      'pdf विभाजित करें',
      'pdf कंप्रेस करें',
      'pdf का साइज़ कम करें',
      'pdf एडिटर',
      'pdf साइन करें',
      'pdf सुरक्षित करें',
      'ocr ऑनलाइन',
      'टेक्स्ट पहचान',
      'इमेज कन्वर्टर',
      'webp में बदलें',
      'png को jpg',
      'इमेज रीसाइज़ करें',
      'इमेज कंप्रेस करें',
      'फ़ेविकॉन जेनरेटर',
      'वीडियो कन्वर्टर',
      'mp4 में बदलें',
      'ऑडियो कन्वर्टर',
      'mp3 में बदलें',
      'ऑडियो निकालें',
      'zip ऑनलाइन बनाएं',
      'qr कोड जेनरेटर',
      'बैच में कन्वर्ट करें',
      'मुफ़्त ऑनलाइन टूल्स',
    ],
    longTail: [
      'pdf को word में मुफ़्त में बदलें',
      'गुणवत्ता खोए बिना pdf कंप्रेस करें',
      'कई pdf को एक फ़ाइल में मर्ज करें',
      'बिना साइनअप jpg को pdf बनाएं',
      'वेबसाइट के लिए इमेज का साइज़ कम करें',
      'स्कैन किए गए pdf को टेक्स्ट में बदलें',
      'इमेज से टेक्स्ट निकालें',
      'वीडियो को मुफ़्त में mp4 बनाएं',
      'कई इमेज को webp में बदलें',
      'pdf पर वॉटरमार्क लगाएं',
      'pdf को अलग-अलग पेज में बाँटें',
      'फ़ॉर्मेटिंग बनाए रखते हुए word को pdf बनाएं',
    ],
    categories: {
      transformation: 'रूपांतरण',
      assemblage: 'फ़ाइल जोड़ना',
      authentification: 'सुरक्षा',
      conversion: 'कन्वर्ज़न',
      optimisation: 'ऑप्टिमाइज़ेशन',
      personnalisation: 'कस्टमाइज़ेशन',
      production: 'प्रोडक्शन',
      reparation: 'रिपेयर',
    },
    toolTitlePattern: '{name} — मुफ़्त ऑनलाइन टूल, इंस्टॉल की ज़रूरत नहीं',
    toolDescPattern:
      '{intro} ऑनलाइन टूल, बैच प्रोसेसिंग के साथ। प्रोसेसिंग के तुरंत बाद आपकी फ़ाइलें हटा दी जाती हैं।',
    toolKeywordPatterns: [
      '{name}',
      '{name} ऑनलाइन',
      '{name} मुफ़्त',
      '{name} इंस्टॉल के बिना',
      '{name} बिना साइनअप',
    ],
    categoryKeywordPatterns: ['{category} टूल्स', 'ऑनलाइन {category} टूल्स', 'मुफ़्त {category} टूल्स'],
  },

  // =========================================================================
  // РУССКИЙ (RUSSIAN)
  // =========================================================================
  ru: {
    hreflang: 'ru',
    ogLocale: 'ru_RU',
    defaultTitle: 'Multi Convert — Бесплатный онлайн-конвертер файлов (PDF, изображения, видео, аудио)',
    defaultDescription:
      'Конвертируйте PDF, Word, Excel, изображения, видео и аудио онлайн. Объединяйте, разделяйте, сжимайте, добавляйте водяные знаки, подписывайте и распознавайте текст — пакетно и без установки программ.',
    keywords: [
      'конвертер файлов',
      'онлайн конвертер',
      'конвертировать pdf',
      'конвертер pdf',
      'pdf в word',
      'pdf в excel',
      'pdf в изображения',
      'jpg в pdf',
      'word в pdf',
      'excel в pdf',
      'изображения в pdf',
      'объединить pdf',
      'соединить pdf',
      'разделить pdf',
      'сжать pdf',
      'уменьшить размер pdf',
      'редактор pdf',
      'подписать pdf',
      'защитить pdf',
      'замазать текст в pdf',
      'нумерация бейтса',
      'ocr онлайн',
      'распознавание текста',
      'конвертер изображений',
      'конвертировать в webp',
      'конвертировать в avif',
      'png в jpg',
      'изменить размер изображения',
      'сжать изображение',
      'генератор favicon',
      'конвертер видео',
      'конвертировать в mp4',
      'конвертер аудио',
      'конвертировать в mp3',
      'извлечь аудио',
      'создать zip онлайн',
      'генератор qr кода',
      'пакетная обработка файлов',
      'бесплатные онлайн инструменты',
    ],
    longTail: [
      'конвертировать pdf в word бесплатно онлайн',
      'сжать pdf без потери качества',
      'объединить несколько pdf в один файл',
      'конвертировать jpg в pdf без регистрации',
      'уменьшить размер изображения для сайта',
      'конвертировать сканированный pdf в текст',
      'извлечь текст из изображения онлайн',
      'конвертировать видео в mp4 бесплатно',
      'конвертировать несколько изображений в webp',
      'добавить водяной знак на pdf онлайн',
      'разделить pdf на отдельные страницы',
      'конвертировать word в pdf с сохранением форматирования',
    ],
    categories: {
      transformation: 'Преобразование',
      assemblage: 'Объединение файлов',
      authentification: 'Безопасность',
      conversion: 'Конвертация',
      optimisation: 'Оптимизация',
      personnalisation: 'Настройка',
      production: 'Производство',
      reparation: 'Восстановление',
    },
    toolTitlePattern: '{name} — бесплатный онлайн-инструмент, без установки',
    toolDescPattern:
      '{intro} Онлайн-инструмент с пакетной обработкой. Ваши файлы удаляются сразу после операции.',
    toolKeywordPatterns: [
      '{name}',
      '{name} онлайн',
      '{name} бесплатно',
      '{name} без установки',
      '{name} без регистрации',
    ],
    categoryKeywordPatterns: [
      'инструменты {category}',
      '{category} онлайн',
      'бесплатные инструменты {category}',
    ],
  },

  // =========================================================================
  // SVENSKA
  // =========================================================================
  sv: {
    hreflang: 'sv',
    ogLocale: 'sv_SE',
    defaultTitle: 'Multi Convert — Gratis online filkonverterare (PDF, bilder, video och ljud)',
    defaultDescription:
      'Konvertera PDF, Word, Excel, bilder, video och ljud online. Slå ihop, dela, komprimera, lägg till vattenstämpel, signera och OCR-behandla dina filer — i batch och utan installation.',
    keywords: [
      'filkonverterare',
      'konvertera filer online',
      'online konverterare',
      'konvertera pdf',
      'pdf konverterare',
      'pdf till word',
      'pdf till excel',
      'pdf till bilder',
      'jpg till pdf',
      'word till pdf',
      'excel till pdf',
      'bilder till pdf',
      'slå ihop pdf',
      'sammanfoga pdf',
      'dela pdf',
      'separera pdf',
      'komprimera pdf',
      'minska pdf storlek',
      'pdf redigerare',
      'signera pdf',
      'skydda pdf',
      'maskera pdf',
      'bates numrering',
      'ocr online',
      'textigenkänning',
      'bildkonverterare',
      'konvertera till webp',
      'konvertera till avif',
      'png till jpg',
      'ändra bildstorlek',
      'komprimera bild',
      'favicon generator',
      'videokonverterare',
      'konvertera till mp4',
      'ljudkonverterare',
      'konvertera till mp3',
      'extrahera ljud',
      'skapa zip online',
      'qr-kod generator',
      'batchkonvertering',
      'gratis onlineverktyg',
    ],
    longTail: [
      'konvertera pdf till word gratis online',
      'komprimera pdf utan kvalitetsförlust',
      'slå ihop flera pdf till en fil',
      'konvertera jpg till pdf utan registrering',
      'minska bildstorlek för webb',
      'konvertera skannad pdf till text',
      'extrahera text från en bild online',
      'konvertera video till mp4 gratis',
      'konvertera flera bilder till webp',
      'lägg till vattenstämpel i pdf online',
      'dela en pdf i flera sidor',
      'konvertera word till pdf med bevarad formatering',
    ],
    categories: {
      transformation: 'Omvandling',
      assemblage: 'Sammanfogning',
      authentification: 'Säkerhet',
      conversion: 'Konvertering',
      optimisation: 'Optimering',
      personnalisation: 'Anpassning',
      production: 'Produktion',
      reparation: 'Reparation',
    },
    toolTitlePattern: '{name} — gratis onlineverktyg, ingen installation',
    toolDescPattern:
      '{intro} Onlineverktyg med batchbearbetning. Dina filer raderas direkt efter åtgärden.',
    toolKeywordPatterns: [
      '{name}',
      '{name} online',
      '{name} gratis',
      '{name} utan installation',
      '{name} utan registrering',
    ],
    categoryKeywordPatterns: ['{category} verktyg', '{category} onlineverktyg', 'gratis {category} verktyg'],
  },

  // =========================================================================
  // NORSK
  // =========================================================================
  no: {
    hreflang: 'no',
    ogLocale: 'nb_NO',
    defaultTitle: 'Multi Convert — Gratis online filkonverterer (PDF, bilder, video og lyd)',
    defaultDescription:
      'Konverter PDF, Word, Excel, bilder, video og lyd på nett. Slå sammen, del, komprimer, legg til vannmerke, signer og OCR-behandle filene dine — i batch og uten installasjon.',
    keywords: [
      'filkonverterer',
      'konvertere filer på nett',
      'online konverterer',
      'konvertere pdf',
      'pdf konverterer',
      'pdf til word',
      'pdf til excel',
      'pdf til bilder',
      'jpg til pdf',
      'word til pdf',
      'excel til pdf',
      'bilder til pdf',
      'slå sammen pdf',
      'flette pdf',
      'dele pdf',
      'separere pdf',
      'komprimere pdf',
      'redusere pdf størrelse',
      'pdf redigerer',
      'signere pdf',
      'beskytte pdf',
      'skjerme pdf',
      'bates nummerering',
      'ocr på nett',
      'tekstgjenkjenning',
      'bildekonverterer',
      'konvertere til webp',
      'konvertere til avif',
      'png til jpg',
      'endre bildestørrelse',
      'komprimere bilde',
      'favicon generator',
      'videokonverterer',
      'konvertere til mp4',
      'lydkonverterer',
      'konvertere til mp3',
      'hente ut lyd',
      'lage zip på nett',
      'qr-kode generator',
      'batchkonvertering',
      'gratis nettverktøy',
    ],
    longTail: [
      'konvertere pdf til word gratis på nett',
      'komprimere pdf uten kvalitetstap',
      'slå sammen flere pdf til én fil',
      'konvertere jpg til pdf uten registrering',
      'redusere bildestørrelse for nett',
      'konvertere skannet pdf til tekst',
      'hente ut tekst fra et bilde på nett',
      'konvertere video til mp4 gratis',
      'konvertere flere bilder til webp',
      'legge til vannmerke i pdf på nett',
      'dele en pdf i flere sider',
      'konvertere word til pdf med bevart formatering',
    ],
    categories: {
      transformation: 'Transformasjon',
      assemblage: 'Sammenslåing',
      authentification: 'Sikkerhet',
      conversion: 'Konvertering',
      optimisation: 'Optimalisering',
      personnalisation: 'Tilpasning',
      production: 'Produksjon',
      reparation: 'Reparasjon',
    },
    toolTitlePattern: '{name} — gratis nettverktøy, ingen installasjon',
    toolDescPattern:
      '{intro} Nettverktøy med batchbehandling. Filene dine slettes rett etter operasjonen.',
    toolKeywordPatterns: [
      '{name}',
      '{name} på nett',
      '{name} gratis',
      '{name} uten installasjon',
      '{name} uten registrering',
    ],
    categoryKeywordPatterns: ['{category} verktøy', '{category} nettverktøy', 'gratis {category} verktøy'],
  },
};

// =============================================================================
// RÉSOLUTION ET GÉNÉRATION
// =============================================================================

/** Normalise un code de locale vers une locale SEO connue (« fr-CA » → « fr ») */
export function resolveSeoLocale(locale?: string | null): SeoLocale {
  if (!locale) return SEO_DEFAULT_LOCALE;
  const base = locale.toLowerCase().split('-')[0];
  return (SEO_LOCALES as readonly string[]).includes(base) ? (base as SeoLocale) : SEO_DEFAULT_LOCALE;
}

/** Récupère la configuration SEO d’une langue, avec repli sur l’anglais */
export function getSeo(locale?: string | null): LocalizedSeo {
  return SEO[resolveSeoLocale(locale)];
}

/** Remplace les jetons {cle} d’un motif, ex. « {name} » → « Fusionner PDF » */
export function fillPattern(pattern: string, values: Record<string, string>): string {
  return pattern.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/** Normalise (espaces), dédoublonne (insensible à la casse) et filtre les vides */
export function normalizeKeywords(keywords: string[], limit = 45): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const keyword of keywords) {
    const clean = keyword.replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
    if (result.length >= limit) break;
  }

  return result;
}

/** Titre et description d’un outil, localisés */
export function buildToolCopy(
  locale: string | null | undefined,
  toolName: string,
  intro: string
): { title: string; description: string } {
  const seo = getSeo(locale);
  return {
    title: fillPattern(seo.toolTitlePattern, { name: toolName }),
    description: fillPattern(seo.toolDescPattern, { intro }),
  };
}

/** Jeu de mots-clés complet d’un outil : motifs, catégorie, longue traîne, socle */
export function buildToolKeywords(
  locale: string | null | undefined,
  toolName: string,
  category?: ToolCategory
): string[] {
  const seo = getSeo(locale);

  const fromTool = seo.toolKeywordPatterns.map((pattern) => fillPattern(pattern, { name: toolName }));
  const fromCategory = category
    ? seo.categoryKeywordPatterns.map((pattern) =>
        fillPattern(pattern, { category: seo.categories[category] })
      )
    : [];
  const toolInCategory = category ? [`${toolName} ${seo.categories[category].toLowerCase()}`] : [];

  return normalizeKeywords([
    toolName,
    ...fromTool,
    ...toolInCategory,
    ...fromCategory,
    ...seo.longTail,
    ...seo.keywords,
  ]);
}

/** Jeu de mots-clés complet d’une catégorie d’outils */
export function buildCategoryKeywords(locale: string | null | undefined, category: ToolCategory): string[] {
  const seo = getSeo(locale);
  const localized = seo.categories[category];
  return normalizeKeywords([
    localized,
    ...seo.categoryKeywordPatterns.map((pattern) => fillPattern(pattern, { category: localized })),
    ...seo.longTail,
    ...seo.keywords,
  ]);
}

/** Jeu de mots-clés complet de la page d’accueil */
export function buildSiteKeywords(locale: string | null | undefined): string[] {
  const seo = getSeo(locale);
  return normalizeKeywords([...seo.keywords, ...seo.longTail]);
}

// =============================================================================
// LIBELLÉS DES PAGES SECONDAIRES (titre localisé dans les 10 langues)
// =============================================================================

export type PageKey =
  | 'contact'
  | 'features'
  | 'enterprise'
  | 'documentation'
  | 'legal'
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'convert';

export const PAGE_LABELS: Record<SeoLocale, Record<PageKey, string>> = {
  en: {
    contact: 'Contact',
    features: 'Features',
    enterprise: 'Business solutions',
    documentation: 'API documentation',
    legal: 'Legal notice',
    privacy: 'Privacy policy',
    terms: 'Terms of service',
    cookies: 'Cookie policy',
    convert: 'Convert a file',
  },
  fr: {
    contact: 'Contact',
    features: 'Fonctionnalités',
    enterprise: 'Solutions entreprise',
    documentation: 'Documentation API',
    legal: 'Mentions légales',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions générales',
    cookies: 'Politique cookies',
    convert: 'Convertir un fichier',
  },
  es: {
    contact: 'Contacto',
    features: 'Funciones',
    enterprise: 'Soluciones para empresas',
    documentation: 'Documentación de la API',
    legal: 'Aviso legal',
    privacy: 'Política de privacidad',
    terms: 'Términos del servicio',
    cookies: 'Política de cookies',
    convert: 'Convertir un archivo',
  },
  de: {
    contact: 'Kontakt',
    features: 'Funktionen',
    enterprise: 'Unternehmenslösungen',
    documentation: 'API-Dokumentation',
    legal: 'Impressum',
    privacy: 'Datenschutzerklärung',
    terms: 'Nutzungsbedingungen',
    cookies: 'Cookie-Richtlinie',
    convert: 'Datei konvertieren',
  },
  it: {
    contact: 'Contatti',
    features: 'Funzionalità',
    enterprise: 'Soluzioni aziendali',
    documentation: 'Documentazione API',
    legal: 'Note legali',
    privacy: 'Informativa sulla privacy',
    terms: 'Termini di servizio',
    cookies: 'Politica sui cookie',
    convert: 'Converti un file',
  },
  pt: {
    contact: 'Contacto',
    features: 'Funcionalidades',
    enterprise: 'Soluções empresariais',
    documentation: 'Documentação da API',
    legal: 'Informação legal',
    privacy: 'Política de privacidade',
    terms: 'Termos de serviço',
    cookies: 'Política de cookies',
    convert: 'Converter um ficheiro',
  },
  hi: {
    contact: 'संपर्क',
    features: 'फ़ीचर्स',
    enterprise: 'बिज़नेस समाधान',
    documentation: 'API दस्तावेज़',
    legal: 'कानूनी सूचना',
    privacy: 'गोपनीयता नीति',
    terms: 'सेवा की शर्तें',
    cookies: 'कुकी नीति',
    convert: 'फ़ाइल कन्वर्ट करें',
  },
  ru: {
    contact: 'Контакты',
    features: 'Возможности',
    enterprise: 'Решения для бизнеса',
    documentation: 'Документация API',
    legal: 'Правовая информация',
    privacy: 'Политика конфиденциальности',
    terms: 'Условия использования',
    cookies: 'Политика cookie',
    convert: 'Конвертировать файл',
  },
  sv: {
    contact: 'Kontakt',
    features: 'Funktioner',
    enterprise: 'Företagslösningar',
    documentation: 'API-dokumentation',
    legal: 'Juridisk information',
    privacy: 'Integritetspolicy',
    terms: 'Användarvillkor',
    cookies: 'Cookiepolicy',
    convert: 'Konvertera en fil',
  },
  no: {
    contact: 'Kontakt',
    features: 'Funksjoner',
    enterprise: 'Bedriftsløsninger',
    documentation: 'API-dokumentasjon',
    legal: 'Juridisk informasjon',
    privacy: 'Personvernerklæring',
    terms: 'Vilkår for bruk',
    cookies: 'Retningslinjer for cookies',
    convert: 'Konverter en fil',
  },
};

/** Libellé localisé d’une page secondaire */
export function getPageLabel(locale: string | null | undefined, key: PageKey): string {
  return PAGE_LABELS[resolveSeoLocale(locale)][key];
}

