import { Pricing } from '@/components/sections/pricing';
import { BackButton } from '@/components/ui/back-button';

export default function PricingPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <BackButton />
      </div>
      <Pricing />
    </div>
  );
}
