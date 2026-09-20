import type { Metadata } from 'next';
import { buildPrivatePageMetadata } from '@/lib/seo';

/** Définition d’un nouveau mot de passe — espace privé : `noindex, nofollow`. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPrivatePageMetadata(
    locale,
    '/reset-password',
    'Nouveau mot de passe',
    'Définition d’un nouveau mot de passe.'
  );
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
