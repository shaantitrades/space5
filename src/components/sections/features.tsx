'use client';

import { Zap, Shield, Globe } from 'lucide-react';

export function Features() {
  return (
    <section className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <Zap className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune installation</h3>
            <p className="text-sm text-muted-foreground">
              Tout se passe dans le navigateur : rien à installer, aucun compte obligatoire pour convertir un fichier
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Vos fichiers ne sont pas revendus</h3>
            <p className="text-sm text-muted-foreground">
              Les fichiers sont traités à la demande, sans base documentaire constituée, et ne sont jamais revendus
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Globe className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Disponible en 10 langues</h3>
            <p className="text-sm text-muted-foreground">
              Interface et outils traduits, pour vos équipes comme pour vos clients
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
