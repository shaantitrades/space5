/**
 * Multi Convert - OCR Engine
 * Reconnaissance optique de caractères pour PDF et images
 */

import { createWorker, PSM, OEM } from 'tesseract.js';

export interface OCROptions {
  language?: string; // 'fra', 'eng', 'ara', etc.
  psm?: PSM; // Page Segmentation Mode
  oem?: OEM; // OCR Engine Mode
  preserveLayout?: boolean;
}

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
  lines: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

export class OCREngine {
  private static workers: Map<string, any> = new Map();

  /**
   * Initialise un worker Tesseract pour une langue
   */
  private static async getWorker(language: string = 'fra') {
    const key = `worker_${language}`;

    if (!this.workers.has(key)) {
      console.log(`Initialisation OCR pour ${language}...`);
      const worker = await createWorker(language, OEM.LSTM_ONLY, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR en cours: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      this.workers.set(key, worker);
    }

    return this.workers.get(key);
  }

  /**
   * Effectue l'OCR sur une image
   */
  static async recognize(
    imageBuffer: Buffer,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    const {
      language = 'fra',
      psm = PSM.AUTO,
      oem = OEM.LSTM_ONLY,
      preserveLayout = true,
    } = options;

    try {
      const worker = await this.getWorker(language);

      // Configurer le PSM
      await worker.setParameters({
        tessedit_pageseg_mode: psm,
        preserve_interword_spaces: preserveLayout ? '1' : '0',
      });

      // Effectuer la reconnaissance
      const { data } = await worker.recognize(imageBuffer);

      return {
        text: data.text,
        confidence: data.confidence,
        words: data.words.map((word: any) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox,
        })),
        lines: data.lines.map((line: any) => ({
          text: line.text,
          confidence: line.confidence,
          bbox: line.bbox,
        })),
      };
    } catch (error) {
      console.error('Erreur OCR:', error);
      throw new Error('Échec de la reconnaissance de texte');
    }
  }

  /**
   * Effectue l'OCR sur plusieurs images (batch)
   */
  static async recognizeBatch(
    imageBuffers: Buffer[],
    options: OCROptions = {}
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (let i = 0; i < imageBuffers.length; i++) {
      console.log(`OCR page ${i + 1}/${imageBuffers.length}...`);
      const result = await this.recognize(imageBuffers[i], options);
      results.push(result);
    }

    return results;
  }

  /**
   * Convertit un PDF scanné en texte via OCR
   */
  static async pdfToText(
    pdfImageBuffers: Buffer[],
    options: OCROptions = {}
  ): Promise<string> {
    const results = await this.recognizeBatch(pdfImageBuffers, options);
    return results.map((r, i) => `--- Page ${i + 1} ---\n${r.text}`).join('\n\n');
  }

  /**
   * Détecte la langue d'un document
   */
  static async detectLanguage(imageBuffer: Buffer): Promise<string[]> {
    try {
      // Tester avec plusieurs langues courantes
      const testLanguages = ['fra', 'eng', 'ara', 'spa', 'deu'];
      const confidences: Array<{ lang: string; confidence: number }> = [];

      for (const lang of testLanguages) {
        try {
          const result = await this.recognize(imageBuffer, {
            language: lang,
            preserveLayout: false,
          });
          confidences.push({ lang, confidence: result.confidence });
        } catch (error) {
          console.error(`Erreur test langue ${lang}:`, error);
        }
      }

      // Trier par confiance
      confidences.sort((a, b) => b.confidence - a.confidence);

      return confidences.map((c) => c.lang);
    } catch (error) {
      console.error('Erreur détection langue:', error);
      return ['fra']; // Par défaut
    }
  }

  /**
   * Nettoie les ressources
   */
  static async cleanup() {
    for (const [key, worker] of this.workers.entries()) {
      try {
        await worker.terminate();
        console.log(`Worker ${key} terminé`);
      } catch (error) {
        console.error(`Erreur fermeture worker ${key}:`, error);
      }
    }
    this.workers.clear();
  }

  /**
   * Vérifie si le texte extrait est de bonne qualité
   */
  static validateOCRQuality(result: OCRResult): {
    isGood: boolean;
    confidence: number;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let isGood = true;

    // Vérifier la confiance globale
    if (result.confidence < 60) {
      warnings.push('Confiance globale faible (<60%)');
      isGood = false;
    }

    // Vérifier le nombre de mots reconnus
    if (result.words.length === 0) {
      warnings.push('Aucun mot reconnu');
      isGood = false;
    }

    // Vérifier les mots à faible confiance
    const lowConfidenceWords = result.words.filter((w) => w.confidence < 50);
    if (lowConfidenceWords.length > result.words.length * 0.3) {
      warnings.push('Plus de 30% des mots ont une faible confiance');
      isGood = false;
    }

    return {
      isGood,
      confidence: result.confidence,
      warnings,
    };
  }
}
