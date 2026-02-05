/**
 * Multi Convert - PDF Transform
 * Rotation et recadrage de pages PDF
 */

import { PDFDocument, degrees } from 'pdf-lib';

export type RotationAngle = 90 | 180 | 270 | -90 | -180 | -270;

export interface RotationOptions {
  pageIndices?: number[]; // Pages spécifiques (par défaut: toutes)
  angle: RotationAngle; // Angle de rotation en degrés
}

export interface CropOptions {
  pageIndex?: number; // Page spécifique (par défaut: toutes)
  x: number; // Position X du coin supérieur gauche
  y: number; // Position Y du coin supérieur gauche
  width: number; // Largeur de la zone à conserver
  height: number; // Hauteur de la zone à conserver
}

export interface TransformOptions {
  rotation?: RotationOptions;
  crop?: CropOptions;
}

export class PDFTransform {
  /**
   * Transforme un PDF avec rotation et/ou recadrage
   */
  static async transform(
    pdfBuffer: Buffer,
    options: TransformOptions
  ): Promise<Buffer> {
    try {
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Le buffer PDF est vide ou invalide');
      }

      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      if (totalPages === 0) {
        throw new Error('Le PDF ne contient aucune page');
      }

      // Appliquer la rotation si spécifiée
      if (options.rotation) {
        await this.applyRotation(pages, options.rotation, totalPages);
      }

      // Appliquer le recadrage si spécifié
      if (options.crop) {
        await this.applyCrop(pages, options.crop, totalPages);
      }

      // Métadonnées
      pdfDoc.setProducer('Multi Convert PDF Transform');
      pdfDoc.setCreator('Multi Convert');
      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur transformation PDF:', error);
      throw new Error(
        error instanceof Error
          ? `Échec de la transformation: ${error.message}`
          : 'Échec de la transformation'
      );
    }
  }

  /**
   * Applique une rotation aux pages spécifiées
   */
  private static async applyRotation(
    pages: any[],
    rotation: RotationOptions,
    totalPages: number
  ): Promise<void> {
    const targetPages = rotation.pageIndices 
      ? rotation.pageIndices.filter((idx) => idx >= 0 && idx < totalPages)
      : Array.from({ length: totalPages }, (_, i) => i);

    const angleDegrees = degrees(rotation.angle);

    for (const pageIndex of targetPages) {
      try {
        const page = pages[pageIndex];
        page.setRotation(angleDegrees);
      } catch (error) {
        console.error(`Erreur rotation page ${pageIndex}:`, error);
        // Continuer avec les autres pages
      }
    }
  }

  /**
   * Applique un recadrage aux pages spécifiées
   */
  private static async applyCrop(
    pages: any[],
    crop: CropOptions,
    totalPages: number
  ): Promise<void> {
    const targetPageIndex = crop.pageIndex;
    
    // Si pageIndex est spécifié, recadrer uniquement cette page
    // Sinon, recadrer toutes les pages
    const pagesToCrop = targetPageIndex !== undefined
      ? (targetPageIndex >= 0 && targetPageIndex < totalPages ? [targetPageIndex] : [])
      : Array.from({ length: totalPages }, (_, i) => i);

    if (pagesToCrop.length === 0) {
      throw new Error('Aucune page valide à recadrer');
    }

    // Valider les paramètres de recadrage
    if (crop.width <= 0 || crop.height <= 0) {
      throw new Error('La largeur et la hauteur doivent être positives');
    }

    for (const pageIndex of pagesToCrop) {
      try {
        const page = pages[pageIndex];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Valider que la zone de recadrage est dans les limites de la page
        const cropX = Math.max(0, Math.min(crop.x, pageWidth));
        const cropY = Math.max(0, Math.min(crop.y, pageHeight));
        const cropWidth = Math.min(crop.width, pageWidth - cropX);
        const cropHeight = Math.min(crop.height, pageHeight - cropY);

        if (cropWidth <= 0 || cropHeight <= 0) {
          console.warn(
            `Zone de recadrage invalide pour la page ${pageIndex}, ignorée`
          );
          continue;
        }

        // Définir la zone de recadrage (crop box)
        // Note: Dans pdf-lib, setCropBox définit la zone visible
        // Le système de coordonnées a y=0 en bas, donc on doit ajuster
        const adjustedY = pageHeight - cropY - cropHeight;

        page.setCropBox(cropX, adjustedY, cropWidth, cropHeight);
      } catch (error) {
        console.error(`Erreur recadrage page ${pageIndex}:`, error);
        // Continuer avec les autres pages
      }
    }
  }

  /**
   * Fait pivoter des pages spécifiques
   */
  static async rotatePages(
    pdfBuffer: Buffer,
    angle: RotationAngle,
    pageIndices?: number[]
  ): Promise<Buffer> {
    return this.transform(pdfBuffer, {
      rotation: {
        angle,
        pageIndices,
      },
    });
  }

  /**
   * Fait pivoter toutes les pages
   */
  static async rotateAllPages(
    pdfBuffer: Buffer,
    angle: RotationAngle
  ): Promise<Buffer> {
    return this.rotatePages(pdfBuffer, angle);
  }

  /**
   * Fait pivoter une page spécifique
   */
  static async rotatePage(
    pdfBuffer: Buffer,
    pageIndex: number,
    angle: RotationAngle
  ): Promise<Buffer> {
    return this.rotatePages(pdfBuffer, angle, [pageIndex]);
  }

  /**
   * Recadre des pages selon les dimensions spécifiées
   */
  static async cropPages(
    pdfBuffer: Buffer,
    x: number,
    y: number,
    width: number,
    height: number,
    pageIndex?: number
  ): Promise<Buffer> {
    return this.transform(pdfBuffer, {
      crop: {
        pageIndex,
        x,
        y,
        width,
        height,
      },
    });
  }

  /**
   * Recadre toutes les pages
   */
  static async cropAllPages(
    pdfBuffer: Buffer,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<Buffer> {
    return this.cropPages(pdfBuffer, x, y, width, height);
  }

  /**
   * Recadre une page spécifique
   */
  static async cropPage(
    pdfBuffer: Buffer,
    pageIndex: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<Buffer> {
    return this.cropPages(pdfBuffer, x, y, width, height, pageIndex);
  }
}
