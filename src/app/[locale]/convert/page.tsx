import type { Metadata } from 'next';
import { Converter } from '@/components/convert/converter';
import { buildLabeledPageMetadata } from '@/lib/seo';
import { SearchBar } from '@/components/layout/search-bar';

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
      {/* Recherche : trouver un outil depuis cette page */}
      <div className="mb-8 px-4">
        <SearchBar embedded />
      </div>

      <Converter />
    </div>
  );
}
