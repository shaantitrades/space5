/**
 * Multi Convert - PDF Watermark
 * Ajout de filigranes textuels ou graphiques pour la protection et l'identification
 */

import { PDFDocument, PDFPage, rgb, StandardFonts, degrees } from 'pdf-lib';

export interface TextWatermark {
  text: string;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  opacity?: number;
  angle?: number; // Angle de rotation en degrés (0 = horizontal)
  position?: 'center' | 'diagonal' | 'top' | 'bottom' | 'custom';
  customX?: number;
  customY?: number;
  font?: 'helvetica' | 'helvetica-bold' | 'times' | 'times-bold' | 'courier';
}

export interface ImageWatermark {
  imageBuffer: Buffer;
  opacity?: number;
  scale?: number; // Facteur d'échelle (1.0 = taille normale)
  position?: 'center' | 'diagonal' | 'top' | 'bottom' | 'custom';
  customX?: number;
  customY?: number;
  angle?: number; // Angle de rotation en degrés
}

export interface WatermarkOptions {
  text?: TextWatermark;
  image?: ImageWatermark;
  applyToAllPages?: boolean; // Par défaut: toutes les pages
  pageIndices?: number[]; // Pages spécifiques à filigraner (si applyToAllPages = false)
  repeatPattern?: boolean; // Répéter le filigrane plusieurs fois (pour texte)
  repeatSpacing?: number; // Espacement pour répétition
}

