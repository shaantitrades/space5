'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { adsConfig, isAdAllowedPath } from '@/config/ads';
import { useCookieConsent } from '@/hooks/use-cookie-consent';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Emplacement publicitaire AdSense.
 *
 * Rien n'est rendu (ni HTML, ni requête) tant que :
 *  - `adsConfig.enabled` est false, ou `clientId`/`slot` est vide ;
 *  - le consentement RGPD n'est pas donné (sauf `requireConsent: false`) ;
 *  - la page courante est sans contenu éditorial (login, dashboard, 403…).
 *
 * Le composant est réactif au consentement : si l'utilisateur accepte les
 * cookies après le montage, l'emplacement est poussé immédiatement.
 * Un `min-height` réserve la place pour éviter tout décalage de mise en page
 * (CLS) et l'emplacement est masqué si Google ne sert pas d'annonce.
 */
export function AdSlot({ slot, format = 'auto', className, style }: AdSlotProps) {
  const pathname = usePathname();
  const consent = useCookieConsent();
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  const shouldRender =
    adsConfig.enabled &&
    !!adsConfig.clientId &&
    !!slot &&
    isAdAllowedPath(pathname) &&
    (!adsConfig.requireConsent || consent === 'accepted');

  useEffect(() => {
    if (!shouldRender) {
      pushedRef.current = false;
      return;
    }

    const ins = insRef.current;
    if (!ins || pushedRef.current) return;

    // Ne jamais pousser deux fois le même bloc (AdSense remplirait en double).
    if (ins.getAttribute('data-adsbygoogle-status')) {
      pushedRef.current = true;
      return;
    }

    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      /* ignore */
    }
  }, [shouldRender]);

  /**
   * Replie l'emplacement quand Google répond « unfilled » (pas d'annonce
   * disponible) ou en cas d'erreur : évite une zone blanche résiduelle.
   */
  useEffect(() => {
    const ins = insRef.current;
    if (!shouldRender || !ins || typeof MutationObserver === 'undefined') return;

    const collapse = () => {
      const status = ins.getAttribute('data-ad-status');
      if (status === 'unfilled' || status === 'error') {
        if (ins.parentElement) ins.parentElement.style.display = 'none';
      }
    };

    const observer = new MutationObserver(collapse);
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    collapse();

    return () => observer.disconnect();
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className={className} style={style}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 90 }}
        data-ad-client={adsConfig.clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

