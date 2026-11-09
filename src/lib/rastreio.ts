// Eventos para o GTM (GA4 agora, Meta depois). O plano completo está em docs/PLANO-DE-TAGUEAMENTO.md.
// Os nomes dos parâmetros são os mesmos das dimensões personalizadas do GA4: mudar aqui exige mudar lá.
import { useEffect } from 'react';
import { precoFinal, type Cor, type Produto } from './content';
import type { Pedido } from './lead';
import { cupomAtivo } from './utils';

/** Tipo da página atual: inicio, catalogo, produto, marca, privacidade ou outra. */
export function tipoPagina(path = typeof location !== 'undefined' ? location.pathname : '/'): string {
  if (path === '/') return 'inicio';
  if (path.startsWith('/produto/')) return 'produto';
  if (path.startsWith('/catalogo')) return 'catalogo';
  if (path.startsWith('/a-marca')) return 'marca';
  if (path.startsWith('/politica-de-privacidade')) return 'privacidade';
  return 'outra';
}

/** Produto no formato de item do GA4. */
export const itemGa = (p: Produto, cor?: Cor, extra: Record<string, unknown> = {}) => ({
  item_id: p.slug,
  item_name: p.nome,
  item_brand: 'Lyft',
  item_category: p.categoria,
  ...(cor ? { item_variant: cor.nome } : {}),
  price: precoFinal(p),
  ...extra,
});

/** Evento de e-commerce do GA4 (view_item_list, select_item, view_item). Limpa o anterior antes, como o GA4 pede. */
export function trackEcommerce(event: string, items: Record<string, unknown>[], extra: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  const value = event === 'view_item' ? Number(items[0]?.price ?? 0) : undefined;
  window.dataLayer.push({
    event,
    pagina_tipo: tipoPagina(),
    ...extra,
    ecommerce: { currency: 'BRL', ...(value ? { value } : {}), ...(extra.item_list_name ? { item_list_name: extra.item_list_name } : {}), items },
  });
}

/** Lista de produtos que apareceu na tela (vitrine da home, catálogo, relacionados). */
export function useListaVista(lista: string, itens: Produto[]) {
  const chave = itens.map((p) => p.slug).join(',');
  useEffect(() => {
    if (!itens.length) return;
    trackEcommerce('view_item_list', itens.map((p, i) => itemGa(p, undefined, { index: i + 1, item_list_name: lista })), { item_list_name: lista });
  }, [lista, chave]);
}

/**
 * Dados comuns dos eventos de WhatsApp: qual botão, em que página, que produto, cupom.
 * A origem vem como "flutuante_produto", "topo_catalogo", "produto", "reposicao"...
 */
export function dadosPedido(p: Pedido) {
  const botao = p.origem.split('_')[0];
  return {
    botao,
    pagina_tipo: tipoPagina(),
    tipo_lead: p.origem === 'reposicao' ? 'reposicao' : p.tamanho ? 'pedido' : p.produto ? 'duvida_produto' : 'contato',
    produto: p.produto ?? '',
    produto_categoria: p.categoria ?? '',
    item_id: p.item_id ?? '',
    cor: p.cor ?? '',
    tamanho: p.tamanho ?? '',
    cupom: cupomAtivo(),
    ...(p.preco ? { value: p.preco, currency: 'BRL' } : {}),
  };
}

/** Identificador único do lead (o Meta usa para não contar o mesmo lead duas vezes). */
export const novoEventId = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Telefone no formato internacional (+5519...), como Google e Meta pedem. */
export const telefoneE164 = (t: string) => {
  const d = t.replace(/\D/g, '');
  return d ? `+${d.startsWith('55') && d.length > 11 ? d : '55' + d}` : '';
};
