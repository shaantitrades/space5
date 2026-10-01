'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  Camera,
  Check,
  Contact,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Wifi,
} from 'lucide-react';
import type { QrDescription, QrKind } from '@/lib/qr';

const KIND_ICONS: Record<QrKind, typeof Link2> = {
  link: Link2,
  wifi: Wifi,
  contact: Contact,
  email: Mail,
  call: Phone,
  sms: MessageSquare,
  map: MapPin,
};

/**
 * Cartouche affiché AVANT le scan : il indique vers quoi mène le QR code, ce
 * qu'il déclenche, un texte de secours recopiable et les points de vigilance.
 * Les données sensibles (mot de passe WiFi) restent masquées par défaut.
 */
export function QrCaption({ description }: { description: QrDescription }) {
  const t = useTranslations('qr');
  const [secretVisible, setSecretVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const Icon = KIND_ICONS[description.kind];

  const subtitle =
    description.kind === 'wifi' && description.security
      ? `${t('caption.security')} · ${t(`encryption.${description.security}`)}`
      : description.subtitle;

  const warning = description.warning ? t(`caption.warnings.${description.warning}`) : undefined;
  const isExternalLink = Boolean(description.href && /^https?:/i.test(description.href));

  const copyFallback = useCallback(async () => {
    if (!description.fallback) return;
    try {
      await navigator.clipboard.writeText(description.fallback);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : le texte reste sélectionnable à la main */
    }
  }, [description.fallback]);

  return (
    <div className="w-full rounded-xl border border-border bg-muted/40 p-4 text-left">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="w-4 h-4" aria-hidden />
        {t(`caption.kinds.${description.kind}`)}
      </p>

      <p className="mt-1 break-words text-lg font-semibold">{description.title}</p>

      {subtitle ? <p className="break-words text-sm text-muted-foreground">{subtitle}</p> : null}

      {description.secret ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{t('fields.password')}</span>
          <code className="rounded bg-background px-2 py-0.5 font-mono">
            {secretVisible ? description.secret : '••••••'}
          </code>
          <button
            type="button"
            onClick={() => setSecretVisible((value) => !value)}
            aria-label={secretVisible ? t('caption.hide') : t('caption.reveal')}
            title={secretVisible ? t('caption.hide') : t('caption.reveal')}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {secretVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      ) : null}

      {description.secret && secretVisible ? (
        <p className="mt-1 text-xs text-muted-foreground">{t('caption.secretNote')}</p>
      ) : null}


      <p className="mt-3 flex items-center gap-2 text-sm font-medium">
        <Camera className="w-4 h-4 shrink-0" aria-hidden />
        {t(`caption.actions.${description.kind}`)}
      </p>

      {description.fallback ? (
        <div className="mt-2 rounded-lg border border-border bg-background p-2 text-xs">
          <span className="text-muted-foreground">{t('caption.fallbackLabel')}</span>
          <div className="mt-1 flex items-center gap-2">
            {description.href ? (
              <a
                href={description.href}
                title={description.fallback}
                {...(isExternalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="min-w-0 flex-1 truncate font-mono hover:underline"
              >
                {description.fallback}
              </a>
            ) : (
              <span title={description.fallback} className="min-w-0 flex-1 truncate font-mono">
                {description.fallback}
              </span>
            )}
            <button
              type="button"
              onClick={copyFallback}
              className="inline-flex shrink-0 items-center gap-1 rounded border border-border px-2 py-0.5 font-medium transition-colors hover:bg-muted"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? t('caption.copied') : t('caption.copy')}
            </button>
          </div>
        </div>
      ) : null}

      {warning ? (
        <p className="mt-2 flex items-start gap-2 text-xs font-medium text-amber-700">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
          {warning}
        </p>
      ) : null}
    </div>
  );
}
