'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  COOKIE_CONSENT_OPEN_EVENT,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentValue,
} from '@/hooks/use-cookie-consent';

/**
 * Bannière de consentement aux cookies (RGPD).
 * S'affiche tant que l'utilisateur n'a pas fait de choix, et peut être
 * rouverte à tout moment (droit de retrait) via `openCookieConsent()`,
 * par exemple depuis la page /cookies.
 * Textes issus du namespace i18n `cookie` (10 langues).
 */
export function CookieConsent() {
  const t = useTranslations('cookie');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readCookieConsent()) setVisible(true);

    const onOpen = () => setVisible(true);
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
  }, []);

  function choose(value: CookieConsentValue) {
    writeCookieConsent(value);
    setVisible(false);
    // Aucun rechargement ici : le composant AdScript retire les scripts
    // publicitaires dès que le refus est enregistré, et un utilisateur peut
    // être en pleine conversion de fichier (le rechargement ferait perdre
    // son travail). Le retrait explicite depuis /cookies, lui, recharge la
    // page pour purger entièrement les balises déjà évaluées par Google.
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] p-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-4 shadow-lg">
        <p className="text-sm text-foreground mb-3">
          {t.rich('message', {
            link: (chunks) => (
              <a href="/privacy" className="underline hover:text-primary">
                {chunks}
              </a>
            ),
          })}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => choose('accepted')}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {t('accept')}
          </button>
          <button
            onClick={() => choose('refused')}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t('refuse')}
          </button>
          <a href="/cookies" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:underline">
            {t('learnMore')}
          </a>
        </div>
      </div>
    </div>
  );
}

