/**
 * Tests unitaires de la géométrie de l'éditeur PDF : centrage des objets
 * déposés et poignée unique de redimensionnement.
 *
 * Ces tests protègent deux régressions constatées à l'usage :
 *  - un objet déposé (croix ✗, texte, tampon, image) apparaissait **décalé**
 *    par rapport au clic (son coin était posé sur le curseur) ;
 *  - sur un petit objet, les 4 poignées de coin recouvraient sa boîte
 *    entière : l'objet ne pouvait plus être **déplacé**, seulement
 *    redimensionné (« 4 coins de zoom »).
 *
 * Lancement : `npm test`
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MIN_CLICKED_SHAPE_SIZE,
  RESIZE_HANDLE_SIZE,
  centerOffset,
  centeredAnchor,
  defaultShapeSize,
  hitResizeHandle,
  isClickedShape,
  resizeHandlePoint,
  resizeHandleTolerance,
  type Bounds,
} from '../src/lib/pdf-editor-geometry';

/** Boîte telle que l'éditeur la calcule pour un symbole : ancre = ligne de base. */
const symbolBounds = (x: number, y: number, w: number, h: number): Bounds => ({ x, y: y - h, w, h });

const centerOf = (bounds: Bounds) => ({ x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 });

test('centerOffset : décale la boîte pour que son centre tombe sur le clic', () => {
  const offset = centerOffset({ x: 0, y: 0, w: 40, h: 20 }, 100, 100);
  assert.equal(offset.dx, 80);
  assert.equal(offset.dy, 90);
});

test('centeredAnchor : la croix ✗ apparaît centrée sur le point cliqué', () => {
  const click = { x: 100, y: 200 };
  const fontSize = 20;
  const bounds = symbolBounds(click.x, click.y, 16, fontSize);

  const anchor = centeredAnchor(bounds, click.x, click.y);
  // L'ancre d'un symbole est sa ligne de base : elle descend sous le clic.
  assert.deepEqual(anchor, { x: 92, y: 210 });

  // Vérification par la boîte reconstruite à partir de la nouvelle ancre.
  const placed = symbolBounds(anchor.x, anchor.y, 16, fontSize);
  assert.deepEqual(centerOf(placed), click);
});

test('centeredAnchor : tampon et image (ancre = coin haut-gauche) sont centrés', () => {
  const click = { x: 300, y: 150 };

  const stamp = centeredAnchor({ x: click.x, y: click.y, w: 240, h: 64 }, click.x, click.y);
  assert.deepEqual(stamp, { x: 180, y: 118 });
  assert.deepEqual(centerOf({ ...stamp, w: 240, h: 64 }), click);

  const image = centeredAnchor({ x: click.x, y: click.y, w: 100, h: 50 }, click.x, click.y);
  assert.deepEqual(image, { x: 250, y: 125 });
});

/** Boîte telle que l'éditeur la calcule selon la sémantique d'ancre du type. */
interface Placement {
  w: number;
  h: number;
  /** true = ancre sur la ligne de base (texte/symbole) ; false = coin haut-gauche. */
  anchorAbove: boolean;
}

const boundsFor = (placement: Placement, anchor: { x: number; y: number }): Bounds =>
  placement.anchorAbove
    ? { x: anchor.x, y: anchor.y - placement.h, w: placement.w, h: placement.h }
    : { x: anchor.x, y: anchor.y, w: placement.w, h: placement.h };

test('centeredAnchor : l’objet tombe centré sur le clic, quelles que soient sa taille et son ancre', () => {
  const placements: Placement[] = [
    { w: 16, h: 20, anchorAbove: true }, // croix ✗ (ancre = ligne de base)
    { w: 220, h: 18, anchorAbove: true }, // texte sur une ligne
    { w: 240, h: 64, anchorAbove: false }, // tampon
    { w: 420, h: 300, anchorAbove: false }, // image
  ];
  const clicks = [
    { x: 60, y: 60 },
    { x: 512, y: 700 },
    { x: 1000, y: 40 },
  ];

  for (const placement of placements) {
    for (const click of clicks) {
      const anchor = centeredAnchor(boundsFor(placement, click), click.x, click.y);
      assert.deepEqual(centerOf(boundsFor(placement, anchor)), click);
    }
  }
});

test('poignée unique : en bas à droite, au centre de l’objet rien ne l’attrape', () => {
  const bounds: Bounds = { x: 100, y: 100, w: 200, h: 120 };

  assert.deepEqual(resizeHandlePoint(bounds), { handle: 'se', x: 300, y: 220 });
  assert.equal(hitResizeHandle(bounds, 300, 220), 'se');
  assert.equal(hitResizeHandle(bounds, 295, 215), 'se');
  // Centre et coin opposé : la place est laissée au déplacement.
  assert.equal(hitResizeHandle(bounds, 200, 160), null);
  assert.equal(hitResizeHandle(bounds, 100, 100), null);
});

test('petit objet (croix ✗ 20×20) : le centre reste déplaçable', () => {
  const bounds: Bounds = { x: 50, y: 50, w: 20, h: 20 };
  const tolerance = resizeHandleTolerance(bounds);

  // La marge est réduite sur les petits objets…
  assert.ok(tolerance < 12, `marge attendue < 12 px, reçue ${tolerance}`);
  // …ce qui laisse une zone centrale libre : le bug où les 4 coins se
  // recouvraient rendait cette zone nulle.
  assert.equal(hitResizeHandle(bounds, 50 + bounds.w / 2, 50 + bounds.h / 2), null);
  assert.equal(hitResizeHandle(bounds, 55, 55), null);
  // La poignée bas-droite reste saisissable.
  assert.equal(hitResizeHandle(bounds, 70, 70), 'se');
  assert.ok(tolerance >= 7 && RESIZE_HANDLE_SIZE >= 9);
});

test('marge de saisie : plafonnée sur les gros objets', () => {
  assert.equal(resizeHandleTolerance({ x: 0, y: 0, w: 400, h: 300 }), 16);
  assert.equal(resizeHandleTolerance({ x: 0, y: 0, w: 1, h: 1 }), 7);
});

test('formes : un simple clic reçoit une taille par défaut centrée', () => {
  const kinds = ['rectangle', 'circle', 'triangle', 'hexagon', 'pentagon', 'star', 'cloud', 'highlight', 'erase', 'redact'] as const;

  for (const kind of kinds) {
    const size = defaultShapeSize(kind);
    assert.ok(size.width >= MIN_CLICKED_SHAPE_SIZE && size.height >= MIN_CLICKED_SHAPE_SIZE, `${kind} doit être visible`);

    const click = { x: 120, y: 240 };
    const anchor = centeredAnchor({ x: click.x, y: click.y, w: size.width, h: size.height }, click.x, click.y);
    assert.deepEqual(centerOf({ x: anchor.x, y: anchor.y, w: size.width, h: size.height }), click);
  }

  assert.equal(isClickedShape(1, 1), true);
  assert.equal(isClickedShape(0, 0), true);
  assert.equal(isClickedShape(60, 40), false);
  // Un seul côté négligeable suffit à considérer la forme comme « dessinée ».
  assert.equal(isClickedShape(60, 1), false);
});
