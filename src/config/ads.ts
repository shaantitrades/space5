/**
 * Configuration publicitaire (Google AdSense).
 *
 * ── Activer la monétisation (aucune modification de code) ────────────────
 *  1. Faire approuver le site sur https://adsense.google.com
 *     (site en ligne, avec du contenu, une politique de confidentialité et
 *     une page cookies — c'est déjà le cas).
 *  2. AdSense > Annonces > Par bloc d'annonces : créer les emplacements et
 *     relever leurs identifiants numériques (`data-ad-slot`).
 *  3. Renseigner les variables d'environnement :
 *       NEXT_PUBLIC_ADSENSE_ENABLED=true
 *       NEXT_PUBLIC_ADSENSE_SLOT_HEADER=1234567890
 *       NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT=1234567890
 *       NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=1234567890
 *     (+ NEXT_PUBLIC_ADSENSE_CMP_ID pour la CMP Google, obligatoire pour
 *        monétiser l'EEE/UK/CH — voir docs/ADSENSE.md)
 *  4. Redéployer : les variables `NEXT_PUBLIC_*` sont inlinées AU BUILD.
 *
 * Tant que `enabled` est `false` ou qu'un emplacement n'a pas d'ID, aucun
 * bloc n'est rendu : le site fonctionne à l'identique sans AdSense.
 *
 * ⚠️ Les annonces sont aussi conditionnées au consentement RGPD
 * (`requireConsent`) et interdites sur les pages sans contenu éditorial
 * (connexion, tableau de bord, erreurs…) : voir `blockedPathPrefixes`.
 */

/** Éditeur AdSense du site (format ca-pub-XXXXXXXXXXXXXXXX). */
const DEFAULT_ADSENSE_CLIENT_ID = 'ca-pub-5343389597650456';

function env(value: string | undefined, fallback = ''): string {
  return (value ?? '').trim() || fallback;
}

/**
 * Pages sans contenu éditorial : les règles AdSense (et le bon sens) y
 * interdisent toute annonce. Comparaison sur le chemin SANS le préfixe de
 * langue (`/fr/login` → `/login`).
 */
const BLOCKED_PATH_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify',
  '/verify-email',
  '/403',
  '/admin',
  '/dashboard',
  '/api',
];

export const adsConfig = {
  /** Interrupteur général : false = aucune requête vers Google. */
  enabled: env(process.env.NEXT_PUBLIC_ADSENSE_ENABLED) === 'true',

  /** Identifiant éditeur (ca-pub-…). */
  clientId: env(process.env.NEXT_PUBLIC_ADSENSE_CLIENT, DEFAULT_ADSENSE_CLIENT_ID),

  /**
   * ID de la CMP Google (Funding Choices), ex. `pub-5343389597650456`.
   * Obligatoire pour diffuser des annonces dans l'EEE/UK/CH depuis 2024.
   * Vide = pas de CMP Google (bannière interne uniquement).
   */
  cmpId: env(process.env.NEXT_PUBLIC_ADSENSE_CMP_ID),

  /**
   * true (défaut) : AdSense n'est chargé qu'après acceptation des cookies.
   * false : les blocs sont rendus immédiatement et c'est la CMP Google qui
   * arbitre (à utiliser uniquement si `cmpId` est renseigné).
   */
  requireConsent: env(process.env.NEXT_PUBLIC_ADSENSE_REQUIRE_CONSENT, 'true') !== 'false',

  /** Identifiants des blocs créés dans AdSense (vide = bloc masqué). */
  slots: {
    header: env(process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER), // bannière en haut de page
    inContent: env(process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT), // rectangle dans le contenu
    footer: env(process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER), // bannière en bas de page
  },

  blockedPathPrefixes: BLOCKED_PATH_PREFIXES,
};

/** ID éditeur sans le préfixe `ca-` (utilisé par ads.txt, ex. `pub-…`). */
export const adsensePublisherId = adsConfig.clientId.replace(/^ca-/, '');

/**
 * Indique si une annonce peut être affichée sur ce chemin.
 * `pathname` provient de `usePathname()` (préfixe de langue inclus).
 */
export function isAdAllowedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;

  // Retire le préfixe de langue : /fr/login → /login
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  return !adsConfig.blockedPathPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
