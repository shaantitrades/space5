import type { Metadata } from 'next';
import { buildPrivatePageMetadata } from '@/lib/seo';

/** Confirmation d’adresse e-mail — espace privé : `noindex, nofollow`. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPrivatePageMetadata(
    locale,
    '/verify-email',
    'Vérification de l’adresse e-mail',
    'Confirmation d’adresse e-mail, réservée aux comptes concernés.'
  );
}

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
