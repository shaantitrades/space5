import type { Metadata } from 'next';
import { AlertCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { buildLabeledPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLabeledPageMetadata(locale, '/legal', 'legal');
}

/**
 * Mentions légales obligatoires en France (LCEN art. 6-III).
 *
 * Les valeurs proviennent de `siteConfig.company`. Tant qu'elles contiennent
 * « À COMPLÉTER », un avertissement reste affiché : c'est volontaire, pour
 * empêcher la mise en ligne d'informations manquantes.
 */
export default function LegalPage() {
  const { company, contact } = siteConfig;
  const incomplete = Object.values(company).some((value) => value.includes('À COMPLÉTER'));

  const rows = [
    { label: 'Raison sociale', value: company.legalName },
    { label: 'Forme juridique', value: company.legalForm },
    ...(company.capital ? [{ label: 'Capital social', value: company.capital }] : []),
    { label: 'SIREN / SIRET', value: company.siren },
    { label: 'Numéro de TVA intracommunautaire', value: company.vat },
    { label: 'Siège social', value: company.address },
    { label: 'Directeur de la publication', value: company.publicationDirector },
    { label: 'Hébergeur', value: company.hosting },
    { label: 'Contact', value: contact.email },
  ];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Mentions légales</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().getFullYear()}
        </p>

        {incomplete && (
          <div className="mb-8 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Information incomplète.</strong> Certaines mentions obligatoires ne sont pas renseignées. Elles
              doivent être complétées dans <code>src/config/site.ts</code> avant toute communication commerciale.
            </p>
          </div>
        )}

        <div className="space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Éditeur du site</h2>
            <dl className="space-y-2">
              {rows.map((row) => (
                <div key={row.label} className="flex flex-col sm:flex-row sm:gap-3">
                  <dt className="text-sm font-medium sm:w-64">{row.label}</dt>
                  <dd className="text-sm text-muted-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              L’ensemble des éléments du site (interface, code, textes, identité visuelle) est protégé par le droit
              d’auteur. Toute reproduction non autorisée est interdite. Les marques et logos de tiers cités sur le site
              appartiennent à leurs propriétaires respectifs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Responsabilité</h2>
            <p className="text-muted-foreground">
              Le service est fourni en l’état. L’éditeur ne peut être tenu responsable d’une perte de données ou d’un
              dommage indirect lié à l’utilisation du site. Il est recommandé de conserver une copie de vos fichiers
              originaux.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Données personnelles et cookies</h2>
            <p className="text-muted-foreground">
              Le traitement des données est décrit dans la{' '}
              <a href="/privacy" className="text-primary underline">
                politique de confidentialité
              </a>{' '}
              et dans la{' '}
              <a href="/cookies" className="text-primary underline">
                politique cookies
              </a>
              . Pour exercer vos droits :{' '}
              <a href={`mailto:${contact.privacyEmail}`} className="text-primary underline">
                {contact.privacyEmail}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question relative au site :{' '}
              <a href={`mailto:${contact.email}`} className="text-primary underline">
                {contact.email}
              </a>{' '}
              ou via la{' '}
              <a href="/contact" className="text-primary underline">
                page de contact
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
