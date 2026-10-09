// Mensagem do WhatsApp de acordo com a página em que a cliente está.
// Usada pelos botões gerais (flutuante, topo, menu, rodapé). O botão de pedido do produto
// tem a mensagem própria, com tamanho e valor.
import { useLocation, useSearchParams } from 'react-router-dom';
import { config, corInicial, precoFinal, produtos } from './content';
import type { Pedido } from './lead';
import { origemAtual } from './utils';

export function useMensagemPagina(origem: string): Pedido {
  const { pathname } = useLocation();
  const [params] = useSearchParams();

  if (pathname.startsWith('/produto/')) {
    const p = produtos.find((x) => x.slug === pathname.split('/')[2]);
    if (p) {
      const cor = p.cores.find((c) => c.chave === params.get('cor')) ?? corInicial(p);
      const url = `${origemAtual()}/produto/${p.slug}?cor=${cor.chave}`;
      return {
        origem: `${origem}_produto`,
        mensagem: `Olá, Ju! Estou vendo o *${p.nome}* na cor *${cor.nome}* no site e queria tirar uma dúvida.\n\n${url}`,
        produto: p.nome, cor: cor.nome, preco: precoFinal(p), url_produto: url,
      };
    }
  }

  if (pathname === '/catalogo') {
    const cat = params.get('categoria');
    return {
      origem: `${origem}_catalogo`,
      mensagem: cat
        ? `Olá, Ju! Estou vendo os *${cat.toLowerCase()}* no site da Lyft e quero ajuda para escolher.`
        : 'Olá, Ju! Estou vendo o catálogo no site da Lyft e quero ajuda para escolher meu look.',
    };
  }

  if (pathname === '/a-marca') {
    return { origem: `${origem}_marca`, mensagem: 'Olá, Ju! Conheci a Lyft pelo site e quero saber mais sobre as peças.' };
  }

  if (pathname === '/politica-de-privacidade') {
    return { origem: `${origem}_privacidade`, mensagem: 'Olá! Tenho uma dúvida sobre os meus dados no site da Lyft.' };
  }

  return { origem: `${origem}_inicio`, mensagem: config.mensagem_padrao };
}
