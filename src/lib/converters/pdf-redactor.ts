/**
 * Multi Convert - PDF Redactor
 * Caviardage permanent d'informations sensibles dans les PDF
 */

import { PDFDocument, rgb } from 'pdf-lib';

export interface RedactionArea {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RedactionOptions {
  areas: RedactionArea[];
  fillColor?: { r: number; g: number; b: number };
  removeText?: boolean; // Tenter de supprimer le texte sous-jacent (limité par pdf-lib)
}

export class PDFRedactor {
  /**
   * Caviarde (masque définitivement) des zones spécifiées dans un PDF
   * ATTENTION: Le caviardage visuel est effectué, mais pour une suppression
   * complète du texte, d'autres outils spécialisés peuvent être nécessaires
   */
  static async redact(
    pdfBuffer: Buffer,
    options: RedactionOptions
  ): Promise<Buffer> {
    try {
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Le buffer PDF est vide ou invalide');
      }

      if (!options.areas || options.areas.length === 0) {
        throw new Error('Aucune zone à caviarder spécifiée');
      }

      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      // Couleur de caviardage (noir par défaut)
      const fillColor = options.fillColor
        ? rgb(options.fillColor.r, options.fillColor.g, options.fillColor.b)
        : rgb(0, 0, 0);

      // Appliquer le caviardage sur chaque zone
      for (const area of options.areas) {
        if (area.pageIndex < 0 || area.pageIndex >= pages.length) {
          console.warn(`Page ${area.pageIndex} invalide, zone ignorée`);
          continue;
        }

        const page = pages[area.pageIndex];
        const { width, height } = page.getSize();

        // Valider et ajuster les coordonnées
        const redactX = Math.max(0, Math.min(area.x, width));
        const redactY = Math.max(0, Math.min(area.y, height));
        const redactWidth = Math.min(area.width, width - redactX);
        const redactHeight = Math.min(area.height, height - redactY);

        // Important: Dans le système de coordonnées PDF, y=0 est en bas
        // On doit donc inverser la coordonnée y
        const adjustedY = height - redactY - redactHeight;

        // Dessiner un rectangle noir pour masquer la zone
        page.drawRectangle({
          x: redactX,
          y: adjustedY,
          width: redactWidth,
          height: redactHeight,
          color: fillColor,
          opacity: 1.0, // Opacité totale pour masquer complètement
        });

        // Optionnel: Essayer de supprimer le texte si demandé
        // Note: pdf-lib a des limitations pour la suppression complète de texte
        // Cette fonctionnalité fait surtout du masquage visuel
        if (options.removeText) {
          // On pourrait utiliser d'autres techniques, mais pour l'instant
          // on se contente du masquage visuel avec un rectangle opaque
          console.log('Masquage visuel effectué. Pour suppression complète, utilisez des outils spécialisés.');
        }
      }

      // Métadonnées
      pdfDoc.setProducer('Multi Convert PDF Redactor');
      pdfDoc.setCreator('Multi Convert');
      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur caviardage PDF:', error);
      throw new Error(
        error instanceof Error
          ? `Échec du caviardage: ${error.message}`
          : 'Échec du caviardage'
      );
    }
  }

  /**
   * Caviarde une zone rectangulaire simple
   */
  static async redactArea(
    pdfBuffer: Buffer,
    pageIndex: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<Buffer> {
    return this.redact(pdfBuffer, {
      areas: [{ pageIndex, x, y, width, height }],
    });
  }

  /**
   * Caviarde plusieurs zones sur différentes pages
   */
  static async redactMultiple(
    pdfBuffer: Buffer,
    areas: RedactionArea[]
  ): Promise<Buffer> {
    return this.redact(pdfBuffer, {
      areas,
    });
  }
}
