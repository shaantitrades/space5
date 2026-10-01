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

/* -------------------------------------------------------------------------- */
/*  Cartouche d'informations : ce que l'utilisateur lit AVANT de scanner      */
/* -------------------------------------------------------------------------- */

/** Nature de la destination encodée, utilisée pour les libellés du cartouche. */
export type QrKind = 'link' | 'wifi' | 'contact' | 'email' | 'call' | 'sms' | 'map';

/** Point de vigilance affiché avant le scan. */
export type QrWarning = 'shortlink' | 'open-network' | 'invalid';

/**
 * Description lisible du contenu encodé.
 *
 * Volontairement sans texte traduit : `kind`, `security` et `warning` sont des
 * clés que le composant associe à la locale courante (namespace `qr`).
 */
export interface QrDescription {
  kind: QrKind;
  /** Information principale : domaine, SSID, nom, adresse, numéro, coordonnées. */
  title: string;
  /** Complément discret : chemin, poste occupé, objet du message… */
  subtitle?: string;
  /** Texte recopiable à la main quand l'utilisateur ne peut pas scanner. */
  fallback?: string;
  /** Version cliquable du texte de secours (`tel:`, `mailto:`, carte…). */
  href?: string;
  /** Donnée sensible (mot de passe WiFi), masquée par défaut dans l'interface. */
  secret?: string;
  /** Chiffrement du réseau WiFi. */
  security?: 'wpa' | 'wep' | 'nopass';
  warning?: QrWarning;
}

/** Longueur maximale des informations secondaires affichées. */
export const SUBTITLE_MAX_LENGTH = 44;

/** Services de raccourcissement d'URL les plus courants (destination masquée). */
const SHORTLINK_HOSTS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'rebrand.ly',
  'cutt.ly',
  'lnkd.in',
  't.ly',
  'rb.gy',
  'shorturl.at',
  'urlz.fr',
  'shrtco.de',
  'bl.ink',
  'surl.li',
  'qrco.de',
]);

/**
 * Coupe une valeur trop longue en gardant le début et la fin visibles
 * (le début situe la ressource, la fin son extension ou son domaine).
 */
export function truncateMiddle(value: string, max: number = SUBTITLE_MAX_LENGTH): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const keep = Math.max(2, max - 1);
  const head = Math.ceil(keep * 0.6);
  return `${clean.slice(0, head)}…${clean.slice(clean.length - (keep - head))}`;
}

/** Vrai si l'hôte est un raccourcisseur connu (destination réelle masquée). */
export function isShortlink(host: string): boolean {
  const clean = host.trim().toLowerCase().replace(/^www\./, '');
  if (!clean) return false;
  if (SHORTLINK_HOSTS.has(clean)) return true;
  for (const shortener of SHORTLINK_HOSTS) {
    if (clean.endsWith(`.${shortener}`)) return true;
  }
  return false;
}

/** Lien de carte ouvert (OpenStreetMap : aucune régie publicitaire). */
export function mapLink(latitude: string, longitude: string): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}

/** Nom de fichier lisible pour un export, dérivé du contenu (ex. « exemple-com »). */
export function qrFileSlug(description: QrDescription | null): string {
  const base = description?.title || 'qr';
  const slug = base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
    .replace(/-+$/, '');
  return slug || 'qr';
}

/** Ne conserve que les caractères utiles à un lien `tel:` ou `sms:`. */
function normalizePhone(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return cleaned;
}

function isCoordinate(value: string, max: number): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= max;
}

function describeUrl(raw?: string): QrDescription | null {
  const value = (raw || '').trim();
  if (!value) return null;

  const url = parseUrl(value);
  if (!url || !url.hostname) {
    return { kind: 'link', title: truncateMiddle(value, 40), fallback: value, warning: 'invalid' };
  }

  const host = url.hostname.replace(/^www\./, '');
  const path = `${url.pathname}${url.search}${url.hash}`.replace(/^\/$/, '');
  const description: QrDescription = {
    kind: 'link',
    title: host,
    subtitle: path ? truncateMiddle(path) : undefined,
    fallback: value,
    href: url.toString(),
  };
  if (isShortlink(host)) description.warning = 'shortlink';
  return description;
}

