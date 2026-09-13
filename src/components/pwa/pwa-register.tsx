'use client';

import { useEffect } from 'react';

/**
 * Enregistre le service worker pour activer la PWA
 * (installation, mode hors-ligne, cache des assets statiques).
 *
 * Recharge la page une seule fois quand une nouvelle version du service worker
 * prend le contrôle, afin de ne jamais afficher un contenu mis en cache par
 * l'ancienne version (ex. une page restée dans l'ancienne langue).
 */
export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // S'il y avait déjà un service worker, un changement de contrôle signifie
    // qu'une nouvelle version est active → on recharge pour repartir sur du frais.
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;
    const handleControllerChange = () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // `updateViaCache: 'none'` force le navigateur à toujours récupérer la
    // dernière version de /sw.js (sinon un ancien service worker peut rester
    // actif et servir d'anciens chunks → erreurs au runtime).
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => registration.update().catch(() => {}))
      .catch(() => {
        // Service worker indisponible (ex: navigation privée) → ignorer
      });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  return null;
}
