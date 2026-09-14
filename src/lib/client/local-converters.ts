/**
 * 🔒 MOTEUR DE CONVERSION LOCAL — Multi Convert
 *
 * Exécute certaines conversions **entièrement dans le navigateur** :
 * le fichier n’est jamais transmis à un serveur.
 *
 * ✅ Pris en charge : conversion et redimensionnement d’images
 *    (JPEG, PNG, WebP, AVIF) via l’API Canvas.
 * ❌ Non pris en charge ici : vidéo, audio, PDF, documents, OCR —
 *    ces traitements restent exécutés côté serveur (voir `canConvertLocally`).
 *
 * Aucune dépendance externe : uniquement des API navigateur standard.
 */

export type LocalImageFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export interface LocalImageOptions {
  format: LocalImageFormat;
  /** Qualité de 0 à 1 (ignorée pour PNG) */
  quality?: number;
  /** Largeur maximale : l’image est réduite proportionnellement si dépassée */
  maxWidth?: number;
  /** Hauteur maximale : l’image est réduite proportionnellement si dépassée */
  maxHeight?: number;
}

const FORMAT_TO_MIME: Record<LocalImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
};

const ALIASES: Record<string, LocalImageFormat> = {
  jpg: 'jpeg',
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
};

/** Normalise une extension ou un type MIME vers un format local connu */
export function normalizeImageFormat(input: string): LocalImageFormat | null {
  const clean = input.toLowerCase().replace(/^image\//, '').split(';')[0].trim();
  return ALIASES[clean] ?? null;
}

/** Le navigateur courant sait-il encoder ce format ? */
export function isFormatEncodable(format: LocalImageFormat): boolean {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL(FORMAT_TO_MIME[format]).startsWith(`data:${FORMAT_TO_MIME[format]}`);
}

/** Le moteur local est-il utilisable dans cet environnement ? */
export function isLocalEngineAvailable(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof createImageBitmap === 'function' &&
    typeof HTMLCanvasElement !== 'undefined'
  );
}

/**
 * Cette conversion peut-elle être faite localement, sans envoi de fichier ?
 * Sert au choix automatique entre mode local et mode serveur.
 */
export function canConvertLocally(file: File, outputFormat: string): boolean {
  if (!isLocalEngineAvailable()) return false;
  if (!file.type.startsWith('image/')) return false;
  // Les SVG peuvent être rasterisés, mais leurs dimensions ne sont pas fiables
  // sans analyse : on les laisse au serveur.
  if (file.type === 'image/svg+xml') return false;

  const format = normalizeImageFormat(outputFormat);
  if (!format) return false;

  return isFormatEncodable(format);
}

/** Extrait la dimension cible en conservant les proportions */
function computeTargetSize(
  width: number,
  height: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  let ratio = 1;
  if (maxWidth && width > maxWidth) ratio = Math.min(ratio, maxWidth / width);
  if (maxHeight && height > maxHeight) ratio = Math.min(ratio, maxHeight / height);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

/**
 * Convertit une image dans le navigateur.
 * @throws Error si le navigateur ne peut pas lire ou encoder le format demandé
 */
export async function convertImageLocally(file: File, options: LocalImageOptions): Promise<Blob> {
  if (!isLocalEngineAvailable()) {
    throw new Error('Le traitement local n’est pas disponible dans ce navigateur.');
  }

  const mime = FORMAT_TO_MIME[options.format];
  if (!isFormatEncodable(options.format)) {
    throw new Error(`Ce navigateur ne peut pas produire le format ${options.format.toUpperCase()}.`);
  }

  const bitmap = await createImageBitmap(file);

  try {
    const { width, height } = computeTargetSize(
      bitmap.width,
      bitmap.height,
      options.maxWidth,
      options.maxHeight
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Impossible de préparer le canevas de conversion.');
    }

    // JPEG ne gère pas la transparence : on aplatit sur fond blanc
    // pour éviter un fond noir inattendu.
    if (options.format === 'jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const quality = options.format === 'png' ? undefined : (options.quality ?? 0.92);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mime, quality);
    });

    if (!blob) {
      throw new Error('La conversion locale a échoué.');
    }

    // Certains navigateurs ignorent le type demandé et renvoient du PNG :
    // on vérifie pour ne pas produire un fichier au mauvais format.
    if (blob.type && blob.type !== mime) {
      throw new Error(
        `Le navigateur a produit du ${blob.type} au lieu de ${mime}. Utilisez le mode serveur.`
      );
    }

    return blob;
  } finally {
    bitmap.close?.();
  }
}

/** Remplace l’extension d’un nom de fichier */
export function replaceExtension(filename: string, format: LocalImageFormat): string {
  const extension = format === 'jpeg' ? 'jpg' : format;
  const base = filename.replace(/\.[^./\\]+$/, '');
  return `${base || 'fichier'}.${extension}`;
}

/** Déclenche le téléchargement d’un blob produit localement */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
