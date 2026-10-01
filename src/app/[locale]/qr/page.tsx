import type { Metadata } from 'next';
import { QrGenerator } from '@/components/qr/qr-generator';
import { buildToolMetadata } from '@/lib/seo';
import { SearchBar } from '@/components/layout/search-bar';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('qr-generator', locale);
}

export default function QrPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Recherche : trouver un outil depuis cette page */}
        <div className="mb-8">
          <SearchBar embedded />
        </div>

        <QrGenerator />
      </div>
    </div>
  );
}
