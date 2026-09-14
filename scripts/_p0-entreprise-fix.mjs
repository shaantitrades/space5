/**
 * Script P0 — Page /entreprise
 *
 * Objectif : supprimer toutes les affirmations invérifiables (logos clients
 * fictifs, certifications non obtenues, métriques inventées, témoignages
 * fabriqués) et câbler le formulaire sur l'API /api/leads.
 *
 * Usage : node scripts/_p0-entreprise-fix.mjs
 */
import fs from 'node:fs';

const FILE = 'src/app/[locale]/entreprise/page.tsx';
let src = fs.readFileSync(FILE, 'utf8');
const initialLength = src.length;
let failures = 0;

function swap(label, startMarker, endMarker, replacement) {
  const start = src.indexOf(startMarker);
  if (start === -1) {
    failures++;
    console.error(`❌ ${label} — ancre de début introuvable : ${startMarker}`);
    return;
  }
  const end = endMarker ? src.indexOf(endMarker, start) : src.length;
  if (end === -1) {
    failures++;
    console.error(`❌ ${label} — ancre de fin introuvable : ${endMarker}`);
    return;
  }
  src = src.slice(0, start) + replacement + src.slice(end);
  console.log(`✅ ${label}`);
}

// ---------------------------------------------------------------------------
// 1. Imports : Building n’est plus utilisé
// ---------------------------------------------------------------------------
swap(
  'imports',
  "import { Check, Building, Users, Shield, Zap, Mail, MessageSquare, TrendingUp, Lock, Globe, Server, ChevronDown, ChevronUp, Loader2, AlertCircle, Rocket, FlaskConical } from 'lucide-react';",
  'import { Link } from',
  "import { Check, Users, Shield, Zap, Mail, MessageSquare, TrendingUp, Lock, Globe, Server, ChevronDown, ChevronUp, Loader2, AlertCircle, Rocket, FlaskConical } from 'lucide-react';\n"
);

// ---------------------------------------------------------------------------
// 2. Jeux de données : remplacement des contenus fabriqués
// ---------------------------------------------------------------------------
const dataBlocks = `  /** Ce qui est réellement inclus dans le programme pilote */
  const pilotIncludes = [
    'Accès complet aux outils PDF, Images et Média',
    'Jusqu’à 10 000 conversions par mois',
    'Prise en main accompagnée (visio 1 h)',
    'Canal de support direct (email + messagerie)',
    'Démonstration sur vos propres fichiers',
    'Restitution chiffrée : volume traité et temps gagné',
  ];

  /**
   * Ce que nous ne promettons PAS à ce stade.
   * Afficher ces limites est un gage de sérieux : un acheteur B2B
   * vérifie chaque promesse et sanctionne les affirmations invérifiables.
   */
  const pilotExcludes = [
    'Engagement de disponibilité (SLA) contractuel',
    'Hébergement dédié ou on-premise',
    'SSO / connexion à votre annuaire',
    'Certification ISO 27001 ou SOC 2',
    'Hébergement de données de santé (HDS)',
  ];

  /** Ce que nous demandons en échange du pilote gratuit */
  const pilotExpectations = [
    'Deux points de 30 min par mois',
    'Un témoignage chiffré en fin de pilote',
    'L’autorisation de citer le nom de votre entreprise',
    'Vos retours d’usage, priorisés',
  ];

  /** Segments pour lesquels nos outils répondent à un besoin réel */
  const targetSegments = [
    {
      name: 'Cabinets juridiques & notariaux',
      icon: '⚖️',
      need: 'Fusion de dossiers, numérotation Bates, OCR de pièces scannées, caviardage, signature.',
    },
    {
      name: 'Expertise comptable & paie',
      icon: '🧾',
      need: 'PDF vers Excel, OCR de factures, fusion de justificatifs, traitement par lot.',
    },
    {
      name: 'E-commerce & marketplaces',
      icon: '🛒',
      need: 'Conversion par lot en WebP/AVIF, redimensionnement, filigrane catalogue.',
    },
    {
      name: 'Agences, imprimeurs & studios',
      icon: '🎬',
      need: 'Formats d’impression, compression et découpe vidéo/audio, lots de 100+ fichiers.',
    },
    {
      name: 'Immobilier & gestion locative',
      icon: '🏠',
      need: 'Compilation et compression de dossiers volumineux.',
    },
    {
      name: 'Éducation & formation',
      icon: '🎓',
      need: 'Conversion de supports pédagogiques, extraction audio de cours.',
    },
  ];

  /** État réel de la conformité : aucune certification affichée sans audit passé */
  const complianceStatus = [
    { name: 'RGPD', icon: Shield, status: 'En cours', detail: 'Registre de traitement et accord de sous-traitance (DPA) en préparation.' },
    { name: 'ISO 27001', icon: Lock, status: 'Non certifié', detail: 'Aucun audit planifié à ce stade.' },
    { name: 'SOC 2', icon: Server, status: 'Non certifié', detail: 'Aucun audit planifié à ce stade.' },
    { name: 'HDS (données de santé)', icon: Globe, status: 'Non éligible', detail: 'L’hébergement de données de santé n’est pas supporté.' },
  ];

  /** Intégrations : distinguer ce qui existe de ce qui reste à construire */
  const integrationRoadmap = [
    { name: 'API REST', status: 'Disponible', detail: 'Points d’entrée de traitement opérationnels.' },
    { name: 'Clés API & webhooks', status: 'En développement', detail: 'Gestion des clés en cours de finalisation.' },
    { name: 'Make / Zapier', status: 'À l’étude', detail: 'Planifié après la sortie des clés API.' },
    { name: 'Stockage cloud (S3, Drive, Dropbox)', status: 'À l’étude', detail: 'Étudié au cas par cas pendant un pilote.' },
    { name: 'SSO / SAML', status: 'À l’étude', detail: 'Requis pour les grands comptes.' },
    { name: 'Déploiement on-premise', status: 'À l’étude', detail: 'Étudié au cas par cas selon les contraintes.' },
  ];

`;
swap('jeux de données', '  const enterpriseFeatures = [', '  // FAQ Data', dataBlocks);

