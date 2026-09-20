import type { Metadata } from 'next';
import { buildPrivatePageMetadata } from '@/lib/seo';

/** Estimation des crédits — espace privé : `noindex, nofollow`. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPrivatePageMetadata(
    locale,
    '/credits',
    'Crédits',
    'Estimation du coût des conversions.'
  );
}

export default function CreditsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
