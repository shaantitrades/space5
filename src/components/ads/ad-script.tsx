'use client';

import { useEffect } from 'react';
import { adsConfig } from '@/config/ads';

/**
 * Charge le script AdSense une seule fois, uniquement si :
 *  - la pub est activée (adsConfig.enabled), et
 *  - l'utilisateur a accepté les cookies (RGPD).
 */
export function AdScript() {
  useEffect(() => {
    if (!adsConfig.enabled || !adsConfig.clientId) return;
    if (localStorage.getItem('cookie-consent') !== 'accepted') return;
    if (document.querySelector('script[data-adscript="true"]')) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.clientId}`;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-adscript', 'true');
    document.head.appendChild(script);
  }, []);

  return null;
}