// ---------------------------------------------------------------------------
// 3. FAQ : réponses honnêtes (plus de SLA 99,99 % ni de conformité garantie)
// ---------------------------------------------------------------------------
const faqBlock = `  // FAQ
  const faqData = [
    {
      question: "Combien de temps prend la mise en place ?",
      answer:
        "Le pilote démarre sous 48 h : création de l’accès, prise en main d’une heure, puis vous traitez vos propres fichiers. Aucune intégration technique n’est requise pour commencer.",
    },
    {
      question: 'Comment se passe le pilote gratuit ?',
      answer:
        "45 jours, trois places maximum par secteur, sans engagement. Nous ne demandons ni moyen de paiement ni exclusivité. En échange, nous attendons deux points d’échange par mois et un témoignage en fin de pilote.",
    },
    {
      question: 'Que se passe-t-il à la fin du pilote ?',
      answer:
        "Le tarif post-pilote vous est communiqué AVANT le début du pilote, avec une remise de fidélité. Si l’outil ne convient pas, l’accès est simplement arrêté, sans frais ni engagement.",
    },
    {
      question: 'Où sont traitées nos données ?',
      answer:
        "Les fichiers sont traités sur nos serveurs, hébergés dans l’Union européenne, uniquement le temps de l’opération, puis supprimés. Aucun envoi vers un service tiers d’intelligence artificielle n’est effectué aujourd’hui. Un mode de traitement 100 % local dans le navigateur, où aucun fichier n’est transmis, est en préparation.",
    },
    {
      question: 'Êtes-vous certifiés ISO 27001 ou SOC 2 ?',
      answer:
        "Non, et nous ne l’affichons pas car ce serait faux : aucun audit n’est planifié à ce stade. Nous travaillons en revanche à la mise en conformité RGPD (registre de traitement, accord de sous-traitance) et appliquons déjà la minimisation des données.",
    },
    {
      question: 'Proposez-vous un hébergement on-premise ?',
      answer:
        "Pas aujourd’hui. C’est une demande fréquente des secteurs à contraintes fortes : le sujet est à l’étude et sera examiné au cas par cas selon les pilotes.",
    },
    {
      question: 'Comment fonctionne le support ?',
      answer:
        "Un canal direct (email et messagerie partagée) avec un objectif de réponse sous 24 h ouvrées. Il n’y a pas de permanence 24/7 : nous ne le promettons pas.",
    },
  ];

`;
swap('FAQ', '  // FAQ Data', '  return (', faqBlock);

// ---------------------------------------------------------------------------
// 4. Hero : suppression du « SLA 99,9 % » et du positionnement grand compte
// ---------------------------------------------------------------------------
const heroBlock = `      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <FlaskConical className="w-4 h-4" />
              Programme pilote : {siteConfig.pilot.seats} places, {siteConfig.pilot.durationDays} jours, sans engagement
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Offre Entreprise</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Un accompagnement pour les équipes qui traitent beaucoup de documents, d’images ou de médias — sans
              engagement, et sans chiffres inventés.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Pilote sans frais</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Prise en main accompagnée</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Serveurs dans l’UE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

`;
swap('hero', '      {/* Hero */}', '      {/* Métriques en temps réel */}', heroBlock);

