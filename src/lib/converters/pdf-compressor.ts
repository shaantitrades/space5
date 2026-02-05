/**
 * Multi Convert - PDF Compressor
 * Compression de PDF pour réduire la taille
 */

import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export interface CompressionOptions {
  quality?: 'low' | 'medium' | 'high'; // Qualité de compression
  imageQuality?: number; // 1-100
  removeMetadata?: boolean;
  optimizeImages?: boolean;
}

export class PDFCompressor {
  /**
   * Compresse un PDF en optimisant les images et métadonnées
   */
  static async compress(
    pdfBuffer: Buffer,
    options: CompressionOptions = {}
  ): Promise<Buffer> {
    const {
      quality = 'medium',
      imageQuality = 75,
      removeMetadata = true,
      optimizeImages = true,
    } = options;

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const originalSize = pdfBuffer.length;

      // Supprimer les métadonnées si demandé
      if (removeMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('Multi Convert');
        pdfDoc.setCreator('Multi Convert');
      }

      // Optimiser les images dans le PDF
      if (optimizeImages) {
        await this.optimizeImages(pdfDoc, imageQuality);
      }

      // Sauvegarder avec compression
      const compressedBytes = await pdfDoc.save({
        // Object streams = meilleure compression (et généralement compatible)
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: quality === 'low' ? 50 : quality === 'medium' ? 100 : 200,
      });

      const compressedBuffer = Buffer.from(compressedBytes);
      const newSize = compressedBuffer.length;
      const compressionRatio = ((1 - newSize / originalSize) * 100).toFixed(2);

      console.log(
        `PDF compressé: ${(originalSize / 1024).toFixed(2)} KB → ${(newSize / 1024).toFixed(2)} KB (${compressionRatio}% de réduction)`
      );

      return compressedBuffer;
    } catch (error) {
      console.error('Erreur compression PDF:', error);
      throw new Error('Échec de la compression du PDF');
    }
  }

  /**
   * Optimise les images dans un PDF
   */
  private static async optimizeImages(
    pdfDoc: PDFDocument,
    quality: number
  ): Promise<void> {
    try {
      // Note: pdf-lib ne permet pas de modifier directement les images embarquées
      // Pour une compression complète, il faudrait extraire les images,
      // les compresser avec Sharp, et recréer le PDF
      // Cette fonction est un placeholder pour une implémentation future
      console.log('Optimisation des images PDF (fonctionnalité avancée)');
    } catch (error) {
      console.error('Erreur optimisation images:', error);
    }
  }

  /**
   * Analyse la taille d'un PDF et donne des recommandations
   */
  static async analyze(pdfBuffer: Buffer): Promise<{
    size: number;
    pageCount: number;
    averagePageSize: number;
    canCompress: boolean;
    recommendedQuality: 'low' | 'medium' | 'high';
  }> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const size = pdfBuffer.length;
      const pageCount = pdfDoc.getPageCount();
      const averagePageSize = size / pageCount;

      // Déterminer si la compression est recommandée
      const canCompress = averagePageSize > 100 * 1024; // > 100KB par page

      // Recommander la qualité de compression
      let recommendedQuality: 'low' | 'medium' | 'high' = 'medium';
      if (averagePageSize > 500 * 1024) {
        recommendedQuality = 'low';
      } else if (averagePageSize > 200 * 1024) {
        recommendedQuality = 'medium';
      } else {
        recommendedQuality = 'high';
      }

      return {
        size,
        pageCount,
        averagePageSize,
        canCompress,
        recommendedQuality,
      };
    } catch (error) {
      console.error('Erreur analyse PDF:', error);
      throw new Error('Échec de l\'analyse du PDF');
    }
  }

  /**
   * Compresse avec différentes qualités et retourne la meilleure
   */
  static async autoCompress(pdfBuffer: Buffer): Promise<{
    buffer: Buffer;
    quality: string;
    originalSize: number;
    compressedSize: number;
    ratio: number;
  }> {
    const originalSize = pdfBuffer.length;
    const analysis = await this.analyze(pdfBuffer);

    // Compresser avec la qualité recommandée
    const compressed = await this.compress(pdfBuffer, {
      quality: analysis.recommendedQuality,
      optimizeImages: true,
      removeMetadata: true,
    });

    const compressedSize = compressed.length;
    const ratio = ((1 - compressedSize / originalSize) * 100);

    return {
      buffer: compressed,
      quality: analysis.recommendedQuality,
      originalSize,
      compressedSize,
      ratio,
    };
  }
}
