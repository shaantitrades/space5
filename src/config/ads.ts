/**
 * Configuration publicitaire (AdSense).
 *
 * Pour activer la monétisation :
 *  1. Faire approuver le site sur Google AdSense.
 *  2. Renseigner `clientId` (format ca-pub-XXXXXXXXXXXXXXXX).
 *  3. Renseigner les IDs d'emplacements (`slots`) créés dans AdSense.
 *  4. Passer `enabled` à `true`.
 *
 * Tant que `enabled` est `false`, aucun emplacement n'est affiché.
 */
export const adsConfig = {
  enabled: false,
  clientId: '', // ex: 'ca-pub-1234567890123456'
  slots: {
    header: '', // bannière en haut de page
    inContent: '', // rectangle dans le contenu
    footer: '', // bannière en bas de page
  },
};
