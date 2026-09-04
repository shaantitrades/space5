import { Pricing } from '@/components/sections/pricing';
import { BackButton } from '@/components/ui/back-button';
import { redirect } from '@/i18n/routing';
import { siteConfig } from '@/config/site';

export default function PricingPage() {
  // Site gratuit : masquer la page tarifs (redirection vers l'accueil)
  if (!siteConfig.features.showPricing) {
    redirect('/');
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <BackButton />
      </div>
      <Pricing />
    </div>
  );
}
