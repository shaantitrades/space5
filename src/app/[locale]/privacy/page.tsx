import type { Metadata } from 'next';
import { buildLabeledPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLabeledPageMetadata(locale, '/privacy', 'privacy');
}

export default function PrivacyPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : {new Date().getFullYear()}</p>

        <div className="space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p className="text-muted-foreground">
              Multi Convert (« nous », « notre ») s&apos;engage à protéger votre vie privée. Cette politique
              explique quelles données nous collectons et comment nous les utilisons lorsque vous utilisez
              notre service de conversion de fichiers accessible sur multi-convert.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Traitement de vos fichiers</h2>
            <p className="text-muted-foreground">
              Lorsque vous utilisez un outil de conversion, votre fichier est transmis à nos serveurs
              (hébergés dans l&apos;Union européenne) pour y être traité. Il est conservé uniquement le temps
              nécessaire à l&apos;opération, puis supprimé. Nous ne constituons aucune base documentaire à partir
              de vos fichiers et nous ne les analysons pas à d&apos;autres fins.
            </p>
            <p className="text-muted-foreground mt-3">
              Nous ne transmettons pas vos fichiers à des services tiers d&apos;intelligence artificielle. À ce jour,
              certains outils supposent donc un envoi de fichier ; ne les utilisez pas pour des documents dont
              l&apos;export est contractuellement interdit.
            </p>
            <p className="text-muted-foreground mt-3">
              <strong>Un mode de traitement 100 % local</strong>, exécuté dans votre navigateur sans aucun envoi de
              fichier, est en cours de développement. Nous préférons l&apos;annoncer comme objectif plutôt que comme
              fonctionnalité disponible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Cookies et publicité</h2>
            <p className="text-muted-foreground">
              Le site est financé par la publicité. Nous utilisons des cookies publicitaires (notamment via
              Google AdSense) pour afficher des annonces pertinentes et mesurer leur performance.
            </p>
            <ul className="list-disc pl-5 mt-2 text-muted-foreground space-y-1">
              <li>Google peut utiliser des cookies (DoubleClick) pour personnaliser les annonces.</li>
              <li>Vous pouvez désactiver la personnalisation via les Paramètres des annonces de Google.</li>
              <li>Vous pouvez refuser les cookies via notre bannière de consentement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Données techniques</h2>
            <p className="text-muted-foreground">
              Comme la plupart des sites, nous pouvons collecter des données techniques anonymes
              (adresse IP, type de navigateur, pages visitées) à des fins de sécurité et de statistiques.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Base légale (RGPD)</h2>
            <p className="text-muted-foreground">
              Le traitement de vos données repose sur votre consentement (cookies publicitaires) et sur notre
              intérêt légitime (sécurité et bon fonctionnement du service). Vous pouvez retirer votre
              consentement à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Vos droits</h2>
            <p className="text-muted-foreground">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
              d&apos;effacement, de limitation, de portabilité et d&apos;opposition. Pour exercer ces droits,
              contactez-nous à l&apos;adresse ci-dessous.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question relative à cette politique :{' '}
              <a href="mailto:privacy@multi-convert.com" className="underline text-primary">
                privacy@multi-convert.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
