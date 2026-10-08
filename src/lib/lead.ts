// Origem da visita (UTMs) e envio do contato para a planilha Google.
import { config } from './content';
import { lerPreferencias } from './consent';
import { cupomAtivo, track } from './utils';

const CAMPOS_ORIGEM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid'] as const;
/** Identificadores de clique em anúncio. Ficam guardados por 90 dias (validade no Google Ads e no Meta). */
const CLIQUES = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid'] as const;
type Clique = (typeof CLIQUES)[number];
const NOVENTA_DIAS = 90 * 24 * 60 * 60 * 1000;
type Origem = Partial<Record<(typeof CAMPOS_ORIGEM)[number] | 'referrer' | 'pagina_entrada' | 'data_entrada', string>>;

const CHAVE_PRIMEIRA = 'lyft_origem_primeira';
const CHAVE_ULTIMA = 'lyft_origem_ultima';
const CHAVE_CONTATO = 'lyft_contato';
const CHAVE_CLIQUES = 'lyft_cliques_anuncio';

const ler = (store: Storage, k: string) => { try { return JSON.parse(store.getItem(k) || 'null'); } catch { return null; } };
const gravar = (store: Storage, k: string, v: unknown) => { try { store.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } };

/**
 * Guarda de onde a visitante veio. A primeira origem fica para sempre (primeiro clique);
 * a última é atualizada sempre que ela volta por um link com UTM (último clique).
 */
export function registrarOrigem() {
  const q = new URLSearchParams(location.search);
  const atual: Origem = {};
  CAMPOS_ORIGEM.forEach((c) => { const v = q.get(c); if (v) atual[c] = v.slice(0, 200); });
  const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : '';
  const temOrigem = Object.keys(atual).length > 0 || !!ref;
  const registro: Origem = { ...atual, referrer: ref, pagina_entrada: location.pathname + location.search, data_entrada: new Date().toISOString() };

  if (!ler(localStorage, CHAVE_PRIMEIRA)) gravar(localStorage, CHAVE_PRIMEIRA, registro);
  if (temOrigem || !ler(sessionStorage, CHAVE_ULTIMA)) gravar(sessionStorage, CHAVE_ULTIMA, registro);

  // Cada clique de anúncio novo substitui o anterior da mesma plataforma.
  const cliques: Partial<Record<Clique, { v: string; t: number }>> = ler(localStorage, CHAVE_CLIQUES) ?? {};
  let mudou = false;
  CLIQUES.forEach((c) => { if (atual[c]) { cliques[c] = { v: atual[c]!, t: Date.now() }; mudou = true; } });
  if (mudou) gravar(localStorage, CHAVE_CLIQUES, cliques);
}

/** Cliques de anúncio ainda válidos (até 90 dias). */
function cliquesValidos() {
  const cliques: Partial<Record<Clique, { v: string; t: number }>> = ler(localStorage, CHAVE_CLIQUES) ?? {};
  const out: Partial<Record<Clique | 'gclid_data' | 'fbclid_data', string>> = {};
  CLIQUES.forEach((c) => {
    const x = cliques[c];
    if (x && Date.now() - x.t < NOVENTA_DIAS) out[c] = x.v;
  });
  if (cliques.gclid && out.gclid) out.gclid_data = new Date(cliques.gclid.t).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  if (cliques.fbclid && out.fbclid) out.fbclid_data = new Date(cliques.fbclid.t).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return { out, fbcTempo: cliques.fbclid?.t };
}

const lerCookie = (nome: string) => document.cookie.split('; ').find((c) => c.startsWith(nome + '='))?.split('=')[1] ?? '';

export interface Contato { nome: string; email: string; whatsapp: string }

export const contatoSalvo = (): Contato | null => ler(localStorage, CHAVE_CONTATO);
export const lembrarContato = (c: Contato) => gravar(localStorage, CHAVE_CONTATO, c);
export const esquecerContato = () => { try { localStorage.removeItem(CHAVE_CONTATO); } catch { /* */ } };

export interface Pedido {
  origem: string;          // botão que abriu: produto, flutuante, topo...
  mensagem: string;
  produto?: string;
  cor?: string;
  tamanho?: string;
  preco?: number;
  url_produto?: string;
}

