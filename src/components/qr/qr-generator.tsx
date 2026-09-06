'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Link2, Wifi, Contact, Mail, Phone, MessageSquare, MapPin,
  Download, RotateCcw, QrCode,
} from 'lucide-react';
import { buildQrContent, type QrType } from '@/lib/qr';

type Field = {
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  options?: { value: string; label: string }[];
};

const TYPES: { id: QrType; label: string; icon: typeof QrCode }[] = [
  { id: 'url', label: 'URL', icon: Link2 },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'vcard', label: 'vCard', icon: Contact },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Téléphone', icon: Phone },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'geo', label: 'GPS', icon: MapPin },
];

const FIELDS: Record<QrType, Field[]> = {
  url: [{ name: 'url', label: 'Lien (URL)', placeholder: 'https://exemple.com' }],
  wifi: [
    { name: 'ssid', label: 'Nom du réseau (SSID)', placeholder: 'MonWiFi' },
    { name: 'password', label: 'Mot de passe', placeholder: '••••••' },
    {
      name: 'encryption',
      label: 'Chiffrement',
      options: [
        { value: 'WPA', label: 'WPA / WPA2' },
        { value: 'WEP', label: 'WEP' },
        { value: 'nopass', label: 'Aucun (réseau ouvert)' },
      ],
    },
  ],
  vcard: [
    { name: 'firstName', label: 'Prénom' },
    { name: 'lastName', label: 'Nom' },
    { name: 'organization', label: 'Entreprise' },
    { name: 'title', label: 'Poste / Titre' },
    { name: 'phone', label: 'Téléphone' },
    { name: 'email', label: 'Email' },
    { name: 'website', label: 'Site web' },
    { name: 'address', label: 'Adresse' },
  ],
  email: [
    { name: 'email', label: 'Adresse email', placeholder: 'contact@exemple.com' },
    { name: 'subject', label: 'Objet' },
    { name: 'body', label: 'Message', textarea: true },
  ],
  phone: [{ name: 'phone', label: 'Numéro de téléphone', placeholder: '+33 6 12 34 56 78' }],
  sms: [
    { name: 'phone', label: 'Numéro de téléphone' },
    { name: 'message', label: 'Message', textarea: true },
  ],
  geo: [
    { name: 'latitude', label: 'Latitude', placeholder: '48.8566' },
    { name: 'longitude', label: 'Longitude', placeholder: '2.3522' },
  ],
};

export function QrGenerator() {
  const [type, setType] = useState<QrType>('url');
  const [values, setValues] = useState<Record<string, string>>({});
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(256);
  const [png, setPng] = useState('');
  const [svg, setSvg] = useState('');

  const content = useMemo(() => buildQrContent(type, values), [type, values]);

  useEffect(() => {
    if (!content) {
      setPng('');
      setSvg('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const opts = {
          width: size,
          margin: 2,
          color: { dark: color, light: '#ffffff' },
          errorCorrectionLevel: 'M' as const,
        };
        const [p, s] = await Promise.all([
          QRCode.toDataURL(content, opts),
          QRCode.toString(content, { ...opts, type: 'svg' as const }),
        ]);
        if (!cancelled) {
          setPng(p);
          setSvg(s);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [content, color, size]);

  function setField(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function reset() {
    setValues({});
  }

  function downloadPng() {
    if (!png) return;
    const a = document.createElement('a');
    a.href = png;
    a.download = 'qrcode.png';
    a.click();
  }

  function downloadSvg() {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasContent = Boolean(content);

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Générateur de QR Code</h1>
        <p className="text-muted-foreground">
          Créez gratuitement des QR codes scannables, sans inscription ni publicité.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
            {TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium transition-colors ${
                    type === t.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {FIELDS[type].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1">{f.label}</label>
                {f.options ? (
                  <select
                    value={values[f.name] || f.options[0].value}
                    onChange={(e) => setField(f.name, e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.textarea ? (
                  <textarea
                    value={values[f.name] || ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={values[f.name] || ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Couleur</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Taille : {size}px</label>
                <input
                  type="range"
                  min={128}
                  max={512}
                  step={16}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
          {hasContent ? (
            <>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                {png ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={png} alt="QR Code" width={size} height={size} className="rounded" />
                ) : (
                  <div style={{ width: size, height: size }} className="animate-pulse bg-muted rounded" />
                )}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={downloadPng}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-4 h-4" /> PNG
                </button>
                <button
                  onClick={downloadSvg}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  <Download className="w-4 h-4" /> SVG
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <RotateCcw className="w-4 h-4" /> Réinitialiser
                </button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Scannez le code avec l&apos;appareil photo de votre téléphone pour tester.
              </p>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Remplissez le formulaire pour générer votre QR code.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-card rounded-lg border">
          <div className="text-3xl font-bold text-primary mb-2">7</div>
          <p className="text-sm text-muted-foreground">Types de QR code</p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <div className="text-3xl font-bold text-primary mb-2">100%</div>
          <p className="text-sm text-muted-foreground">Gratuit et sans inscription</p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <div className="text-3xl font-bold text-primary mb-2">PNG+SVG</div>
          <p className="text-sm text-muted-foreground">Export haute résolution</p>
        </div>
      </div>
    </div>
  );
}
