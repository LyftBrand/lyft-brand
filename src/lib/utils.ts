import { config } from './content';

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Parcela de "até 6x" — o número vem do texto de parcelamento configurado no painel. */
export function parcela(v: number) {
  const n = Number(config.parcelamento.match(/(\d+)\s*x/i)?.[1] ?? 0);
  return n > 1 ? `ou ${n}x de ${brl(v / n)}` : '';
}

/* ---------- Imagens ---------- */

const NETLIFY = import.meta.env.VITE_NETLIFY_IMAGES === '1';

/** Na Netlify, a imagem passa pelo Image CDN: redimensiona e entrega AVIF/WebP sozinho. */
export function img(src: string, w: number, q = 75) {
  if (!src || !NETLIFY || !src.startsWith('/')) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&q=${q}`;
}

export function srcSet(src: string, widths: number[], q = 75) {
  if (!NETLIFY) return undefined;
  return widths.map((w) => `${img(src, w, q)} ${w}w`).join(', ');
}

/* ---------- Cupom por link (?cupom=JU10) ---------- */

const CUPOM_KEY = 'lyft_cupom';

export function lerCupomDaUrl() {
  try {
    const c = new URLSearchParams(location.search).get('cupom');
    if (c) sessionStorage.setItem(CUPOM_KEY, c.trim().toUpperCase().slice(0, 30));
  } catch { /* navegador sem storage */ }
}

/** Cupom digitado pela cliente. Vale para todas as mensagens desta visita. */
export function salvarCupom(c: string) {
  const v = c.trim().toUpperCase().replace(/\s+/g, '').slice(0, 30);
  try { if (v) sessionStorage.setItem(CUPOM_KEY, v); else sessionStorage.removeItem(CUPOM_KEY); } catch { /* sem storage */ }
  // Avisa a faixa do topo e o campo de cupom, que podem estar abertos ao mesmo tempo.
  window.dispatchEvent(new Event('lyft:cupom'));
  return v;
}

export function cupomAtivo(): string {
  try { return sessionStorage.getItem(CUPOM_KEY) ?? ''; } catch { return ''; }
}

/* ---------- WhatsApp ---------- */

export function linkWhatsapp(mensagem = config.mensagem_padrao) {
  const cupom = cupomAtivo();
  const texto = cupom ? `${mensagem}\n\nCupom: *${cupom}*` : mensagem;
  return `https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
}

export function linkInstagram() {
  return `https://instagram.com/${config.instagram.replace(/^@/, '')}`;
}

/* ---------- Medição (GTM opcional) ---------- */

declare global {
  interface Window { dataLayer?: Record<string, unknown>[] }
}

export function track(event: string, data: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}
