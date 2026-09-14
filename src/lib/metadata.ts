/**
 * 🔁 Compatibilité — ancien module de métadonnées
 *
 * Les générateurs vivent désormais dans `@/lib/seo` (localisation des
 * 10 langues + hreflang + mots-clés complets). Ce fichier ne sert plus
 * que de passerelle pour les appels historiques.
 *
 * ⚠️ Les anciennes descriptions annonçaient une « conversion locale sans
 * envoi de données sur nos serveurs » : c’était inexact et a été supprimé.
 */

export {
  buildMetadata,
  buildToolMetadata,
  buildCategoryMetadata,
  buildSectionMetadata,
  buildPageMetadata,
  getLocalizedTool,
  getLocalizedSection,
  buildAlternates,
  localeUrl,
} from '@/lib/seo';

import type { Metadata } from 'next';
import { buildCategoryMetadata, buildToolMetadata } from '@/lib/seo';
import type { ToolCategory } from '@/config/seo';

/** @deprecated Utiliser `buildToolMetadata` de `@/lib/seo` */
export function generateToolMetadata(toolId: string, locale: string = 'en'): Metadata {
  return buildToolMetadata(toolId, locale);
}

/** @deprecated Utiliser `buildCategoryMetadata` de `@/lib/seo` */
export function generateCategoryMetadata(category: string, locale: string = 'en'): Metadata {
  return buildCategoryMetadata(category as ToolCategory, locale);
}
