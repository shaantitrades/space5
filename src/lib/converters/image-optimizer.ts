/**
 * Multi Convert - Image Optimizer
 * Compression et optimisation intelligente d'images
 */

import sharp from 'sharp';

export interface OptimizationOptions {
  targetSize?: number; // Taille cible en KB
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  stripMetadata?: boolean;
  progressive?: boolean;
}

export interface OptimizationResult {
  buffer: Buffer;
  originalSize: number;
  optimizedSize: number;
  savings: number; // Pourcentage
  format: string;
}

export class ImageOptimizer {
  /**
   * Optimise une image pour réduire sa taille
   */
  static async optimize(
    imageBuffer: Buffer,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const {
      targetSize,
      quality = 85,
      format = 'webp',
      stripMetadata = true,
      progressive = true,
    } = options;

    const originalSize = imageBuffer.length;

    try {
      let pipeline = sharp(imageBuffer);

      // Supprimer les métadonnées EXIF
      if (stripMetadata) {
        pipeline = pipeline.withMetadata({
          orientation: undefined,
          exif: undefined,
          icc: undefined,
        });
      }

      // Conversion selon le format
      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({
            quality,
            effort: 6,
            smartSubsample: true,
          });
          break;
        case 'avif':
          pipeline = pipeline.avif({
            quality,
            effort: 6,
            chromaSubsampling: '4:2:0',
          });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality,
            mozjpeg: true,
            progressive,
            optimizeScans: true,
          });
          break;
        case 'png':
          pipeline = pipeline.png({
            compressionLevel: 9,
            adaptiveFiltering: true,
            progressive,
          });
          break;
      }

      let optimizedBuffer = await pipeline.toBuffer();

      // Si une taille cible est spécifiée, ajuster la qualité
      if (targetSize && optimizedBuffer.length > targetSize * 1024) {
        optimizedBuffer = await this.optimizeToTargetSize(
          imageBuffer,
          targetSize,
          format
        );
      }

      const optimizedSize = optimizedBuffer.length;
      const savings = ((1 - optimizedSize / originalSize) * 100);

      return {
        buffer: optimizedBuffer,
        originalSize,
        optimizedSize,
        savings,
        format,
      };
    } catch (error) {
      console.error('Erreur optimisation:', error);
      throw new Error('Échec de l\'optimisation');
    }
  }

  /**
   * Optimise jusqu'à atteindre une taille cible
   */
  static async optimizeToTargetSize(
    imageBuffer: Buffer,
    targetKB: number,
    format: 'webp' | 'avif' | 'jpeg' | 'png' = 'webp'
  ): Promise<Buffer> {
    let quality = 85;
    let optimized: Buffer = imageBuffer;

    // Essayer différentes qualités jusqu'à atteindre la cible
    while (quality > 10 && optimized.length > targetKB * 1024) {
      let pipeline = sharp(imageBuffer);

      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({ quality, effort: 6 });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality, effort: 6 });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, mozjpeg: true });
          break;
        case 'png':
          pipeline = pipeline.png({ compressionLevel: 9 });
          break;
      }

      optimized = await pipeline.toBuffer();
      quality -= 5;
    }

    return optimized;
  }

  /**
   * Optimise un lot d'images
   */
  static async batchOptimize(
    images: Buffer[],
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    for (let i = 0; i < images.length; i++) {
      console.log(`Optimisation image ${i + 1}/${images.length}...`);
      const result = await this.optimize(images[i], options);
      results.push(result);
    }

    // Calculer les statistiques globales
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const totalSavings = ((1 - totalOptimized / totalOriginal) * 100).toFixed(2);

    console.log(`Total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB → ${(totalOptimized / 1024 / 1024).toFixed(2)} MB (${totalSavings}% d'économie)`);

    return results;
  }

  /**
   * Convertit une image en plusieurs formats modernes
   */
  static async convertToModernFormats(
    imageBuffer: Buffer
  ): Promise<{
    webp: Buffer;
    avif: Buffer;
    jpeg: Buffer;
  }> {
    try {
      const [webp, avif, jpeg] = await Promise.all([
        sharp(imageBuffer).webp({ quality: 85, effort: 6 }).toBuffer(),
        sharp(imageBuffer).avif({ quality: 80, effort: 6 }).toBuffer(),
        sharp(imageBuffer).jpeg({ quality: 85, mozjpeg: true }).toBuffer(),
      ]);

      return { webp, avif, jpeg };
    } catch (error) {
      console.error('Erreur conversion formats modernes:', error);
      throw new Error('Échec de la conversion');
    }
  }

  /**
   * Analyse une image et recommande des optimisations
   */
  static async analyzeAndRecommend(imageBuffer: Buffer): Promise<{
    currentSize: number;
    currentFormat: string;
    recommendations: string[];
    estimatedSavings: {
      webp: number;
      avif: number;
      optimized: number;
    };
  }> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      const currentSize = imageBuffer.length;
      const currentFormat = metadata.format || 'unknown';
      const recommendations: string[] = [];

      // Tester différentes optimisations
      const [webpResult, avifResult, optimizedResult] = await Promise.all([
        this.optimize(imageBuffer, { format: 'webp', quality: 85 }),
        this.optimize(imageBuffer, { format: 'avif', quality: 80 }),
        this.optimize(imageBuffer, {
          format: currentFormat as any,
          quality: 85,
          stripMetadata: true,
        }),
      ]);

      // Générer des recommandations
      if (webpResult.savings > 20) {
        recommendations.push(
          `Conversion en WebP: ${webpResult.savings.toFixed(1)}% d'économie`
        );
      }

      if (avifResult.savings > 30) {
        recommendations.push(
          `Conversion en AVIF: ${avifResult.savings.toFixed(1)}% d'économie (meilleure)`
        );
      }

      if (currentSize > 1024 * 1024) {
        recommendations.push('Image volumineuse: compression recommandée');
      }

      if (metadata.width && metadata.width > 2000) {
        recommendations.push('Résolution élevée: redimensionnement recommandé');
      }

      return {
        currentSize,
        currentFormat,
        recommendations,
        estimatedSavings: {
          webp: webpResult.savings,
          avif: avifResult.savings,
          optimized: optimizedResult.savings,
        },
      };
    } catch (error) {
      console.error('Erreur analyse:', error);
      throw new Error('Échec de l\'analyse');
    }
  }
}
