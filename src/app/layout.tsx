import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { siteConfig } from '@/config/site';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { PwaRegister } from '@/components/pwa/pwa-register';
import { CookieConsent } from '@/components/consent/cookie-consent';
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
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <InstallPrompt />
        <PwaRegister />
        <AdScript />
        <CookieConsent />
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

