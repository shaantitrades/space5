import type { Metadata } from 'next';
import { buildLabeledPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLabeledPageMetadata(locale, '/entreprise', 'enterprise');
}

export default function EntrepriseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
