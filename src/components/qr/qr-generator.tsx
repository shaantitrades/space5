'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useTranslations } from 'next-intl';
import {
  Contact,
  Download,
  FileImage,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  QrCode,
  RotateCcw,
  Wifi,
} from 'lucide-react';
import { buildQrContent, describeQr, qrFileSlug, type QrType } from '@/lib/qr';
import {
  MONO_FONT,
  SANS_FONT,
  buildPosterLayout,
  layoutToSvg,
  type PosterContent,
  type PosterLayout,
} from '@/lib/qr-poster';
import { QrCaption } from '@/components/qr/qr-caption';

/** Description des champs d'un type : les libellés vivent dans le namespace `qr`. */
interface FieldSpec {
  name: string;
  labelKey: string;
  placeholderKey?: string;
  textarea?: boolean;
  options?: { value: string; labelKey: string }[];
}

const TYPE_IDS: QrType[] = ['url', 'wifi', 'vcard', 'email', 'phone', 'sms', 'geo'];

const TYPE_ICONS: Record<QrType, typeof QrCode> = {
  url: Link2,
  wifi: Wifi,
  vcard: Contact,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  geo: MapPin,
};

const FIELDS: Record<QrType, FieldSpec[]> = {
  url: [{ name: 'url', labelKey: 'fields.url', placeholderKey: 'placeholders.url' }],
  wifi: [
    { name: 'ssid', labelKey: 'fields.ssid', placeholderKey: 'placeholders.ssid' },
    { name: 'password', labelKey: 'fields.password', placeholderKey: 'placeholders.password' },
    {
      name: 'encryption',
      labelKey: 'fields.encryption',
      options: [
        { value: 'WPA', labelKey: 'encryption.wpa' },
        { value: 'WEP', labelKey: 'encryption.wep' },
        { value: 'nopass', labelKey: 'encryption.nopass' },
      ],
    },
  ],
  vcard: [
    { name: 'firstName', labelKey: 'fields.firstName' },
    { name: 'lastName', labelKey: 'fields.lastName' },
    { name: 'organization', labelKey: 'fields.organization' },
    { name: 'title', labelKey: 'fields.jobTitle' },
    { name: 'phone', labelKey: 'fields.phone' },
    { name: 'email', labelKey: 'fields.email' },
    { name: 'website', labelKey: 'fields.website' },
    { name: 'address', labelKey: 'fields.address' },
  ],
  email: [
    { name: 'email', labelKey: 'fields.emailAddress', placeholderKey: 'placeholders.emailAddress' },
    { name: 'subject', labelKey: 'fields.subject' },
    { name: 'body', labelKey: 'fields.body', textarea: true },
  ],
  phone: [
    { name: 'phone', labelKey: 'fields.phoneNumber', placeholderKey: 'placeholders.phoneNumber' },
  ],
  sms: [
    { name: 'phone', labelKey: 'fields.phoneNumber' },
    { name: 'message', labelKey: 'fields.message', textarea: true },
  ],
  geo: [
    { name: 'latitude', labelKey: 'fields.latitude', placeholderKey: 'placeholders.latitude' },
    { name: 'longitude', labelKey: 'fields.longitude', placeholderKey: 'placeholders.longitude' },
  ],
};

/** Résolution de l'affiche PNG : 2000 px de large, pour une impression nette. */
const PNG_EXPORT_SCALE = 2;

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('qr image load failed'));
    image.src = source;
  });
}

/**
 * Dessine sur un canvas la même mise en page que l'export SVG : toutes les
 * positions et tailles viennent de `buildPosterLayout`, seules les primitives
 * de dessin diffèrent. Les deux exports restent donc superposables.
 */
