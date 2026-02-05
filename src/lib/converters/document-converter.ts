/**
 * Multi Convert - Document Converter
 * Conversion de documents Office (Word, Excel, PowerPoint) vers/depuis PDF
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export class DocumentConverter {
  /**
   * Convertit un document Word (.docx) en PDF
   */
  static async wordToPDF(docxBuffer: Buffer): Promise<Buffer> {
    try {
      // Extraire le contenu HTML depuis DOCX
      const result = await mammoth.convertToHtml({ buffer: docxBuffer });
      const html = result.value;

      // Créer un PDF à partir du HTML
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Parser le HTML simplement (pour une version basique)
      const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      // Écrire le texte sur le PDF
      const fontSize = 12;
      const margin = 50;
      const maxWidth = width - 2 * margin;
      const lineHeight = fontSize * 1.2;
      let y = height - margin;

      const words = text.split(' ');
      let line = '';

      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth && line.length > 0) {
          page.drawText(line, {
            x: margin,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          line = word + ' ';
          y -= lineHeight;

          // Nouvelle page si nécessaire
          if (y < margin) {
            const newPage = pdfDoc.addPage([595, 842]);
            y = height - margin;
          }
        } else {
          line = testLine;
        }
      }

      // Dernière ligne
      if (line.length > 0) {
        page.drawText(line, {
          x: margin,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur conversion Word vers PDF:', error);
      throw new Error('Échec de la conversion Word vers PDF');
    }
  }

  /**
   * Convertit un fichier Excel (.xlsx) en PDF
   */
  static async excelToPDF(xlsxBuffer: Buffer): Promise<Buffer> {
    try {
      // Lire le fichier Excel
      const workbook = XLSX.read(xlsxBuffer, { type: 'buffer' });
      const pdfDoc = await PDFDocument.create();

      // Traiter chaque feuille
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const page = pdfDoc.addPage([842, 595]); // A4 paysage
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 10;
        const margin = 30;
        let y = height - margin;

        // Titre de la feuille
        page.drawText(sheetName, {
          x: margin,
          y: y,
          size: 14,
          font: font,
          color: rgb(0, 0, 0),
        });
        y -= 30;

        // Dessiner les données
        for (const row of jsonData as (string | number | boolean | null)[][]) {
          if (y < margin) break;

          let x = margin;
          const rowText = row.map((cell) => String(cell || '')).join(' | ');
          const maxTextWidth = width - 2 * margin;
          
          if (font.widthOfTextAtSize(rowText, fontSize) > maxTextWidth) {
            // Tronquer si trop long
            const truncated = rowText.substring(0, 100) + '...';
            page.drawText(truncated, {
              x: x,
              y: y,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
          } else {
            page.drawText(rowText, {
              x: x,
              y: y,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
          }

          y -= fontSize * 1.5;
        }
      }

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur conversion Excel vers PDF:', error);
      throw new Error('Échec de la conversion Excel vers PDF');
    }
  }

  /**
   * Convertit un PDF simple en document Word (.docx)
   */
  static async pdfToWord(pdfBuffer: Buffer, textContent: string): Promise<Buffer> {
    try {
      // Créer un document Word
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Document converti depuis PDF',
                    bold: true,
                    size: 28,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun({ text: '' })],
              }),
              ...textContent.split('\n').map(
                (line) =>
                  new Paragraph({
                    children: [new TextRun({ text: line })],
                  })
              ),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Erreur conversion PDF vers Word:', error);
      throw new Error('Échec de la conversion PDF vers Word');
    }
  }

  /**
   * Convertit un PDF simple en Excel (.xlsx)
   */
  static async pdfToExcel(
    pdfBuffer: Buffer,
    textContent: string
  ): Promise<Buffer> {
    try {
      // Parser le contenu en lignes
      const lines = textContent.split('\n').filter((line) => line.trim());

      // Créer un workbook
      const workbook = XLSX.utils.book_new();
      const worksheetData = lines.map((line) => [line]);

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PDF Content');

      // Générer le buffer
      const buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });

      return Buffer.from(buffer);
    } catch (error) {
      console.error('Erreur conversion PDF vers Excel:', error);
      throw new Error('Échec de la conversion PDF vers Excel');
    }
  }

  /**
   * Détecte le type de document
   */
  static detectDocumentType(buffer: Buffer): string | null {
    const signature = buffer.toString('hex', 0, 4).toUpperCase();

    if (signature === '504B0304') {
      // ZIP-based (DOCX, XLSX, PPTX)
      const fileContent = buffer.toString('utf8', 0, 1000);
      if (fileContent.includes('word/')) return 'docx';
      if (fileContent.includes('xl/')) return 'xlsx';
      if (fileContent.includes('ppt/')) return 'pptx';
    }

    if (signature === '25504446') {
      return 'pdf';
    }

    if (signature.startsWith('D0CF11E0')) {
      return 'doc'; // Old Office format
    }

    return null;
  }
}
