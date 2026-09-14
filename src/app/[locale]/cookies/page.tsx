import type { Metadata } from 'next';
import { buildLabeledPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLabeledPageMetadata(locale, '/cookies', 'cookies');
}

export default function CookiesPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Politique de cookies</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : {new Date().getFullYear()}</p>

        <div className="space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="text-muted-foreground">
              Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d&apos;un site.
              Il permet de mémoriser vos préférences et d&apos;assurer le bon fonctionnement du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Cookies utilisés</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Cookies de préférences</strong> : mémorisent votre langue et votre choix de consentement.</li>
              <li><strong>Cookies publicitaires</strong> : utilisés par Google AdSense pour afficher des annonces.</li>
              <li><strong>Cookies de mesure</strong> : statistiques anonymes de fréquentation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Publicité (Google AdSense)</h2>
            <p className="text-muted-foreground">
              Les annonces sont fournies par Google. Google peut utiliser le cookie DoubleClick pour
              personnaliser les annonces en fonction de vos visites sur ce site et d&apos;autres sites.
            </p>
            <p className="text-muted-foreground mt-2">
              Vous pouvez désactiver la publicité personnalisée dans les{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary"
              >
                Paramètres des annonces Google
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Gérer vos cookies</h2>
            <p className="text-muted-foreground">
              Vous pouvez accepter ou refuser les cookies via notre bannière de consentement. Vous pouvez
              également configurer votre navigateur pour bloquer les cookies, ou effacer les cookies déjà
              déposés.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
