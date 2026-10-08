// Prepara as fotos do site a partir de fotos-originais/.
// Fontes: catálogo Elevate 2026 (Canva, páginas vNN) e posts do @lyft.brand (igNNN).
// Saída: public/uploads/... já redimensionada (lado maior 1600px) para o repositório não pesar.
// Rodar de novo é seguro: só gera o que ainda não existe.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ORIG = path.join(ROOT, 'fotos-originais');
const OUT = path.join(ROOT, 'public', 'uploads');

const igFiles = fs.readdirSync(path.join(ORIG, 'instagram'));
const cvFiles = fs.readdirSync(path.join(ORIG, 'canva-v'));

function src(id) {
  if (id.startsWith('ig')) {
    const n = id.slice(2).padStart(3, '0');
    const f = igFiles.find((x) => x.startsWith(n + '_'));
    if (!f) throw new Error('foto não encontrada: ' + id);
    return path.join(ORIG, 'instagram', f);
  }
  if (id.startsWith('v')) {
    const f = cvFiles.find((x) => x.startsWith(id.padEnd(3, '_').slice(0, 3) + '_0_'));
    if (!f) throw new Error('foto não encontrada: ' + id);
    return path.join(ORIG, 'canva-v', f);
  }
  throw new Error('id inválido: ' + id);
}

// produto/cor -> fotos, na ordem em que aparecem na galeria
export const MAPA = {
  'conjunto-aura': { verde: ['v01', 'ig71'], marsala: ['v12'], cinza: ['ig76', 'ig61', 'ig60'], preto: ['ig75', 'v23'] },
  'conjunto-camila': { 'verde-mastruz': ['ig30'] },
  'macaquinho-muse': { chumbo: ['ig82', 'v03'] },
  'conjunto-brenda': { grape: ['v04', 'ig2'] },
  'conjunto-mood': { marrom: ['ig26'], 'verde-militar': ['ig20', 'v08'] },
  'conjunto-glow': { 'off-white': ['ig78', 'ig57'], preto: ['ig83'] },
  'conjunto-isis': { 'rosa-vintage': ['ig13', 'v09', 'ig1'], 'verde-botanico': ['ig12', 'v13', 'ig10'], preto: ['ig15'], 'azul-bic': ['v22'] },
  'conjunto-icon': { cinza: ['ig84', 'ig56', 'ig49'] },
  'conjunto-anna': { 'verde-menta': ['ig27', 'v11'], 'rosa-claro': ['ig21'] },
  'conjunto-pulse': { 'off-white': ['ig6', 'ig4', 'ig5'], verde: ['ig77'] },
  'macaquinho-sun': { 'verde-militar': ['ig25', 'v15', 'ig16'] },
  'jaqueta-bliss': { preta: ['ig72', 'ig62', 'ig58'] },
  'conjunto-mila': { 'mirtilo-e-aurora': ['ig19', 'v21'] },
  'conjunto-dora': { rosa: ['v24'] },
  'macacao-soul': { marrom: ['ig31', 'ig46', 'ig34'] },
  'conjunto-prime': { marsala: ['ig43', 'v26'] },
  'conjunto-valentina': { _geral: ['v27'] },
  'macaquinho-isabele': { marsala: ['ig18'], 'azul-marinho': ['ig39'] },
  'conjunto-paty': { marrom: ['ig7', 'v29', 'ig9', 'ig8'] },
  'conjunto-stella': { 'azul-marinho': ['ig47'], 'verde-mastruz': ['ig11'] },
  'conjunto-veneza': { 'verde-mastruz': ['ig37'], 'rosa-chiclete': ['ig32'] },
  'conjunto-maine': { 'azul-marinho': ['ig22'], marsala: ['ig24'] },
  'conjunto-gabi': { 'verde-aloe': ['v33', 'v34'] },
};

// fotos de marca (topo, sobre, embalagem, Instagram)
export const MARCA = {
  'hero': 'ig7',
  'hero-2': 'ig12',
  'fundadora': 'ig4',
  'lancamento': 'ig86',
  'embalagem': 'ig80',
  'sacola': 'ig87',
  'cartao': 'ig65',
  'cores': 'ig74',
  'tecidos': 'ig85',
  'ig-1': 'ig10', 'ig-2': 'ig30', 'ig-3': 'ig58', 'ig-4': 'ig42', 'ig-5': 'ig37', 'ig-6': 'ig17',
};

async function gerar(id, dest) {
  if (fs.existsSync(dest)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src(id)).rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(dest);
  return true;
}

let novas = 0;
for (const [slug, cores] of Object.entries(MAPA)) {
  for (const [cor, ids] of Object.entries(cores)) {
    for (let i = 0; i < ids.length; i++) {
      if (await gerar(ids[i], path.join(OUT, 'produtos', slug, `${cor}-${i + 1}.jpg`))) novas++;
    }
  }
}
for (const [nome, id] of Object.entries(MARCA)) {
  if (await gerar(id, path.join(OUT, 'marca', `${nome}.jpg`))) novas++;
}
console.log(`${novas} fotos novas em public/uploads`);
