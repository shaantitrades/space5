export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/layout/navbar';
import { SearchBar } from '@/components/layout/search-bar';
import { PageBack } from '@/components/layout/page-back';
import { HtmlLang } from '@/components/layout/html-lang';
import { Footer } from '@/components/layout/footer';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { CookieConsent } from '@/components/consent/cookie-consent';
import { AdSlot } from '@/components/ads/ad-slot';
import { adsConfig } from '@/config/ads';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLang />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        {/* <SearchBar /> */}
        <AdSlot slot={adsConfig.slots.header} className="container mx-auto px-4 pt-4" />
        <main className="flex-1">
          <PageBack />
          {children}
        </main>
        <AdSlot slot={adsConfig.slots.footer} className="container mx-auto px-4 pb-4" />
        <Footer />
      </div>
      <InstallPrompt />
      <CookieConsent />
    </NextIntlClientProvider>
  );
}
