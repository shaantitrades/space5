import type { Metadata } from 'next';
import { buildLabeledPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLabeledPageMetadata(locale, '/documentation', 'documentation');
}

export default function DocumentationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
