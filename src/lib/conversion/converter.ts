/**
 * 🔄 MOTEUR DE CONVERSION - Multi Convert
 * 
 * Conversion de fichiers avec Sharp (images) et pdf-lib (PDF)
 */

import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

/**
 * Convertit un fichier vers le format de sortie spécifié
 */
export async function convertFile(
  inputBuffer: Buffer,
  inputMimeType: string,
  outputFormat: string
): Promise<Buffer> {
  const format = outputFormat.toLowerCase();

  // Conversion d'images
  if (inputMimeType.startsWith('image/')) {
    return convertImage(inputBuffer, format);
  }

  // Conversion PDF
  if (inputMimeType === 'application/pdf') {
    return convertPDF(inputBuffer, format);
  }

  throw new Error(`Conversion from ${inputMimeType} to ${format} is not yet supported`);
}

/**
 * Convertit une image vers un autre format
 */
async function convertImage(inputBuffer: Buffer, outputFormat: string): Promise<Buffer> {
  let sharpInstance = sharp(inputBuffer);

  switch (outputFormat) {
    case 'png':
      return sharpInstance.png().toBuffer();
    case 'jpg':
    case 'jpeg':
      return sharpInstance.jpeg({ quality: 90 }).toBuffer();
    case 'webp':
      return sharpInstance.webp({ quality: 90 }).toBuffer();
    case 'gif':
      return sharpInstance.gif().toBuffer();
    case 'bmp':
      return sharpInstance.bmp().toBuffer();
    case 'tiff':
      return sharpInstance.tiff().toBuffer();
    default:
      throw new Error(`Unsupported image format: ${outputFormat}`);
  }
}

/**
 * Convertit un PDF vers un autre format
 */
async function convertPDF(inputBuffer: Buffer, outputFormat: string): Promise<Buffer> {
  // Pour PDF vers image, on convertit la première page
  if (['png', 'jpg', 'jpeg', 'webp'].includes(outputFormat)) {
    // Utiliser Sharp pour convertir la première page du PDF en image
    // Note: Sharp peut convertir PDF directement
    return sharp(inputBuffer, { pages: 1 }).toFormat(outputFormat as 'png' | 'jpg' | 'jpeg' | 'webp').toBuffer();
  }

  // Pour PDF vers PDF (pas de conversion nécessaire, mais on peut optimiser)
  if (outputFormat === 'pdf') {
    // TODO: Implémenter l'optimisation PDF
    return inputBuffer;
  }

  throw new Error(`PDF to ${outputFormat} conversion is not yet supported`);
}
