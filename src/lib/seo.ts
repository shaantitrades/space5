/**
 * 🔍 GÉNÉRATION DES MÉTADONNÉES SEO — Multi Convert
 *
 * Produit des métadonnées complètes et localisées pour les 10 langues :
 * titre, description, mots-clés, Open Graph, Twitter Card, canonical,
 * hreflang (toutes les langues + x-default) et directives robots.
 *
 * Les noms d’outils traduits proviennent de `messages/<locale>.json`
 * (section `catalog.items`), avec repli sur `src/config/tools.ts`.
 */

import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { tools } from '@/config/tools';
import {
  SEO_DEFAULT_LOCALE,
  SEO_LOCALES,
  type PageKey,
  type ToolCategory,
  buildCategoryKeywords,
  buildSiteKeywords,
  buildToolCopy,
  buildToolKeywords,
  getPageLabel,
  getSeo,
  resolveSeoLocale,
} from '@/config/seo';

import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import es from '../../messages/es.json';
import de from '../../messages/de.json';
import it from '../../messages/it.json';
import pt from '../../messages/pt.json';
import hi from '../../messages/hi.json';
import ru from '../../messages/ru.json';
import sv from '../../messages/sv.json';
import no from '../../messages/no.json';

// =============================================================================
// TRADUCTIONS DES OUTILS
// =============================================================================

interface CatalogItem {
  title?: string;
  description?: string;
}
interface CatalogMessages {
  catalog?: { items?: Record<string, CatalogItem> };
}

const MESSAGES: Record<string, CatalogMessages> = { en, fr, es, de, it, pt, hi, ru, sv, no };

function getCatalogItems(locale: string): Record<string, CatalogItem> {
  return MESSAGES[resolveSeoLocale(locale)]?.catalog?.items ?? {};
}

/** Nom + description localisés d’un outil (repli sur la config française) */
export function getLocalizedTool(
  locale: string,
  toolId: string
): { name: string; description: string } | null {
  const tool = tools.find((entry) => entry.id === toolId);
  const translated = getCatalogItems(locale)[toolId];

  if (!tool && !translated?.title) return null;

  return {
    name: translated?.title || tool?.name || toolId,
    description: translated?.description || tool?.description || '',
  };
}

/** Nom + description localisés d’une section (clés : pdf, images, media, archive…) */
export function getLocalizedSection(
  locale: string,
  sectionId: string,
  fallback: { name: string; description: string }
): { name: string; description: string } {
  const translated = getCatalogItems(locale)[sectionId];
  return {
    name: translated?.title || fallback.name,
    description: translated?.description || fallback.description,
  };
}

// =============================================================================
// URLS ET HREFLANG
// =============================================================================

/** Normalise un chemin interne : « tools » → « /tools » */
function normalizePath(path: string): string {
  if (!path || path === '/') return '';
  return path.startsWith('/') ? path : `/${path}`;
}

/** URL absolue canonique d’une page pour une langue donnée */
export function localeUrl(locale: string, path = ''): string {
  return `${siteConfig.url}/${resolveSeoLocale(locale)}${normalizePath(path)}`;
}

/**
 * Alternatives linguistiques complètes (hreflang) pour les 10 langues,
 * plus `x-default` pointant vers la langue par défaut.
 */
export function buildAlternates(path = ''): Record<string, string> {
  const clean = normalizePath(path);
  const languages: Record<string, string> = {};

  for (const locale of SEO_LOCALES) {
    languages[locale] = `${siteConfig.url}/${locale}${clean}`;
  }
  languages['x-default'] = `${siteConfig.url}/${SEO_DEFAULT_LOCALE}${clean}`;

  return languages;
}

/** Poignée Twitter déduite de la configuration du site */
const TWITTER_HANDLE = `@${siteConfig.links.twitter.split('/').filter(Boolean).pop() || 'multiconvert'}`;

// =============================================================================
// CONSTRUCTION DES MÉTADONNÉES
// =============================================================================

export interface PageSeoInput {
  locale: string;
  /** Chemin sans la langue, ex. « /tools » */
  path: string;
  title: string;
  description: string;
  keywords: string[];
  /** Pages privées ou non pertinentes : à exclure de l’index */
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
}

