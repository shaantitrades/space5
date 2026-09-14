import type { Metadata } from 'next';
import { Hero } from '@/components/sections/hero-fixed';
import { QuickAccess } from '@/components/sections/quick-access';
import { FeaturesGrid } from '@/components/sections/features-grid';
import { Features } from '@/components/sections/features';
import { buildHomeMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildHomeMetadata(locale);
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <QuickAccess />
      <FeaturesGrid />
      <Features />
    </div>
  );
}
