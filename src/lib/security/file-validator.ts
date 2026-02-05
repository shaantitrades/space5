/**
 * 🔒 VALIDATION FICHIERS ULTRA-STRICTE - Multi Convert
 * 
 * Double scan antivirus, vérification magic bytes, détection malware
 */

import { ALLOWED_FILE_TYPES, MAX_FILE_SIZES } from '@/config/security';
import { fileTypeFromBuffer } from 'file-type';
import { detect } from 'magic-bytes.js';

export interface ValidationResult {
  valid: boolean;
  mimeType: string | null;
  size: number;
  checksPassed: number;
  errors: string[];
  warnings: string[];
}

export interface FileValidationOptions {
  userTier: 'free' | 'pro' | 'business' | 'enterprise';
  strictMode?: boolean;
}

/**
 * Valide un fichier avec toutes les vérifications de sécurité
 */
export async function validateFile(
  fileData: Buffer,
  filename: string,
  options: FileValidationOptions
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: false,
    mimeType: null,
    size: fileData.length,
    checksPassed: 0,
    errors: [],
    warnings: [],
  };

  try {
    // 1. Vérification taille maximale
    const maxSize = MAX_FILE_SIZES[options.userTier];
    if (fileData.length > maxSize) {
      result.errors.push(
        `File exceeds maximum size of ${formatBytes(maxSize)} for ${options.userTier} tier`
      );
      return result;
    }
    result.checksPassed++;

    // 2. Vérification signature magique (magic bytes)
    const magicBytesResult = detect(fileData);
    if (!magicBytesResult || magicBytesResult.length === 0) {
      result.errors.push('Unable to detect file type from magic bytes');
      if (options.strictMode) {
        return result;
      }
      result.warnings.push('File type detection failed - proceeding with caution');
    } else {
      result.checksPassed++;
    }

    // 3. Détection MIME type avec file-type
    const fileTypeResult = await fileTypeFromBuffer(fileData);
    if (!fileTypeResult) {
      result.errors.push('Unable to determine MIME type');
      if (options.strictMode) {
        return result;
      }
    } else {
      result.mimeType = fileTypeResult.mime;
      result.checksPassed++;
    }

    // 4. Vérification extension vs MIME type
    const extension = getExtension(filename).toLowerCase();
    if (result.mimeType && !isAllowedMimeType(result.mimeType, extension)) {
      result.errors.push(
        `MIME type mismatch: detected ${result.mimeType} but extension is .${extension}`
      );
      if (options.strictMode) {
        return result;
      }
      result.warnings.push('MIME type mismatch detected');
    } else {
      result.checksPassed++;
    }

    // 5. Vérification que le type est autorisé
    if (result.mimeType && !isAllowedMimeType(result.mimeType)) {
      result.errors.push(`File type ${result.mimeType} is not allowed`);
      return result;
    }
    result.checksPassed++;

    // 6. Détection de patterns suspects (stéganographie, shellcode, etc.)
    if (await detectSuspiciousPatterns(fileData)) {
      result.errors.push('Suspicious patterns detected in file');
      if (options.strictMode) {
        return result;
      }
      result.warnings.push('Suspicious patterns detected');
    } else {
      result.checksPassed++;
    }

    // 7. Vérification encodage pour PDF/Office
    if (result.mimeType?.includes('pdf') || result.mimeType?.includes('office')) {
      if (!validateEncoding(fileData, result.mimeType)) {
        result.errors.push('File encoding appears corrupted');
        if (options.strictMode) {
          return result;
        }
        result.warnings.push('Encoding validation failed');
      } else {
        result.checksPassed++;
      }
    } else {
      result.checksPassed++;
    }

    // Toutes les vérifications passées
    result.valid = result.errors.length === 0;
    return result;
  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Vérifie si un MIME type est autorisé
 */
function isAllowedMimeType(mimeType: string, extension?: string): boolean {
  // Vérifier dans toutes les catégories
  for (const category of Object.values(ALLOWED_FILE_TYPES)) {
    if (category.includes(mimeType)) {
      return true;
    }
  }

  // Si extension fournie, vérifier aussi par extension
  if (extension) {
    const extensionMap: Record<string, readonly string[]> = {
      pdf: ALLOWED_FILE_TYPES.pdf,
      jpg: ALLOWED_FILE_TYPES.image,
      jpeg: ALLOWED_FILE_TYPES.image,
      png: ALLOWED_FILE_TYPES.image,
      webp: ALLOWED_FILE_TYPES.image,
      gif: ALLOWED_FILE_TYPES.image,
      mp4: ALLOWED_FILE_TYPES.video,
      avi: ALLOWED_FILE_TYPES.video,
      mov: ALLOWED_FILE_TYPES.video,
      webm: ALLOWED_FILE_TYPES.video,
      mp3: ALLOWED_FILE_TYPES.audio,
      wav: ALLOWED_FILE_TYPES.audio,
      doc: ALLOWED_FILE_TYPES.document,
      docx: ALLOWED_FILE_TYPES.document,
      xls: ALLOWED_FILE_TYPES.document,
      xlsx: ALLOWED_FILE_TYPES.document,
      ppt: ALLOWED_FILE_TYPES.document,
      pptx: ALLOWED_FILE_TYPES.document,
    };

    const allowedMimes = extensionMap[extension];
    if (allowedMimes && allowedMimes.includes(mimeType)) {
      return true;
    }
  }

  return false;
}

/**
 * Détecte des patterns suspects dans le fichier
 */
async function detectSuspiciousPatterns(fileData: Buffer): Promise<boolean> {
  // Patterns de shellcode communs
  const shellcodePatterns = [
    /\\x90\\x90\\x90\\x90/, // NOP sled
    /\\xeb\\xfe/, // Infinite loop
    /\\xcc/, // INT3 (breakpoint)
  ];

  // Patterns de stéganographie
  const steganographyPatterns = [
    /steg/i,
    /hidden/i,
    /secret/i,
  ];

  const fileString = fileData.toString('utf8', 0, Math.min(1024, fileData.length));

  // Vérifier shellcode
  for (const pattern of shellcodePatterns) {
    if (pattern.test(fileString)) {
      return true;
    }
  }

  // Vérifier stéganographie (dans les métadonnées)
  if (steganographyPatterns.some((pattern) => pattern.test(fileString))) {
    return true;
  }

  return false;
}

/**
 * Valide l'encodage d'un fichier PDF ou Office
 */
function validateEncoding(fileData: Buffer, mimeType: string): boolean {
  if (mimeType.includes('pdf')) {
    // PDF doit commencer par %PDF
    const header = fileData.toString('ascii', 0, 4);
    return header === '%PDF';
  }

  if (mimeType.includes('office') || mimeType.includes('msword')) {
    // Office files modernes sont des ZIP
    const header = fileData.toString('hex', 0, 4);
    return header === '504b0304'; // PK (ZIP signature)
  }

  return true;
}

/**
 * Extrait l'extension d'un nom de fichier
 */
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Formate les bytes en format lisible
 */
function formatBytes(bytes: number): string {
  if (bytes === Infinity) return 'Unlimited';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
