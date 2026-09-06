'use client';

import { useEffect } from 'react';
import { adsConfig } from '@/config/ads';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Emplacement publicitaire AdSense.
 * N'affiche rien tant que adsConfig.enabled est false.
 */
export function AdSlot({ slot, format = 'auto', className, style }: AdSlotProps) {
  useEffect(() => {
    if (!adsConfig.enabled) return;
    if (localStorage.getItem('cookie-consent') !== 'accepted') return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* ignore */
    }
  }, []);

  if (!adsConfig.enabled || !adsConfig.clientId || !slot) return null;

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsConfig.clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
