'use client';

import { useEffect } from 'react';
import { adsConfig } from '@/config/ads';
import { useCookieConsent } from '@/hooks/use-cookie-consent';

const SCRIPT_SELECTOR = 'script[data-adscript="true"]';
const CMP_SELECTOR = 'script[data-adcmp="true"]';

/**
 * Injecte les scripts AdSense (et, si configurée, la CMP Google) UNE seule
 * fois, dès que les conditions sont réunies :
 *  - la publicité est activée (adsConfig.enabled) ET un clientId est défini ;
 *  - le consentement RGPD est donné, sauf si `requireConsent` est false
 *    (dans ce cas la CMP Google arbitre elle-même).
 *
 * Le hook de consentement est réactif : si l'utilisateur accepte les cookies
 * APRÈS le chargement de la page, les scripts sont injectés immédiatement.
 * S'il refuse explicitement, les scripts AdSense sont retirés (un
 * rechargement de page purge les ressources déjà évaluées côté Google —
 * voir `docs/ADSENSE.md`).
 */
export function AdScript() {
  const consent = useCookieConsent();

  const adsAllowed =
    adsConfig.enabled &&
    !!adsConfig.clientId &&
    (!adsConfig.requireConsent || consent === 'accepted');

  useEffect(() => {
    if (!adsAllowed) {
      document.querySelectorAll(SCRIPT_SELECTOR).forEach((script) => script.remove());
      document.querySelectorAll(CMP_SELECTOR).forEach((script) => script.remove());
      return;
    }

    if (document.querySelector(SCRIPT_SELECTOR)) return;

    // 1. CMP Google (Funding Choices) : doit être chargée AVANT AdSense pour
    //    pouvoir recueillir le consentement exigé dans l'EEE/UK/CH.
    if (adsConfig.cmpId && !document.querySelector(CMP_SELECTOR)) {
      const cmp = document.createElement('script');
      cmp.async = true;
      cmp.src = `https://fundingchoicesmessages.google.com/i/${adsConfig.cmpId}?ers=1`;
      cmp.setAttribute('data-adcmp', 'true');
      document.head.appendChild(cmp);
    }

    // 2. Bibliothèque AdSense.
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.clientId}`;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-adscript', 'true');
    document.head.appendChild(script);
  }, [adsAllowed]);

  return null;
}
