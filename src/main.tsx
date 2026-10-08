import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { lerCupomDaUrl } from './lib/utils';
import { iniciarConsentimento } from './lib/consent';
import { registrarOrigem } from './lib/lead';
import './index.css';

lerCupomDaUrl();
registrarOrigem();
// Antes do GTM: cookies analíticos e de anúncio começam negados até a visitante escolher.
iniciarConsentimento();

// GTM só entra se o ID estiver configurado na Netlify (VITE_GTM_ID).
const GTM = import.meta.env.VITE_GTM_ID;
if (GTM) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM}`;
  document.head.appendChild(s);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
