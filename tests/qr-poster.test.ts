/**
 * Tests unitaires de la composition d'affiche : cartouche + QR code + pied de page.
 *
 * Lancement : `npm test`
 * (compilation via tsconfig.test.json puis exécution avec le lanceur natif Node)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  POSTER_WIDTH,
  buildPosterLayout,
  embedQrSvg,
  escapeXml,
  layoutToSvg,
  posterSvg,
  wrapText,
  type PosterContent,
} from '../src/lib/qr-poster';

/** Réplique du balisage produit par `qrcode` avec `type: 'svg'`. */
const QR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 41 41" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h41v41H0z"/><path stroke="#000000" d="M4 4.5h7m1 0h1"/></svg>';

const CONTENT: PosterContent = {
  kind: 'Lien vers',
  title: 'exemple.com',
  subtitle: '/produits/ete-2026',
  action: 'Scannez avec l’appareil photo',
  fallbackLabel: 'Pas de scanneur ? Recopiez ceci :',
  fallback: 'https://www.exemple.com/produits/ete-2026',
  warning: 'Lien raccourci : la destination réelle n’est pas visible.',
  footer: 'Mon entreprise — monentreprise.fr',
};

test('buildPosterLayout : cartouche complet, QR centré et hauteur calculée', () => {
  const layout = buildPosterLayout(CONTENT);

  assert.equal(layout.width, POSTER_WIDTH);
  assert.equal(layout.scale, 1);
  assert.equal(layout.rules.length, 1);

  const lines = layout.texts.map((line) => line.text);
  assert.ok(lines.includes('LIEN VERS'));
  assert.ok(lines.includes('exemple.com'));
  assert.ok(lines.includes('/produits/ete-2026'));
  assert.ok(lines.includes('https://www.exemple.com/produits/ete-2026'));
  assert.ok(lines.includes('Mon entreprise — monentreprise.fr'));

  // Le texte de secours est en chasse fixe : il doit être recopiable sans ambiguïté.
  const fallback = layout.texts.find((line) => line.text.startsWith('https://'));
  assert.ok(fallback);
  assert.equal(fallback.family, 'mono');

  // Le pied de page est centré, le reste est aligné à gauche.
  const footer = layout.texts.find((line) => line.text.startsWith('Mon entreprise'));
  assert.ok(footer);
  assert.equal(footer.anchor, 'middle');

  assert.equal(layout.qr.size, 560);
  assert.equal(layout.qr.x, 220);
  assert.ok(layout.qr.y > 72);
  assert.ok(layout.height >= layout.qr.y + layout.qr.size);

  const positions = layout.texts.map((line) => line.y);
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
});

test('buildPosterLayout : les options décochent les blocs facultatifs', () => {
  const layout = buildPosterLayout(CONTENT, {
    showSubtitle: false,
    showAction: false,
    showFallback: false,
  });

  const lines = layout.texts.map((line) => line.text);
  assert.ok(!lines.includes('/produits/ete-2026'));
  assert.ok(!lines.some((line) => line.startsWith('Scannez')));
  assert.ok(!lines.includes('https://www.exemple.com/produits/ete-2026'));
  assert.ok(lines.includes('exemple.com'));
  assert.ok(lines.includes('Mon entreprise — monentreprise.fr'));
  assert.ok(layout.height < buildPosterLayout(CONTENT).height);
});

test('buildPosterLayout : mot de passe masqué sauf demande explicite', () => {
  const wifi: PosterContent = {
    kind: 'Réseau WiFi',
    title: 'Cafe-Invites',
    subtitle: 'Sécurité · WPA / WPA2',
    action: 'Scannez pour rejoindre le WiFi',
    secretLabel: 'Mot de passe',
    secret: 'cafe2026',
  };

  const hidden = buildPosterLayout(wifi).texts.map((line) => line.text);
  assert.ok(!hidden.includes('cafe2026'));

  const shown = buildPosterLayout(wifi, { showSecret: true }).texts.map((line) => line.text);
  assert.ok(shown.includes('Mot de passe'));
  assert.ok(shown.includes('cafe2026'));
  assert.ok(!hidden.includes('Mot de passe'));
});

