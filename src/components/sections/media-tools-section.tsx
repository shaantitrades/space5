'use client';

import { Link } from '@/i18n/routing';
import { 
  Video,
  Music,
  Film,
  Scissors,
  Minimize2,
  Volume2,
  ArrowRight 
} from 'lucide-react';

export function MediaToolsSection() {
  const tools = [
    {
      id: 'video-convert',
      name: 'Conversion Vidéo',
      description: 'MP4, AVI, MOV, WebM',
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'audio-convert',
      name: 'Conversion Audio',
      description: 'MP3, WAV, FLAC, AAC',
      icon: Music,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'extract',
      name: 'Extraire Audio',
      description: 'Audio depuis vidéo',
      icon: Volume2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'trim',
      name: 'Découper',
      description: 'Couper vidéo/audio',
      icon: Scissors,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'compress',
      name: 'Compresser',
      description: 'Réduire la taille',
      icon: Minimize2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'merge',
      name: 'Fusionner',
      description: 'Combiner fichiers',
      icon: Film,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vidéo & Audio - Studio Multimédia
          </h2>
          <p className="text-xl text-muted-foreground">
            Conversion, découpage et compression vidéo/audio professionnels
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
            href="/media"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-xl transition-all"
          >
            Accéder aux outils Vidéo & Audio
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
