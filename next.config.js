/** @type {import('next').NextConfig} */
const path = require('path');
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  compiler: {
    removeConsole: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // Empêche webpack de bundler ces modules natifs/ESM-only côté serveur
    serverComponentsExternalPackages: [
      'sharp',
      '@ffmpeg-installer/ffmpeg',
      'fluent-ffmpeg',
      'tesseract.js',
      'pdf-parse',
      'file-type',
      'magic-bytes.js',
      'geoip-lite',
      'ioredis',
      '@prisma/client',
      'prisma',
      '@aws-sdk/client-s3',
      '@aws-sdk/s3-request-presigner',
    ],
  },
  // Configuration webpack pour pdfjs-dist
  webpack: (config, { isServer }) => {
    // Configuration spécifique pour pdfjs-dist
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    
    // Ignorer les modules canvas côté serveur
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
    };
    
    return config;
  },
  /**
   * 🔎 ALIAS DE SITEMAP → /sitemap.xml
   *
   * Google (et Bing) acceptent une redirection 308 devant un sitemap. Sans ces
   * règles, les URL ci-dessous renvoyaient une page 404 en HTML : Search Console
   * répondait alors « Impossible de lire le sitemap » (le fichier reçu n'est pas
   * un XML). Les noms `sitemap_index.xml` / `sitemap-index.xml` sont ceux générés
   * par la plupart des CMS et donc ceux saisis par défaut dans Search Console.
   *
   * `redirects()` est évalué AVANT le middleware (voir
   * node_modules/next/dist/server/lib/router-utils/resolve-routes.js) : la règle
   * `/sitemap` fonctionne donc malgré le middleware i18n.
   */
  async redirects() {
    return [
      { source: '/sitemap', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap/', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap_index', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap-index', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap-index.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap.xml.gz', destination: '/sitemap.xml', permanent: true },
    ];
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com https://*.uploadthing.com",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
