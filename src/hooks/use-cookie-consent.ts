'use client';

import { useEffect, useState } from 'react';

/**
 * Consentement cookies (RGPD) — source unique de vérité côté client.
 *
 * Le choix est stocké dans `localStorage` sous la clé `cookie-consent` :
 *  - `accepted` : publicité autorisée (AdSense peut être chargé) ;
 *  - `refused`  : aucune ressource publicitaire chargée ;
 *  - absent     : choix non encore exprimé (équivalent à un refus).
 *
 * En plus du stockage, chaque changement émet l'événement
 * `cookie-consent-changed` : la bannière, le script AdSense et les
 * emplacements publicitaires se synchronisent donc immédiatement, sans
 * rechargement de page. L'événement `cookie-consent-open` permet de
 * rouvrir la bannière (retrait du consentement depuis /cookies).
 */
export const COOKIE_CONSENT_KEY = 'cookie-consent';
export const COOKIE_CONSENT_EVENT = 'cookie-consent-changed';
export const COOKIE_CONSENT_OPEN_EVENT = 'cookie-consent-open';

export type CookieConsentValue = 'accepted' | 'refused';

/** Lecture synchrone du choix stocké (null si aucun choix valide). */
export function readCookieConsent(): CookieConsentValue | null {
  if (typeof window === 'undefined') return null;

  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === 'accepted' || value === 'refused' ? value : null;
  } catch {
    // localStorage indisponible (navigation privée stricte, iframe sandbox…)
    return null;
  }
}

/** Enregistre le choix et prévient les composants abonnés. */
export function writeCookieConsent(value: CookieConsentValue): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    /* ignore : le consentement reste valable pour la session en cours */
  }

  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}

/** Rouvre la bannière de consentement (droit de retrait). */
export function openCookieConsent(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}

/**
 * Hook de lecture du consentement, réactif :
 *  - changement dans l'onglet courant (événement custom) ;
 *  - changement dans un autre onglet (`storage`).
 */
export function useCookieConsent(): CookieConsentValue | null {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);

  useEffect(() => {
    setConsent(readCookieConsent());

    const onConsentChanged = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentValue>).detail;
      setConsent(detail === 'accepted' || detail === 'refused' ? detail : readCookieConsent());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY || event.key === null) {
        setConsent(readCookieConsent());
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChanged);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return consent;
}
