import type { MetadataRoute } from 'next';
import { SEO_DEFAULT_LOCALE, SEO_LOCALES } from '@/config/seo';
import { siteConfig } from '@/config/site';

/**
 * 📄 SITEMAP XML — https://multi-convert.com/sitemap.xml
 *
 * Généré par la méthode native de Next.js (`app/sitemap.ts`) : Next.js
 * sérialise lui-même le XML (déclaration `<?xml …?>` en tout premier octet,
 * `<urlset>`, `<url>`, `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`) et
 * sert la réponse avec le Content-Type `application/xml`.
 *
 * ⚠️ Ne jamais remplacer ce fichier par un générateur de texte/JSON : c'est ce
 * qui produisait un sitemap illisible (« URL lastmod changefreq priority » sans
 * balises) et le message « Impossible de récupérer » dans Search Console.
 */

/** URL canonique : toujours https, jamais de « / » final (normalisée dans siteConfig). */
const BASE_URL = siteConfig.url;

/**
 * Génération statique à la construction : le fichier est un vrai XML servi tel
 * quel (jamais de HTML, jamais de JSON, jamais de texte brut).
 */
export const dynamic = 'force-static';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

interface SitemapPage {
  /** Chemin relatif à la langue, sans « / » initial ('' = page d'accueil) */
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

/**
 * Pages publiques indexables — liste inchangée : aucune URL existante n'est
 * supprimée du sitemap.
 * Volontairement exclues : /pricing (masquée quand le site est gratuit),
 * /dashboard, /login, /signup, /credits, /verify — pages privées.
 */
const PAGES: SitemapPage[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: 'tools', priority: 0.9, changeFrequency: 'weekly' },
  { path: 'pdf', priority: 0.9, changeFrequency: 'weekly' },
  { path: 'images', priority: 0.9, changeFrequency: 'weekly' },
  { path: 'media', priority: 0.9, changeFrequency: 'weekly' },
  { path: 'archive', priority: 0.8, changeFrequency: 'weekly' },
  { path: 'qr', priority: 0.8, changeFrequency: 'weekly' },
  { path: 'convert', priority: 0.8, changeFrequency: 'weekly' },
  { path: 'features', priority: 0.7, changeFrequency: 'monthly' },
  { path: 'documentation', priority: 0.7, changeFrequency: 'monthly' },
  { path: 'entreprise', priority: 0.7, changeFrequency: 'monthly' },
  { path: 'blog', priority: 0.7, changeFrequency: 'daily' },
  { path: 'contact', priority: 0.5, changeFrequency: 'yearly' },
  { path: 'legal', priority: 0.3, changeFrequency: 'yearly' },
  { path: 'privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: 'terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: 'cookies', priority: 0.3, changeFrequency: 'yearly' },
];

/** URL absolue et canonique d'une page pour une langue donnée. */
function localeUrl(locale: string, path: string): string {
  return `${BASE_URL}/${locale}${path ? `/${path}` : ''}`;
}

/**
 * Traductions d'une page : une entrée par langue + `x-default`.
 * Les URLs sont statiques et sans paramètre de requête : aucun caractère à
 * échapper (`&`, `<`, `>`, `"`, `'`) ne peut se retrouver dans le XML.
 */
function alternatesFor(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of SEO_LOCALES) {
    languages[locale] = localeUrl(locale, path);
  }
  languages['x-default'] = localeUrl(SEO_DEFAULT_LOCALE, path);

  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Date de dernière modification du déploiement (identique pour toutes les
  // entrées générées lors de la même construction).
  const lastModified = new Date();

  return SEO_LOCALES.flatMap((locale) =>
    PAGES.map(({ path, priority, changeFrequency }) => ({
      url: localeUrl(locale, path),
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: alternatesFor(path) },
    }))
  );
}
