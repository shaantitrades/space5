import type { Metadata } from 'next';
import { buildPrivatePageMetadata } from '@/lib/seo';

/** Page de vérification de sécurité — espace privé : `noindex, nofollow`. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPrivatePageMetadata(
    locale,
    '/verify',
    'Vérification de sécurité',
    'Page de vérification de sécurité, réservée aux visiteurs concernés.'
  );
}

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
