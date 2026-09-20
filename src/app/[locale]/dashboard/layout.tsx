import type { Metadata } from 'next';
import { buildPrivatePageMetadata } from '@/lib/seo';

/**
 * Tableau de bord — espace privé : `noindex, nofollow`.
 *
 * Doublon volontaire du `robots.txt` (qui bloque déjà `/dashboard` et sa
 * version localisée `/fr/dashboard`) : cette balise couvre le cas d’une URL
 * découverte par un lien direct, le `robots.txt` celui d’une exploration
 * automatique.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPrivatePageMetadata(
    locale,
    '/dashboard',
    'Tableau de bord',
    'Espace privé : historique de vos conversions et gestion de votre compte.'
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
