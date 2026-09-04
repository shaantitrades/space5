/**
 * Icônes PWA + OG image — encodeur PNG pur Node (zlib + CRC32), aucune dépendance.
 * Usage : node scripts/generate-pwa-icons.js
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'public');
fs.mkdirSync(dir, { recursive: true });

const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const tb = Buffer.from(type); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([tb, data]))); return Buffer.concat([l, tb, data, c]); }
function png(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  return Buffer.concat([sig, chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const hex = (s) => { const n = parseInt(s.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
// Police 5x7 pour "MC"
const F = { M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'], C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'] };

function render(w, h, scaleRatio) {
  const [r1, g1, b1] = hex('#2563eb');
  const [r2, g2, b2] = hex('#7c3aed');
  const out = Buffer.alloc(w * h * 4);
  const scale = Math.max(1, Math.floor((h * scaleRatio) / 7));
  const cols = (5 * 2 + 1); // M + espace + C
  const tw = cols * scale, th = 7 * scale;
  const sx = Math.floor((w - tw) / 2), sy = Math.floor((h - th) / 2);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const t = (x + y) / (w + h - 2);
    let r = lerp(r1, r2, t), g = lerp(g1, g2, t), b = lerp(b1, b2, t);
    const tx = x - sx, ty = y - sy;
    if (tx >= 0 && ty >= 0 && tx < tw && ty < th) {
      const col = Math.floor(tx / scale), row = Math.floor(ty / scale);
      const glyph = col < 5 ? F.M : col < 6 ? ['00000', '00000', '00000', '00000', '00000', '00000', '00000'] : F.C;
      if (col < 5 ? F.M[row][col] === '1' : col >= 6 ? F.C[row][col - 6] === '1' : false) { r = 255; g = 255; b = 255; }
    }
    out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255;
  }
  return out;
}

function save(name, w, h, ratio) { fs.writeFileSync(path.join(dir, name), png(w, h, render(w, h, ratio))); console.log('✔', name); }

save('icon-192.png', 192, 192, 0.46);
save('icon-512.png', 512, 512, 0.46);
save('maskable-icon-512.png', 512, 512, 0.36);
save('apple-touch-icon.png', 180, 180, 0.46);
save('favicon-32x32.png', 32, 32, 0.5);
save('favicon-16x16.png', 16, 16, 0.5);
save('og-image.png', 1200, 630, 0.5);
console.log('✅ Icônes PWA générées');
