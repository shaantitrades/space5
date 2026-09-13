'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

/**
 * Synchronise l'attribut `lang` de la balise <html> avec la locale courante.
 * Le layout racine est au-dessus du provider i18n et ne connaît donc pas la
 * locale : on corrige l'attribut côté client (accessibilité + SEO).
 */
export function HtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
