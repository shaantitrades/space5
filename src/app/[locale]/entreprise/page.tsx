'use client';

import { useState } from 'react';
import { Check, Building, Users, Shield, Zap, Phone, Mail, MessageSquare, TrendingUp, Lock, Globe, Rocket, Server, Cloud, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { BackButton } from '@/components/ui/back-button';

export default function EntreprisePage() {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    employees: '',
    message: '',
  });

  // ROI Calculator State
  const [roiData, setRoiData] = useState({
    monthlyConversions: 10000,
    averageFileSize: 5,
    currentCostPerConversion: 0.05,
  });

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Envoyer les données au backend
    alert('Merci ! Notre équipe vous contactera sous 24h.');
  };

  // ROI Calculations
  const calculateROI = () => {
    const monthlyConversions = roiData.monthlyConversions;
    const currentMonthlyCost = monthlyConversions * roiData.currentCostPerConversion;
    const omniversaCost = 299; // Prix Enterprise de base
    const monthlySavings = currentMonthlyCost - omniversaCost;
    const yearlySavings = monthlySavings * 12;
    const roi = ((monthlySavings * 12) / (omniversaCost * 12)) * 100;

    return {
      currentMonthlyCost: currentMonthlyCost.toFixed(2),
      omniversaCost: omniversaCost.toFixed(2),
      monthlySavings: monthlySavings.toFixed(2),
      yearlySavings: yearlySavings.toFixed(2),
      roi: roi.toFixed(0),
    };
  };

  const roiResults = calculateROI();

  const enterpriseFeatures = [
    'Conversions illimitées',
    'Taille de fichier illimitée',
    'Stockage permanent',
    'API illimitée avec SLA 99,9%',
    'Support dédié 24/7 (téléphone + chat)',
    'Chiffrement militaire personnalisé',
    'Intégration sur mesure',
    'Formation de l\'équipe incluse',
    'Facturation centralisée',
    'Gestion multi-utilisateurs',
    'Audit logs complets',
    'Conformité personnalisée (HIPAA, etc.)',
  ];

  const caseStudies = [
    {
      company: 'TechCorp Global',
      logo: '🏢',
      industry: 'Technologie',
      employees: '5000+',
      result: '80% de gain de temps sur les conversions de documents',
      quote: 'OMNIVERSA a transformé notre workflow documentaire. L\'API s\'est intégrée en 2 jours.',
    },
    {
      company: 'MediaPro Studio',
      logo: '🎬',
      industry: 'Médias',
      employees: '500+',
      result: '2M+ fichiers convertis par mois sans incident',
      quote: 'La fiabilité et la qualité sont exceptionnelles. Support technique au top.',
    },
    {
      company: 'HealthCare Inc',
      logo: '🏥',
      industry: 'Santé',
      employees: '10000+',
      result: 'Conformité HIPAA garantie',
      quote: 'Sécurité de niveau militaire et conformité réglementaire assurée.',
    },
  ];

  // Client Logos
  const clientLogos = [
    { name: 'Microsoft', logo: '🖥️' },
    { name: 'Amazon', logo: '📦' },
    { name: 'Google', logo: '🔍' },
    { name: 'Apple', logo: '🍎' },
    { name: 'IBM', logo: '💼' },
    { name: 'Oracle', logo: '🔴' },
    { name: 'Salesforce', logo: '☁️' },
    { name: 'Adobe', logo: '🎨' },
  ];

  // Certifications
  const certifications = [
    { name: 'ISO 27001', icon: Shield, description: 'Sécurité de l\'information' },
    { name: 'SOC 2 Type II', icon: Lock, description: 'Audit de sécurité' },
    { name: 'GDPR', icon: Globe, description: 'Protection des données EU' },
    { name: 'HIPAA', icon: Shield, description: 'Conformité santé USA' },
  ];

  // Integrations
  const integrations = [
    { name: 'AWS', icon: Cloud },
    { name: 'Azure', icon: Cloud },
    { name: 'Google Cloud', icon: Cloud },
    { name: 'Salesforce', icon: Rocket },
    { name: 'Slack', icon: MessageSquare },
    { name: 'Microsoft 365', icon: Building },
    { name: 'Dropbox', icon: Server },
    { name: 'Box', icon: Server },
  ];

  // FAQ Data
  const faqData = [
    {
      question: 'Combien de temps prend la mise en place ?',
      answer: 'L\'intégration standard prend 2-5 jours ouvrés. Notre équipe technique vous accompagne à chaque étape avec une formation complète de votre équipe.',
    },
    {
      question: 'Comment gérez-vous 10,000+ utilisateurs simultanés ?',
      answer: 'Notre infrastructure cloud auto-scalable garantit des performances optimales même avec des pics de charge. SLA de 99.99% uptime avec redondance géographique.',
    },
    {
      question: 'Quelles sont les options de migration ?',
      answer: 'Nous offrons un service de migration complet et gratuit de votre solution actuelle. Notre équipe gère l\'extraction, la transformation et l\'importation de vos données.',
    },
    {
      question: 'Proposez-vous un hébergement on-premise ?',
      answer: 'Oui, pour les entreprises avec des contraintes de souveraineté des données, nous proposons des déploiements on-premise ou dans des clouds privés.',
    },
    {
      question: 'Quel est le niveau de personnalisation disponible ?',
      answer: 'Personnalisation complète : white-labeling, workflows sur mesure, intégrations custom, API dédiée, et développements spécifiques selon vos besoins.',
    },
    {
      question: 'Comment fonctionne le support 24/7 ?',
      answer: 'Support dédié avec équipe technique assignée, hotline directe, chat prioritaire, et gestionnaire de compte attitré. Temps de réponse < 1h pour les urgences.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          {/* Bouton retour */}
          <div className="mb-6">
            <BackButton />
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Solutions Enterprise
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Une plateforme de conversion sur mesure pour les grandes entreprises
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>SLA 99,9%</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Support 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Intégration rapide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métriques en temps réel */}
      <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50M+</div>
              <div className="text-sm text-muted-foreground">Conversions/mois</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">99.99%</div>
              <div className="text-sm text-muted-foreground">Uptime garanti</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Entreprises clientes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support dédié</div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Clients */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Rejoignez les leaders de l'industrie
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Des centaines d'entreprises du Fortune 500 nous font confiance
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-8 max-w-6xl mx-auto items-center">
            {clientLogos.map((client, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-4 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-2">{client.logo}</div>
                <div className="text-xs text-center text-muted-foreground">{client.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sécurité & Certifications */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Sécurité & Conformité de niveau Enterprise
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Certifications reconnues mondialement pour garantir la protection de vos données
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-card rounded-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground">{cert.description}</p>
                </div>
              );
            })}
          </div>

          {/* Security Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 bg-card rounded-lg border border-border">
              <Lock className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">Chiffrement AES-256</h3>
              <p className="text-sm text-muted-foreground">
                Vos fichiers sont chiffrés en transit et au repos avec les standards militaires
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <Shield className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">Audit Logs</h3>
              <p className="text-sm text-muted-foreground">
                Traçabilité complète de toutes les actions avec logs d'audit détaillés
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <Globe className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">Redondance Géographique</h3>
              <p className="text-sm text-muted-foreground">
                Données répliquées sur plusieurs régions pour une disponibilité maximale
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intégrations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Intégrations avec vos outils existants
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Connexion native avec les plateformes que vous utilisez déjà
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-md text-center group"
                >
                  <Icon className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-sm">{integration.name}</h3>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">
              + Intégrations personnalisées via notre API REST
            </p>
            <Link
              href="/documentation"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              📖 Voir la documentation API
            </Link>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                📊 Calculez votre ROI
              </h2>
              <p className="text-lg text-muted-foreground">
                Découvrez combien vous pourriez économiser avec OMNIVERSA Enterprise
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="p-8 bg-card rounded-xl border border-border space-y-6">
                <h3 className="font-bold text-xl mb-6">Vos paramètres actuels</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Conversions mensuelles
                  </label>
                  <input
                    type="number"
                    value={roiData.monthlyConversions}
                    onChange={(e) => setRoiData({ ...roiData, monthlyConversions: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nombre de fichiers convertis par mois
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Taille moyenne des fichiers (MB)
                  </label>
                  <input
                    type="number"
                    value={roiData.averageFileSize}
                    onChange={(e) => setRoiData({ ...roiData, averageFileSize: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Coût actuel par conversion ($)
                  </label>
                  <input
                    type="number"
                    value={roiData.currentCostPerConversion}
                    onChange={(e) => setRoiData({ ...roiData, currentCostPerConversion: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Incluant licences, infrastructure, maintenance
                  </p>
                </div>
              </div>

              {/* Results */}
              <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary shadow-lg">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Vos économies potentielles
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Coût actuel (mois)</div>
                    <div className="text-3xl font-bold text-red-600">
                      ${roiResults.currentMonthlyCost}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">OMNIVERSA Enterprise (mois)</div>
                    <div className="text-3xl font-bold text-green-600">
                      ${roiResults.omniversaCost}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground mb-1">Économies mensuelles</div>
                    <div className="text-4xl font-bold text-primary">
                      ${roiResults.monthlySavings}
                    </div>
                  </div>

                  <div className="p-4 bg-primary/20 rounded-lg">
                    <div className="text-sm font-medium mb-1">Économies annuelles</div>
                    <div className="text-3xl font-bold text-primary">
                      ${roiResults.yearlySavings}
                    </div>
                  </div>

                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="text-sm font-medium mb-1">ROI sur 1 an</div>
                    <div className="text-3xl font-bold text-green-600">
                      +{roiResults.roi}%
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    ⚡ Sans compter les gains de productivité et la réduction des erreurs
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                💰 Obtenir un devis personnalisé
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Enterprise */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Questions fréquentes Enterprise
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Les réponses aux questions les plus courantes de nos clients entreprise
            </p>
            
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                    {openFaqIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === index && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-primary/10 rounded-xl text-center">
              <h3 className="font-bold text-lg mb-2">Vous avez d'autres questions ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Notre équipe est disponible pour répondre à toutes vos questions
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                💬 Parler à un expert
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Comparaison Enterprise vs Business */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Enterprise vs Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Business */}
            <div className="p-8 bg-card rounded-xl border border-border">
              <h3 className="text-2xl font-bold mb-4">Business</h3>
              <div className="text-3xl font-bold mb-6">$59,99<span className="text-lg text-muted-foreground">/mois</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start text-sm">
                  <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Conversions illimitées</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>2GB taille max</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>15K requêtes API/mois</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Support chat + email</span>
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full text-center py-3 px-4 rounded-lg font-semibold bg-muted hover:bg-muted/80 transition-colors"
              >
                Voir les détails
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <div className="text-3xl font-bold mb-6">Sur devis<span className="text-lg text-muted-foreground block">À partir de $299/mois</span></div>
              <ul className="space-y-3 mb-6">
                {enterpriseFeatures.slice(0, 6).map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="text-sm text-primary font-semibold">+ 6 autres avantages</li>
              </ul>
              <a
                href="#contact"
                className="block w-full text-center py-3 px-4 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                📞 Contacter les ventes
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cas clients */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ils nous font confiance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {caseStudies.map((study, index) => (
              <div key={index} className="p-6 bg-card rounded-xl border border-border">
                <div className="text-5xl mb-4">{study.logo}</div>
                <h3 className="text-xl font-bold mb-2">{study.company}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                  <span>{study.industry}</span>
                  <span>•</span>
                  <span>{study.employees} employés</span>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-primary">{study.result}</p>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "{study.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire de contact */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Demandez une démo personnalisée
              </h2>
              <p className="text-lg text-muted-foreground">
                Notre équipe vous contactera sous 24h pour discuter de vos besoins
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Votre entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Prénom Nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="vous@entreprise.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre d'employés
                  </label>
                  <select
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="1-50">1-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-1000">201-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    placeholder="Parlez-nous de vos besoins..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  📞 Demander une démo
                </button>
              </form>

              {/* Informations de contact */}
              <div className="space-y-6">
                <div className="p-6 bg-card rounded-xl border border-border">
                  <h3 className="font-bold mb-4">Contactez-nous directement</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <div className="font-semibold">Téléphone</div>
                        <div className="text-sm text-muted-foreground">+33 1 23 45 67 89</div>
                        <div className="text-xs text-muted-foreground">Lun-Ven 9h-18h</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <div className="font-semibold">Email</div>
                        <div className="text-sm text-muted-foreground">enterprise@omniversa.com</div>
                        <div className="text-xs text-muted-foreground">Réponse sous 24h</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <div className="font-semibold">Chat</div>
                        <div className="text-sm text-muted-foreground">Support instantané</div>
                        <div className="text-xs text-muted-foreground">24/7 pour Enterprise</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-primary/10 rounded-xl">
                  <h3 className="font-bold mb-3">Ce qui est inclus :</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Démo personnalisée 1h</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Audit de vos besoins</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Devis sur mesure</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>POC gratuit 30 jours</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
