import { Pricing } from '@/components/sections/pricing';
import { redirect } from '@/i18n/routing';
import { siteConfig } from '@/config/site';

export default function PricingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Site gratuit : masquer la page tarifs (redirection localisée vers l'accueil).
  //
  // ⚠️ `redirect()` de next-intl (v3) attend un OBJET `{ href, locale }`.
  // Appelé avec une simple chaîne (`redirect('/')`), `href` ET `locale` restent
  // `undefined` : la réponse était `307 Location: /undefinedundefined` puis 404
  // en production (constaté sur `https://multi-convert.com/fr/pricing`).
  if (!siteConfig.features.showPricing) {
    redirect({ href: '/', locale });
  }

  return (
    <div className="py-8">
      <Pricing />
    </div>
  );
}