// ---------------------------------------------------------------------------
// 5. Métriques : remplacement de « 50M+ / 99,99 % / 500+ / 24/7 »
// ---------------------------------------------------------------------------
const metricsBlock = `      {/* Chiffres vérifiables uniquement */}
      <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{siteConfig.pilot.seats}</div>
              <div className="text-sm text-muted-foreground">places pilotes par secteur</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{siteConfig.pilot.durationDays} j</div>
              <div className="text-sm text-muted-foreground">de pilote, sans engagement</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">0 €</div>
              <div className="text-sm text-muted-foreground">pendant le pilote</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10 000</div>
              <div className="text-sm text-muted-foreground">conversions par mois incluses</div>
            </div>
          </div>
        </div>
      </section>

`;
swap('métriques', '      {/* Métriques en temps réel */}', '      {/* Logos Clients */}', metricsBlock);

// ---------------------------------------------------------------------------
// 6. Logos clients fictifs -> segments réellement servis
// ---------------------------------------------------------------------------
const segmentsBlock = `      {/* Segments ciblés */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Pour quels métiers l’outil est-il conçu ?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Nous ouvrons {siteConfig.pilot.seats} places par secteur, afin d’adapter l’outil à un usage réel plutôt qu’à
            un cahier des charges théorique.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {targetSegments.map((segment, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-3">{segment.icon}</div>
                <h3 className="font-bold mb-2">{segment.name}</h3>
                <p className="text-sm text-muted-foreground">{segment.need}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Votre métier n’apparaît pas ? Écrivez-nous : les places restantes sont attribuées au cas par cas.
          </p>
        </div>
      </section>

`;
swap('segments', '      {/* Logos Clients */}', '      {/* Sécurité & Certifications */}', segmentsBlock);

// ---------------------------------------------------------------------------
// 7. Certifications inventées -> état de conformité réel
// ---------------------------------------------------------------------------
const complianceBlock = `      {/* Conformité : état réel, sans certification inventée */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Conformité : où nous en sommes réellement</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Nous n’afficherons aucune certification avant d’avoir passé l’audit correspondant.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {complianceStatus.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="p-6 bg-card rounded-xl border border-border text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <div className="text-sm font-semibold text-primary mb-2">{item.status}</div>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              );
            })}
          </div>

          {/* Mesures réellement en place */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 bg-card rounded-lg border border-border">
              <Lock className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">Chiffrement en transit</h3>
              <p className="text-sm text-muted-foreground">
                Les échanges avec nos serveurs passent en HTTPS/TLS. Le chiffrement au repos n’est pas encore généralisé.
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <Server className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">Minimisation des données</h3>
              <p className="text-sm text-muted-foreground">
                Les fichiers sont traités le temps de l’opération puis supprimés. Nous ne constituons pas de base
                documentaire.
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <Users className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">Accès restreint</h3>
              <p className="text-sm text-muted-foreground">
                Les accès internes sont nominatifs. Les journaux d’audit exportables font partie des chantiers en cours.
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-10 p-5 rounded-xl border border-border bg-muted/40 flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Vous avez un besoin de conformité strict (santé, défense, secteur public) ? Dites-le nous avant de
              commencer : nous préférons refuser un pilote plutôt que de promettre une conformité non démontrable.
            </p>
          </div>
        </div>
      </section>

`;
swap('conformité', '      {/* Sécurité & Certifications */}', '      {/* Intégrations */}', complianceBlock);

// ---------------------------------------------------------------------------
// 8. Intégrations « natives » -> feuille de route assumée
// ---------------------------------------------------------------------------
const integrationsBlock = `      {/* Intégrations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Intégrations : ce qui existe et ce qui vient</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Cette feuille de route est publique et mise à jour au fil du développement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {integrationRoadmap.map((item, index) => (
              <div key={index} className="p-6 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">
              Une intégration précise est bloquante pour vous ? Signalez-la pendant le pilote : elle peut être
              priorisée.
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

`;
swap('intégrations', '      {/* Intégrations */}', '      {/* ROI Calculator */}', integrationsBlock);

