// Consentimento de cookies (LGPD) + Google Consent Mode v2.
// O GTM carrega sempre, mas tudo que é analítico ou de anúncio fica "negado" até a visitante aceitar.

export interface Preferencias {
  necessarios: true;
  analiticos: boolean;
  marketing: boolean;
}

const CHAVE = 'lyft_cookies_v1';

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

// O GTM só reconhece comandos de consentimento quando recebe o objeto `arguments`, não um array.
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments as unknown as Record<string, unknown>);
}

export function lerPreferencias(): Preferencias | null {
  try {
    const p = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    return p ? { necessarios: true, analiticos: !!p.analiticos, marketing: !!p.marketing } : null;
  } catch { return null; }
}

const sinais = (p: Preferencias) => ({
  analytics_storage: p.analiticos ? 'granted' : 'denied',
  ad_storage: p.marketing ? 'granted' : 'denied',
  ad_user_data: p.marketing ? 'granted' : 'denied',
  ad_personalization: p.marketing ? 'granted' : 'denied',
});

/** Roda antes do GTM: tudo negado por padrão, ou a escolha que a visitante já fez. */
export function iniciarConsentimento() {
  const p = lerPreferencias();
  gtag('consent', 'default', { ...sinais(p ?? { necessarios: true, analiticos: false, marketing: false }), wait_for_update: 500 });
}

export function salvarPreferencias(p: Preferencias) {
  try { localStorage.setItem(CHAVE, JSON.stringify({ ...p, data: new Date().toISOString() })); } catch { /* sem storage */ }
  gtag('consent', 'update', sinais(p));
  window.dataLayer?.push({ event: 'cookie_consent_update', ...p });
  window.dispatchEvent(new CustomEvent('lyft:cookies', { detail: p }));
}

/** Abre a central de cookies (usado no rodapé e na página de privacidade). */
export const abrirCentralCookies = () => window.dispatchEvent(new Event('lyft:abrir-cookies'));
