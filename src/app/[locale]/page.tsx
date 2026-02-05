import { Hero } from '@/components/sections/hero-fixed';
import { QuickAccess } from '@/components/sections/quick-access';
import { FeaturesGrid } from '@/components/sections/features-grid';
import { Features } from '@/components/sections/features';

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