/** Assemble un objet Metadata complet et localisé */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  noIndex = false,
  type = 'website',
  publishedTime,
}: PageSeoInput): Metadata {
  const seo = getSeo(locale);
  const canonical = localeUrl(locale, path);
  const image = `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title,
    description,
    keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    alternates: {
      canonical,
      languages: buildAlternates(path),
    },
    openGraph: {
      type,
      locale: seo.ogLocale,
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      ...(publishedTime ? { publishedTime } : {}),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: TWITTER_HANDLE,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}

// =============================================================================
// RACCOURCIS PAR TYPE DE PAGE
// =============================================================================

/** Métadonnées d’un outil (nom et description traduits depuis les messages) */
export function buildToolMetadata(toolId: string, locale: string): Metadata {
  const tool = tools.find((entry) => entry.id === toolId);
  const localized = getLocalizedTool(locale, toolId);

  if (!localized) {
    const seo = getSeo(locale);
    return buildMetadata({
      locale,
      path: '/tools',
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      keywords: buildSiteKeywords(locale),
      noIndex: true,
    });
  }

  const copy = buildToolCopy(locale, localized.name, localized.description);

  return buildMetadata({
    locale,
    path: tool?.href?.split('?')[0] || '/tools',
    title: copy.title,
    description: copy.description,
    keywords: buildToolKeywords(locale, localized.name, tool?.category),
  });
}

/** Description localisée d’une catégorie, composée sans texte inventé */
function categoryDescription(locale: string, name: string): string {
  const sentence = buildToolCopy(locale, name, '').description.trim();
  return `${name} · ${sentence}`;
}

/** Métadonnées d’une catégorie d’outils */
export function buildCategoryMetadata(category: ToolCategory, locale: string): Metadata {
  const seo = getSeo(locale);
  const name = seo.categories[category];

  return buildMetadata({
    locale,
    path: `/tools?category=${category}`,
    title: `${name} — ${siteConfig.name}`,
    description: categoryDescription(locale, name),
    keywords: buildCategoryKeywords(locale, category),
  });
}

/** Métadonnées d’une section d’outils (/pdf, /images, /media, /archive…) */
export function buildSectionMetadata(
  locale: string,
  path: string,
  fallback: { name: string; description: string }
): Metadata {
  const sectionId = path.replace(/^\//, '');
  const localized = getLocalizedSection(locale, sectionId, fallback);
  const copy = buildToolCopy(locale, localized.name, localized.description);

  return buildMetadata({
    locale,
    path,
    title: copy.title,
    description: copy.description,
    keywords: buildToolKeywords(locale, localized.name),
  });
}

/** Métadonnées d’une page standard (titre/description à fournir) */
export function buildPageMetadata(
  locale: string,
  path: string,
  title: string,
  description: string,
  extraKeywords: string[] = [],
  noIndex = false
): Metadata {
  return buildMetadata({
    locale,
    path,
    title,
    description,
    keywords: [...extraKeywords, ...buildSiteKeywords(locale)],
    noIndex,
  });
}

/**
 * Métadonnées d’une page PRIVÉE (authentification, tableau de bord, erreurs…).
 *
 * Ces pages ne doivent jamais apparaître dans les résultats de recherche :
 * `noindex, nofollow` systématique. Elles sont également exclues du `robots.txt`
 * (voir `app/robots.ts`) — les deux mécanismes sont complémentaires :
 * le `robots.txt` empêche l’EXPLORATION (et donc la lecture de la balise), la
 * balise empêche l’INDEXATION si l’URL est découverte par un lien direct.
 *
 * Le titre n’est volontairement pas traduit : ces pages n’ont aucune valeur
 * éditoriale et ne peuvent pas être affichées dans les résultats.
 */
export function buildPrivatePageMetadata(
  locale: string,
  path: string,
  title: string,
  description: string
): Metadata {
  return buildMetadata({
    locale,
    path,
    title: `${title} — ${siteConfig.name}`,
    description,
    keywords: [],
    noIndex: true,
  });
}



/** Métadonnées de la page d’accueil (10 langues) */
export function buildHomeMetadata(locale: string): Metadata {
  const seo = getSeo(locale);
  return buildMetadata({
    locale,
    path: '',
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    keywords: buildSiteKeywords(locale),
  });
}

/**
 * Métadonnées d’une page secondaire (contact, mentions légales, CGU…)
 * construites à partir de son libellé localisé dans les 10 langues.
 */
export function buildLabeledPageMetadata(
  locale: string,
  path: string,
  key: PageKey,
  noIndex = false
): Metadata {
  const seo = getSeo(locale);
  const label = getPageLabel(locale, key);

  return buildMetadata({
    locale,
    path,
    title: `${label} — ${siteConfig.name}`,
    description: `${label} · ${seo.defaultDescription}`,
    keywords: [`${label} ${siteConfig.name}`, ...buildSiteKeywords(locale)],
    noIndex,
  });
}
