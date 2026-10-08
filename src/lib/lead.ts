// Origem da visita (UTMs) e envio do contato para a planilha Google.
import { config } from './content';
import { lerPreferencias } from './consent';
import { cupomAtivo, track } from './utils';

const CAMPOS_ORIGEM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ttclid'] as const;
type Origem = Partial<Record<(typeof CAMPOS_ORIGEM)[number] | 'referrer' | 'pagina_entrada' | 'data_entrada', string>>;

const CHAVE_PRIMEIRA = 'lyft_origem_primeira';
const CHAVE_ULTIMA = 'lyft_origem_ultima';
const CHAVE_CONTATO = 'lyft_contato';

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
}

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
  const primeira: Origem = ler(localStorage, CHAVE_PRIMEIRA) ?? {};
  const ultima: Origem = ler(sessionStorage, CHAVE_ULTIMA) ?? {};
  const cookies = lerPreferencias();
  const agora = new Date();

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
    fbclid: ultima.fbclid ?? '',
    gclid: ultima.gclid ?? '',
    ttclid: ultima.ttclid ?? '',
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
