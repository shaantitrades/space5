'use client';

import { 
  FileText, Image, Video, Music, Zap, Lock, 
  Code, Users, Workflow, Shield, Globe, CheckCircle,
  Sparkles, FileSearch, Merge, Scissors, Stamp, Key
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { siteConfig } from '@/config/site';

export default function FeaturesPage() {
  const categories = [
    {
      id: 'conversion',
      title: 'CONVERSION AVANCÉE',
      description: 'Convertissez tous vos fichiers avec une qualité professionnelle',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      features: [
        {
          icon: FileText,
          name: 'PDF ↔ Documents',
          description: 'Conversion bidirectionnelle PDF vers Word, Excel, PowerPoint, JPG, PNG et vice-versa',
        },
        {
          icon: Image,
          name: 'Images (20+ formats)',
          description: 'JPG, PNG, WebP, AVIF, SVG, GIF, TIFF, BMP avec optimisation intelligente',
        },
        {
          icon: Video,
          name: 'Vidéo HD/4K',
          description: 'MP4, AVI, MOV, MKV, WebM avec réglages qualité et compression',
        },
        {
          icon: Music,
          name: 'Audio Multi-format',
          description: 'MP3, WAV, FLAC, AAC, OGG avec préservation de la qualité',
        },
      ],
    },
    {
      id: 'tools',
      title: 'OUTILS INTÉGRÉS',
      description: 'Manipulez vos fichiers sans logiciel externe',
      icon: Scissors,
      color: 'from-purple-500 to-pink-500',
      features: [
        {
          icon: Scissors,
          name: 'Compression',
          description: 'Réduisez la taille de vos PDF et images sans perte de qualité visible',
        },
        {
          icon: Merge,
          name: 'Fusion PDF',
          description: 'Combinez plusieurs PDF en un seul document avec réorganisation',
        },
        {
          icon: Stamp,
          name: 'Signature & Watermark',
          description: 'Ajoutez signature électronique, watermark texte ou image',
        },
        {
          icon: Key,
          name: 'Protection PDF',
          description: 'Sécurisez vos documents avec mot de passe et restrictions',
        },
      ],
    },
    {
      id: 'privacy',
      title: 'ENGAGEMENT VIE PRIVÉE',
      description: 'Votre sécurité et confidentialité avant tout',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      features: [
        {
          icon: Lock,
          name: 'Traitement Local',
          description: 'Toutes vos conversions sont effectuées directement dans votre navigateur, sans envoyer vos fichiers sur nos serveurs.',
        },
        {
          icon: Shield,
          name: 'Aucune IA',
          description: 'Contrairement aux autres plateformes, nous ne utilisons pas d\'intelligence artificielle pour analyser vos données personnelles.',
        },
        {
          icon: CheckCircle,
          name: 'Contrôle Total',
          description: 'Vos données restent exclusivement sur votre appareil, vous gardez un contrôle absolu sur vos informations.',
        },
        {
          icon: Globe,
          name: 'Respect RGPD',
          description: 'Nous nous engageons à respecter strictement le RGPD et à ne jamais collecter ou monétiser vos données personnelles.',
        },
      ],
    },
    {
      id: 'security',
      title: 'SÉCURITÉ & CONFORMITÉ',
      description: 'Ce que nous protégeons, et comment',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      features: [
        {
          icon: Lock,
          name: 'Chiffrement en transit',
          description: 'HTTPS/TLS sur tous les échanges. Le chiffrement au repos n’est pas encore généralisé.',
        },
        {
          icon: CheckCircle,
          name: 'Aucune conservation par défaut',
          description: 'Les fichiers traités ne constituent pas une base documentaire.',
        },
        {
          icon: Shield,
          name: 'Conformité RGPD',
          description: 'Minimisation des données et registre de traitement',
        },
        {
          icon: Globe,
          name: 'Geo-blocking',
          description: 'Bloquez l\'accès depuis certains pays pour plus de sécurité',
        },
      ],
    },
    {
      id: 'developers',
      title: 'DÉVELOPPEURS',
      description: 'API puissante et documentation complète',
      icon: Code,
      color: 'from-indigo-500 to-blue-500',
      features: [
        {
          icon: Code,
          name: 'API REST Complète',
          description: 'Intégrez Multi Convert dans vos applications en quelques lignes',
        },
        {
          icon: Zap,
          name: 'Webhooks Temps Réel',
          description: 'Recevez des notifications instantanées sur vos conversions',
        },
        {
          icon: FileText,
          name: 'SDK Multi-langages',
          description: 'Python, JavaScript, PHP, Ruby, Go, Java avec exemples',
        },
        {
          icon: CheckCircle,
          name: 'Sandbox de Test',
          description: 'Testez l\'API gratuitement sans limite avant production',
        },
      ],
    },
    {
      id: 'support',
      title: 'SUPPORT & ÉQUIPE',
      description: 'Assistance professionnelle quand vous en avez besoin',
      icon: Users,
      color: 'from-pink-500 to-rose-500',
      features: [
        {
          icon: Users,
          name: 'Chat en Direct',
          description: 'Support instantané pour les plans Business et Enterprise',
        },
        {
          icon: CheckCircle,
          name: 'Email Prioritaire',
          description: 'Réponse sous 24h pour tous les plans payants',
        },
        {
          icon: Shield,
          name: 'Support Téléphonique',
          description: 'Ligne dédiée 24/7 pour les clients Enterprise',
        },
        {
          icon: FileText,
          name: 'Centre d\'Aide',
          description: 'Tutoriels vidéo, documentation et forum communautaire',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Fonctionnalités Complètes
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez toutes les fonctionnalités qui font de Multi Convert la plateforme 
              de conversion la plus complète du marché
            </p>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="py-12">
        <div className="container mx-auto px-4 space-y-20">
          {categories.map((category, index) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id} className="scroll-mt-20" id={category.id}>
                {/* En-tête de catégorie */}
                <div className="text-center mb-12">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} mb-4`}>
                    <CategoryIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">{category.title}</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {category.description}
                  </p>
                </div>

                {/* Grille de fonctionnalités */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  {category.features.map((feature, featureIndex) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div
                        key={featureIndex}
                        className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all group"
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <FeatureIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à essayer toutes ces fonctionnalités ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Commencez gratuitement dès maintenant, aucune carte bancaire requise
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/convert"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              🚀 Essayer gratuitement
            </Link>
            {siteConfig.features.showPricing && (
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                💎 Voir les tarifs
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
