/**
 * 🧪 Test unitaire — recadrage PDF par marges en pourcentage
 *
 * Vérifie `PDFTransform.cropByMargins` (nouvelle API de recadrage utilisée par
 * l'écran « Recadrer les Pages ») :
 *   1. marges symétriques de 10 % → CropBox = 80 % de la page, centré ;
 *   2. marges asymétriques → chaque côté est retiré indépendamment ;
 *   3. `pageIndex` → seule la page demandée est recadrée ;
 *   4. marges absurdes (200 %) → bornées à 45 % (jamais de page vide) ;
 *   5. non-régression : l'ancien recadrage en points absolus fonctionne toujours.
 *
 * Lancement :
 *   node scripts/test-pdf-crop.mjs
 */
import { PDFDocument } from 'pdf-lib';

const { PDFTransform } = await import('../src/lib/converters/pdf-transform.ts');

let pass = 0;
let fail = 0;
const results = [];

const check = (name, condition, detail = '') => {
  if (condition) {
    pass++;
    results.push(`  ✅ ${name}`);
  } else {
    fail++;
    results.push(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const near = (actual, expected, tolerance = 0.05) => Math.abs(actual - expected) <= tolerance;

/** PDF de test : 2 pages A4, une marque de texte sur chacune. */
const makePdf = async (pages = 2) => {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    const page = pdf.addPage([595.28, 841.89]); // A4 en points
    page.drawText(`Page ${i + 1}`, { x: 40, y: 800, size: 18 });
  }
  return Buffer.from(await pdf.save());
};

const A4_W = 595.28;
const A4_H = 841.89;

console.log('\n🧪 Recadrage PDF — marges en pourcentage\n');

// --- 1. Marges symétriques 10 % -------------------------------------------
{
  const input = await makePdf();
  const output = await PDFTransform.cropByMargins(input, { top: 10, bottom: 10, left: 10, right: 10 });
  const pdf = await PDFDocument.load(output);

  const pages = pdf.getPages();
  check('1. le document conserve ses 2 pages', pages.length === 2, `pages=${pages.length}`);

  const box = pages[0].getCropBox();
  check(
    '1. X du CropBox = 10 % de la largeur (59.528)',
    near(box.x, A4_W * 0.1),
    `x=${box.x}`
  );
  check(
    '1. Y du CropBox = 10 % de la hauteur (84.189)',
    near(box.y, A4_H * 0.1),
    `y=${box.y}`
  );
  check(
    '1. largeur du CropBox = 80 % (476.224)',
    near(box.width, A4_W * 0.8),
    `width=${box.width}`
  );
  check(
    '1. hauteur du CropBox = 80 % (673.512)',
    near(box.height, A4_H * 0.8),
    `height=${box.height}`
  );
  check(
    '1. la 2e page est recadrée elle aussi',
    near(pages[1].getCropBox().width, A4_W * 0.8),
    `width=${pages[1].getCropBox().width}`
  );
}

// --- 2. Marges asymétriques ------------------------------------------------
{
  const input = await makePdf(1);
  // 5 % à gauche (29.764), 20 % à droite (119.056), 0 % en haut/bas
  const output = await PDFTransform.cropByMargins(input, { top: 0, bottom: 0, left: 5, right: 20 });
  const pdf = await PDFDocument.load(output);
  const box = pdf.getPages()[0].getCropBox();

  check('2. marge gauche = 5 % (29.764)', near(box.x, A4_W * 0.05), `x=${box.x}`);
  check('2. largeur = 75 % (446.460)', near(box.width, A4_W * 0.75), `width=${box.width}`);
  check('2. aucune marge verticale appliquée', near(box.y, 0) && near(box.height, A4_H), `y=${box.y} h=${box.height}`);
}

// --- 3. Ciblage d'une seule page -------------------------------------------
{
  const input = await makePdf(2);
  const output = await PDFTransform.cropByMargins(input, { top: 10, bottom: 10, left: 10, right: 10 }, 1);
  const pdf = await PDFDocument.load(output);
  const [first, second] = pdf.getPages();

  check(
    '3. la page 1 (index 0) n\'est pas recadrée',
    near(first.getCropBox().width, A4_W),
    `width=${first.getCropBox().width}`
  );
  check(
    '3. la page 2 (index 1) est recadrée',
    near(second.getCropBox().width, A4_W * 0.8),
    `width=${second.getCropBox().width}`
  );
}

// --- 4. Bornage des marges absurdes ---------------------------------------
{
  const input = await makePdf(1);
  const output = await PDFTransform.cropByMargins(input, { top: 200, bottom: -50, left: 200, right: 200 });
  const pdf = await PDFDocument.load(output);
  const box = pdf.getPages()[0].getCropBox();

  // 200 % → borné à 45 % ; -50 % → 0 %. Reste 10 % de largeur, soit ≈ 59.5 pts.
  check('4. marge > 100 % bornée (largeur = 10 % de la page)', near(box.width, A4_W * 0.1), `width=${box.width}`);
  check('4. marge négative ignorée (hauteur = 55 %)', near(box.height, A4_H * 0.55), `height=${box.height}`);
  check('4. jamais de largeur/hauteur nulle ou négative', box.width > 0 && box.height > 0, `w=${box.width} h=${box.height}`);
}

// --- 5. Non-régression : recadrage en points absolus -----------------------
{
  const input = await makePdf(1);
  const output = await PDFTransform.cropPages(input, 10, 20, 300, 400);
  const pdf = await PDFDocument.load(output);
  const box = pdf.getPages()[0].getCropBox();

  // Convention de PDFTransform.cropPages : y est le coin SUPÉRIEUR gauche,
  // mesuré depuis le haut de la page (converti en origine bas-gauche ensuite).
  check(
    '5. recadrage absolu conservé (300 × 400 depuis 10,20 en partant du haut)',
    near(box.x, 10) &&
      near(box.y, A4_H - 20 - 400) &&
      near(box.width, 300) &&
      near(box.height, 400),
    JSON.stringify(box)
  );
}

// --- 6. Le haut et le bas ne sont pas confondus ----------------------------
{
  const input = await makePdf(1);
  // 20 % retirés en HAUT uniquement : le bas de la page doit rester intact (y = 0).
  const output = await PDFTransform.cropByMargins(input, { top: 20, bottom: 0, left: 0, right: 0 });
  const pdf = await PDFDocument.load(output);
  const box = pdf.getPages()[0].getCropBox();

  check('6. marge du haut : la page démarre bien en bas (y = 0)', near(box.y, 0), `y=${box.y}`);
  check('6. marge du haut : hauteur = 80 %', near(box.height, A4_H * 0.8), `height=${box.height}`);
}

{
  const input = await makePdf(1);
  // 20 % retirés en BAS uniquement : la boîte doit être rehaussée de 20 %.
  const output = await PDFTransform.cropByMargins(input, { top: 0, bottom: 20, left: 0, right: 0 });
  const pdf = await PDFDocument.load(output);
  const box = pdf.getPages()[0].getCropBox();

  check('6. marge du bas : la boîte est rehaussée (y = 20 %)', near(box.y, A4_H * 0.2), `y=${box.y}`);
  check('6. marge du bas : hauteur = 80 %', near(box.height, A4_H * 0.8), `height=${box.height}`);
}

console.log(results.join('\n'));
console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} test(s) OK, ${fail} échec(s)\n`);
process.exit(fail === 0 ? 0 : 1);
