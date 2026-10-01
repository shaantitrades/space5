'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { readCookieConsent, writeCookieConsent, type CookieConsentValue } from '@/hooks/use-cookie-consent';

/**
 * Réglages cookies intégrés (alternative légère à une bannière externe) :
 * permettent de revenir sur son choix à tout moment depuis /cookies,
 * comme l'exige le RGPD (retrait du consentement aussi simple que l'octroi).
 */
export function CookieSettings() {
  const t = useTranslations('cookie');
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);

  useEffect(() => {
    setConsent(readCookieConsent());
  }, []);

  function choose(value: CookieConsentValue) {
    if (value === consent) return;
    writeCookieConsent(value);
    setConsent(value);
    // Purge les balises/scripts publicitaires déjà chargés : indispensable
    // pour que le refus soit réellement effectif (voir docs/ADSENSE.md).
    window.location.reload();
  }

  const buttonBase = 'rounded-lg px-4 py-2 text-sm font-medium transition-colors';

  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('currentChoice')}{' '}
        <strong className="text-foreground">
          {consent === 'accepted' ? t('accept') : consent === 'refused' ? t('refuse') : t('notChosen')}
        </strong>
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose('accepted')}
          disabled={consent === 'accepted'}
          className={`${buttonBase} bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50`}
        >
          {t('accept')}
        </button>
        <button
          type="button"
          onClick={() => choose('refused')}
          disabled={consent === 'refused'}
          className={`${buttonBase} border border-border hover:bg-muted disabled:opacity-50`}
        >
          {t('refuse')}
        </button>
      </div>
    </div>
  );
}
