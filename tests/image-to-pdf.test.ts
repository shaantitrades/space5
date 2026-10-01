/**
 * Tests unitaires de l'assembleur « images → PDF ».
 *
 * Lancement : `npm test`
 * (compilation via tsconfig.test.json puis exécution avec le lanceur natif Node)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

import { ImageToPdfConverter, mmToPt } from '../src/lib/converters/image-to-pdf';

/** Tolérance sur les dimensions relues, en points */
const TOLERANCE = 0.5;

/** Dimensions A4 et Letter en points (1 pt = 1/72 pouce) */
const A4_PORTRAIT = { width: 595.28, height: 841.89 };
const LETTER_PORTRAIT = { width: 612, height: 792 };

const createImage = (
  width: number,
  height: number,
  format: 'png' | 'jpeg' | 'webp' | 'gif' | 'tiff',
  alpha = false
): Promise<Buffer> => {
  const image = sharp({
    create: {
      width,
      height,
      channels: alpha ? 4 : 3,
      background: alpha
        ? { r: 255, g: 0, b: 0, alpha: 0.4 }
        : { r: 0, g: 120, b: 255, alpha: 1 },
    },
  });

  switch (format) {
    case 'png':
      return image.png().toBuffer();
    case 'jpeg':
      return image.jpeg().toBuffer();
    case 'webp':
      return image.webp().toBuffer();
    case 'gif':
      return image.gif().toBuffer();
    default:
      return image.tiff().toBuffer();
  }
};

/** Relit les dimensions de chaque page du PDF produit */
const readPages = async (pdf: Buffer): Promise<Array<{ width: number; height: number }>> => {
  const document = await PDFDocument.load(pdf);
  return document.getPages().map((page) => page.getSize());
};

const assertSize = (
  page: { width: number; height: number } | undefined,
  expected: { width: number; height: number }
): void => {
  assert.ok(page, 'page attendue');
  assert.ok(
    Math.abs(page.width - expected.width) <= TOLERANCE,
    `largeur attendue ${expected.width}, obtenue ${page.width}`
  );
  assert.ok(
    Math.abs(page.height - expected.height) <= TOLERANCE,
    `hauteur attendue ${expected.height}, obtenue ${page.height}`
  );
};

test("mode « fit » : une page par image, dans l'ordre fourni", async () => {
  const pdf = await ImageToPdfConverter.convert(
    [
      await createImage(400, 300, 'png'),
      await createImage(300, 500, 'jpeg'),
      await createImage(520, 180, 'webp'),
    ],
    { pageSize: 'fit' }
  );

  assert.equal(pdf.subarray(0, 4).toString('ascii'), '%PDF');

  const pages = await readPages(pdf);
  assert.equal(pages.length, 3);
  assertSize(pages[0], { width: 400, height: 300 });
  assertSize(pages[1], { width: 300, height: 500 });
  assertSize(pages[2], { width: 520, height: 180 });
});

test('accepte des entrées nommées { buffer, name }', async () => {
  const pdf = await ImageToPdfConverter.convert(
    [
      { buffer: await createImage(200, 100, 'png'), name: 'photo.png' },
      { buffer: await createImage(100, 200, 'jpeg'), name: 'scan.jpg' },
    ],
    { pageSize: 'fit' }
  );

  const pages = await readPages(pdf);
  assert.equal(pages.length, 2);
  assertSize(pages[0], { width: 200, height: 100 });
  assertSize(pages[1], { width: 100, height: 200 });
});

test('A4 : orientation automatique selon le sens de l\u2019image', async () => {
  const pdf = await ImageToPdfConverter.convert(
    [await createImage(520, 180, 'png'), await createImage(300, 500, 'jpeg')],
    { pageSize: 'a4' }
  );

  const pages = await readPages(pdf);
  // Image large → page paysage ; image haute → page portrait
  assertSize(pages[0], { width: A4_PORTRAIT.height, height: A4_PORTRAIT.width });
  assertSize(pages[1], A4_PORTRAIT);
});