// ---------------------------------------------------------------------------
// 9. ROI : plus de « $299 » ni de fausse remise sur un prix non publié
// ---------------------------------------------------------------------------
const roiBlock = `      {/* ROI Calculator */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">📊 Estimez ce que le pilote vous fait économiser</h2>
              <p className="text-lg text-muted-foreground">
                Pendant le pilote, l’accès est offert : vos économies correspondent au coût que vous payez aujourd’hui.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="p-8 bg-card rounded-xl border border-border space-y-6">
                <h3 className="font-bold text-xl mb-6">Vos paramètres actuels</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">Conversions par mois</label>
                  <input
                    type="number"
                    value={roiData.monthlyConversions}
                    onChange={(e) => setRoiData({ ...roiData, monthlyConversions: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Nombre de fichiers traités chaque mois</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Coût actuel par conversion (€)</label>
                  <input
                    type="number"
                    value={roiData.currentCostPerConversion}
                    onChange={(e) => setRoiData({ ...roiData, currentCostPerConversion: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Licences, abonnements, temps de manipulation manuelle…
                  </p>
                </div>
              </div>

              {/* Results */}
              <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary shadow-lg">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Estimation
                </h3>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Coût actuel estimé (par mois)</div>
                    <div className="text-3xl font-bold text-muted-foreground">≈ {roiResults.currentMonthlyCost} €</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Coût actuel estimé (par an)</div>
                    <div className="text-3xl font-bold text-muted-foreground">≈ {roiResults.yearlyCost} €</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Coût pendant le pilote</div>
                    <div className="text-3xl font-bold text-green-600">0 €</div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Estimation indicative, calculée à partir de vos propres chiffres. Elle ne constitue pas une offre de
                  prix.
                </p>

                <a
                  href="#contact"
                  className="mt-6 inline-flex w-full items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Demander une place pilote
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

`;
swap('ROI', '      {/* ROI Calculator */}', '      {/* FAQ Enterprise */}', roiBlock);

// ---------------------------------------------------------------------------
// 10. FAQ : titre et accroche sans promesse de « clients entreprise »
// ---------------------------------------------------------------------------
const faqSectionBlock = `      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Questions fréquentes</h2>
            <p className="text-center text-muted-foreground mb-12">
              Les réponses aux questions que l’on nous pose le plus souvent avant un pilote
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
              <h3 className="font-bold text-lg mb-2">Une autre question ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Écrivez-nous : une réponse humaine, sous 24 h ouvrées.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                💬 Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

`;
swap('FAQ (section)', '      {/* FAQ Enterprise */}', '      {/* Comparaison Enterprise vs Business */}', faqSectionBlock);

// ---------------------------------------------------------------------------
// 11. Comparaison tarifaire inventée -> périmètre explicite du pilote
// ---------------------------------------------------------------------------
const perimeterBlock = `      {/* Périmètre du pilote */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Le périmètre du pilote, sans ambiguïté</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Inclus */}
            <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Ce qui est inclus</h3>
              <ul className="space-y-3 mb-6">
                {pilotIncludes.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="block w-full text-center py-3 px-4 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Demander une place pilote
              </a>
            </div>

            {/* Non inclus */}
            <div className="p-8 bg-card rounded-xl border border-border">
              <h3 className="text-2xl font-bold mb-6">Ce qui n’est pas inclus</h3>
              <ul className="space-y-3 mb-6">
                {pilotExcludes.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <AlertCircle className="w-5 h-5 text-muted-foreground mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                Ce périmètre peut évoluer si votre besoin le justifie, mais jamais sans un échange écrit.
              </p>
            </div>
          </div>
        </div>
      </section>

`;
swap('périmètre', '      {/* Comparaison Enterprise vs Business */}', '      {/* Cas clients */}', perimeterBlock);

// ---------------------------------------------------------------------------
// 12. Faux cas clients -> déroulé réel du pilote
// ---------------------------------------------------------------------------
const pilotProgramBlock = `      {/* Programme pilote */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Comment se déroule le pilote</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Nous n’affichons pas de références clients que nous n’avons pas. Voici les étapes, et ce que nous vous
            demandons en retour.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Vos étapes
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>Prise de contact et description de votre flux de travail habituel.</li>
                <li>Prise en main d’une heure, sur vos propres fichiers.</li>
                <li>Traitement en autonomie pendant {siteConfig.pilot.durationDays} jours.</li>
                <li>Points d’étape réguliers et ajustements.</li>
                <li>Bilan chiffré et proposition d’offre préférentielle.</li>
              </ol>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Ce que nous demandons
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {pilotExpectations.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Aucun moyen de paiement n’est demandé et aucun engagement n’est signé pour démarrer.
              </p>
            </div>
          </div>
        </div>
      </section>

`;
swap('programme pilote', '      {/* Cas clients */}', '      {/* Formulaire de contact */}', pilotProgramBlock);

