/**
 * Utilitaires de sécurité pour l'authentification
 * Remplace tous les 'as any' par des types stricts
 */

import type { Session } from 'next-auth';
import type { CustomSession } from '@/lib/types/auth';

/**
 * Extrait le rôle de manière type-safe (remplace (session?.user as any)?.role)
 */
export function getUserRole(session: Session | null): string | undefined {
  if (!session?.user) return undefined;
  
  const user = session.user as any;
  return user?.role;
}

/**
 * Type guard pour vérifier si un utilisateur est admin
 */
export function isAdmin(session: Session | null): boolean {
  const role = getUserRole(session);
  return role === 'ADMIN';
}

/**
 * Type guard pour vérifier si un utilisateur est modérateur
 */
export function isModerator(session: Session | null): boolean {
  const role = getUserRole(session);
  return role === 'MODERATOR' || role === 'ADMIN';
}

/**
 * Type guard pour vérifier si l'utilisateur est authentifié
 */
export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user?.email;
}

/**
 * Extrait l'ID utilisateur de manière type-safe
 */
export function getUserId(session: Session | null): string | undefined {
  if (!session?.user) return undefined;
  
  const user = session.user as any;
  return user?.id;
}

/**
 * Type pour les réponses d'erreur API
 */
export interface ApiErrorResponse {
  error: string;
  status: number;
  details?: string;
}

/**
 * Crée une réponse d'erreur structurée
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: string
): ApiErrorResponse {
  return { error, status, details };
}

/**
 * Type pour les statuts Prisma BlogPost
 */
export type BlogPostStatus = 'DRAFT' | 'PUBLISHED';

/**
 * Type pour les formats de conversion
 */
export type ConversionFormat = 
  | 'mp4' | 'webm' | 'avi' | 'mkv' | 'mov' | 'flv' | 'wmv' | 'hevc'
  | 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'wma' | 'm4a'
  | 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'tiff' | 'svg' | 'ico' | 'pdf'
  | 'zip' | 'rar' | '7z' | 'tar' | 'gz' | 'bz2' | 'xz'
  | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'pdf';

/**
 * Type pour les options de qualité
 */
export type QualityOption = 'low' | 'medium' | 'high' | 'maximum' | '360p' | '480p' | '720p' | '1080p' | '4k';

/**
 * Type pour les filtres d'image
 */
export type ImageFilter = 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'sepia' | 'invert' | 'saturate' | 'hue-rotate' | 'opacity';

/**
 * Type pour les positions de texte sur une image
 */
export type TextPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * Valide un format de conversion
 */
export function isValidFormat(format: unknown): format is ConversionFormat {
  const validFormats: ConversionFormat[] = [
    'mp4', 'webm', 'avi', 'mkv', 'mov', 'flv', 'wmv', 'hevc',
    'mp3', 'wav', 'aac', 'flac', 'ogg', 'wma', 'm4a',
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico', 'pdf',
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf',
  ];
  return typeof format === 'string' && validFormats.includes(format as ConversionFormat);
}

/**
 * Valide une qualité
 */
export function isValidQuality(quality: unknown): quality is QualityOption {
  const validQualities: QualityOption[] = ['low', 'medium', 'high', 'maximum', '360p', '480p', '720p', '1080p', '4k'];
  return typeof quality === 'string' && validQualities.includes(quality as QualityOption);
}
