import type { Metadata } from 'next';
import { Converter } from '@/components/convert/converter';
import { buildLabeledPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLabeledPageMetadata(locale, '/convert', 'convert');
}

export default function ConvertPage() {
  return (
    <div className="container mx-auto py-8">
      <Converter />
    </div>
  );
}
