// Gera folhas de contato numeradas (uso interno, para classificar fotos).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [dir, outPrefix, perSheet = 20, cols = 5] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const W = 220, H = 275, LABEL = 22;
for (let s = 0; s * perSheet < files.length; s++) {
  const batch = files.slice(s * perSheet, (s + 1) * perSheet);
  const rows = Math.ceil(batch.length / cols);
  const tiles = await Promise.all(batch.map(async (f, i) => {
    const img = await sharp(path.join(dir, f)).resize(W, H, { fit: 'cover', position: 'attention' }).toBuffer();
    const label = Buffer.from(`<svg width="${W}" height="${LABEL}"><rect width="100%" height="100%" fill="#000"/><text x="6" y="16" font-size="14" font-family="Arial" fill="#fff">${f.slice(0, 26)}</text></svg>`);
    return [
      { input: img, left: (i % cols) * W, top: Math.floor(i / cols) * (H + LABEL) },
      { input: label, left: (i % cols) * W, top: Math.floor(i / cols) * (H + LABEL) + H },
    ];
  }));
  await sharp({ create: { width: cols * W, height: rows * (H + LABEL), channels: 3, background: '#333' } })
    .composite(tiles.flat()).jpeg({ quality: 70 }).toFile(`${outPrefix}-${s + 1}.jpg`);
  console.log(`${outPrefix}-${s + 1}.jpg`);
}
