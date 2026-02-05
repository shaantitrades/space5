/**
 * Multi Convert - PDF Merger
 * Fusion de plusieurs PDF en un seul document
 */

import { PDFDocument } from 'pdf-lib';

export interface MergeOptions {
  title?: string;
  author?: string;
  subject?: string;
}

export class PDFMerger {
  /**
   * Fusionne plusieurs PDF en un seul
   */
  static async merge(
    pdfBuffers: Buffer[],
    options: MergeOptions = {}
  ): Promise<Buffer> {
    try {
      if (pdfBuffers.length === 0) {
        throw new Error('Aucun PDF à fusionner');
      }

      if (pdfBuffers.length === 1) {
        return pdfBuffers[0];
      }

      // Créer un nouveau document PDF
      const mergedPdf = await PDFDocument.create();

      // Ajouter les métadonnées
      if (options.title) mergedPdf.setTitle(options.title);
      if (options.author) mergedPdf.setAuthor(options.author);
      if (options.subject) mergedPdf.setSubject(options.subject);
      mergedPdf.setProducer('Multi Convert PDF Merger');
      mergedPdf.setCreator('Multi Convert');
      mergedPdf.setCreationDate(new Date());

      // Fusionner tous les PDF
      for (const pdfBuffer of pdfBuffers) {
        try {
          const pdf = await PDFDocument.load(pdfBuffer);
          const copiedPages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
          );
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (error) {
          console.error('Erreur lors de la fusion d\'un PDF:', error);
          // Continuer avec les autres PDF
        }
      }

      // Sauvegarder le PDF fusionné
      const pdfBytes = await mergedPdf.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur fusion PDF:', error);
      throw new Error('Échec de la fusion des PDF');
    }
  }

  /**
   * Fusionne des PDF en ne gardant que certaines pages
   */
  static async mergeSelective(
    sources: Array<{ buffer: Buffer; pages?: number[] }>,
    options: MergeOptions = {}
  ): Promise<Buffer> {
    try {
      const mergedPdf = await PDFDocument.create();

      // Métadonnées
      if (options.title) mergedPdf.setTitle(options.title);
      if (options.author) mergedPdf.setAuthor(options.author);
      if (options.subject) mergedPdf.setSubject(options.subject);
      mergedPdf.setProducer('Multi Convert PDF Merger');
      mergedPdf.setCreator('Multi Convert');

      for (const source of sources) {
        const pdf = await PDFDocument.load(source.buffer);
        const totalPages = pdf.getPageCount();

        // Déterminer les pages à copier
        const pagesToCopy = source.pages || Array.from(
          { length: totalPages },
          (_, i) => i
        );

        // Valider et copier les pages
        const validPages = pagesToCopy.filter(
          (p) => p >= 0 && p < totalPages
        );

        if (validPages.length > 0) {
          const copiedPages = await mergedPdf.copyPages(pdf, validPages);
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
      }

      const pdfBytes = await mergedPdf.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur fusion sélective PDF:', error);
      throw new Error('Échec de la fusion sélective');
    }
  }

  /**
   * Obtient le nombre total de pages après fusion
   */
  static async getTotalPages(pdfBuffers: Buffer[]): Promise<number> {
    let totalPages = 0;

    for (const buffer of pdfBuffers) {
      try {
        const pdf = await PDFDocument.load(buffer);
        totalPages += pdf.getPageCount();
      } catch (error) {
        console.error('Erreur lecture PDF:', error);
      }
    }

    return totalPages;
  }
}