test('wrapText : respecte la largeur, garde les mots entiers', () => {
  assert.deepEqual(wrapText('un deux trois quatre cinq', 10), [
    'un deux',
    'trois',
    'quatre',
    'cinq',
  ]);
  assert.deepEqual(wrapText('ligne 1\nligne 2', 20), ['ligne 1', 'ligne 2']);
  assert.deepEqual(wrapText('   ', 10), []);
  assert.deepEqual(wrapText('un\ndeux', 4), ['un', 'deux']);
});

test('wrapText : coupe les mots plus longs que la largeur disponible', () => {
  const lines = wrapText('anticonstitutionnellement', 8);

  assert.deepEqual(
    lines.map((line) => line.length),
    [8, 8, 8, 1]
  );
  assert.equal(lines.join(''), 'anticonstitutionnellement');
});

test('escapeXml : neutralise les caractères réservés au XML', () => {
  assert.equal(escapeXml(`A & B <C> "D" 'E'`), 'A &amp; B &lt;C&gt; &quot;D&quot; &apos;E&apos;');
});

test('embedQrSvg : réutilise viewBox et crispEdges, sans attribut dupliqué', () => {
  const embedded = embedQrSvg(QR_SVG, { x: 220, y: 600, size: 560 });

  assert.ok(embedded);
  assert.ok(embedded.includes('x="220" y="600" width="560" height="560"'));
  assert.ok(embedded.includes('viewBox="0 0 41 41"'));
  assert.ok(embedded.includes('shape-rendering="crispEdges"'));
  assert.ok(embedded.includes('<path fill="#ffffff" d="M0 0h41v41H0z"/>'));
  assert.ok(!embedded.includes('width="320"'));
  assert.equal((embedded.match(/viewBox=/g) || []).length, 1);
  assert.equal((embedded.match(/<svg/g) || []).length, 1);
});

test('embedQrSvg : balisage sans dimensions -> repli signalé par null', () => {
  assert.equal(embedQrSvg('pas un svg', { x: 0, y: 0, size: 10 }), null);
  assert.equal(embedQrSvg('<svg></svg>', { x: 0, y: 0, size: 10 }), null);
});

test('posterSvg : affiche complète, texte échappé et QR imbriqué', () => {
  const markup = posterSvg(
    { ...CONTENT, title: 'exemple.com & Cie' },
    {},
    QR_SVG,
    'data:image/png;base64,AAA'
  );

  assert.ok(markup.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(markup.endsWith('</svg>'));
  assert.ok(markup.includes('exemple.com &amp; Cie'));
  assert.ok(!markup.includes('exemple.com & Cie'));
  assert.ok(/<line x1="/.test(markup));
  assert.ok(!markup.includes('<image'));
  assert.ok(!markup.includes('undefined'));
  assert.equal((markup.match(/<svg/g) || []).length, 2);
});

test('layoutToSvg : repli PNG quand le SVG du QR code est illisible', () => {
  const layout = buildPosterLayout(CONTENT);

  const withFallback = layoutToSvg(layout, 'cassé', 'data:image/png;base64,AAA');
  assert.ok(withFallback.includes('<image x="220"'));
  assert.ok(withFallback.includes('data:image/png;base64,AAA'));

  const withoutFallback = layoutToSvg(layout, 'cassé');
  assert.ok(!withoutFallback.includes('<image'));
});

test('layoutToSvg : le facteur d’échelle dimensionne la sortie', () => {
  const base = buildPosterLayout(CONTENT);
  const markups = layoutToSvg(buildPosterLayout(CONTENT, { scale: 2 }), QR_SVG);
  const dimensions = /width="(\d+)" height="(\d+)"/.exec(markups);

  assert.ok(dimensions);
  assert.equal(Number(dimensions[1]), POSTER_WIDTH * 2);
  assert.equal(Number(dimensions[2]), base.height * 2);
});

