/**
 * Composition d'une affiche « prête à imprimer » : cartouche d'informations
 * + QR code + pied de page facultatif.
 *
 * La mise en page est calculée une seule fois (`buildPosterLayout`) puis rendue
 * soit en SVG (texte vectoriel, imprimable), soit en canvas (PNG haute
 * définition) — aucune dépendance externe, aucun appel réseau.
 */

/** Largeur de référence de l'affiche, en unités de mise en page. */
export const POSTER_WIDTH = 1000;

/** Marge intérieure, en unités de mise en page. */
export const POSTER_PADDING = 72;

/** Taille maximale du QR code dans l'affiche. */
export const POSTER_QR_MAX_SIZE = 560;

/** Nombre de caractères par ligne avant retour automatique. */
export const TITLE_MAX_CHARS = 20;
export const SUBTITLE_MAX_CHARS = 38;
export const ACTION_MAX_CHARS = 34;
export const DETAIL_MAX_CHARS = 44;
export const WARNING_MAX_CHARS = 40;
export const FOOTER_MAX_CHARS = 58;

/** Piles de polices : identiques en SVG et en canvas pour un rendu homogène. */
export const SANS_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
export const MONO_FONT = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

/** Palette de l'affiche (lisible en noir et blanc à l'impression). */
export const POSTER_COLORS = {
  dark: '#111827',
  body: '#374151',
  muted: '#6b7280',
  warning: '#b45309',
  rule: '#e5e7eb',
};

/** Contenu textuel de l'affiche, déjà traduit par l'appelant. */
export interface PosterContent {
  /** Étiquette de type, ex. « Lien vers » (mise en majuscules par la mise en page). */
  kind: string;
  /** Information principale, ex. « exemple.com ». */
  title: string;
  /** Complément discret : chemin, poste occupé, chiffrement… */
  subtitle?: string;
  /** Consigne de scan, ex. « Scannez avec l'appareil photo ». */
  action?: string;
  /** Libellé du texte de secours, ex. « Pas de scanneur ? Recopiez ceci : ». */
  fallbackLabel?: string;
  /** Texte recopiable à la main. */
  fallback?: string;
  /** Libellé de la donnée sensible, ex. « Mot de passe ». */
  secretLabel?: string;
  /** Donnée sensible, affichée seulement si `showSecret`. */
  secret?: string;
  /** Avertissement affiché avant le scan. */
  warning?: string;
  /** Pied de page libre (marque, adresse…). */
  footer?: string;
}

/** Réglages d'export choisis par l'utilisateur. */
export interface PosterOptions {
  /** Facteur d'échelle de sortie (1 = 1000 px de large). */
  scale?: number;
  showSubtitle?: boolean;
  showAction?: boolean;
  showFallback?: boolean;
  showSecret?: boolean;
}

export interface PosterText {
  text: string;
  x: number;
  y: number;
  size: number;
  weight: number;
  color: string;
  anchor: 'start' | 'middle';
  family: 'sans' | 'mono';
}

export interface PosterRule {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

export interface PosterLayout {
  width: number;
  height: number;
  scale: number;
  texts: PosterText[];
  rules: PosterRule[];
  qr: { x: number; y: number; size: number };
}

/**
 * Découpe un texte en lignes d'au plus `maxChars` caractères.
 *
 * Aucune police n'est mesurée : la même découpe est réutilisée par le rendu SVG
 * et par le rendu canvas, ce qui garantit deux exports identiques. Les sauts de
 * ligne explicites sont conservés et les mots trop longs sont coupés.
 */
export function wrapText(value: string, maxChars: number): string[] {
  const limit = Math.max(1, Math.floor(maxChars));
  return value.split('\n').flatMap((segment) => wrapSegment(segment, limit));
}

function wrapSegment(segment: string, limit: number): string[] {
  const words = segment.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if (current.length + word.length + 1 <= limit) {
      current = `${current} ${word}`;
      continue;
    }
    lines.push(current);
    current = word;
  }
  if (current) lines.push(current);

  return lines.flatMap((line) => splitLongLine(line, limit));
}

function splitLongLine(line: string, limit: number): string[] {
  if (line.length <= limit) return [line];

  const chunks: string[] = [];
  for (let index = 0; index < line.length; index += limit) {
    chunks.push(line.slice(index, index + limit));
  }
  return chunks;
}

