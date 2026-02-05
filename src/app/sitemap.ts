import { MetadataRoute } from 'next';
import { tools } from '@/config/tools';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://multi-convert.com';
const LOCALES = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'hi', 'no', 'sv'];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Pages principales pour chaque locale
  const mainPages = [
    '',
    'tools',
    'convert',
    'pricing',
    'features',
    'documentation',
    'blog',
    'entreprise',
    'dashboard',
    'login',
    'signup',
  ];

  LOCALES.forEach((locale) => {
    // Pages principales
    mainPages.forEach((page) => {
      routes.push({
        url: `${BASE_URL}/${locale}${page ? `/${page}` : ''}`,
        lastModified: new Date(),
        changeFrequency: page === '' || page === 'blog' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : page === 'tools' ? 0.9 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${page ? `/${page}` : ''}`])
          ),
        },
      });
    });

    // Pages d'outils individuels
    tools.forEach((tool) => {
      routes.push({
        url: `${BASE_URL}/${locale}/${tool.href}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: tool.popular ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}/${tool.href}`])
          ),
        },
      });
    });

    // Pages de catégories
    const categories = [
      'transformation',
      'assemblage',
      'authentification',
      'conversion',
      'optimisation',
      'personnalisation',
      'production',
      'reparation',
    ];

    categories.forEach((category) => {
      routes.push({
        url: `${BASE_URL}/${locale}/tools?category=${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  });

  return routes;
}