// ---------------------------------------------------------------------------
// 13. Formulaire : envoi réel vers /api/leads + coordonnées non fictives
// ---------------------------------------------------------------------------
const formBlockTop = `      {/* Formulaire de contact */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Demander une place pilote</h2>
              <p className="text-lg text-muted-foreground">
                Décrivez votre besoin en quelques lignes : nous répondons sous 24 h ouvrées.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {submitState === 'success' ? (
                <div className="p-8 bg-card rounded-xl border-2 border-primary">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Demande envoyée
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Merci ! Nous revenons vers vous sous 24 h ouvrées avec les prochaines étapes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitState('idle')}
                    className="text-sm text-primary hover:underline"
                  >
                    Envoyer une autre demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Champ leurre anti-robot : invisible pour les humains */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="hidden"
                    aria-hidden="true"
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">Nom de l’entreprise *</label>
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
                    <label className="block text-sm font-medium mb-2">Votre nom *</label>
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
                    <label className="block text-sm font-medium mb-2">Email professionnel *</label>
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
                    <label className="block text-sm font-medium mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
`;

const formBlockBottom = `
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre d’employés</label>
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
                    <label className="block text-sm font-medium mb-2">Votre besoin</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="Types de fichiers, volume mensuel, contraintes de conformité…"
                    />
                  </div>

                  {submitState === 'error' && (
                    <div className="flex items-start gap-2 p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-sm">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitState === 'loading'}
                    className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {submitState === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi…
                      </>
                    ) : (
                      'Demander une place pilote'
                    )}
                  </button>
`;

const formBlockFooter = `
                  <p className="text-xs text-muted-foreground">
                    En envoyant ce formulaire, vous acceptez que nous utilisions ces informations pour vous recontacter.
                    Aucun fichier ne vous est demandé à cette étape.
                  </p>
                </form>
              )}

              {/* Informations de contact */}
              <div className="space-y-6">
                <div className="p-6 bg-card rounded-xl border border-border">
                  <h3 className="font-bold mb-4">Nous écrire directement</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <div className="font-semibold">Email</div>
                        <a
                          href={'mailto:' + siteConfig.contact.email}
                          className="text-sm text-primary hover:underline"
                        >
                          {siteConfig.contact.email}
                        </a>
                        <div className="text-xs text-muted-foreground">Réponse sous 24 h ouvrées</div>
                      </div>
                    </div>
                    {siteConfig.contact.phone ? (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <div className="font-semibold">Téléphone</div>
                          <div className="text-sm text-muted-foreground">{siteConfig.contact.phone}</div>
                        </div>
                      </div>
                    ) : null}
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <div className="font-semibold">Langues</div>
                        <div className="text-sm text-muted-foreground">Français, anglais</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-primary/10 rounded-xl">
                  <h3 className="font-bold mb-3">Ce qui est inclus :</h3>
                  <ul className="space-y-2 text-sm">
                    {pilotIncludes.slice(0, 5).map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
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
`;

swap('formulaire', '      {/* Formulaire de contact */}', null, formBlockTop + formBlockBottom + formBlockFooter);

// ---------------------------------------------------------------------------
// Écriture + bilan
// ---------------------------------------------------------------------------
if (failures > 0) {
  console.error(`\n❌ ${failures} remplacement(s) en échec — fichier NON écrit.`);
  process.exit(1);
}

const leftovers = src
  .split(/\r?\n/)
  .map((line, index) => ({ line, index: index + 1 }))
  .filter(({ line }) =>
    /OMNIVERSA|omniversa|99\.99|50M\+|HIPAA|Fortune 500|Entreprises clientes|TechCorp|MediaPro|HealthCare|SLA 99,9|Microsoft|Amazon Web|Salesforce|Oracle|Adobe|Enterprise vs Business|\$299|\$59,99/i.test(
      line
    )
  );

if (leftovers.length > 0) {
  console.error('\n❌ Affirmations résiduelles détectées — fichier NON écrit :');
  leftovers.forEach(({ index, line }) => console.error(`  ligne ${index}: ${line.trim()}`));
  process.exit(1);
}

fs.writeFileSync(FILE, src, 'utf8');
console.log(`\n✅ Fichier écrit : ${FILE}`);
console.log(`   ${initialLength} → ${src.length} caractères`);