/** Échappe un texte destiné à un nœud ou à un attribut XML. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Construit la mise en page de l'affiche : cartouche en haut, QR code centré,
 * pied de page facultatif en bas. La hauteur s'adapte au contenu.
 */
export function buildPosterLayout(
  content: PosterContent,
  options: PosterOptions = {}
): PosterLayout {
  const showSubtitle = options.showSubtitle !== false && Boolean(content.subtitle);
  const showAction = options.showAction !== false && Boolean(content.action);
  const showFallback = options.showFallback !== false && Boolean(content.fallback);
  const showSecret = options.showSecret === true && Boolean(content.secret);
  const scale = options.scale && options.scale > 0 ? options.scale : 1;

  const texts: PosterText[] = [];
  const rules: PosterRule[] = [];
  const left = POSTER_PADDING;
  const right = POSTER_WIDTH - POSTER_PADDING;
  let y = POSTER_PADDING;

  // Étiquette de type : elle annonce l'action attendue avant même le scan.
  texts.push({
    text: content.kind.toUpperCase(),
    x: left,
    y,
    size: 26,
    weight: 600,
    color: POSTER_COLORS.muted,
    anchor: 'start',
    family: 'sans',
  });
  y += 62;

  // Destination : l'information la plus utile pour décider de scanner ou non.
  for (const line of wrapText(content.title, TITLE_MAX_CHARS)) {
    texts.push({
      text: line,
      x: left,
      y,
      size: 56,
      weight: 700,
      color: POSTER_COLORS.dark,
      anchor: 'start',
      family: 'sans',
    });
    y += 64;
  }

  if (showSubtitle && content.subtitle) {
    for (const line of wrapText(content.subtitle, SUBTITLE_MAX_CHARS)) {
      texts.push({
        text: line,
        x: left,
        y,
        size: 30,
        weight: 400,
        color: POSTER_COLORS.body,
        anchor: 'start',
        family: 'sans',
      });
      y += 40;
    }
  }

  y += 4;
  rules.push({ x1: left, y1: y, x2: right, y2: y, color: POSTER_COLORS.rule, width: 2 });
  y += 44;

  if (showSecret && content.secret) {
    if (content.secretLabel) {
      texts.push({
        text: content.secretLabel,
        x: left,
        y,
        size: 24,
        weight: 400,
        color: POSTER_COLORS.muted,
        anchor: 'start',
        family: 'sans',
      });
      y += 36;
    }
    for (const line of wrapText(content.secret, DETAIL_MAX_CHARS)) {
      texts.push({
        text: line,
        x: left,
        y,
        size: 32,
        weight: 600,
        color: POSTER_COLORS.dark,
        anchor: 'start',
        family: 'mono',
      });
      y += 42;
    }
  }

  if (showAction && content.action) {
    for (const line of wrapText(content.action, ACTION_MAX_CHARS)) {
      texts.push({
        text: line,
        x: left,
        y,
        size: 32,
        weight: 600,
        color: POSTER_COLORS.dark,
        anchor: 'start',
        family: 'sans',
      });
      y += 42;
    }
  }

  if (showFallback && content.fallback) {
    if (content.fallbackLabel) {
      texts.push({
        text: content.fallbackLabel,
        x: left,
        y,
        size: 24,
        weight: 400,
        color: POSTER_COLORS.muted,
        anchor: 'start',
        family: 'sans',
      });
      y += 36;
    }
    for (const line of wrapText(content.fallback, DETAIL_MAX_CHARS)) {
      texts.push({
        text: line,
        x: left,
        y,
        size: 28,
        weight: 600,
        color: POSTER_COLORS.body,
        anchor: 'start',
        family: 'mono',
      });
      y += 38;
    }
  }

  if (content.warning) {
    y += 6;
    for (const line of wrapText(content.warning, WARNING_MAX_CHARS)) {
      texts.push({
        text: line,
        x: left,
        y,
        size: 26,
        weight: 600,
        color: POSTER_COLORS.warning,
        anchor: 'start',
        family: 'sans',
      });
      y += 36;
    }
  }

  // Le QR code reste carré et centré : il demeure scannable quel que soit le texte.
  const qrSize = Math.min(POSTER_QR_MAX_SIZE, POSTER_WIDTH - POSTER_PADDING * 2);
  y += 28;
  const qr = { x: Math.round((POSTER_WIDTH - qrSize) / 2), y: Math.round(y), size: qrSize };
  y += qrSize;

  if (content.footer) {
    y += 56;
    for (const line of wrapText(content.footer, FOOTER_MAX_CHARS)) {
      texts.push({
        text: line,
        x: Math.round(POSTER_WIDTH / 2),
        y,
        size: 24,
        weight: 400,
        color: POSTER_COLORS.muted,
        anchor: 'middle',
        family: 'sans',
      });
      y += 34;
    }
  }

  const textBottom = texts.reduce((max, text) => Math.max(max, text.y + text.size * 0.3), 0);
  const height = Math.round(Math.max(textBottom, qr.y + qr.size) + POSTER_PADDING);

  return { width: POSTER_WIDTH, height, scale, texts, rules, qr };
}

