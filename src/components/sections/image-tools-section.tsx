'use client';

import { Link } from '@/i18n/routing';
import { 
  Image as ImageIcon,
  Sparkles,
  Zap,
  Droplets,
  Scissors,
  Maximize2,
  ArrowRight 
} from 'lucide-react';

export function ImageToolsSection() {
  const tools = [
    {
      id: 'convert',
      name: 'Conversion',
      description: '20+ formats supportés',
      icon: ImageIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'optimize',
      name: 'Optimisation',
      description: 'WebP, AVIF, compression',
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'resize',
      name: 'Redimensionner',
      description: 'Crop, resize, rotate',
      icon: Maximize2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'filters',
      name: 'Filtres',
      description: 'Effets professionnels',
      icon: Sparkles,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      id: 'watermark',
      name: 'Filigrane',
      description: 'Protégez vos images',
      icon: Droplets,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'batch',
      name: 'Traitement par lot',
      description: '100+ images à la fois',
      icon: Scissors,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Images & Logos - Studio Professionnel
          </h2>
          <p className="text-xl text-muted-foreground">
            Conversion, optimisation et édition d'images de qualité studio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="p-6 bg-card rounded-lg border hover:shadow-lg transition-all hover:scale-105"
              >
                <div className={`${tool.bgColor} ${tool.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-center mb-2">{tool.name}</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {tool.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/images"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-xl transition-all"
          >
            Accéder aux outils Images
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
