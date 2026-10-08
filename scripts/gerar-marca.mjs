// Gera favicon e imagem de compartilhamento (og-image) a partir do logo e das fotos.
import sharp from 'sharp';
import fs from 'node:fs';

const logo = fs.readFileSync('public/logo.svg', 'utf8');
const vb = logo.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
const paths = logo.match(/<path[^>]*\/>/g).join('');

// favicon: logo no círculo nude, como o avatar do Instagram
const s = 64, pad = 12, escala = (s - pad * 2) / vb[2];
const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}"><circle cx="32" cy="32" r="32" fill="#EDE5DE"/><g transform="translate(${pad} ${(s - vb[3] * escala) / 2}) scale(${escala}) translate(${-vb[0]} ${-vb[1]})">${paths}</g></svg>`;
fs.writeFileSync('public/favicon.svg', fav);
await sharp(Buffer.from(fav)).resize(180, 180).png().toFile('public/apple-touch-icon.png');

// og-image 1200x630: foto à direita, logo e slogan à esquerda
const foto = await sharp('public/uploads/marca/hero.jpg').resize(560, 630, { fit: 'cover', position: 'top' }).toBuffer();
const lw = 300, lh = Math.round(lw * vb[3] / vb[2]);
const logoPng = await sharp(Buffer.from(logo)).resize(lw, lh).png().toBuffer();
const texto = Buffer.from(`<svg width="640" height="630" xmlns="http://www.w3.org/2000/svg">
  <text x="70" y="420" font-family="Georgia, serif" font-size="40" fill="#1A1614">Movimente seu corpo,</text>
  <text x="70" y="470" font-family="Georgia, serif" font-style="italic" font-size="40" fill="#8C7067">eleve sua confiança.</text>
  <text x="70" y="545" font-family="Arial, sans-serif" font-size="17" letter-spacing="4" fill="#877B74">COLEÇÃO ELEVATE 2026</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#EDE5DE' } })
  .composite([{ input: foto, left: 640, top: 0 }, { input: logoPng, left: 70, top: 120 }, { input: texto, left: 0, top: 0 }])
  .jpeg({ quality: 84, mozjpeg: true }).toFile('public/og-image.jpg');
console.log('ok');
