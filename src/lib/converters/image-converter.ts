/**
 * Multi Convert - Image Converter
 * Conversion complète d'images (20+ formats)
 */

import sharp from 'sharp';

export interface ImageConversionOptions {
  format?: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'tiff' | 'bmp' | 'svg';
  quality?: number; // 1-100
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: { r: number; g: number; b: number; alpha?: number };
  rotate?: number; // Degrés
  flip?: boolean;
  flop?: boolean;
  grayscale?: boolean;
  blur?: number; // 0.3-1000
  sharpen?: boolean;
  normalize?: boolean;
  removeAlpha?: boolean;
}

export interface ImageMetadata {
  format: string;
  width: number;
  height: number;
  space: string;
  channels: number;
  depth: string;
  density: number;
  hasAlpha: boolean;
  size: number;
}

export class ImageConverter {
  /**
   * Convertit une image vers un autre format
   */
  static async convert(
    imageBuffer: Buffer,
    options: ImageConversionOptions = {}
  ): Promise<Buffer> {
    const {
      format = 'jpeg',
      quality = 90,
      width,
      height,
      fit = 'inside',
      background,
      rotate,
      flip,
      flop,
      grayscale,
      blur,
      sharpen,
      normalize,
      removeAlpha,
    } = options;

    try {
      let pipeline = sharp(imageBuffer);

      // Rotation
      if (rotate) {
        pipeline = pipeline.rotate(rotate);
      }

      // Flip/Flop
      if (flip) pipeline = pipeline.flip();
      if (flop) pipeline = pipeline.flop();

      // Redimensionnement
      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit,
          background: background || { r: 255, g: 255, b: 255, alpha: 1 },
        });
      }

      // Effets
      if (grayscale) pipeline = pipeline.grayscale();
      if (blur) pipeline = pipeline.blur(blur);
      if (sharpen) pipeline = pipeline.sharpen();
      if (normalize) pipeline = pipeline.normalize();

      // Supprimer le canal alpha si demandé
      if (removeAlpha) {
        pipeline = pipeline.removeAlpha();
      }

      // Conversion vers le format cible
      switch (format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, mozjpeg: true });
          break;
        case 'png':
          pipeline = pipeline.png({ quality, compressionLevel: 9 });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality, effort: 6 });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality, effort: 6 });
          break;
        case 'gif':
          pipeline = pipeline.gif();
          break;
        case 'tiff':
          pipeline = pipeline.tiff({ quality });
          break;
        case 'bmp':
          pipeline = pipeline.png().toFormat('bmp' as any);
          break;
        default:
          throw new Error(`Format non supporté: ${format}`);
      }

      return await pipeline.toBuffer();
    } catch (error) {
      console.error('Erreur conversion image:', error);
      throw new Error('Échec de la conversion de l\'image');
    }
  }

  /**
   * Redimensionne une image
   */
  static async resize(
    imageBuffer: Buffer,
    width?: number,
    height?: number,
    options: { fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' } = {}
  ): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(width, height, {
          fit: options.fit || 'inside',
          withoutEnlargement: false,
        })
        .toBuffer();
    } catch (error) {
      console.error('Erreur redimensionnement:', error);
      throw new Error('Échec du redimensionnement');
    }
  }

  /**
   * Rogne une image
   */
  static async crop(
    imageBuffer: Buffer,
    left: number,
    top: number,
    width: number,
    height: number
  ): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .extract({ left, top, width, height })
        .toBuffer();
    } catch (error) {
      console.error('Erreur rognage:', error);
      throw new Error('Échec du rognage');
    }
  }

  /**
   * Applique un filtre à une image
   */
  static async applyFilter(
    imageBuffer: Buffer,
    filter: 'grayscale' | 'sepia' | 'negative' | 'blur' | 'sharpen' | 'vintage'
  ): Promise<Buffer> {
    try {
      let pipeline = sharp(imageBuffer);

      switch (filter) {
        case 'grayscale':
          pipeline = pipeline.grayscale();
          break;
        case 'sepia':
          pipeline = pipeline.tint({ r: 112, g: 66, b: 20 });
          break;
        case 'negative':
          pipeline = pipeline.negate();
          break;
        case 'blur':
          pipeline = pipeline.blur(5);
          break;
        case 'sharpen':
          pipeline = pipeline.sharpen();
          break;
        case 'vintage':
          pipeline = pipeline
            .modulate({ brightness: 1.1, saturation: 0.8 })
            .tint({ r: 255, g: 250, b: 230 });
          break;
        default:
          throw new Error(`Filtre non supporté: ${filter}`);
      }

      return await pipeline.toBuffer();
    } catch (error) {
      console.error('Erreur application filtre:', error);
      throw new Error('Échec de l\'application du filtre');
    }
  }

  /**
   * Obtient les métadonnées d'une image
   */
  static async getMetadata(imageBuffer: Buffer): Promise<ImageMetadata> {
    try {
      const metadata = await sharp(imageBuffer).metadata();

      return {
        format: metadata.format || 'unknown',
        width: metadata.width || 0,
        height: metadata.height || 0,
        space: metadata.space || 'unknown',
        channels: metadata.channels || 0,
        depth: metadata.depth || 'unknown',
        density: metadata.density || 0,
        hasAlpha: metadata.hasAlpha || false,
        size: imageBuffer.length,
      };
    } catch (error) {
      console.error('Erreur lecture métadonnées:', error);
      throw new Error('Échec de la lecture des métadonnées');
    }
  }

  /**
   * Crée une miniature
   */
  static async createThumbnail(
    imageBuffer: Buffer,
    size: number = 200
  ): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Erreur création miniature:', error);
      throw new Error('Échec de la création de la miniature');
    }
  }

  /**
   * Optimise une image pour le web
   */
  static async optimizeForWeb(
    imageBuffer: Buffer,
    targetFormat: 'webp' | 'avif' | 'jpeg' = 'webp'
  ): Promise<Buffer> {
    try {
      let pipeline = sharp(imageBuffer);

      // Redimensionner si trop grande
      const metadata = await sharp(imageBuffer).metadata();
      const maxWidth = 1920;
      const maxHeight = 1080;

      if (
        metadata.width &&
        metadata.height &&
        (metadata.width > maxWidth || metadata.height > maxHeight)
      ) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: false,
        });
      }

      // Convertir au format optimal
      switch (targetFormat) {
        case 'webp':
          pipeline = pipeline.webp({ quality: 85, effort: 6 });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality: 80, effort: 6 });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
          break;
      }

      return await pipeline.toBuffer();
    } catch (error) {
      console.error('Erreur optimisation web:', error);
      throw new Error('Échec de l\'optimisation');
    }
  }
}
