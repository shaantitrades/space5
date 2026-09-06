import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    "Politique de confidentialité de Multi Convert : données collectées, cookies, publicité et droits RGPD.",
};

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
            <h2 className="text-xl font-semibold mb-2">2. Données collectées</h2>
            <p className="text-muted-foreground">
              Nos outils de conversion traitent les fichiers <strong>localement dans votre navigateur</strong>.
              Vos fichiers ne sont <strong>pas envoyés sur nos serveurs</strong>. Nous ne stockons donc pas le
              contenu de vos documents, images, vidéos ou autres fichiers.
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
