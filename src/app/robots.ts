import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Pages privées : jamais explorées, jamais indexées.
 *
 * ⚠️ Google évalue ces règles comme des PRÉFIXES depuis la racine du domaine :
 * `Disallow: /dashboard` bloquait `/dashboard` mais PAS `/fr/dashboard`
 * (vérifié en production : `https://multi-convert.com/fr/dashboard` → 200, avec
 * `<meta name="robots" content="index, follow">` hérité du layout racine).
 *
 * Chaque chemin est donc déclaré deux fois : brut (URL sans langue, redirigée
 * en 307 vers la version localisée) et préfixé par le joker « * », qui couvre
 * les 10 langues (« /fr/dashboard », « /en/verify », …).
 *
 * Ces pages portent en plus une balise `noindex, nofollow`
 * (voir `lib/seo.ts` → `buildPrivatePageMetadata`). Les deux mécanismes sont
 * complémentaires : le `robots.txt` empêche l’EXPLORATION (donc la lecture de la
 * balise), la balise empêche l’INDEXATION si une URL est découverte par lien.
 */
const PRIVATE_PATHS = [
  '/dashboard',
  '/admin',
  '/login',
  '/signup',
  '/credits',
  '/verify',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/403',
] as const;

const BASE_URL = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // API : aucune page publique
          '/api/',
          // Pages privées, URL sans langue (« /dashboard » → 307 « /en/dashboard »)
          ...PRIVATE_PATHS,
          // Les mêmes en version localisée : /fr/dashboard, /en/verify, …
          ...PRIVATE_PATHS.map((path) => `/*${path}`),
          // Paramètres sensibles : jamais explorés
          '/*?apiKey=*',
          '/*?token=*',
        ],
      },
      // Robots d’entraînement IA : le contenu éditorial n’est pas offert
      // gratuitement comme corpus d’entraînement.
      // NB : Google-Extended ne concerne PAS l’indexation Search (il ne couvre
      // que l’usage du contenu par Gemini / Vertex AI).
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
