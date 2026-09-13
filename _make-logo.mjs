/**
 * Multi Convert - generation de l'icone (logo + favicon).
 *
 *   node _make-logo.mjs
 *
 * 1) ecrit public/logo.svg et public/favicon.svg (contenu strictement identique) ;
 * 2) rastérise tous les PNG a partir de public/logo.svg.
 *
 * Geometrie deduite pixel par pixel de l'image de reference, puis symetrisee :
 * viewBox carre 1024, centre (512, 512).
 */
import fs from 'node:fs';
import sharp from 'sharp';

const OUT = 'C:/space 5/public/';
const BLUE = '#4285F4';
const WHITE = '#FFFFFF';

const R_DISC = 512;   // grand cercle bleu (plein cadre)
const R_RING = 445;   // rayon median de la fine bordure circulaire blanche
const RING_W = 17;    // epaisseur de la bordure blanche

/* Document 194 x 230 : coin superieur droit plie (66), coins arrondis (11) */
const DOC = 'M426 397H543L609 463V616A11 11 0 0 1 598 627H426A11 11 0 0 1 415 616V408A11 11 0 0 1 426 397Z';
/* Rabat du coin plie : pliure creusee en bleu */
const FOLD = 'M543 397L609 463L543 463Z';
/* Fleches : jambe verticale + barre horizontale + tete (angle 90 degres) */
const ARROW_TOP = 'M248 280H703V203L812 311L703 419V342H310V499H248Z';     // pointe a DROITE
const ARROW_BOTTOM = 'M776 744H321V821L212 713L321 605V682H714V525H776Z'; // pointe a GAUCHE

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" fill="none" role="img">
<circle cx="512" cy="512" r="${R_DISC}" fill="${BLUE}"/>
<circle cx="512" cy="512" r="${R_RING}" fill="none" stroke="${WHITE}" stroke-width="${RING_W}"/>
<path d="${ARROW_TOP}" fill="${WHITE}"/>
<path d="${ARROW_BOTTOM}" fill="${WHITE}"/>
<path d="${DOC}" fill="${WHITE}"/>
<path d="${FOLD}" fill="${WHITE}" stroke="${BLUE}" stroke-width="6" stroke-linejoin="round"/>
</svg>
`;

/* Le logo et le favicon partagent exactement le meme symbole */
fs.writeFileSync(OUT + 'logo.svg', SVG, 'utf8');
fs.writeFileSync(OUT + 'favicon.svg', SVG, 'utf8');
console.log(`  logo.svg + favicon.svg : SVG vectoriel identique (${SVG.length} octets)`);

/* Rasterisation depuis public/logo.svg */
const svg = fs.readFileSync(OUT + 'logo.svg');
for (const [name, size] of [
  ['logo.png', 1024],
  ['favicon-512.png', 512],
  ['favicon-192.png', 192],
  ['apple-touch-icon.png', 180],
  ['favicon-32.png', 32],
  ['favicon-16.png', 16],
]) {
  const buf = await sharp(svg, { density: 1024 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(OUT + name, buf);
  console.log(`  ${name.padEnd(22)} PNG ${size}x${size} (${buf.length} octets)`);
}
