// Depois do build: gera o HTML pronto de cada página (título, descrição, prévia de
// compartilhamento e conteúdo já no HTML). O Google e o WhatsApp leem sem precisar de JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.resolve('dist');
const modelo = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render, rotas } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href);

// data-pre: o navegador remove estas tags ao iniciar e o React coloca as dele (evita duplicadas).
const marcar = (head) => head.replace(/<(title|meta|link|script)(?=[\s>])/g, '<$1 data-pre=""');

function gerar(url, arquivos) {
  const { html, head } = render(url);
  const pagina = modelo.replace('<!--head-->', marcar(head)).replace('<!--app-->', html);
  for (const arquivo of arquivos) {
    const destino = path.join(dist, arquivo);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, pagina);
  }
}

// /catalogo é servido por catalogo.html (sem barra no fim) e /catalogo/ por catalogo/index.html.
for (const url of rotas) {
  gerar(url, url === '/' ? ['index.html'] : [`${url.slice(1)}.html`, `${url.slice(1)}/index.html`]);
}
gerar('/404', ['404.html']);
fs.rmSync('dist-ssr', { recursive: true, force: true });
console.log(`pré-renderizadas: ${rotas.length} páginas + 404`);