export class PDFWatermark {
  /**
   * Ajoute un filigrane textuel ou graphique à un PDF
   */
  static async addWatermark(
    pdfBuffer: Buffer,
    options: WatermarkOptions
  ): Promise<Buffer> {
    try {
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Le buffer PDF est vide ou invalide');
      }

      if (!options.text && !options.image) {
        throw new Error('Un filigrane texte ou image doit être spécifié');
      }

      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      if (totalPages === 0) {
        throw new Error('Le PDF ne contient aucune page');
      }

      // Déterminer les pages à filigraner
      const pagesToWatermark = options.applyToAllPages !== false
        ? Array.from({ length: totalPages }, (_, i) => i)
        : (options.pageIndices || []).filter((idx) => idx >= 0 && idx < totalPages);

      if (pagesToWatermark.length === 0) {
        throw new Error('Aucune page valide à filigraner');
      }

      // Préparer les polices si nécessaire
      let helveticaFont: any;
      let helveticaBoldFont: any;
      let timesFont: any;
      let timesBoldFont: any;
      let courierFont: any;

      if (options.text) {
        try {
          helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
          timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
          courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
        } catch (error) {
          console.error('Erreur chargement polices:', error);
        }
      }

      // Appliquer le filigrane sur chaque page ciblée
      for (const pageIndex of pagesToWatermark) {
        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        // Filigrane texte
        if (options.text) {
          await this.addTextWatermarkToPage(
            page,
            options.text,
            width,
            height,
            helveticaFont,
            helveticaBoldFont,
            timesFont,
            timesBoldFont,
            courierFont,
            options.repeatPattern,
            options.repeatSpacing
          );
        }

        // Filigrane image
        if (options.image) {
          await this.addImageWatermark(page, options.image, width, height, pdfDoc);
        }
      }

      // Métadonnées
      pdfDoc.setProducer('Multi Convert PDF Watermark');
      pdfDoc.setCreator('Multi Convert');
      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur filigrane PDF:', error);
      throw new Error(
        error instanceof Error
          ? `Échec de l'ajout du filigrane: ${error.message}`
          : 'Échec de l\'ajout du filigrane'
      );
    }
  }

  /**
   * Ajoute un filigrane textuel à une page (méthode interne)
   */
  private static async addTextWatermarkToPage(
    page: PDFPage,
    watermark: TextWatermark,
    pageWidth: number,
    pageHeight: number,
    helveticaFont: any,
    helveticaBoldFont: any,
    timesFont: any,
    timesBoldFont: any,
    courierFont: any,
    repeatPattern?: boolean,
    repeatSpacing?: number
  ): Promise<void> {
    const fontSize = watermark.fontSize || 48;
    const color = watermark.color
      ? rgb(watermark.color.r, watermark.color.g, watermark.color.b)
      : rgb(0.7, 0.7, 0.7); // Gris par défaut
    const opacity = watermark.opacity ?? 0.3;
    const angle = watermark.angle || 0;

    // Sélectionner la police
    let font = helveticaFont;
    if (watermark.font === 'helvetica-bold') font = helveticaBoldFont;
    else if (watermark.font === 'times') font = timesFont;
    else if (watermark.font === 'times-bold') font = timesBoldFont;
    else if (watermark.font === 'courier') font = courierFont;

    // Calculer la position
    let x = pageWidth / 2;
    let y = pageHeight / 2;

    switch (watermark.position) {
      case 'top':
        x = pageWidth / 2;
        y = pageHeight - 100;
        break;
      case 'bottom':
        x = pageWidth / 2;
        y = 100;
        break;
      case 'diagonal':
        // Position diagonale avec rotation
        x = pageWidth * 0.3;
        y = pageHeight * 0.7;
        break;
      case 'custom':
        x = watermark.customX ?? x;
        y = watermark.customY ?? y;
        break;
      case 'center':
      default:
        x = pageWidth / 2;
        y = pageHeight / 2;
        break;
    }

    // Dessiner le texte du filigrane
    if (repeatPattern && repeatSpacing) {
      // Répéter le filigrane en motif
      const spacing = repeatSpacing;
      for (let offsetY = 0; offsetY < pageHeight; offsetY += spacing) {
        for (let offsetX = 0; offsetX < pageWidth; offsetX += spacing) {
          page.drawText(watermark.text, {
            x: x + offsetX - (spacing / 2),
            y: y + offsetY - (spacing / 2),
            size: fontSize,
            font: font,
            color: color,
            opacity: opacity,
            rotate: degrees(angle),
          });
        }
      }
    } else {
      // Filigrane unique
      const textWidth = font.widthOfTextAtSize(watermark.text, fontSize);
      const adjustedX = x - textWidth / 2;

      page.drawText(watermark.text, {
        x: adjustedX,
        y: y,
        size: fontSize,
        font: font,
        color: color,
        opacity: opacity,
        rotate: { angleDegrees: angle },
      });
    }
  }

  /**
   * Ajoute un filigrane image à une page
   */
  private static async addImageWatermark(
    page: PDFPage,
    watermark: ImageWatermark,
    pageWidth: number,
    pageHeight: number,
    pdfDoc: PDFDocument
  ): Promise<void> {
    try {
      const image = await pdfDoc.embedPng(watermark.imageBuffer);
      const scale = watermark.scale ?? 0.3; // 30% de la taille originale par défaut
      const opacity = watermark.opacity ?? 0.3;
      const angle = watermark.angle || 0;

      // Calculer les dimensions
      const imgWidth = image.width * scale;
      const imgHeight = image.height * scale;

      // Calculer la position
      let x = (pageWidth - imgWidth) / 2;
      let y = (pageHeight - imgHeight) / 2;

      switch (watermark.position) {
        case 'top':
          x = (pageWidth - imgWidth) / 2;
          y = pageHeight - imgHeight - 50;
          break;
        case 'bottom':
          x = (pageWidth - imgWidth) / 2;
          y = 50;
          break;
        case 'diagonal':
          x = pageWidth * 0.2;
          y = pageHeight * 0.6;
          break;
        case 'custom':
          x = watermark.customX ?? x;
          y = watermark.customY ?? y;
          break;
        case 'center':
        default:
          x = (pageWidth - imgWidth) / 2;
          y = (pageHeight - imgHeight) / 2;
          break;
      }

      // Dessiner l'image
      page.drawImage(image, {
        x: x,
        y: y,
        width: imgWidth,
        height: imgHeight,
        opacity: opacity,
        rotate: { angleDegrees: angle },
      });
    } catch (error) {
      console.error('Erreur ajout filigrane image:', error);
      // Continuer même si l'image échoue
    }
  }

  /**
   * Ajoute un filigrane texte simple
   */
  static async addTextWatermark(
    pdfBuffer: Buffer,
    text: string,
    options?: Partial<TextWatermark>
  ): Promise<Buffer> {
    return this.addWatermark(pdfBuffer, {
      text: {
        text,
        fontSize: options?.fontSize,
        color: options?.color,
        opacity: options?.opacity,
        angle: options?.angle,
        position: options?.position,
        customX: options?.customX,
        customY: options?.customY,
        font: options?.font,
      },
    });
  }

  /**
   * Ajoute un filigrane image simple
   */
  static async addImageWatermark(
    pdfBuffer: Buffer,
    imageBuffer: Buffer,
    options?: Partial<ImageWatermark>
  ): Promise<Buffer> {
    return this.addWatermark(pdfBuffer, {
      image: {
        imageBuffer,
        opacity: options?.opacity,
        scale: options?.scale,
        position: options?.position,
        customX: options?.customX,
        customY: options?.customY,
        angle: options?.angle,
      },
    });
  }
}