function paintPosterOnCanvas(
  layout: PosterLayout,
  qrImage: HTMLImageElement,
  canvas: HTMLCanvasElement
): boolean {
  canvas.width = Math.round(layout.width * layout.scale);
  canvas.height = Math.round(layout.height * layout.scale);

  const context = canvas.getContext('2d');
  if (!context) return false;

  context.scale(layout.scale, layout.scale);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, layout.width, layout.height);

  for (const rule of layout.rules) {
    context.strokeStyle = rule.color;
    context.lineWidth = rule.width;
    context.beginPath();
    context.moveTo(rule.x1, rule.y1);
    context.lineTo(rule.x2, rule.y2);
    context.stroke();
  }

  for (const text of layout.texts) {
    context.fillStyle = text.color;
    context.font = `${text.weight} ${text.size}px ${
      text.family === 'mono' ? MONO_FONT : SANS_FONT
    }`;
    context.textAlign = text.anchor === 'middle' ? 'center' : 'left';
    context.textBaseline = 'alphabetic';
    context.fillText(text.text, text.x, text.y);
  }

  context.drawImage(qrImage, layout.qr.x, layout.qr.y, layout.qr.size, layout.qr.size);
  return true;
}

export function QrGenerator() {
  const t = useTranslations('qr');

  const [type, setType] = useState<QrType>('url');
  const [values, setValues] = useState<Record<string, string>>({});
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(256);
  const [png, setPng] = useState('');
  const [svg, setSvg] = useState('');
  const [footer, setFooter] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [showAction, setShowAction] = useState(true);
  const [showFallback, setShowFallback] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  const content = useMemo(() => buildQrContent(type, values), [type, values]);

  /** Ce que l'utilisateur lit avant de scanner (ou de recopier à la main). */
  const description = useMemo(() => describeQr(type, values), [type, values]);

  useEffect(() => {
    if (!content) {
      setPng('');
      setSvg('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const options = {
          width: size,
          margin: 2,
          color: { dark: color, light: '#ffffff' },
          errorCorrectionLevel: 'M' as const,
        };
        const [dataUrl, markup] = await Promise.all([
          QRCode.toDataURL(content, options),
          QRCode.toString(content, { ...options, type: 'svg' as const }),
        ]);
        if (!cancelled) {
          setPng(dataUrl);
          setSvg(markup);
        }
      } catch {
        /* encodage impossible : l'aperçu reste en attente */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [content, color, size]);

  /**
   * Texte du cartouche, partagé par l'aperçu et par l'affiche exportée :
   * ce que l'utilisateur voit à l'écran est exactement ce qu'il imprime.
   */
  const posterContent: PosterContent | null = useMemo(() => {
    if (!description) return null;

    const subtitle =
      description.kind === 'wifi' && description.security
        ? `${t('caption.security')} · ${t(`encryption.${description.security}`)}`
        : description.subtitle;

    return {
      kind: t(`caption.kinds.${description.kind}`),
      title: description.title,
      subtitle,
      action: t(`caption.actions.${description.kind}`),
      fallbackLabel: t('caption.fallbackLabel'),
      fallback: description.fallback,
      secretLabel: t('fields.password'),
      secret: description.secret,
      warning: description.warning ? t(`caption.warnings.${description.warning}`) : undefined,
      footer: footer.trim() || undefined,
    };
  }, [description, footer, t]);

  const posterOptions = useMemo(
    () => ({ showSubtitle, showAction, showFallback, showSecret }),
    [showSubtitle, showAction, showFallback, showSecret]
  );

  const fileBase = `qrcode-${qrFileSlug(description)}`;

  function setField(name: string, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  function reset() {
    setValues({});
    setFooter('');
    setShowSecret(false);
  }

  function saveDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  function saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadQrPng() {
    if (png) saveDataUrl(png, `${fileBase}.png`);
  }

  function downloadQrSvg() {
    if (svg) saveBlob(new Blob([svg], { type: 'image/svg+xml' }), `${fileBase}.svg`);
  }

  function downloadPosterSvg() {
    if (!svg || !posterContent) return;
    const markup = layoutToSvg(
      buildPosterLayout(posterContent, posterOptions),
      svg,
      png || undefined
    );
    saveBlob(new Blob([markup], { type: 'image/svg+xml' }), `${fileBase}-affiche.svg`);
  }

  async function downloadPosterPng() {
    if (!png || !posterContent) return;
    try {
      const layout = buildPosterLayout(posterContent, {
        ...posterOptions,
        scale: PNG_EXPORT_SCALE,
      });
      const qrImage = await loadImage(png);
      const canvas = document.createElement('canvas');
      if (!paintPosterOnCanvas(layout, qrImage, canvas)) return;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob) saveBlob(blob, `${fileBase}-affiche.png`);
    } catch {
      /* export canvas indisponible : l'affiche SVG reste proposée */
    }
  }

  const hasContent = Boolean(content) && Boolean(description);

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
            {TYPE_IDS.map((id) => {
              const Icon = TYPE_ICONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setType(id)}
                  aria-pressed={type === id}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium transition-colors ${
                    type === id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t(`types.${id}`)}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {FIELDS[type].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1" htmlFor={`qr-${field.name}`}>
                  {t(field.labelKey)}
                </label>
                {field.options ? (
                  <select
                    id={`qr-${field.name}`}
                    value={values[field.name] || field.options[0].value}
                    onChange={(event) => setField(field.name, event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                ) : field.textarea ? (
                  <textarea
                    id={`qr-${field.name}`}
                    value={values[field.name] || ''}
                    onChange={(event) => setField(field.name, event.target.value)}
                    placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    id={`qr-${field.name}`}
                    type="text"
                    value={values[field.name] || ''}
                    onChange={(event) => setField(field.name, event.target.value)}
                    placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="qr-color">
                  {t('appearance.color')}
                </label>
                <input
                  id="qr-color"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="qr-size">
                  {t('appearance.sizePx', { size })}
                </label>
                <input
                  id="qr-size"
                  type="range"
                  min={128}
                  max={512}
                  step={16}
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu : le cartouche d'informations précède toujours le QR code */}
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6">
          {hasContent && description ? (
            <>
              <QrCaption description={description} />

              <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
                {png ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={png}
                    alt={t('caption.alt', { title: description.title })}
                    width={size}
                    height={size}
                    className="rounded"
                  />
                ) : (
                  <div
                    style={{ width: size, height: size }}
                    className="animate-pulse bg-muted rounded"
                  />
                )}
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={downloadQrPng}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-4 h-4" /> {t('download.qrPng')}
                </button>
                <button
                  type="button"
                  onClick={downloadQrSvg}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  <Download className="w-4 h-4" /> {t('download.qrSvg')}
                </button>
                <button
                  type="button"
                  onClick={downloadPosterPng}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  <FileImage className="w-4 h-4" /> {t('download.posterPng')}
                </button>
                <button
                  type="button"
                  onClick={downloadPosterSvg}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  <Printer className="w-4 h-4" /> {t('download.posterSvg')}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <RotateCcw className="w-4 h-4" /> {t('reset')}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">{t('hint')}</p>

              <div className="mt-6 w-full rounded-xl border border-border bg-muted/30 p-4 text-left">
                <p className="text-sm font-semibold">{t('poster.title')}</p>
                <div className="mt-3 space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showSubtitle}
                      onChange={(event) => setShowSubtitle(event.target.checked)}
                      className="accent-primary"
                    />
                    {t('poster.subtitle')}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showAction}
                      onChange={(event) => setShowAction(event.target.checked)}
                      className="accent-primary"
                    />
                    {t('poster.action')}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showFallback}
                      onChange={(event) => setShowFallback(event.target.checked)}
                      className="accent-primary"
                    />
                    {t('poster.fallback')}
                  </label>
                  {description.secret ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showSecret}
                        onChange={(event) => setShowSecret(event.target.checked)}
                        className="accent-primary"
                      />
                      {t('poster.secret')}
                    </label>
                  ) : null}
                  <label className="block pt-1">
                    <span className="mb-1 block font-medium">{t('poster.footer')}</span>
                    <input
                      type="text"
                      value={footer}
                      onChange={(event) => setFooter(event.target.value)}
                      placeholder={t('poster.footerPlaceholder')}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>{t('empty')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-card rounded-lg border">
          <div className="text-3xl font-bold text-primary mb-2">{TYPE_IDS.length}</div>
          <p className="text-sm text-muted-foreground">{t('stats.types')}</p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <div className="text-3xl font-bold text-primary mb-2">100%</div>
          <p className="text-sm text-muted-foreground">{t('stats.free')}</p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <div className="text-3xl font-bold text-primary mb-2">PNG+SVG</div>
          <p className="text-sm text-muted-foreground">{t('stats.export')}</p>
        </div>
      </div>
    </div>
  );
}


