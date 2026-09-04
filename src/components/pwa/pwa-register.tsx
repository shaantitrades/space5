'use client';

import { useEffect } from 'react';

/**
 * Enregistre le service worker pour activer la PWA
 * (installation, mode hors-ligne, cache des assets).
 */
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker indisponible (ex: navigation privée) → ignorer
      });
    }
  }, []);

  return null;
}
