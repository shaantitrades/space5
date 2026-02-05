/**
 * Multi Convert - PDF Signer
 * Ajout de signatures électroniques, initiales, dates et cases à cocher
 */

import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';

export interface SignatureOptions {
  type: 'signature' | 'initials' | 'date' | 'checkbox' | 'text';
  x: number;
  y: number;
  pageIndex?: number;
  width?: number;
  height?: number;
  color?: { r: number; g: number; b: number };
  fontSize?: number;
  text?: string; // Pour type 'text'
  checked?: boolean; // Pour type 'checkbox'
  dateFormat?: string; // Pour type 'date'
}

export class PDFSigner {
  /**
   * Ajoute des signatures, initiales, dates ou cases à cocher à un PDF
   */
  static async sign(
    pdfBuffer: Buffer,
    signatures: SignatureOptions[]
  ): Promise<Buffer> {
    try {
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Le buffer PDF est vide ou invalide');
      }

      if (!signatures || signatures.length === 0) {
        throw new Error('Aucune signature à ajouter');
      }

      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (const sig of signatures) {
        const pageIndex = sig.pageIndex ?? 0;
        if (pageIndex < 0 || pageIndex >= pages.length) {
          console.warn(`Page ${pageIndex} invalide, signature ignorée`);
          continue;
        }

        const page = pages[pageIndex];
        const { width, height } = page.getSize();
        const color = sig.color 
          ? rgb(sig.color.r, sig.color.g, sig.color.b)
          : rgb(0, 0, 0);

        switch (sig.type) {
          case 'signature': {
            // Dessiner une ligne de signature stylisée
            const lineY = height - sig.y;
            const lineWidth = sig.width || 150;
            const lineX = Math.max(0, Math.min(sig.x, width - lineWidth));

            // Ligne de signature
            page.drawLine({
              start: { x: lineX, y: lineY },
              end: { x: lineX + lineWidth, y: lineY },
              thickness: 2,
              color: color,
            });

            // Texte "Signature" en dessous (optionnel)
            const fontSize = sig.fontSize || 10;
            page.drawText('Signature', {
              x: lineX,
              y: lineY - 15,
              size: fontSize,
              font: helveticaFont,
              color: rgb(0.5, 0.5, 0.5),
            });
            break;
          }

          case 'initials': {
            // Dessiner une zone pour les initiales
            const boxWidth = sig.width || 60;
            const boxHeight = sig.height || 30;
            const boxX = Math.max(0, Math.min(sig.x, width - boxWidth));
            const boxY = height - sig.y;

            // Rectangle avec bordure
            page.drawRectangle({
              x: boxX,
              y: boxY - boxHeight,
              width: boxWidth,
              height: boxHeight,
              borderColor: color,
              borderWidth: 1,
            });

            // Texte "Initiales"
            const fontSize = sig.fontSize || 8;
            page.drawText('Initiales', {
              x: boxX + 5,
              y: boxY - boxHeight + 5,
              size: fontSize,
              font: helveticaFont,
              color: rgb(0.5, 0.5, 0.5),
            });
            break;
          }

          case 'date': {
            // Ajouter la date actuelle ou personnalisée
            const dateFormat = sig.dateFormat || 'DD/MM/YYYY';
            const now = new Date();
            let dateText = '';
            
            if (dateFormat === 'DD/MM/YYYY') {
              dateText = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
            } else if (dateFormat === 'MM/DD/YYYY') {
              dateText = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
            } else {
              dateText = now.toLocaleDateString();
            }

            if (sig.text) {
              dateText = sig.text;
            }

            const fontSize = sig.fontSize || 12;
            const textY = height - sig.y;
            const textX = Math.max(0, Math.min(sig.x, width - 100));

            // Ligne pour la date
            page.drawLine({
              start: { x: textX, y: textY },
              end: { x: textX + 100, y: textY },
              thickness: 1,
              color: color,
            });

            page.drawText(dateText, {
              x: textX,
              y: textY - 15,
              size: fontSize,
              font: helveticaFont,
              color: color,
            });
            break;
          }

          case 'checkbox': {
            // Dessiner une case à cocher
            const boxSize = sig.width || 15;
            const boxX = Math.max(0, Math.min(sig.x, width - boxSize));
            const boxY = height - sig.y;

            // Rectangle pour la case
            page.drawRectangle({
              x: boxX,
              y: boxY - boxSize,
              width: boxSize,
              height: boxSize,
              borderColor: color,
              borderWidth: 1.5,
            });

            // Cocher si demandé
            if (sig.checked) {
              // Dessiner une croix
              page.drawLine({
                start: { x: boxX + 2, y: boxY - 2 },
                end: { x: boxX + boxSize - 2, y: boxY - boxSize + 2 },
                thickness: 2,
                color: color,
              });
              page.drawLine({
                start: { x: boxX + boxSize - 2, y: boxY - 2 },
                end: { x: boxX + 2, y: boxY - boxSize + 2 },
                thickness: 2,
                color: color,
              });
            }
            break;
          }

          case 'text': {
            // Ajouter du texte personnalisé
            const text = sig.text || '';
            const fontSize = sig.fontSize || 12;
            const textY = height - sig.y;
            const textX = Math.max(0, Math.min(sig.x, width - 200));

            page.drawText(text, {
              x: textX,
              y: textY,
              size: fontSize,
              font: helveticaBold,
              color: color,
            });
            break;
          }
        }
      }

      // Métadonnées
      pdfDoc.setProducer('Multi Convert PDF Signer');
      pdfDoc.setCreator('Multi Convert');
      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur signature PDF:', error);
      throw new Error(
        error instanceof Error
          ? `Échec de l'ajout de signature: ${error.message}`
          : 'Échec de l\'ajout de signature'
      );
    }
  }

  /**
   * Ajoute une signature simple à une position donnée
   */
  static async addSignature(
    pdfBuffer: Buffer,
    x: number = 50,
    y: number = 50,
    pageIndex: number = 0
  ): Promise<Buffer> {
    return this.sign(pdfBuffer, [{
      type: 'signature',
      x,
      y,
      pageIndex,
    }]);
  }

  /**
   * Ajoute une case à cocher
   */
  static async addCheckbox(
    pdfBuffer: Buffer,
    x: number = 50,
    y: number = 50,
    pageIndex: number = 0,
    checked: boolean = false
  ): Promise<Buffer> {
    return this.sign(pdfBuffer, [{
      type: 'checkbox',
      x,
      y,
      pageIndex,
      checked,
    }]);
  }
}
