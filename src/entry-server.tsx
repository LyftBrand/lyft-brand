// Usado só no build: gera o HTML pronto de cada página (SEO e prévia no WhatsApp/Instagram).
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { produtos } from './lib/content';

export const rotas = ['/', '/catalogo', '/a-marca', '/politica-de-privacidade', ...produtos.map((p) => `/produto/${p.slug}`)];

// Com React 19, título, metas e links saem no próprio HTML renderizado; aqui eles vão para o <head>,
// que é onde o React os procura ao "acordar" a página. O JSON-LD (<script>) o React mantém no corpo,
// então ele fica onde está (o Google lê em qualquer lugar da página).
const TAGS_HEAD = /<title>[\s\S]*?<\/title>|<meta [^>]*\/?>|<link [^>]*\/?>/g;

export function render(url: string) {
  let html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  const head: string[] = [];
  html = html.replace(TAGS_HEAD, (tag) => { head.push(tag); return ''; });
  return { html, head: head.join('\n') };
}
