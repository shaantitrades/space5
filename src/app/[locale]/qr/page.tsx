import type { Metadata } from 'next';
import { QrGenerator } from '@/components/qr/qr-generator';
import { buildToolMetadata } from '@/lib/seo';

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
        <QrGenerator />
      </div>
    </div>
  );
}
