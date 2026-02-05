/**
 * Multi Convert - Image Watermark & Batch Processing
 * Ajout de filigranes et traitement par lots
 */

import sharp from 'sharp';
import { ImageConverter } from './image-converter';

export interface WatermarkOptions {
  text?: string;
  image?: Buffer;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity?: number; // 0-1
  fontSize?: number;
  color?: string;
  rotation?: number;
}

export interface BatchProcessOptions {
  resize?: { width?: number; height?: number };
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  watermark?: WatermarkOptions;
  prefix?: string;
  suffix?: string;
}

export class ImageBatchProcessor {
  /**
   * Ajoute un filigrane textuel à une image
   */
  static async addTextWatermark(
    imageBuffer: Buffer,
    options: WatermarkOptions
  ): Promise<Buffer> {
    const {
      text = 'Multi Convert',
      position = 'bottom-right',
      opacity = 0.5,
      fontSize = 48,
      color = 'white',
    } = options;

    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const width = metadata.width || 800;
      const height = metadata.height || 600;

      // Créer un SVG pour le texte
      const textSVG = this.createTextSVG(
        text,
        fontSize,
        color,
        opacity,
        width,
        height,
        position
      );

      // Superposer le texte sur l'image
      return await image
        .composite([
          {
            input: Buffer.from(textSVG),
            gravity: this.positionToGravity(position),
          },
        ])
        .toBuffer();
    } catch (error) {
      console.error('Erreur ajout filigrane texte:', error);
      throw new Error('Échec de l\'ajout du filigrane');
    }
  }

  /**
   * Ajoute un filigrane image
   */
  static async addImageWatermark(
    imageBuffer: Buffer,
    watermarkBuffer: Buffer,
    options: WatermarkOptions = {}
  ): Promise<Buffer> {
    const { position = 'bottom-right', opacity = 0.5 } = options;

    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const width = metadata.width || 800;

      // Redimensionner le filigrane (20% de la largeur de l'image)
      const watermarkSize = Math.floor(width * 0.2);
      const resizedWatermark = await sharp(watermarkBuffer)
        .resize(watermarkSize, watermarkSize, { fit: 'inside' })
        .toBuffer();

      // Appliquer l'opacité
      const watermarkWithOpacity = await sharp(resizedWatermark)
        .composite([
          {
            input: await sharp({
              create: {
                width: watermarkSize,
                height: watermarkSize,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: opacity },
              },
            }).toBuffer(),
            blend: 'dest-in',
          },
        ])
        .toBuffer();

      // Superposer sur l'image
      return await image
        .composite([
          {
            input: watermarkWithOpacity,
            gravity: this.positionToGravity(position),
          },
        ])
        .toBuffer();
    } catch (error) {
      console.error('Erreur ajout filigrane image:', error);
      throw new Error('Échec de l\'ajout du filigrane');
    }
  }

  /**
   * Traite un lot d'images avec les mêmes opérations
   */
  static async batchProcess(
    images: Array<{ buffer: Buffer; name: string }>,
    options: BatchProcessOptions
  ): Promise<
    Array<{
      buffer: Buffer;
      name: string;
      originalSize: number;
      newSize: number;
    }>
  > {
    const results = [];

    for (let i = 0; i < images.length; i++) {
      const { buffer, name } = images[i];
      const originalSize = buffer.length;

      console.log(`Traitement ${i + 1}/${images.length}: ${name}...`);

      try {
        let processedBuffer = buffer;

        // Redimensionnement
        if (options.resize) {
          processedBuffer = await ImageConverter.resize(
            processedBuffer,
            options.resize.width,
            options.resize.height
          );
        }

        // Filigrane
        if (options.watermark) {
          processedBuffer = await this.addTextWatermark(
            processedBuffer,
            options.watermark
          );
        }

        // Conversion de format
        if (options.format) {
          processedBuffer = await ImageConverter.convert(processedBuffer, {
            format: options.format,
            quality: options.quality || 85,
          });
        }

        // Nouveau nom
        const ext = options.format || name.split('.').pop() || 'jpg';
        const baseName = name.replace(/\.[^.]+$/, '');
        const newName = `${options.prefix || ''}${baseName}${options.suffix || ''}.${ext}`;

        results.push({
          buffer: processedBuffer,
          name: newName,
          originalSize,
          newSize: processedBuffer.length,
        });
      } catch (error) {
        console.error(`Erreur traitement ${name}:`, error);
      }
    }

    return results;
  }

  /**
   * Crée une mosaïque d'images
   */
  static async createCollage(
    images: Buffer[],
    columns: number = 3,
    spacing: number = 10
  ): Promise<Buffer> {
    try {
      if (images.length === 0) {
        throw new Error('Aucune image fournie');
      }

      // Obtenir les dimensions de la première image (référence)
      const firstMeta = await sharp(images[0]).metadata();
      const imageWidth = firstMeta.width || 300;
      const imageHeight = firstMeta.height || 300;

      // Calculer les dimensions de la mosaïque
      const rows = Math.ceil(images.length / columns);
      const collageWidth = columns * imageWidth + (columns + 1) * spacing;
      const collageHeight = rows * imageHeight + (rows + 1) * spacing;

      // Créer le fond blanc
      let collage = sharp({
        create: {
          width: collageWidth,
          height: collageHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      });

      // Préparer les images pour la composition
      const composites = await Promise.all(
        images.map(async (img, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;

          const resized = await sharp(img)
            .resize(imageWidth, imageHeight, { fit: 'cover' })
            .toBuffer();

          return {
            input: resized,
            left: col * imageWidth + (col + 1) * spacing,
            top: row * imageHeight + (row + 1) * spacing,
          };
        })
      );

      // Créer la mosaïque
      return await collage.composite(composites).jpeg({ quality: 90 }).toBuffer();
    } catch (error) {
      console.error('Erreur création mosaïque:', error);
      throw new Error('Échec de la création de la mosaïque');
    }
  }

  /**
   * Crée un SVG pour le texte du filigrane
   */
  private static createTextSVG(
    text: string,
    fontSize: number,
    color: string,
    opacity: number,
    imageWidth: number,
    imageHeight: number,
    position: string
  ): string {
    const padding = 20;
    let x = padding;
    let y = padding + fontSize;

    // Positionner selon l'option
    if (position.includes('right')) {
      x = imageWidth - padding;
    }
    if (position.includes('bottom')) {
      y = imageHeight - padding;
    }
    if (position === 'center') {
      x = imageWidth / 2;
      y = imageHeight / 2;
    }

    const anchor = position.includes('right')
      ? 'end'
      : position === 'center'
      ? 'middle'
      : 'start';

    return `
      <svg width="${imageWidth}" height="${imageHeight}">
        <text
          x="${x}"
          y="${y}"
          font-family="Arial"
          font-size="${fontSize}"
          font-weight="bold"
          fill="${color}"
          opacity="${opacity}"
          text-anchor="${anchor}"
        >${text}</text>
      </svg>
    `;
  }

  /**
   * Convertit une position en gravité Sharp
   */
  private static positionToGravity(
    position: string
  ): 'center' | 'north' | 'northeast' | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' {
    switch (position) {
      case 'center':
        return 'center';
      case 'top-left':
        return 'northwest';
      case 'top-right':
        return 'northeast';
      case 'bottom-left':
        return 'southwest';
      case 'bottom-right':
        return 'southeast';
      default:
        return 'southeast';
    }
  }
}
