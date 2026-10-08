// Recorta o SVG do logo rente ao desenho e gera variações de cor.
import sharp from 'sharp';
import fs from 'node:fs';

let svg = fs.readFileSync('public/logo-trace.svg', 'utf8');
const w = +svg.match(/width="(\d+)"/)[1], h = +svg.match(/height="(\d+)"/)[1];
const { info } = await sharp(Buffer.from(svg)).flatten({ background: '#fff' }).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
const x = -info.trimOffsetLeft, y = -info.trimOffsetTop, vw = info.width, vh = info.height;
const paths = svg.match(/<path[^>]*\/>/g).join('');
const make = (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${vw} ${vh}" role="img" aria-label="lyft">${paths.replace(/fill="[^"]*"/g, `fill="${fill}"`)}</svg>`;
fs.writeFileSync('public/logo.svg', make('#1A1614'));
fs.writeFileSync('public/logo-claro.svg', make('#F6F1EC'));
fs.writeFileSync('src-logo-paths.txt', paths);
fs.unlinkSync('public/logo-trace.svg');
console.log({ x, y, vw, vh, w, h });
