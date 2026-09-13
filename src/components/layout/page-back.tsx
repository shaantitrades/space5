'use client';

import { usePathname } from '@/i18n/routing';
import { BackButton } from '@/components/ui/back-button';

/**
 * Bouton "Retour" global affiché en haut de chaque page (sauf la page d'accueil).
 * Garantit qu'un bouton retour est toujours disponible, quelle que soit la page.
 */
export function PageBack() {
  const pathname = usePathname();

  // Pas de bouton retour sur la page d'accueil
  if (!pathname || pathname === '/') return null;

  return (
    <div className="container mx-auto px-4 pt-4">
      <BackButton />
    </div>
  );
}