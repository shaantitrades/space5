'use client';

import { useState } from 'react';
import { Calculator, CreditCard, Check, Zap } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function CreditsPage() {
  const [fileType, setFileType] = useState('pdf');
  const [fileSize, setFileSize] = useState(10);
  const [options, setOptions] = useState({
    ocr: false,
    compression: false,
    ai: false,
  });

  // Calcul des crédits nécessaires
  const calculateCredits = () => {
    let credits = 1; // Base

    // Facteur taille
    if (fileSize > 50) credits += 1;
    if (fileSize > 100) credits += 2;

    // Facteur type
    if (fileType === 'video') credits += 3;
    if (fileType === 'audio') credits += 2;

    // Options
    if (options.ocr) credits += 1;
    if (options.compression) credits += 0.5;
    if (options.ai) credits += 2;

    return Math.ceil(credits);
  };

  const creditsNeeded = calculateCredits();
  const costUSD = (creditsNeeded * 0.10).toFixed(2);

  const packs = [
    {
      credits: 5,
      price: 0.99,
      pricePerCredit: 0.198,
      popular: false,
    },
    {
      credits: 10,
      price: 1.49,
      pricePerCredit: 0.149,
      popular: false,
    },
    {
      credits: 50,
      price: 4.99,
      pricePerCredit: 0.0998,
      popular: true,
      savings: '50%',
    },
    {
      credits: 100,
      price: 7.99,
      pricePerCredit: 0.0799,
      popular: false,
      savings: '60%',
    },
    {
      credits: 500,
      price: 29.99,
      pricePerCredit: 0.06,
      popular: false,
      savings: '70%',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Acheter des Crédits
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Paiement à l'usage sans abonnement. Crédits valables 12 mois.
          </p>
        </div>

        {/* Calculateur */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border-2 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Calculateur de Crédits</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Type de fichier */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type de fichier
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="pdf">PDF / Document</option>
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                  <option value="video">Vidéo</option>
                </select>
              </div>

              {/* Taille estimée */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Taille estimée: {fileSize} MB
                </label>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={fileSize}
                  onChange={(e) => setFileSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 MB</span>
                  <span>200 MB</span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                Options supplémentaires
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="checkbox"
                    checked={options.ocr}
                    onChange={(e) => setOptions({ ...options, ocr: e.target.checked })}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium text-sm">OCR</div>
                    <div className="text-xs text-muted-foreground">+1 crédit</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="checkbox"
                    checked={options.compression}
                    onChange={(e) => setOptions({ ...options, compression: e.target.checked })}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium text-sm">Compression</div>
                    <div className="text-xs text-muted-foreground">+0.5 crédit</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="checkbox"
                    checked={options.ai}
                    onChange={(e) => setOptions({ ...options, ai: e.target.checked })}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium text-sm">Amélioration IA</div>
                    <div className="text-xs text-muted-foreground">+2 crédits</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Résultat */}
            <div className="bg-card rounded-xl p-6 border-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Vous avez besoin d'environ
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {creditsNeeded} crédit{creditsNeeded > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    Coût estimé
                  </p>
                  <p className="text-3xl font-bold">
                    ${costUSD}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Packs de crédits */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Choisissez votre pack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {packs.map((pack) => (
              <div
                key={pack.credits}
                className={`relative p-6 rounded-xl border-2 transition-all hover:shadow-xl ${
                  pack.popular
                    ? 'border-primary bg-primary/5 scale-105'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ Populaire
                    </span>
                  </div>
                )}
                {pack.savings && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{pack.savings}
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {pack.credits}
                  </div>
                  <div className="text-sm text-muted-foreground">crédits</div>
                </div>

                <div className="text-center mb-4">
                  <div className="text-2xl font-bold mb-1">
                    ${pack.price}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${pack.pricePerCredit.toFixed(3)} / crédit
                  </div>
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    pack.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Acheter
                </button>
              </div>
            ))}
          </div>

          {/* Informations */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-card rounded-xl border text-center">
              <Check className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Valables 12 mois</h3>
              <p className="text-sm text-muted-foreground">
                Utilisez vos crédits quand vous voulez
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border text-center">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Pas d'abonnement</h3>
              <p className="text-sm text-muted-foreground">
                Payez uniquement ce que vous utilisez
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border text-center">
              <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Paiement sécurisé</h3>
              <p className="text-sm text-muted-foreground">
                Stripe & PayPal acceptés
              </p>
            </div>
          </div>

          {/* CTA Abonnement */}
          <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-3">
              Besoin de plus ? Essayez un abonnement
            </h3>
            <p className="text-muted-foreground mb-6">
              Conversions illimitées à partir de $24,99/mois
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Voir les abonnements
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
