import type { Metadata } from 'next';
import { buildSectionMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildSectionMetadata(locale, '/media', {
    name: 'Video & Audio',
    description: 'Conversion vidéo et audio, extraction audio, découpe, compression et fusion',
  });
}

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
