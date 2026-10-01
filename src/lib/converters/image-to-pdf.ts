/**
 * 🖼️➡️📄 IMAGE VERS PDF - Multi Convert
 *
 * Assemble une ou plusieurs images en un seul document PDF (une image par page,
 * dans l'ordre fourni).
 *
 * - pdf-lib embarque directement les PNG et JPEG ;
 * - les autres formats (GIF, WebP, AVIF, BMP, TIFF, SVG…) sont d'abord
 *   normalisés avec Sharp, déjà utilisé par le reste de la plateforme.
 */

import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

/** Taille de page du PDF généré */
export type ImageToPdfPageSize = 'fit' | 'a4' | 'letter';

/** Orientation des pages aux formats papier (`auto` suit l'image) */
export type ImageToPdfOrientation = 'auto' | 'portrait' | 'landscape';

export interface ImageToPdfOptions {
  /**
   * `fit` (défaut) : chaque page prend exactement la taille de son image.
   * `a4` / `letter` : pages au format papier, image centrée et mise à l'échelle.
   */
  pageSize?: ImageToPdfPageSize;
  /**
   * `auto` (défaut) : une image plus large que haute produit une page paysage.
   * Sans effet en mode `fit`, où la page épouse l'image.
   */
  orientation?: ImageToPdfOrientation;
  /** Marge en points (1 pt = 1/72 pouce) autour de l'image */
  margin?: number;
}

/** Marge maximale acceptée, en points (≈ 14 cm) : évite les pages absurdes */
const MAX_MARGIN = 400;

/** Convertit une marge exprimée en millimètres en points PDF */
export const mmToPt = (millimeters: number): number => (millimeters * 72) / 25.4;

/** Normalise la marge demandée : valeur finie, jamais négative, jamais excessive */
const normalizeMargin = (margin: number | undefined): number => {
  if (margin === undefined || !Number.isFinite(margin)) return 0;
  return Math.min(MAX_MARGIN, Math.max(0, margin));
};

/** Formats embarquables directement par pdf-lib */
const EMBEDDABLE_FORMATS = new Set(['png', 'jpeg', 'jpg']);

/** Dimensions portrait des formats papier, en points */
const PAGE_SIZES: Record<Exclude<ImageToPdfPageSize, 'fit'>, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

export class ImageToPdfConverter {
  /**
   * Détecte le format réel d'une image d'après ses octets d'en-tête
   * (plus fiable que l'extension du fichier).
   */
  private static detectFormat(buffer: Buffer, fileName = ''): string {
    if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50) return 'png';
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpeg';
    if (buffer.length >= 4 && buffer.toString('ascii', 0, 4) === 'GIF8') return 'gif';
    if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) return 'bmp';
    if (
      buffer.length >= 3 &&
      ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a) ||
        (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00))
    ) {
      return 'tiff';
    }
    if (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return 'webp';
    }
    if (buffer.length >= 12 && buffer.toString('ascii', 4, 12) === 'ftypavif') return 'avif';

    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Ramène l'image à un format embarquable par pdf-lib.
   * Les images avec transparence restent en PNG, les autres passent en JPEG.
   */
  private static async toEmbeddable(
    buffer: Buffer,
    format: string
  ): Promise<{ data: Buffer; format: 'png' | 'jpeg' }> {
    if (format === 'png') return { data: buffer, format: 'png' };
    if (format === 'jpeg' || format === 'jpg') return { data: buffer, format: 'jpeg' };

    const image = sharp(buffer, { animated: false });
    const metadata = await image.metadata();

    if (metadata.hasAlpha) {
      return { data: await image.png().toBuffer(), format: 'png' };
    }
    return { data: await image.jpeg({ quality: 92 }).toBuffer(), format: 'jpeg' };
  }

  /**
   * Convertit une liste d'images en un unique PDF.
   * Accepte des `Buffer` simples ou des objets `{ buffer, name }`.
   */
  static async convert(
    images: Array<Buffer | { buffer: Buffer; name?: string }>,
    options: ImageToPdfOptions = {}
  ): Promise<Buffer> {
    if (!images || images.length === 0) {
      throw new Error('Aucune image à convertir');
    }

    const pageSize = options.pageSize ?? 'fit';
    const orientation = options.orientation ?? 'auto';
    const margin = normalizeMargin(options.margin);

    const pdf = await PDFDocument.create();
    pdf.setProducer('Multi Convert');
    pdf.setCreator('Multi Convert');

    for (const entry of images) {
      const raw = Buffer.isBuffer(entry) ? entry : entry.buffer;
      const name = Buffer.isBuffer(entry) ? '' : entry.name ?? '';

      if (!raw || raw.length === 0) {
        throw new Error('Image vide ou illisible');
      }

      const { data, format } = await ImageToPdfConverter.toEmbeddable(
        raw,
        ImageToPdfConverter.detectFormat(raw, name)
      );
      const embedded = format === 'png' ? await pdf.embedPng(data) : await pdf.embedJpg(data);

      // Dimensions de la page : taille de l'image, ou format papier standard
      let pageWidth = embedded.width + margin * 2;
      let pageHeight = embedded.height + margin * 2;

      if (pageSize !== 'fit') {
        const [portraitWidth, portraitHeight] = PAGE_SIZES[pageSize];
        // Par défaut, une image plus large que haute produit une page paysage ;
        // une orientation explicite prend le dessus.
        const landscape =
          orientation === 'auto' ? embedded.width > embedded.height : orientation === 'landscape';
        pageWidth = landscape ? portraitHeight : portraitWidth;
        pageHeight = landscape ? portraitWidth : portraitHeight;
      }

      const page = pdf.addPage([pageWidth, pageHeight]);

      // Mise à l'échelle pour tenir dans la page sans déformer l'image
      const maxWidth = Math.max(1, pageWidth - margin * 2);
      const maxHeight = Math.max(1, pageHeight - margin * 2);
      const scale = Math.min(maxWidth / embedded.width, maxHeight / embedded.height);
      const drawWidth = embedded.width * scale;
      const drawHeight = embedded.height * scale;

      page.drawImage(embedded, {
        x: (pageWidth - drawWidth) / 2,
        y: (pageHeight - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
      });
    }

    const bytes = await pdf.save();
    return Buffer.from(bytes);
  }
}
