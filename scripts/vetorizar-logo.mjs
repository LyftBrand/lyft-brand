// Redesenha o logo em vetor (SVG) a partir da melhor versão raster disponível.
import sharp from 'sharp';
import potrace from 'potrace';
import fs from 'node:fs';

const src = process.argv[2];
const up = await sharp(src).greyscale().resize({ width: 1600, kernel: 'lanczos3' })
  .blur(1.2).threshold(140).png().toBuffer();
potrace.trace(up, { threshold: 128, turdSize: 40, optTolerance: 0.4, alphaMax: 1.1, color: '#1A1614', background: 'transparent' }, (err, svg) => {
  if (err) throw err;
  fs.writeFileSync('public/logo-trace.svg', svg);
  console.log('ok', svg.length);
});
