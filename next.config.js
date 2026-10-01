/** @type {import('next').NextConfig} */
const path = require('path');
const os = require('os');
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/**
 * Nombre de « workers » utilisés par le build (option `experimental.cpus`).
 *
 * POURQUOI CETTE FONCTION
 * -----------------------
 * Next.js crée **4 workers par défaut** (voir
 * node_modules/next/dist/build/index.js → getNumberOfWorkers : « Fall back to 4
 * workers if a count is not specified »). Or, à la création de ces workers,
 * Next **retire le plafond de tas** (`--max-old-space-size`) de leur
 * environnement (même fichier : « we don't pass down NODE_OPTIONS as it can
 * extra memory usage ») : chaque worker est donc un process Node complet dont
 * la mémoire n'est plus bornée par NODE_OPTIONS.
 *
 * Sur un VPS qui fait déjà tourner Coolify + l'application + Postgres + Redis,
 * ces 4 process en plus du process principal (qui compile, puis collecte les
 * « build traces ») dépassent la RAM : le noyau tue le build (OOM killer)
 * pendant l'étape la plus gourmande, d'où un échec à
 * « Collecting build traces ... » avec `exit code 255` et **aucun message
 * d'erreur** (voir DEPLOIEMENT-COOLIFY.md §6 et §9).
 *
 * On dimensionne donc le nombre de workers sur la mémoire réellement libre :
 * ~1 Go de RAM libre par worker, après avoir réservé 1,5 Go au process
 * principal (webpack + collecte des traces).
 *
 *   VPS 4 Go, ~2,5 Go libres  -> 1 worker
 *   VPS 8 Go, ~5,5 Go libres  -> 4 workers (maximum de Next)
 *   Runner GitHub Actions     -> 4 workers (build CI rapide, inchangé)
 *
 * Surchargeable sans modifier ce fichier (build-arg / variable de build
 * Coolify) : NEXT_BUILD_WORKERS=1 (ou 2, 4...). Une valeur vide ou invalide
 * laisse le dimensionnement automatique.
 */
function buildWorkers() {
  const forced = Number(process.env.NEXT_BUILD_WORKERS);
  if (Number.isFinite(forced) && forced > 0) {
    return Math.floor(forced);
  }
  const GB = 1024 ** 3;
  const freeAfterMainProcess = (os.freemem() - 1.5 * GB) / GB;
  return Math.max(1, Math.min(4, Math.floor(freeAfterMainProcess)));
}

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
    // Mémoire de build : voir buildWorkers() en haut de ce fichier.
    // 4 workers (défaut Next) tuent le build sur un VPS (OOM killer pendant
    // « Collecting build traces » → exit 255 sans message).
    cpus: buildWorkers(),
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
            /**
             * CSP compatible AdSense.
             *
             * AdSense (et la CMP Google Funding Choices) chargent leurs
             * ressources depuis les domaines Google : sans ces autorisations,
             * les annonces sont bloquées silencieusement par le navigateur
             * (« Refused to load the script… » dans la console).
             *
             * - script-src : pagead2.googlesyndication.com, adservice.google.com,
             *                tpc.googlesyndication.com (via *.googlesyndication.com),
             *                fundingchoicesmessages.google.com (CMP).
             * - connect-src : doubleclick.net / googlesyndication.com (beacons).
             * - frame-src : googleads.g.doubleclick.net et
             *               *.googlesyndication.com (iframes d'annonces).
             */
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://adservice.google.com https://fundingchoicesmessages.google.com https://*.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://*.googlesyndication.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://*.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://*.uploadthing.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://fundingchoicesmessages.google.com",
              "frame-src 'self' https://js.stripe.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://*.googlesyndication.com https://*.google.com",
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
