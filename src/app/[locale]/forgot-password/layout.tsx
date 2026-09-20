import type { Metadata } from 'next';
import { buildPrivatePageMetadata } from '@/lib/seo';

/** Mot de passe oublié — espace privé : `noindex, nofollow`. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPrivatePageMetadata(
    locale,
    '/forgot-password',
    'Mot de passe oublié',
    'Demande de réinitialisation de mot de passe.'
  );
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
