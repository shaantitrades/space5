import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const BASE_URL = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard',
          '/login',
          '/signup',
          '/credits',
          '/verify',
          '/verify-email',
          '/forgot-password',
          '/reset-password',
          '/403',
          '/pricing',
          '/*?apiKey=*',
          '/*?token=*',
        ],
      },
      // Robots d’entraînement IA : le contenu éditorial n’est pas offert
      // gratuitement comme corpus d’entraînement.
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
