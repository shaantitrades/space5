'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Upload } from 'lucide-react';
import { SearchBar } from '@/components/layout/search-bar';

export function Hero() {
  const t = useTranslations('common');
  const th = useTranslations();

  // Textes avec fallback explicite pour éviter les clés manquantes
  const title = t('hero_title', { default: 'Suite de conversion universelle' }) as string;
  const subtitle = t('hero_subtitle', { default: 'Convertissez tous vos fichiers en local, vite et en sécurité.' }) as string;
  const cta = t('start_converting', { default: 'Commencer la conversion' }) as string;

  return (
    <section className="relative bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/convert"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                <Upload className="w-5 h-5" />
                {cta}
              </Link>
            </div>
          </div>

          {/* Faits vérifiables uniquement : aucun chiffre d'usage ni
              certification non démontrée ne doit apparaître ici. */}
          <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <span>{th.has('home.stats.noInstall') ? th('home.stats.noInstall') : '🖥️ Aucune installation'}</span>
            <span>{th.has('home.stats.languages') ? th('home.stats.languages') : '🌍 Disponible en 10 langues'}</span>
            <span>{th.has('home.stats.https') ? th('home.stats.https') : '🔒 Connexion chiffrée (HTTPS)'}</span>
          </div>

          {/* Barre de recherche : trouver un outil rapidement */}
          <div className="mt-8">
            <SearchBar embedded />
          </div>
        </div>
      </div>
    </section>
  );
}
