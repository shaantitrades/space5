/**
 * Géométrie de l'éditeur PDF : centrage des objets déposés et poignée de
 * redimensionnement.
 *
 * Ces calculs vivaient dans `src/components/editors/pdf-editor.tsx` (4 000+
 * lignes) où ils étaient impossibles à tester. Ils sont réunis ici et restent
 * **purs** : aucun accès au DOM, au canvas ou à React.
 *
 * Tests : `tests/pdf-editor-geometry.test.ts` (lancés par `npm test`).
 */

/** Boîte englobante, dans les coordonnées du canvas de l'éditeur. */
export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Côté (en px) du carré dessiné comme poignée de redimensionnement. */
export const RESIZE_HANDLE_SIZE = 11;

/** Marge de saisie minimale autour de la poignée (px). */
const HANDLE_TOLERANCE_MIN = 7;
/** Marge de saisie maximale autour de la poignée (px). */
const HANDLE_TOLERANCE_MAX = 16;
/**
 * Part de la plus petite dimension d'un objet en dessous de laquelle la
 * poignée ne doit plus mordre : sans ce plafond, sur un petit objet (croix ✗,
 * icône, texte court) la zone de la poignée recouvrait la boîte entière et
 * l'objet devenait impossible à déplacer (il se redimensionnait toujours).
 */
const HANDLE_TOLERANCE_RATIO = 2.5;

/**
 * Décalage à appliquer pour amener le **centre** d'une boîte sur un point.
 *
 * Comme la boîte d'un objet est une simple translation de son ancre (`x`/`y`),
 * appliquer ce décalage à l'ancre centre l'objet sur le point cliqué.
 */
export function centerOffset(bounds: Bounds, pointX: number, pointY: number): { dx: number; dy: number } {
  return {
    dx: pointX - (bounds.x + bounds.w / 2),
    dy: pointY - (bounds.y + bounds.h / 2),
  };
}

/**
 * Ancre d'un nouvel élément, telle qu'il apparaisse **centré** sur le clic
 * (comportement attendu de type Figma/Canva : l'objet se pose là où l'on
 * clique, il n'est ni décalé en haut/à droite, ni caché sous le curseur).
 *
 * @param bounds Boîte de l'élément calculée à partir de l'ancre `(x, y)`.
 * @param x Ancre horizontale (point cliqué).
 * @param y Ancre verticale (point cliqué).
 */
export function centeredAnchor(bounds: Bounds, x: number, y: number): { x: number; y: number } {
  const { dx, dy } = centerOffset(bounds, x, y);
  return { x: x + dx, y: y + dy };
}

/**
 * Poignée unique de redimensionnement : le coin **bas-droite** de l'objet.
 *
 * Quatre poignées (aux quatre coins) étaient toutes équivalentes — sur un
 * texte ou un symbole, tirer un coin revient à changer la taille de la police
 * — et encombraient les petits objets. Une seule poignée, plus les boutons
 * « + / − » de la barre d'actions, rendent l'action lisible.
 */
export function resizeHandlePoint(bounds: Bounds): { handle: 'se'; x: number; y: number } {
  return { handle: 'se', x: bounds.x + bounds.w, y: bounds.y + bounds.h };
}

/**
 * Marge de saisie autour de la poignée. Elle se réduit sur les petits objets
 * pour laisser une zone centrale déplaçable.
 */
export function resizeHandleTolerance(bounds: Bounds): number {
  const smallest = Math.min(Math.abs(bounds.w), Math.abs(bounds.h));
  return Math.max(HANDLE_TOLERANCE_MIN, Math.min(HANDLE_TOLERANCE_MAX, smallest / HANDLE_TOLERANCE_RATIO));
}

/**
 * Le pointeur est-il sur la poignée de redimensionnement ?
 *
 * @returns `'se'` si la poignée est saisie, `null` sinon (l'appelant laisse
 * alors la place au déplacement de l'objet).
 */
export function hitResizeHandle(bounds: Bounds, x: number, y: number): 'se' | null {
  const point = resizeHandlePoint(bounds);
  const tolerance = resizeHandleTolerance(bounds);
  const onHandle = Math.abs(x - point.x) <= tolerance && Math.abs(y - point.y) <= tolerance;
  return onHandle ? 'se' : null;
}

/** Écart entre deux lignes de texte, en multiple de la taille de police. */
export const TEXT_LINE_HEIGHT_RATIO = 1.25;

/** Hauteur d'une ligne de texte (pour placer la ligne de base suivante). */
export function textLineHeight(fontSize: number): number {
  return fontSize * TEXT_LINE_HEIGHT_RATIO;
}

/**
 * Hauteur de la boîte d'un texte, retours à la ligne compris.
 *
 * L'ancre `y` du texte est la ligne de base de la première ligne : la hauteur
 * vaut la taille de police pour une ligne, puis une interligne par ligne
 * supplémentaire. Sans cela, un texte replié automatiquement débordait de sa
 * boîte de sélection (et le centrage sur le clic était faux).
 */
export function textBlockHeight(text: string, fontSize: number): number {
  const lines = Math.max(1, String(text ?? '').split('\n').length);
  return fontSize + (lines - 1) * textLineHeight(fontSize);
}

/** Types de formes créées par glisser-déposer. */
export type BoxShapeKind =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'hexagon'
  | 'pentagon'
  | 'star'
  | 'cloud'
  | 'highlight'
  | 'erase'
  | 'redact';

/** Taille en dessous de laquelle une forme est considérée « juste cliquée ». */
export const MIN_CLICKED_SHAPE_SIZE = 8;

/**
 * Taille par défaut d'une forme lorsqu'on s'est contenté de **cliquer** (sans
 * glisser) : une forme de 1×1 px était invisible et impossible à rattraper.
 */
export function defaultShapeSize(kind: BoxShapeKind): { width: number; height: number } {
  switch (kind) {
    case 'circle':
      return { width: 96, height: 96 };
    case 'triangle':
      return { width: 120, height: 100 };
    case 'hexagon':
    case 'pentagon':
    case 'star':
    case 'cloud':
      return { width: 120, height: 120 };
    case 'highlight':
      return { width: 180, height: 26 };
    case 'erase':
    case 'redact':
      return { width: 180, height: 40 };
    case 'rectangle':
    default:
      return { width: 180, height: 100 };
  }
}

/** La forme a-t-elle été simplement cliquée (aucun glisser significatif) ? */
export function isClickedShape(width: number, height: number): boolean {
  return Math.abs(width) < MIN_CLICKED_SHAPE_SIZE && Math.abs(height) < MIN_CLICKED_SHAPE_SIZE;
}