/**
 * Envia o contato para a planilha sem atrasar a abertura do WhatsApp.
 * sendBeacon continua mesmo que a página troque para o WhatsApp logo em seguida.
 */
export function enviarLead(contato: Contato, pedido: Pedido) {
  // O contato vem guardado; a origem não. Ela é relida a cada clique, para cada pedido
  // ficar com a UTM da visita atual (e não com a da primeira vez que a cliente preencheu).
  registrarOrigem();
  const primeira: Origem = ler(localStorage, CHAVE_PRIMEIRA) ?? {};
  const ultima: Origem = ler(sessionStorage, CHAVE_ULTIMA) ?? {};
  const cookies = lerPreferencias();
  const agora = new Date();
  const { out: cliques, fbcTempo } = cliquesValidos();
  // fbc no formato que a API de Conversões do Meta pede: fb.1.<quando clicou>.<fbclid>
  const fbc = lerCookie('_fbc') || (cliques.fbclid && fbcTempo ? `fb.1.${fbcTempo}.${cliques.fbclid}` : '');

  const dados = {
    data_hora: agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    nome: contato.nome,
    email: contato.email,
    whatsapp: contato.whatsapp,
    origem_botao: pedido.origem,
    produto: pedido.produto ?? '',
    cor: pedido.cor ?? '',
    tamanho: pedido.tamanho ?? '',
    preco: pedido.preco != null ? pedido.preco.toFixed(2).replace('.', ',') : '',
    mensagem: pedido.mensagem,
    url_produto: pedido.url_produto ?? '',
    pagina: location.href,
    cupom: cupomAtivo(),
    utm_source: ultima.utm_source ?? '',
    utm_medium: ultima.utm_medium ?? '',
    utm_campaign: ultima.utm_campaign ?? '',
    utm_content: ultima.utm_content ?? '',
    utm_term: ultima.utm_term ?? '',
    gclid: cliques.gclid ?? '',
    gbraid: cliques.gbraid ?? '',
    wbraid: cliques.wbraid ?? '',
    gclid_data: cliques.gclid_data ?? '',
    fbclid: cliques.fbclid ?? '',
    fbc,
    fbp: lerCookie('_fbp'),
    fbclid_data: cliques.fbclid_data ?? '',
    ttclid: cliques.ttclid ?? '',
    plataforma_anuncio: cliques.gclid || cliques.gbraid || cliques.wbraid ? (cliques.fbclid ? 'Google e Meta' : 'Google') : cliques.fbclid ? 'Meta' : cliques.ttclid ? 'TikTok' : '',
    referrer: ultima.referrer ?? '',
    primeira_origem: [primeira.utm_source, primeira.utm_medium, primeira.utm_campaign].filter(Boolean).join(' / ') || primeira.referrer || 'direto',
    primeira_visita: primeira.data_entrada ?? '',
    dispositivo: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Celular' : 'Computador',
    consentimento_lgpd: 'Sim',
    cookies_marketing: cookies?.marketing ? 'Sim' : 'Não',
    site: '', // campo-isca: robôs preenchem, pessoas não veem
  };

  track('lead_whatsapp', {
    lead_origem: pedido.origem,
    item_name: pedido.produto,
    value: pedido.preco,
    currency: 'BRL',
    fb_event_name: 'Lead',
    tt_event_name: 'SubmitForm',
  });

  if (import.meta.env.DEV) (window as unknown as { __ultimoLead: unknown }).__ultimoLead = dados;
  const url = config.planilha_url?.trim();
  if (!url) {
    if (import.meta.env.DEV) console.info('[lead] planilha_url vazia: contato não enviado', dados);
    return;
  }
  const corpo = JSON.stringify(dados);
  // text/plain evita o preflight de CORS, que o Apps Script não responde.
  const ok = navigator.sendBeacon?.(url, new Blob([corpo], { type: 'text/plain;charset=utf-8' }));
  if (!ok) fetch(url, { method: 'POST', body: corpo, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, keepalive: true, mode: 'no-cors' }).catch(() => {});
}
