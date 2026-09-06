/**
 * Générateur de QR Code — construction du contenu selon le type.
 * Le contenu final est une simple chaîne de caractères que l'on encode en QR.
 */
export type QrType = 'url' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms' | 'geo';

export interface QrData {
  url?: string;
  ssid?: string;
  password?: string;
  encryption?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  subject?: string;
  body?: string;
  message?: string;
  latitude?: string;
  longitude?: string;
}

export function buildQrContent(type: QrType, data: QrData): string {
  switch (type) {
    case 'url':
      return data.url?.trim() || '';
    case 'wifi':
      return `WIFI:T:${data.encryption || 'WPA'};S:${data.ssid || ''};P:${data.password || ''};;`;
    case 'vcard':
      return buildVCard(data);
    case 'email':
      return buildMailto(data);
    case 'phone':
      return `tel:${data.phone?.trim() || ''}`;
    case 'sms':
      return `SMSTO:${data.phone?.trim() || ''}:${data.message || ''}`;
    case 'geo':
      return `geo:${data.latitude?.trim() || ''},${data.longitude?.trim() || ''}`;
    default:
      return '';
  }
}

function buildVCard(d: QrData): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  if (d.firstName || d.lastName) {
    lines.push(`N:${d.lastName || ''};${d.firstName || ''};;;`);
    lines.push(`FN:${[d.firstName, d.lastName].filter(Boolean).join(' ')}`);
  }
  if (d.organization) lines.push(`ORG:${d.organization}`);
  if (d.title) lines.push(`TITLE:${d.title}`);
  if (d.phone) lines.push(`TEL:${d.phone}`);
  if (d.email) lines.push(`EMAIL:${d.email}`);
  if (d.website) lines.push(`URL:${d.website}`);
  if (d.address) lines.push(`ADR:;;${d.address};;;;`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

function buildMailto(d: QrData): string {
  const params: string[] = [];
  if (d.subject) params.push(`subject=${encodeURIComponent(d.subject)}`);
  if (d.body) params.push(`body=${encodeURIComponent(d.body)}`);
  const q = params.length ? `?${params.join('&')}` : '';
  return `mailto:${d.email?.trim() || ''}${q}`;
}
