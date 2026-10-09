// Usado só no build: gera o HTML pronto de cada página (SEO e prévia no WhatsApp/Instagram).
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { produtos } from './lib/content';

export const rotas = ['/', '/catalogo', '/a-marca', '/politica-de-privacidade', ...produtos.map((p) => `/produto/${p.slug}`)];

// Com React 19, título, metas, links e JSON-LD saem no próprio HTML renderizado.
// Aqui eles são tirados do corpo e devolvidos à parte, para irem no <head>.
const TAGS_HEAD = /<title>[\s\S]*?<\/title>|<meta [^>]*\/?>|<link [^>]*\/?>|<script type="application\/ld\+json">[\s\S]*?<\/script>/g;

export function render(url: string) {
  let html = renderToString(
    <StrictMode>
      <HelmetProvider>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>,
  );
  const head: string[] = [];
  html = html.replace(TAGS_HEAD, (tag) => { head.push(tag); return ''; });
  return { html, head: head.join('\n') };
}
