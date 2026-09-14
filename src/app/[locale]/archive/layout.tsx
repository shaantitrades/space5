import type { Metadata } from 'next';
import { buildSectionMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildSectionMetadata(locale, '/archive', {
    name: 'Archive (ZIP)',
    description: 'Créer ou extraire des archives ZIP en ligne',
  });
}

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
