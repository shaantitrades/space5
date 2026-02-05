/**
 * Multi Convert - Favicon Generator
 * Génération de favicons multi-tailles depuis images
 */

import sharp from 'sharp';

export interface FaviconOptions {
  sizes?: number[]; // Tailles par défaut: [16, 32, 48, 64, 128, 256]
  backgroundColor?: { r: number; g: number; b: number };
  padding?: number; // Padding en pixels
}

export interface FaviconResult {
  size: number;
  buffer: Buffer;
  format: string;
}

export class FaviconGenerator {
  /**
   * Génère un favicon en plusieurs tailles depuis une image
   */
  static async generate(
    imageBuffer: Buffer,
    options: FaviconOptions = {}
  ): Promise<FaviconResult[]> {
    const {
      sizes = [16, 32, 48, 64, 128, 256],
      backgroundColor = { r: 255, g: 255, b: 255 },
      padding = 0,
    } = options;

    try {
      const results: FaviconResult[] = [];

      for (const size of sizes) {
        // Calculer la taille avec padding
        const actualSize = size - padding * 2;

        let pipeline = sharp(imageBuffer)
          .resize(actualSize, actualSize, {
            fit: 'contain',
            background: backgroundColor,
          });

        // Ajouter le padding si nécessaire
        if (padding > 0) {
          pipeline = pipeline.extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: backgroundColor,
          });
        }

        // Convertir en PNG (meilleure qualité pour les petites tailles)
        const buffer = await pipeline.png().toBuffer();

        results.push({
          size,
          buffer,
          format: 'png',
        });
      }

      return results;
    } catch (error) {
      console.error('Erreur génération favicon:', error);
      throw new Error('Échec de la génération du favicon');
    }
  }

  /**
   * Génère un favicon.ico multi-résolution
   */
  static async generateICO(
    imageBuffer: Buffer,
    sizes: number[] = [16, 32, 48]
  ): Promise<Buffer> {
    try {
      // Générer les différentes tailles
      const favicons = await this.generate(imageBuffer, { sizes });

      // Pour l'instant, retourner la taille 32x32 comme .ico
      // Une implémentation complète nécessiterait une bibliothèque ICO
      const favicon32 = favicons.find((f) => f.size === 32);
      
      if (!favicon32) {
        throw new Error('Taille 32x32 non générée');
      }

      return favicon32.buffer;
    } catch (error) {
      console.error('Erreur génération ICO:', error);
      throw new Error('Échec de la génération du fichier .ico');
    }
  }

  /**
   * Génère un favicon SVG optimisé
   */
  static async generateSVGFavicon(
    svgBuffer: Buffer,
    backgroundColor?: string
  ): Promise<Buffer> {
    try {
      // Convertir SVG en PNG puis optimiser
      const pngBuffer = await sharp(svgBuffer)
        .resize(512, 512, { fit: 'contain' })
        .png()
        .toBuffer();

      return pngBuffer;
    } catch (error) {
      console.error('Erreur génération SVG favicon:', error);
      throw new Error('Échec de la génération du favicon SVG');
    }
  }

  /**
   * Génère un package complet de favicons
   */
  static async generateFaviconPackage(
    imageBuffer: Buffer
  ): Promise<{
    favicon16: Buffer;
    favicon32: Buffer;
    favicon48: Buffer;
    favicon180: Buffer; // Apple touch icon
    favicon192: Buffer; // Android
    favicon512: Buffer; // Android HD
  }> {
    try {
      const favicons = await this.generate(imageBuffer, {
        sizes: [16, 32, 48, 180, 192, 512],
      });

      const result = {
        favicon16: favicons.find((f) => f.size === 16)!.buffer,
        favicon32: favicons.find((f) => f.size === 32)!.buffer,
        favicon48: favicons.find((f) => f.size === 48)!.buffer,
        favicon180: favicons.find((f) => f.size === 180)!.buffer,
        favicon192: favicons.find((f) => f.size === 192)!.buffer,
        favicon512: favicons.find((f) => f.size === 512)!.buffer,
      };

      return result;
    } catch (error) {
      console.error('Erreur génération package favicon:', error);
      throw new Error('Échec de la génération du package');
    }
  }

  /**
   * Optimise une image pour favicon (contraste, netteté)
   */
  static async optimizeForFavicon(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .sharpen()
        .normalise()
        .modulate({
          brightness: 1.05,
          saturation: 1.1,
        })
        .toBuffer();
    } catch (error) {
      console.error('Erreur optimisation favicon:', error);
      throw new Error('Échec de l\'optimisation');
    }
  }

  /**
   * Ajoute un fond coloré circulaire (pour les logos transparents)
   */
  static async addCircularBackground(
    imageBuffer: Buffer,
    size: number,
    backgroundColor: { r: number; g: number; b: number }
  ): Promise<Buffer> {
    try {
      // Créer un cercle de fond
      const circle = Buffer.from(
        `<svg width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="rgb(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})" />
        </svg>`
      );

      // Créer le fond circulaire
      const background = await sharp(circle)
        .resize(size, size)
        .png()
        .toBuffer();

      // Redimensionner le logo
      const resizedLogo = await sharp(imageBuffer)
        .resize(Math.floor(size * 0.7), Math.floor(size * 0.7), {
          fit: 'inside',
        })
        .toBuffer();

      // Superposer le logo sur le fond
      return await sharp(background)
        .composite([
          {
            input: resizedLogo,
            gravity: 'center',
          },
        ])
        .png()
        .toBuffer();
    } catch (error) {
      console.error('Erreur ajout fond circulaire:', error);
      throw new Error('Échec de l\'ajout du fond');
    }
  }
}
