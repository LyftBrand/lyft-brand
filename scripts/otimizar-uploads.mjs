// Roda no build: reduz fotos grandes enviadas pelo painel antes de publicar.
// O arquivo no GitHub continua o original; só a cópia publicada (dist/uploads) é otimizada.
// Mesmo nome e formato, então nenhum link do site muda.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Sem cache: a foto é lida para a memória e o arquivo fica livre para ser sobrescrito (Windows trava o arquivo aberto).
sharp.cache(false);

const PASTA = path.resolve('dist/uploads');
const LADO_MAX = 2000;
const PESO_MAX = 800 * 1024;

function* arquivos(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* arquivos(p);
    else if (/\.(jpe?g|png|webp)$/i.test(e.name)) yield p;
  }
}

let otimizadas = 0;
let economia = 0;
if (fs.existsSync(PASTA)) {
  for (const arq of arquivos(PASTA)) {
    const antes = fs.statSync(arq).size;
    const img = sharp(fs.readFileSync(arq), { failOn: 'none' }).rotate();
    const { width = 0, height = 0 } = await img.metadata();
    if (Math.max(width, height) <= LADO_MAX && antes <= PESO_MAX) continue;

    const ext = path.extname(arq).toLowerCase();
    let saida = img.resize({ width: LADO_MAX, height: LADO_MAX, fit: 'inside', withoutEnlargement: true });
    if (ext === '.png') saida = saida.png({ compressionLevel: 9, palette: true, quality: 85 });
    else if (ext === '.webp') saida = saida.webp({ quality: 82 });
    else saida = saida.jpeg({ quality: 82, mozjpeg: true, progressive: true });

    const buf = await saida.toBuffer();
    if (buf.length < antes) {
      fs.writeFileSync(arq, buf);
      otimizadas++;
      economia += antes - buf.length;
    }
  }
}
console.log(`fotos otimizadas: ${otimizadas} (−${(economia / 1024 / 1024).toFixed(1)} MB)`);