/** Attributs lus dans la balise ouvrante d'un SVG (`viewBox`, `width`, …). */
function parseSvgAttributes(markup: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*"([^"]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(markup)) !== null) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

/**
 * Imbrique le SVG produit par `qrcode` à la position voulue.
 *
 * `viewBox` et `shape-rendering="crispEdges"` sont conservés : le QR code reste
 * net, vectoriel et scannable une fois imprimé. Retourne `null` si le balisage
 * ne peut pas être interprété (l'appelant prévoit alors un repli PNG).
 */
export function embedQrSvg(
  qrSvg: string,
  box: { x: number; y: number; size: number }
): string | null {
  const opening = /<svg\b([^>]*)>/i.exec(qrSvg);
  if (!opening) return null;

  const attributes = parseSvgAttributes(opening[1]);
  const width = Number(attributes.width);
  const height = Number(attributes.height);
  const viewBox = attributes.viewBox || (width > 0 && height > 0 ? `0 0 ${width} ${height}` : '');
  if (!viewBox) return null;

  const kept = Object.entries(attributes)
    .filter(([name]) => !['width', 'height', 'viewbox'].includes(name.toLowerCase()))
    .map(([name, value]) => ` ${name}="${value}"`)
    .join('');

  const inner = qrSvg.slice(opening.index + opening[0].length);
  return `<svg${kept} x="${box.x}" y="${box.y}" width="${box.size}" height="${box.size}" viewBox="${viewBox}">${inner}`;
}

/**
 * Rend la mise en page en SVG : le cartouche est du texte vectoriel
 * (sélectionnable, lisible par les lecteurs d'écran, net à l'impression).
 */
export function layoutToSvg(layout: PosterLayout, qrSvg: string, fallbackImage?: string): string {
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(
      layout.width * layout.scale
    )}" height="${Math.round(layout.height * layout.scale)}" viewBox="0 0 ${layout.width} ${
      layout.height
    }">`,
    `<rect width="${layout.width}" height="${layout.height}" fill="#ffffff"/>`,
  ];

  for (const rule of layout.rules) {
    parts.push(
      `<line x1="${rule.x1}" y1="${rule.y1}" x2="${rule.x2}" y2="${rule.y2}" stroke="${rule.color}" stroke-width="${rule.width}"/>`
    );
  }

  for (const text of layout.texts) {
    const family = (text.family === 'mono' ? MONO_FONT : SANS_FONT).replace(/"/g, "'");
    parts.push(
      `<text x="${text.x}" y="${text.y}" font-family="${family}" font-size="${text.size}" font-weight="${text.weight}" fill="${text.color}" text-anchor="${text.anchor}">${escapeXml(
        text.text
      )}</text>`
    );
  }

  const embedded = embedQrSvg(qrSvg, layout.qr);
  if (embedded) {
    parts.push(embedded);
  } else if (fallbackImage) {
    parts.push(
      `<image x="${layout.qr.x}" y="${layout.qr.y}" width="${layout.qr.size}" height="${layout.qr.size}" href="${escapeXml(
        fallbackImage
      )}"/>`
    );
  }

  parts.push('</svg>');
  return parts.join('\n');
}

/** Affiche complète en SVG, prête à être enregistrée (`.svg`). */
export function posterSvg(
  content: PosterContent,
  options: PosterOptions,
  qrSvg: string,
  fallbackImage?: string
): string {
  return layoutToSvg(buildPosterLayout(content, options), qrSvg, fallbackImage);
}
