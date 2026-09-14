export const siteConfig = {
  name: 'Multi Convert',
  description: 'The Universal Conversion Suite. All formats, one platform. Convert PDF, images, videos, audio and documents instantly.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://multi-convert.com',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/multiconvert',
    github: 'https://github.com/multiconvert',
  },
  /**
   * Coordonnées publiques.
   * ⚠️ Ne jamais afficher de numéro de téléphone ou d'adresse fictifs :
   * un prospect B2B le vérifie et cela détruit la crédibilité.
   */
  contact: {
    email: 'contact@multi-convert.com',
    supportEmail: 'support@multi-convert.com',
    privacyEmail: 'privacy@multi-convert.com',
    /** Uniquement si une adresse professionnelle réelle est surveillée */
    phone: '',
    phoneHours: '',
  },
  /**
   * Informations légales (obligatoires en France : LCEN art. 6-III).
   * Remplacer chaque "À COMPLÉTER" avant toute prospection.
   */
  company: {
    legalName: 'À COMPLÉTER (raison sociale)',
    legalForm: 'À COMPLÉTER (SASU, SARL, auto-entrepreneur…)',
    capital: '',
    siren: 'À COMPLÉTER (SIREN/SIRET)',
    vat: 'À COMPLÉTER (n° TVA intracommunautaire)',
    address: 'À COMPLÉTER (adresse du siège social)',
    publicationDirector: 'À COMPLÉTER (directeur de la publication)',
    hosting: 'À COMPLÉTER (nom, adresse et téléphone de l’hébergeur)',
  },
  /**
   * Offre commerciale de démarrage : pilote gratuit encadré.
   * Voir docs/STRATEGIE-B2B.md
   */
  pilot: {
    enabled: true,
    durationDays: 45,
    seats: 3,
    /** Le tarif post-pilote doit être annoncé AVANT le début du pilote */
    discountPercent: 40,
  },

  keywords: [
    'file conversion',
    'PDF converter',
    'image converter', 
    'video converter',
    'audio converter',
    'document converter',
    'online converter',
    'free converter',
    'batch conversion',
    'file compression',
    'PDF tools',
    'image optimization',
    'video editing',
    'audio extraction',
    'format conversion',
  ],
  creator: 'Multi Convert Team',
  authors: [{ name: 'Multi Convert Team' }],
  // Feature flags
  features: {
    // false = site gratuit : masque tous les tarifs (pricing, plans, entreprise)
    showPricing: false,
  },
}

export type SiteConfig = typeof siteConfig
