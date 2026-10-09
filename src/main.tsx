import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { config } from './lib/content';
import { lerCupomDaUrl } from './lib/utils';
import { iniciarConsentimento } from './lib/consent';
import { registrarOrigem } from './lib/lead';
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/manrope/index.css';
import './index.css';

lerCupomDaUrl();
registrarOrigem();
// Antes do GTM: cookies analíticos e de anúncio começam negados até a visitante escolher.
iniciarConsentimento();

/**
 * Google Tag Manager. O ID vem do painel (Textos e contatos → ID do Google Tag Manager).
 * Carrega na primeira interação ou 3,5s depois de a página abrir: assim não pesa no PageSpeed
 * e mesmo quem sai rápido ainda é contado. Os eventos disparados antes ficam na fila do dataLayer.
 */
const GTM = (config.gtm_id || import.meta.env.VITE_GTM_ID || '').trim();
if (/^GTM-[A-Z0-9]+$/i.test(GTM)) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  let carregou = false;
  const carregar = () => {
    if (carregou) return;
    carregou = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM}`;
    document.head.appendChild(s);
  };
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((e) => addEventListener(e, carregar, { once: true, passive: true }));
  addEventListener('load', () => setTimeout(carregar, 3500));
}

const raiz = document.getElementById('root')!;
const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
// As páginas já vêm prontas do build (pré-renderizadas): o React só "acorda" o HTML.
// Tira as tags de SEO geradas no build; o React recoloca as mesmas (e atualiza a cada página).
document.querySelectorAll('[data-pre]').forEach((el) => el.remove());
if (raiz.hasChildNodes()) hydrateRoot(raiz, app);
else createRoot(raiz).render(app);
