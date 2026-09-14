import type { Metadata } from 'next';
import { buildSectionMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildSectionMetadata(locale, '/pdf', {
    name: 'PDF Tools',
    description: 'Conversion, OCR, fusion, compression et signature de documents PDF',
  });
}

export default function PdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