function describeWifi(data: QrData): QrDescription | null {
  const ssid = (data.ssid || '').trim();
  if (!ssid) return null;

  const raw = (data.encryption || 'WPA').toLowerCase();
  const security: 'wpa' | 'wep' | 'nopass' = raw === 'nopass' ? 'nopass' : raw === 'wep' ? 'wep' : 'wpa';
  const password = (data.password || '').trim();

  return {
    kind: 'wifi',
    title: truncateMiddle(ssid, 40),
    security,
    secret: security === 'nopass' ? undefined : password || undefined,
    warning: security === 'nopass' ? 'open-network' : undefined,
  };
}

function describeVCard(data: QrData): QrDescription | null {
  const name = [data.firstName, data.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  const organization = (data.organization || '').trim();
  const jobTitle = (data.title || '').trim();
  const email = (data.email || '').trim();
  const phone = (data.phone || '').trim();

  const title = name || organization || email;
  if (!title) return null;

  const subtitle = [jobTitle, organization === title ? '' : organization].filter(Boolean).join(' · ');
  const fallback = phone || email || (data.website || '').trim();

  return {
    kind: 'contact',
    title,
    subtitle: subtitle || undefined,
    fallback: fallback || undefined,
    href: phone ? `tel:${normalizePhone(phone)}` : email ? `mailto:${email}` : undefined,
  };
}

function describeEmail(data: QrData): QrDescription | null {
  const address = (data.email || '').trim();
  if (!address) return null;

  const subject = (data.subject || '').trim();
  return {
    kind: 'email',
    title: truncateMiddle(address, 48),
    subtitle: subject ? truncateMiddle(subject, 48) : undefined,
    fallback: address,
    href: `mailto:${address}`,
  };
}

function describePhone(data: QrData): QrDescription | null {
  const number = (data.phone || '').trim();
  if (!number) return null;
  return { kind: 'call', title: number, fallback: number, href: `tel:${normalizePhone(number)}` };
}

function describeSms(data: QrData): QrDescription | null {
  const number = (data.phone || '').trim();
  if (!number) return null;

  const message = (data.message || '').trim();
  return {
    kind: 'sms',
    title: number,
    subtitle: message ? truncateMiddle(message, 48) : undefined,
    fallback: number,
    href: `sms:${normalizePhone(number)}`,
  };
}

function describeGeo(data: QrData): QrDescription | null {
  const latitude = (data.latitude || '').trim();
  const longitude = (data.longitude || '').trim();
  if (!latitude || !longitude) return null;

  const coordinates = `${latitude}, ${longitude}`;
  const valid = isCoordinate(latitude, 90) && isCoordinate(longitude, 180);

  return {
    kind: 'map',
    title: coordinates,
    fallback: valid ? mapLink(latitude, longitude) : coordinates,
    href: valid ? mapLink(latitude, longitude) : undefined,
    warning: valid ? undefined : 'invalid',
  };
}

/**
 * Décrit ce que contient le QR code, à afficher au-dessus de celui-ci.
 * Retourne `null` tant que le formulaire est vide (aucun cartouche à montrer).
 */
export function describeQr(type: QrType, data: QrData): QrDescription | null {
  switch (type) {
    case 'url':
      return describeUrl(data.url);
    case 'wifi':
      return describeWifi(data);
    case 'vcard':
      return describeVCard(data);
    case 'email':
      return describeEmail(data);
    case 'phone':
      return describePhone(data);
    case 'sms':
      return describeSms(data);
    case 'geo':
      return describeGeo(data);
    default:
      return null;
  }
}

/** Analyse une URL saisie en tolérant l'absence de schéma (`exemple.com`). */
function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    /* l'utilisateur a peut-être omis le schéma */
  }
  try {
    return new URL(`https://${value}`);
  } catch {
    return null;
  }
}

