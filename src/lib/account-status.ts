/**
 * 🚦 STATUT DU COMPTE — Multi Convert
 *
 * La suspension temporaire réutilise la colonne `role` (String) : aucune
 * migration de base n'est nécessaire. `SUSPENDED` est un statut, pas un rôle
 * d'administration, il ne donne donc aucun droit.
 */

export const SUSPENDED_ROLE = 'SUSPENDED';

/** Le compte est-il suspendu (par son propriétaire ou l'administration) ? */
export function isSuspended(role?: string | null): boolean {
  return role === SUSPENDED_ROLE;
}

export function suspensionMessage(): string {
  return 'Ce compte est temporairement suspendu. Réactivez-le depuis vos paramètres (ou contactez le support).';
}

/** Texte à recopier pour confirmer une suppression définitive */
export const DELETE_CONFIRMATION_TEXT = 'SUPPRIMER';
