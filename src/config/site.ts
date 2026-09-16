/**
 * URL canonique du site.
 *
 * Le sitemap, les balises `canonical`, les `hreflang` et les JSON-LD DOIVENT
 * pointer vers https://multi-convert.com : jamais `http://`, jamais de « / »
 * final (sinon Google reçoit des URLs en double et rejette le sitemap).
 *
 * On normalise donc systématiquement la variable d'environnement :
 * - espaces et « / » finaux supprimés ;
 * - passage forcé en `https` (exception : développement local sur localhost) ;
 * - schéma ajouté si absent ;
 * - repli sur l'URL canonique de production si la variable est vide.
 */
export const CANONICAL_SITE_URL = 'https://multi-convert.com';

function normalizeSiteUrl(raw: string | undefined | null): string {
  const value = (raw || '').trim().replace(/\/+$/, '');

  if (!value) {
    return CANONICAL_SITE_URL;
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  // En développement, http://localhost:3000 reste autorisé (sinon les liens
  // locaux et metadataBase seraient cassés).
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(withProtocol);
  if (isLocalhost) {
    return withProtocol;
  }

  return withProtocol.replace(/^http:\/\//i, 'https://');
}

export const siteConfig = {
  name: 'Multi Convert',
  description: 'The Universal Conversion Suite. All formats, one platform. Convert PDF, images, videos, audio and documents instantly.',
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
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
