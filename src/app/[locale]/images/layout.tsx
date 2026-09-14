import type { Metadata } from 'next';
import { buildSectionMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildSectionMetadata(locale, '/images', {
    name: 'Image Tools',
    description: 'Conversion, optimisation, redimensionnement, filtres et filigrane d’images',
  });
}

export default function ImagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
