import type { Metadata } from 'next';
import { buildLabeledPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLabeledPageMetadata(locale, '/terms', 'terms');
}

export default function TermsPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Conditions générales d&apos;utilisation</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : {new Date().getFullYear()}</p>

        <div className="space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptation</h2>
            <p className="text-muted-foreground">
              En accédant à multi-convert.com, vous acceptez les présentes conditions. Si vous n&apos;êtes pas
              d&apos;accord, veuillez ne pas utiliser le service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Description du service</h2>
            <p className="text-muted-foreground">
              Multi Convert fournit des outils de conversion de fichiers (PDF, images, vidéos, audio,
              documents) et de génération de QR codes. La plupart des traitements s&apos;effectuent localement
              dans votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Utilisation autorisée</h2>
            <p className="text-muted-foreground">
              Vous vous engagez à utiliser le service à des fins licites. Il est notamment interdit de :
            </p>
            <ul className="list-disc pl-5 mt-2 text-muted-foreground space-y-1">
              <li>Convertir des contenus illégaux ou portant atteinte aux droits de tiers.</li>
              <li>Tenter de perturber ou de surcharger le service.</li>
              <li>Contourner les mesures de sécurité ou de limitation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              Le service, son code, sa marque et son contenu sont la propriété de Multi Convert. Vos fichiers
              et leurs contenus restent votre propriété.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Limitation de responsabilité</h2>
            <p className="text-muted-foreground">
              Le service est fourni « en l&apos;état », sans garantie. Multi Convert ne saurait être tenu
              responsable des dommages directs ou indirects résultant de l&apos;utilisation du service, y
              compris la perte de données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Droit applicable</h2>
            <p className="text-muted-foreground">
              Les présentes conditions sont régies par le droit français. Tout litige relève des tribunaux
              compétents.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
