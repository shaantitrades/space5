/**
 * Multi Convert - PDF Editor
 * Modification et annotation de PDF avec texte, images, formes et dessins
 */

import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';

export interface TextAnnotation {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  font?: string;
  pageIndex?: number;
}

export interface ImageAnnotation {
  imageBuffer: Buffer;
  x: number;
  y: number;
  width?: number;
  height?: number;
  pageIndex?: number;
}

export interface ShapeAnnotation {
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: { r: number; g: number; b: number };
  strokeWidth?: number;
  fill?: boolean;
  pageIndex?: number;
}

export interface HighlightAnnotation {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: { r: number; g: number; b: number };
}

export interface EditOptions {
  textAnnotations?: TextAnnotation[];
  imageAnnotations?: ImageAnnotation[];
  shapeAnnotations?: ShapeAnnotation[];
  highlightAnnotations?: HighlightAnnotation[];
  pageIndex?: number; // Pour cibler une page spécifique
}

export class PDFEditor {
  /**
   * Édite un PDF en ajoutant des annotations textuelles, visuelles et des formes
   */
  static async edit(
    pdfBuffer: Buffer,
    options: EditOptions = {}
  ): Promise<Buffer> {
    try {
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Le buffer PDF est vide ou invalide');
      }

      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Traiter les annotations textuelles
      if (options.textAnnotations && options.textAnnotations.length > 0) {
        for (const annotation of options.textAnnotations) {
          const targetPageIndex = (annotation.pageIndex !== undefined ? annotation.pageIndex : options.pageIndex) ?? 0;
          if (targetPageIndex >= 0 && targetPageIndex < pages.length) {
            const page = pages[targetPageIndex];
            const { width, height } = page.getSize();
            
            // Convertir coordonnées si nécessaire (y peut être inversé)
            const yPos = height - (annotation.y || 50);
            const xPos = annotation.x || 50;
            
            const fontSize = annotation.fontSize || 12;
            const color = annotation.color 
              ? rgb(annotation.color.r, annotation.color.g, annotation.color.b)
              : rgb(0, 0, 0);

            const font = annotation.font === 'bold' ? helveticaBold : helveticaFont;

            page.drawText(annotation.text, {
              x: Math.max(0, Math.min(xPos, width - 50)),
              y: Math.max(0, Math.min(yPos, height - 20)),
              size: fontSize,
              font: font,
              color: color,
            });
          }
        }
      }

      // Traiter les annotations d'images
      if (options.imageAnnotations && options.imageAnnotations.length > 0) {
        for (const annotation of options.imageAnnotations) {
          const targetPageIndex = annotation.pageIndex ?? options.pageIndex ?? 0;
          if (targetPageIndex >= 0 && targetPageIndex < pages.length) {
            try {
              const image = await pdfDoc.embedPng(annotation.imageBuffer);
              const page = pages[targetPageIndex];
              const { width, height } = page.getSize();
              
              const imgWidth = annotation.width || image.width * 0.5;
              const imgHeight = annotation.height || image.height * 0.5;
              
              page.drawImage(image, {
                x: Math.max(0, Math.min(annotation.x, width - imgWidth)),
                y: Math.max(0, Math.min(annotation.y, height - imgHeight)),
                width: imgWidth,
                height: imgHeight,
              });
            } catch (error) {
              console.error('Erreur lors de l\'ajout d\'une image:', error);
              // Continuer avec les autres annotations
            }
          }
        }
      }

      // Traiter les annotations de formes
      if (options.shapeAnnotations && options.shapeAnnotations.length > 0) {
        for (const annotation of options.shapeAnnotations) {
          const targetPageIndex = annotation.pageIndex ?? options.pageIndex ?? 0;
          if (targetPageIndex >= 0 && targetPageIndex < pages.length) {
            const page = pages[targetPageIndex];
            const color = annotation.color
              ? rgb(annotation.color.r, annotation.color.g, annotation.color.b)
              : rgb(0, 0, 0);
            
            const strokeWidth = annotation.strokeWidth || 2;

            switch (annotation.type) {
              case 'rectangle':
                if (annotation.width && annotation.height) {
                  page.drawRectangle({
                    x: annotation.x,
                    y: annotation.y,
                    width: annotation.width,
                    height: annotation.height,
                    borderColor: color,
                    borderWidth: strokeWidth,
                    color: annotation.fill ? color : undefined,
                  });
                }
                break;

              case 'circle':
                if (annotation.width) {
                  const radius = annotation.width / 2;
                  page.drawCircle({
                    x: annotation.x + radius,
                    y: annotation.y + radius,
                    size: radius,
                    borderColor: color,
                    borderWidth: strokeWidth,
                    color: annotation.fill ? color : undefined,
                  });
                }
                break;

              case 'line':
                if (annotation.width !== undefined) {
                  page.drawLine({
                    start: { x: annotation.x, y: annotation.y },
                    end: { x: annotation.x + annotation.width, y: annotation.y },
                    thickness: strokeWidth,
                    color: color,
                  });
                }
                break;
            }
          }
        }
      }

      // Traiter les surlignages
      if (options.highlightAnnotations && options.highlightAnnotations.length > 0) {
        for (const annotation of options.highlightAnnotations) {
          if (annotation.pageIndex >= 0 && annotation.pageIndex < pages.length) {
            const page = pages[annotation.pageIndex];
            const color = annotation.color
              ? rgb(annotation.color.r, annotation.color.g, annotation.color.b)
              : rgb(1, 1, 0); // Jaune par défaut

            page.drawRectangle({
              x: annotation.x,
              y: annotation.y,
              width: annotation.width,
              height: annotation.height,
              color: color,
              opacity: 0.3,
            });
          }
        }
      }

      // Métadonnées
      pdfDoc.setProducer('Multi Convert PDF Editor');
      pdfDoc.setCreator('Multi Convert');
      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur édition PDF:', error);
      throw new Error(
        error instanceof Error 
          ? `Échec de l'édition du PDF: ${error.message}`
          : 'Échec de l\'édition du PDF'
      );
    }
  }

  /**
   * Ajoute du texte à un PDF
   */
  static async addText(
    pdfBuffer: Buffer,
    text: string,
    x: number = 50,
    y: number = 50,
    pageIndex: number = 0,
    options?: { fontSize?: number; color?: { r: number; g: number; b: number } }
  ): Promise<Buffer> {
    return this.edit(pdfBuffer, {
      textAnnotations: [{
        text,
        x,
        y,
        fontSize: options?.fontSize,
        color: options?.color,
      }],
      pageIndex,
    });
  }

  /**
   * Ajoute une image à un PDF
   */
  static async addImage(
    pdfBuffer: Buffer,
    imageBuffer: Buffer,
    x: number = 50,
    y: number = 50,
    pageIndex: number = 0,
    options?: { width?: number; height?: number }
  ): Promise<Buffer> {
    return this.edit(pdfBuffer, {
      imageAnnotations: [{
        imageBuffer,
        x,
        y,
        width: options?.width,
        height: options?.height,
        pageIndex,
      }],
      pageIndex,
    });
  }
}
