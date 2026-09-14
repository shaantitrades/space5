import type { Metadata } from 'next';
import { buildSectionMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildSectionMetadata(locale, '/tools', {
    name: 'All Tools',
    description: 'Tous les outils de conversion : PDF, images, vidéo, audio et archives',
  });
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
