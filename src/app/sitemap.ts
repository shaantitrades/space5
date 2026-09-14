import { MetadataRoute } from 'next';
import { SEO_DEFAULT_LOCALE, SEO_LOCALES } from '@/config/seo';
import { siteConfig } from '@/config/site';

const BASE_URL = siteConfig.url;

/**
 * Pages publiques indexables.
 * Volontairement exclues : /pricing (masquée quand le site est gratuit),
 * /dashboard, /login, /signup, /credits, /verify — pages privées.
 */
const PAGES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
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

function alternatesFor(path: string): Record<string, string> {
  const suffix = path ? `/${path}` : '';
  const languages: Record<string, string> = {};

  for (const locale of SEO_LOCALES) {
    languages[locale] = `${BASE_URL}/${locale}${suffix}`;
  }
  languages['x-default'] = `${BASE_URL}/${SEO_DEFAULT_LOCALE}${suffix}`;

  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return SEO_LOCALES.flatMap((locale) =>
    PAGES.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}/${locale}${path ? `/${path}` : ''}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: alternatesFor(path) },
    }))
  );
}
