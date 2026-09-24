import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { getLocale } from 'next-intl/server';
import './globals.css';
import { siteConfig } from '@/config/site';
import { PwaRegister } from '@/components/pwa/pwa-register';
import { AdScript } from '@/components/ads/ad-script';
const inter = Inter({ subsets: ['latin'] });

const locales = ['en', 'fr', 'es', 'de', 'it', 'pt', 'hi', 'ru', 'sv', 'no'];

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Multi Convert - The Universal Conversion Suite',
    template: '%s | Multi Convert',
  },
  description: siteConfig.description,
  applicationName: 'Multi Convert',
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Multi Convert',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: 'Multi Convert',
    title: 'Multi Convert - The Universal Conversion Suite',
    description: siteConfig.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Multi Convert - The Universal Conversion Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi Convert - The Universal Conversion Suite',
    description: siteConfig.description,
    images: ['/og-image.png'],
    creator: '@MultiConvert',
  },
  robots: {
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
  alternates: {
    canonical: siteConfig.url,
    languages: Object.fromEntries(locales.map((l) => [l, `${siteConfig.url}/${l}`])),
  },
  verification: {
    /**
     * Jetons Search Console — Next.js génère UNE balise
     * `<meta name="google-site-verification" content="…">` par jeton.
     *
     * - `E3zp…` : propriété `multi-convert.com`. Le même jeton est présent dans
     *   l'enregistrement TXT DNS du domaine : la vérification reste valide même
     *   si cette balise disparaît un jour.
     * - `svdh6…` : propriété `imaparami.com`. La balise doit être servie par le
     *   domaine à vérifier, donc `imaparami.com` doit pointer vers ce
     *   déploiement (Coolify/Traefik) pour que Search Console la trouve.
     */
    google: [
      'E3zpWu3IJ57W2iYGxsvNiN-CSjJGYftVcpYpGq6y85o',
      'svdh6WOrdjKjKZwVz9yXgnYbQOGsmjnebvDoHxTUVbQ',
    ],
  },
  other: {
    'google-adsense-account': 'ca-pub-5343389597650456',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#3b82f6' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * 🌍 Langue du document (`<html lang>`).
   *
   * Google détermine la langue d'une page en priorité via cet attribut, PAS
   * via l'URL. Servir `/fr` avec `lang="en"` fait donc classer la page
   * française comme anglaise : Google affiche la version `/en` aux
   * francophones et signale un conflit dans le rapport hreflang de Search
   * Console.
   *
   * La locale est fournie par l'en-tête `X-NEXT-INTL-LOCALE`, posé par le
   * middleware i18n (`src/middleware.ts`) et lisible côté serveur via
   * `getLocale()` de `next-intl/server`. `HtmlLang` (côté client) reste
   * nécessaire pour mettre l'attribut à jour lors des navigations internes
   * sans rechargement.
   */
  let locale = 'en';
  try {
    const currentLocale = await getLocale();
    if (locales.includes(currentLocale)) {
      locale = currentLocale;
    }
  } catch {
    // Requête hors middleware i18n (en-tête absent) : repli sur l'anglais.
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <PwaRegister />
        <AdScript />
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          duration={4000}
          toastOptions={{
            style: {
              background: 'white',
              color: 'black',
              border: '1px solid #e5e7eb',
            },
            className: 'sonner-toast',
          }}
        />
      </body>
    </html>
  );
}

