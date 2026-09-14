import type { Metadata } from 'next';
import { Mail, MessageSquare, Shield } from 'lucide-react';
import { LeadForm } from '@/components/sections/lead-form';
import { siteConfig } from '@/config/site';
import { buildLabeledPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLabeledPageMetadata(locale, '/contact', 'contact');
}

export default function ContactPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">Contact</h1>
        <p className="text-muted-foreground mb-10">
          Une question, un bug, une demande d’accès API ou l’envie de tester l’outil sur vos propres fichiers ?
          Écrivez-nous, une personne vous répond.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Envoyer un message</h2>
            <LeadForm source="contact" requireCompany={false} />
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="font-semibold">Email</div>
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-sm text-primary hover:underline">
                    {siteConfig.contact.email}
                  </a>
                  <div className="text-xs text-muted-foreground">Réponse sous 24 h ouvrées</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="font-semibold">Programme pilote entreprise</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {siteConfig.pilot.seats} places par secteur, {siteConfig.pilot.durationDays} jours, sans
                    engagement et sans moyen de paiement.
                  </p>
                  <a href="/entreprise" className="text-sm text-primary hover:underline inline-block mt-2">
                    Voir le détail du pilote →
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="font-semibold">Données personnelles</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Les informations envoyées via ce formulaire servent uniquement à traiter votre demande. Pour exercer
                    vos droits, écrivez à{' '}
                    <a href={`mailto:${siteConfig.contact.privacyEmail}`} className="text-primary hover:underline">
                      {siteConfig.contact.privacyEmail}
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Nous n’affichons pas de numéro de téléphone tant qu’aucune ligne dédiée n’est en place : un numéro non
              répondu serait pire que pas de numéro du tout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