test('A4 : orientation forcée portrait / paysage', async () => {
  const forcedPortrait = await ImageToPdfConverter.convert([await createImage(520, 180, 'png')], {
    pageSize: 'a4',
    orientation: 'portrait',
  });
  assertSize((await readPages(forcedPortrait))[0], A4_PORTRAIT);

  const forcedLandscape = await ImageToPdfConverter.convert([await createImage(300, 500, 'png')], {
    pageSize: 'a4',
    orientation: 'landscape',
  });
  assertSize((await readPages(forcedLandscape))[0], {
    width: A4_PORTRAIT.height,
    height: A4_PORTRAIT.width,
  });
});

test("Letter : 612 × 792 pt, orientation ignorée en mode « fit »", async () => {
  const letter = await ImageToPdfConverter.convert([await createImage(300, 500, 'png')], {
    pageSize: 'letter',
  });
  assertSize((await readPages(letter))[0], LETTER_PORTRAIT);

  const fit = await ImageToPdfConverter.convert([await createImage(300, 500, 'png')], {
    pageSize: 'fit',
    orientation: 'landscape',
  });
  assertSize((await readPages(fit))[0], { width: 300, height: 500 });
});

test('marge : agrandit la page en mode « fit »', async () => {
  const pdf = await ImageToPdfConverter.convert([await createImage(400, 300, 'png')], {
    pageSize: 'fit',
    margin: 20,
  });

  const pages = await readPages(pdf);
  assert.equal(pages.length, 1);
  assertSize(pages[0], { width: 440, height: 340 });
});

test('marge : valeurs négatives ou non numériques ignorées', async () => {
  const negative = await ImageToPdfConverter.convert([await createImage(400, 300, 'png')], {
    pageSize: 'fit',
    margin: -50,
  });
  assertSize((await readPages(negative))[0], { width: 400, height: 300 });

  const notANumber = await ImageToPdfConverter.convert([await createImage(400, 300, 'png')], {
    pageSize: 'fit',
    margin: Number.NaN,
  });
  assertSize((await readPages(notANumber))[0], { width: 400, height: 300 });
});

test('marge : bornée pour éviter des pages absurdes', async () => {
  const pdf = await ImageToPdfConverter.convert([await createImage(400, 300, 'png')], {
    pageSize: 'fit',
    margin: 100000,
  });

  // Marge plafonnée à 400 pt : 400 + 2 × 400
  assertSize((await readPages(pdf))[0], { width: 1200, height: 1100 });
});

test("marge : n'agrandit pas les pages aux formats papier", async () => {
  const pdf = await ImageToPdfConverter.convert([await createImage(400, 300, 'png')], {
    pageSize: 'a4',
    margin: 36,
  });

  assertSize((await readPages(pdf))[0], {
    width: A4_PORTRAIT.height,
    height: A4_PORTRAIT.width,
  });
});

test('formats non embarquables (GIF, TIFF) normalisés puis assemblés', async () => {
  const pdf = await ImageToPdfConverter.convert(
    [await createImage(300, 200, 'gif'), await createImage(200, 300, 'tiff')],
    { pageSize: 'fit' }
  );

  const pages = await readPages(pdf);
  assert.equal(pages.length, 2);
  assertSize(pages[0], { width: 300, height: 200 });
  assertSize(pages[1], { width: 200, height: 300 });
});

test('refuse une liste vide', async () => {
  await assert.rejects(
    () => ImageToPdfConverter.convert([], { pageSize: 'a4' }),
    /Aucune image à convertir/
  );
});

test('refuse un contenu vide', async () => {
  await assert.rejects(
    () => ImageToPdfConverter.convert([Buffer.alloc(0)], { pageSize: 'fit' }),
    /Image vide ou illisible/
  );
});

test('mmToPt : 25,4 mm correspondent à 72 pt', () => {
  assert.ok(Math.abs(mmToPt(25.4) - 72) < 0.0001);
  assert.equal(mmToPt(0), 0);
});

