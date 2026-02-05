'use client';

import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Designer Graphique',
      company: 'Studio Créatif',
      content: 'Multi Convert a transformé mon workflow. Je convertis des centaines d\'images par jour avec une qualité parfaite. Le traitement par lot est un game-changer!',
      rating: 5,
      avatar: '👩‍🎨',
    },
    {
      name: 'Thomas Martin',
      role: 'Développeur',
      company: 'TechCorp',
      content: 'L\'API est incroyablement simple à intégrer. J\'ai automatisé toutes nos conversions de documents en moins d\'une heure. Support technique au top!',
      rating: 5,
      avatar: '👨‍💻',
    },
    {
      name: 'Sophie Laurent',
      role: 'Chef de Projet',
      company: 'MediaPro',
      content: 'La sécurité et la conformité RGPD étaient essentielles pour nous. Multi Convert coche toutes les cases. Nos clients sont rassurés.',
      rating: 5,
      avatar: '👩‍💼',
    },
  ];

  const clients = [
    { name: 'Google', logo: '🔍' },
    { name: 'Microsoft', logo: '🪟' },
    { name: 'Amazon', logo: '📦' },
    { name: 'Netflix', logo: '🎬' },
    { name: 'Spotify', logo: '🎵' },
    { name: 'Adobe', logo: '🎨' },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Témoignages */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-muted-foreground">
            Des milliers de professionnels utilisent Multi Convert chaque jour
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.company}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>

        {/* Logos clients */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-6">
            Utilisé par les plus grandes entreprises
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {clients.map((client, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="text-4xl">{client.logo}</div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {client.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Prêt à transformer votre workflow ?
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels qui font confiance à Multi Convert
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/convert"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              🚀 Essai gratuit 7 jours
            </a>
            <a
              href="/entreprise"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              📞 Contactez-nous
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
