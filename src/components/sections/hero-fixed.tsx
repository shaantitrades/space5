'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Upload, Check } from 'lucide-react';

export function Hero() {
  const t = useTranslations('common');

  // Textes avec fallback explicite pour éviter les clés manquantes
  const title = t('hero_title', { default: 'Suite de conversion universelle' }) as string;
  const subtitle = t('hero_subtitle', { default: 'Convertissez tous vos fichiers en local, vite et en sécurité.' }) as string;
  const cta = t('start_converting', { default: 'Commencer la conversion' }) as string;

  const featureCards = [
    { icon: Check, title: 'Rapide', desc: 'Conversions instantanées' },
    { icon: Check, title: 'Sûr', desc: 'Vos fichiers sont protégés' },
    { icon: Check, title: 'Gratuit', desc: 'Aucune limite' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link
                href="/convert"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                <Upload className="w-5 h-5" />
                {cta}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {featureCards.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card">
                <item.icon className="w-8 h-8 text-primary" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 text-sm font-semibold mt-12">
            <span>🎯 2M+ fichiers convertis</span>
            <span>⭐ 4.9/5</span>
            <span>🔐 Certifié GDPR</span>
          </div>
        </div>
      </div>
    </section>
  );
}
