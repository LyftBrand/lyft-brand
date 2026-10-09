// Roda depois do build: escreve sitemap.xml e robots.txt em dist/.
import fs from 'node:fs';
import path from 'node:path';

const SITE = (process.env.URL || process.env.SITE_URL || 'https://lyftbrand.netlify.app').replace(/\/$/, '');
const dir = path.resolve(import.meta.dirname, '../content/produtos');
const produtos = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  .map((f) => ({ slug: f.replace(/\.json$/, ''), ...JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }))
  .filter((p) => p.ativo !== false);

const urls = ['/', '/catalogo', '/a-marca', '/politica-de-privacidade', ...produtos.map((p) => `/produto/${p.slug}`)];
const hoje = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${hoje}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync('dist/sitemap.xml', sitemap);

// Só a produção pode ser indexada. Endereços de teste (branch, prévia) ficam fora do Google.
const producao = process.env.CONTEXT === 'production';
fs.writeFileSync('dist/robots.txt', producao
  ? `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');
console.log(`sitemap: ${urls.length} páginas (${SITE}) · robots: ${producao ? 'indexável' : 'bloqueado (teste)'}`);
