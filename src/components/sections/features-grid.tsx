'use client';

import { FileText, Image, Video, Music, Zap, Lock, Globe2, Workflow } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function FeaturesGrid() {
  const features = [
    {
      icon: Zap,
      title: 'IA-Powered',
      description: 'Suggestions automatiques, amélioration qualité intelligente',
      clickable: false,
    },
    {
      icon: Lock,
      title: 'Sécurité Militaire',
      description: 'Chiffrement, geo-blocking, protection fraude, RGPD',
      clickable: false,
    },
    {
      icon: Globe2,
      title: '10 Langues',
      description: 'Interface internationalisée pour marchés premium',
      clickable: false,
    },
    {
      icon: Workflow,
      title: 'Workflows',
      description: 'Pipelines visuels automatisés pour conversions complexes',
      clickable: false,
    },
    {
      icon: Music,
      title: 'Traitement par lot',
      description: '100+ fichiers simultanément avec gestion de queue',
      clickable: false,
    },
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Fonctionnalités Phares
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour une conversion professionnelle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            // Si la carte est cliquable, l'entourer d'un Link
            if (feature.clickable && feature.link) {
              return (
                <Link
                  key={index}
                  href={feature.link}
                  className="group p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <p className="text-xs text-primary font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Cliquez pour accéder →
                  </p>
                </Link>
              );
            }

            // Sinon, afficher une div normale
            return (
              <div
                key={index}
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
