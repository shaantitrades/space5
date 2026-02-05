/**
 * Multi Convert - PDF Splitter
 * Division de PDF en pages ou sections
 */

import { PDFDocument } from 'pdf-lib';

export interface SplitOptions {
  mode: 'pages' | 'range' | 'chunks';
  pages?: number[]; // Pour mode 'pages'
  ranges?: Array<{ start: number; end: number }>; // Pour mode 'range'
  chunkSize?: number; // Pour mode 'chunks'
}

export interface SplitResult {
  buffers: Buffer[];
  metadata: Array<{
    pageCount: number;
    pageNumbers: number[];
    size: number;
  }>;
}

export class PDFSplitter {
  /**
   * Divise un PDF selon les options spécifiées
   */
  static async split(
    pdfBuffer: Buffer,
    options: SplitOptions
  ): Promise<SplitResult> {
    try {
      const sourcePdf = await PDFDocument.load(pdfBuffer);
      const totalPages = sourcePdf.getPageCount();

      let splitInstructions: number[][] = [];

      // Déterminer les instructions de division selon le mode
      switch (options.mode) {
        case 'pages':
          // Un PDF par page spécifiée
          splitInstructions = (options.pages || [])
            .filter((p) => p >= 0 && p < totalPages)
            .map((p) => [p]);
          break;

        case 'range':
          // Un PDF par plage
          splitInstructions = (options.ranges || []).map((range) => {
            const start = Math.max(0, range.start);
            const end = Math.min(totalPages - 1, range.end);
            return Array.from(
              { length: end - start + 1 },
              (_, i) => start + i
            );
          });
          break;

        case 'chunks':
          // Diviser en chunks de taille fixe
          const chunkSize = options.chunkSize || 1;
          for (let i = 0; i < totalPages; i += chunkSize) {
            const chunk = Array.from(
              { length: Math.min(chunkSize, totalPages - i) },
              (_, j) => i + j
            );
            splitInstructions.push(chunk);
          }
          break;

        default:
          throw new Error(`Mode de division inconnu: ${options.mode}`);
      }

      // Créer les PDF divisés
      const buffers: Buffer[] = [];
      const metadata: SplitResult['metadata'] = [];

      for (const pageNumbers of splitInstructions) {
        if (pageNumbers.length === 0) continue;

        const newPdf = await PDFDocument.create();

        // Copier les pages
        const copiedPages = await newPdf.copyPages(sourcePdf, pageNumbers);
        copiedPages.forEach((page) => newPdf.addPage(page));

        // Métadonnées
        newPdf.setProducer('Multi Convert PDF Splitter');
        newPdf.setCreator('Multi Convert');
        newPdf.setCreationDate(new Date());
        newPdf.setTitle(
          `Pages ${pageNumbers[0] + 1}${
            pageNumbers.length > 1
              ? ` à ${pageNumbers[pageNumbers.length - 1] + 1}`
              : ''
          }`
        );

        const pdfBytes = await newPdf.save();
        const buffer = Buffer.from(pdfBytes);

        buffers.push(buffer);
        metadata.push({
          pageCount: pageNumbers.length,
          pageNumbers: pageNumbers.map((p) => p + 1), // 1-indexed pour l'utilisateur
          size: buffer.length,
        });
      }

      return { buffers, metadata };
    } catch (error) {
      console.error('Erreur division PDF:', error);
      throw new Error('Échec de la division du PDF');
    }
  }

  /**
   * Extrait une seule page d'un PDF
   */
  static async extractPage(
    pdfBuffer: Buffer,
    pageNumber: number
  ): Promise<Buffer> {
    const result = await this.split(pdfBuffer, {
      mode: 'pages',
      pages: [pageNumber],
    });

    if (result.buffers.length === 0) {
      throw new Error(`Page ${pageNumber + 1} introuvable`);
    }

    return result.buffers[0];
  }

  /**
   * Extrait une plage de pages
   */
  static async extractRange(
    pdfBuffer: Buffer,
    start: number,
    end: number
  ): Promise<Buffer> {
    const result = await this.split(pdfBuffer, {
      mode: 'range',
      ranges: [{ start, end }],
    });

    if (result.buffers.length === 0) {
      throw new Error('Aucune page extraite');
    }

    return result.buffers[0];
  }

  /**
   * Divise un PDF en fichiers individuels (1 page par fichier)
   */
  static async splitIntoPages(pdfBuffer: Buffer): Promise<SplitResult> {
    const sourcePdf = await PDFDocument.load(pdfBuffer);
    const totalPages = sourcePdf.getPageCount();

    return await this.split(pdfBuffer, {
      mode: 'chunks',
      chunkSize: 1,
    });
  }

  /**
   * Supprime des pages spécifiques d'un PDF
   */
  static async removePages(
    pdfBuffer: Buffer,
    pagesToRemove: number[]
  ): Promise<Buffer> {
    try {
      const sourcePdf = await PDFDocument.load(pdfBuffer);
      const totalPages = sourcePdf.getPageCount();

      // Créer la liste des pages à garder
      const pagesToKeep = Array.from({ length: totalPages }, (_, i) => i)
        .filter((i) => !pagesToRemove.includes(i));

      if (pagesToKeep.length === 0) {
        throw new Error('Impossible de supprimer toutes les pages');
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
      copiedPages.forEach((page) => newPdf.addPage(page));

      // Métadonnées
      newPdf.setProducer('Multi Convert PDF Splitter');
      newPdf.setCreator('Multi Convert');

      const pdfBytes = await newPdf.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur suppression pages:', error);
      throw new Error('Échec de la suppression des pages');
    }
  }
}
