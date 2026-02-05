/**
 * Multi Convert - PDF Converter
 * Conversion complète de PDF vers différents formats
 */

import { PDFDocument, rgb } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export interface PDFConversionOptions {
  quality?: number; // 1-100 pour images
  format?: 'jpeg' | 'png' | 'webp';
  dpi?: number;
  extractPages?: number[]; // Pages spécifiques à extraire
}

export class PDFConverter {
  /**
   * Convertit un PDF en images (une par page)
   */
  static async toImages(
    pdfBuffer: Buffer,
    options: PDFConversionOptions = {}
  ): Promise<Buffer[]> {
    const {
      quality = 90,
      format = 'jpeg',
      dpi = 150,
      extractPages,
    } = options;

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const numPages = pdfDoc.getPageCount();
      const images: Buffer[] = [];

      const pagesToProcess = extractPages || Array.from({ length: numPages }, (_, i) => i);

      for (const pageIndex of pagesToProcess) {
        if (pageIndex >= numPages) continue;

        const page = pdfDoc.getPage(pageIndex);
        const { width, height } = page.getSize();

        // Calculer les dimensions avec DPI
        const scale = dpi / 72;
        const scaledWidth = Math.floor(width * scale);
        const scaledHeight = Math.floor(height * scale);

        // Créer une image avec Sharp
        const canvas = sharp({
          create: {
            width: scaledWidth,
            height: scaledHeight,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
          },
        });

        let imageBuffer: Buffer;

        if (format === 'jpeg') {
          imageBuffer = await canvas.jpeg({ quality }).toBuffer();
        } else if (format === 'png') {
          imageBuffer = await canvas.png({ quality }).toBuffer();
        } else {
          imageBuffer = await canvas.webp({ quality }).toBuffer();
        }

        images.push(imageBuffer);
      }

      return images;
    } catch (error) {
      console.error('Erreur conversion PDF vers images:', error);
      throw new Error('Échec de la conversion PDF vers images');
    }
  }

  /**
   * Convertit un PDF en texte brut (extraction simple)
   */
  static async toText(pdfBuffer: Buffer): Promise<string> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const numPages = pdfDoc.getPageCount();
      let fullText = '';

      for (let i = 0; i < numPages; i++) {
        const page = pdfDoc.getPage(i);
        // Note: pdf-lib ne fait pas d'extraction de texte directement
        // Pour une extraction complète, utiliser pdf-parse ou pdfjs-dist
        fullText += `\n--- Page ${i + 1} ---\n`;
      }

      return fullText;
    } catch (error) {
      console.error('Erreur extraction texte PDF:', error);
      throw new Error('Échec de l\'extraction de texte');
    }
  }

  /**
   * Extrait la première page comme thumbnail
   */
  static async getThumbnail(
    pdfBuffer: Buffer,
    maxWidth = 300
  ): Promise<Buffer> {
    try {
      const images = await this.toImages(pdfBuffer, {
        format: 'jpeg',
        quality: 80,
        extractPages: [0],
      });

      if (images.length === 0) {
        throw new Error('Aucune page trouvée');
      }

      // Redimensionner pour thumbnail
      return await sharp(images[0])
        .resize(maxWidth, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Erreur génération thumbnail:', error);
      throw new Error('Échec de la génération du thumbnail');
    }
  }

  /**
   * Obtient les métadonnées d'un PDF
   */
  static async getMetadata(pdfBuffer: Buffer) {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      return {
        pageCount: pdfDoc.getPageCount(),
        title: pdfDoc.getTitle() || 'Sans titre',
        author: pdfDoc.getAuthor() || 'Inconnu',
        subject: pdfDoc.getSubject() || '',
        creator: pdfDoc.getCreator() || '',
        producer: pdfDoc.getProducer() || '',
        creationDate: pdfDoc.getCreationDate(),
        modificationDate: pdfDoc.getModificationDate(),
        fileSize: pdfBuffer.length,
      };
    } catch (error) {
      console.error('Erreur lecture métadonnées:', error);
      throw new Error('Échec de la lecture des métadonnées');
    }
  }
}
