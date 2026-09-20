import type { Metadata } from 'next';
import { buildPrivatePageMetadata } from '@/lib/seo';

/** Page d’erreur 403 — sans valeur éditoriale : `noindex, nofollow`. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPrivatePageMetadata(
    locale,
    '/403',
    'Accès refusé',
    'Page d’erreur d’accès, sans contenu indexable.'
  );
}

export default function ForbiddenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
