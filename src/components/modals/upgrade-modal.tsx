'use client';

import { X, CreditCard, Zap, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'limit_reached' | 'feature_locked' | 'file_too_large';
  conversionsUsed?: number;
  conversionsLimit?: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  reason = 'limit_reached',
  conversionsUsed = 25,
  conversionsLimit = 25,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const messages = {
    limit_reached: {
      title: '🎯 Limite atteinte !',
      description: `Vous avez utilisé vos ${conversionsLimit} conversions gratuites ce mois-ci.`,
    },
    feature_locked: {
      title: '🔒 Fonctionnalité Premium',
      description: 'Cette fonctionnalité est réservée aux abonnés.',
    },
    file_too_large: {
      title: '📦 Fichier trop volumineux',
      description: 'Votre plan actuel limite la taille des fichiers à 25MB.',
    },
  };

  const message = messages[reason];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-background/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">{message.title}</h2>
          <p className="text-muted-foreground">{message.description}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Continuez avec :</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Abonnement */}
            <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-primary" />
                <h4 className="text-xl font-bold">Abonnement Professional</h4>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold mb-1">$24,99<span className="text-lg text-muted-foreground">/mois</span></div>
                <div className="text-sm text-green-600 font-semibold">ou $19,99/mois en annuel (Économisez 20%)</div>
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>200 Conversions / mois</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>500MB Taille Max</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Stockage : 7 jours</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>1 500 Requêtes API / mois</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Support prioritaire</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=professional"
                onClick={onClose}
                className="block w-full text-center py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                🚀 Essai gratuit 7 jours
              </Link>
            </div>

            {/* Option 2: Crédits */}
            <div className="p-6 bg-muted/50 rounded-xl border-2 border-border">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-primary" />
                <h4 className="text-xl font-bold">Acheter des Crédits</h4>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold mb-1">Dès $0,99</div>
                <div className="text-sm text-muted-foreground">Pas d'abonnement</div>
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Paiement à l'usage uniquement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>1 crédit ≈ $0,10</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Pas d'engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Crédits valables 12 mois</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Packs de 5 à 500 crédits</span>
                </li>
              </ul>

              <Link
                href="/credits"
                onClick={onClose}
                className="block w-full text-center py-3 px-4 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg font-semibold transition-colors"
              >
                💰 Acheter des crédits
              </Link>
            </div>
          </div>

          {/* Option 3: Télécharger quand même (limité) */}
          {reason === 'limit_reached' && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-sm text-center text-muted-foreground">
                Ou{' '}
                <button
                  onClick={onClose}
                  className="text-primary hover:underline font-semibold"
                >
                  télécharger uniquement cette conversion
                </button>{' '}
                (qualité limitée, sans historique)
              </p>
            </div>
          )}

          {/* Aide */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Besoin d'aide ?{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Contactez-nous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
