'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'cookie-consent';

/**
 * Bannière de consentement aux cookies (RGPD).
 * S'affiche tant que l'utilisateur n'a pas fait de choix.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  function choose(value: 'accepted' | 'refused') {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] p-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-4 shadow-lg">
        <p className="text-sm text-foreground mb-3">
          🍪 Nous utilisons des cookies pour financer le site (publicité) et améliorer votre expérience.
          Consultez notre{' '}
          <a href="/privacy" className="underline hover:text-primary">
            politique de confidentialité
          </a>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => choose('accepted')}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Accepter
          </button>
          <button
            onClick={() => choose('refused')}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Refuser
          </button>
          <a href="/cookies" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:underline">
            En savoir plus
          </a>
        </div>
      </div>
    </div>
  );
}
