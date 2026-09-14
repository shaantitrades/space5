'use client';

import { Check, Star, Phone, Zap, CreditCard } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function Pricing() {
  const plans = [
    {
      id: 'credits-standard',
      name: 'Crédits Standard',
      subtitle: 'Fonctionnalités de base',
      price: 'À l\'usage',
      priceDetail: '1 crédit ≈ $0,10',
      description: 'Conversions simples uniquement',
      icon: CreditCard,
      popular: false,
      cta: '💰 Acheter des crédits',
      ctaLink: '/credits',
      features: [
        'Pas d\'engagement',
        'Achetez 5, 10, 50, 100+ crédits',
        'Conversion simple',
        'Crédits valables 12 mois',
        'Fonctionnalités de base uniquement',
        '(PDF, Word, Excel, Images)',
      ],
    },
    {
      id: 'credits-premium',
      name: 'Crédits Premium',
      subtitle: 'Toutes fonctionnalités',
      price: 'À l\'usage',
      priceDetail: '1 crédit ≈ $0,20',
      description: 'Accès complet aux outils avancés',
      icon: CreditCard,
      popular: false,
      cta: '⭐ Acheter Premium',
      ctaLink: '/credits?type=premium',
      features: [
        'Pas d\'engagement',
        'Achetez 5, 10, 50, 100+ crédits',
        'TOUTES les fonctionnalités',
        'OCR, AI, Compression avancée',
        'Batch processing',
        'Crédits valables 12 mois',
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Pour débuter',
      price: 'Gratuit',
      priceDetail: 'Toujours gratuit',
      description: 'Idéal pour tester',
      icon: Zap,
      popular: false,
      cta: 'Commencer gratuitement',
      ctaLink: '/convert',
      features: [
        '25 Conversions / mois',
        '25MB Taille Max',
        'Stockage : 24 heures',
        'Fonctionnalités de base',
        'API limitée (100 req/mois)',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      subtitle: 'Pour les pros',
      price: '$24,99',
      priceDetail: '/ mois',
      annualPrice: '$19,99 / mois en annuel',
      annualSavings: 'Économisez 20%',
      description: 'Le plus populaire',
      icon: Star,
      popular: false,
      cta: 'Essai gratuit 7 jours',
      ctaLink: '/signup?plan=professional',
      features: [
        '200 Conversions / mois',
        '500MB Taille Max',
        'Stockage : 7 jours',
        '1 500 Requêtes API / mois',
        'Support prioritaire',
        'Traitement par lot (10 fichiers)',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Le plus populaire',
      price: '$59,99',
      priceDetail: '/ mois',
      annualPrice: '$49,99 / mois en annuel',
      annualSavings: 'Économisez 20%',
      description: 'Pour les équipes',
      icon: Star,
      popular: true,
      cta: 'Essai gratuit 7 jours',
      ctaLink: '/signup?plan=business',
      features: [
        'Conversions illimitées',
        '2GB Taille Max',
        'Stockage : 30 jours',
        '15 000 Requêtes API / mois',
        'Support chat + email',
        'Workflows visuels',
        'Traitement par lot (100 fichiers)',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      subtitle: 'Solution sur mesure',
      price: 'Sur devis',
      priceDetail: 'À partir de $299 / mois',
      description: 'Pour les grandes entreprises',
      icon: Phone,
      popular: false,
      cta: '📞 Contacter les ventes',
      ctaLink: '/entreprise',
      features: [
        'Tout illimité (conversions, taille)',
        'Stockage : 90+ jours / permanent',
        'API illimitée',
        'Support 24/7 dédié (tél, chat)',
        'SLA 99,9%',
        'Chiffrement militaire',
        'Intégration personnalisée',
      ],
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Bandeau promo */}
        <div className="text-center mb-8 p-4 bg-primary/10 rounded-lg max-w-4xl mx-auto">
          <p className="text-sm md:text-base font-semibold text-primary">
            🎯 Essayez Multi Convert gratuitement pendant 7 jours – Aucune carte requise
          </p>
        </div>

        {/* Grille des plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative p-6 bg-card rounded-xl border-2 transition-all hover:shadow-xl ${
                  plan.popular
                    ? 'border-primary shadow-lg scale-105 lg:scale-110'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {plan.subtitle}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  {!plan.popular && (
                    <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
                  )}
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-1">{plan.price}</div>
                  <div className="text-xs text-muted-foreground">{plan.priceDetail}</div>
                  {plan.annualPrice && (
                    <div className="mt-2 text-xs text-primary font-semibold">
                      {plan.annualPrice}
                      <br />
                      <span className="text-green-600">{plan.annualSavings}</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                      : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Informations supplémentaires */}
        <div className="text-center space-y-3 mb-8 max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Conversion sans filigrane
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Connexion chiffrée (HTTPS)
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Support technique
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            💳 Sans engagement • Annulation à tout moment • Paiement sécurisé SSL
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Questions Fréquentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'Puis-je changer de plan ?',
                a: 'Oui, à tout moment. Upgrade immédiat, downgrade à la fin du cycle.',
              },
              {
                q: 'Que se passe-t-il si je dépasse mes limites ?',
                a: 'Vous serez notifié et pourrez acheter des crédits ou upgrader.',
              },
              {
                q: 'Comment fonctionnent les crédits ?',
                a: '1 crédit = 1 conversion simple. Valables 12 mois, pas d\'abonnement.',
              },
              {
                q: 'Y a-t-il un engagement ?',
                a: 'Aucun. Annulez à tout moment, remboursement au prorata.',
              },
              {
                q: 'Support disponible ?',
                a: 'Email pour tous, chat pour Business+, téléphone pour Enterprise.',
              },
              {
                q: 'Essai gratuit ?',
                a: '7 jours gratuits sur Professional et Business, sans carte bancaire.',
              },
            ].map((faq, index) => (
              <div key={index} className="p-4 bg-card rounded-lg border">
                <h4 className="font-semibold mb-2 text-sm">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
