// Todo o conteúdo vem de content/ (editado pelo painel /admin) e entra no site no build.
import configJson from '../../content/config.json';
import depoimentosJson from '../../content/depoimentos.json';

export interface Cor {
  nome: string;
  chave: string;
  hex: string;
  disponiveis: string[];
  fotos: string[];
}

export interface Produto {
  slug: string;
  nome: string;
  ativo: boolean;
  categoria: string;
  preco: number;
  preco_promocional?: number;
  resumo: string;
  descricao: string;
  detalhes: string[];
  grade: string[];
  observacao: string;
  destaque: boolean;
  novidade: boolean;
  ordem: number;
  cores: Cor[];
  fotos_extras: string[];
  nota_foto: string;
}

export interface Config {
  whatsapp: string;
  mensagem_padrao: string;
  /** Pede nome/WhatsApp/e-mail antes de abrir o WhatsApp. */
  formulario_ativo: boolean;
  email_obrigatorio: boolean;
  /** URL do App da Web do Google Apps Script que grava na planilha. */
  planilha_url: string;
  instagram: string;
  email: string;
  aviso_topo: string;
  parcelamento: string;
  colecao: string;
  slogan: string;
  hero: { titulo: string; texto: string; imagem: string; imagem_2: string };
  beneficios: string[];
  sobre: { titulo: string; texto: string; assinatura: string; imagem: string };
  embalagem: { titulo: string; imagem: string };
  medidas: { tamanho: string; numeracao: string }[];
  instagram_fotos: string[];
}

export interface Depoimento {
  texto: string;
  origem: string;
}

export const config = configJson as Config;
export const depoimentos = (depoimentosJson as { itens: Depoimento[] }).itens;

export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type RawProduto = Omit<Produto, 'slug' | 'cores'> & { cores?: Omit<Cor, 'chave'>[] };

const arquivos = import.meta.glob<RawProduto>('../../content/produtos/*.json', { eager: true, import: 'default' });

export const produtos: Produto[] = Object.entries(arquivos)
  .map(([caminho, p]) => ({
    ...p,
    slug: caminho.split('/').pop()!.replace(/\.json$/, ''),
    resumo: p.resumo ?? '',
    descricao: p.descricao ?? '',
    detalhes: p.detalhes ?? [],
    grade: p.grade?.length ? p.grade : ['Único'],
    observacao: p.observacao ?? '',
    fotos_extras: p.fotos_extras ?? [],
    nota_foto: p.nota_foto ?? '',
    cores: (p.cores ?? []).map((c) => ({
      ...c,
      chave: slugify(c.nome),
      disponiveis: c.disponiveis ?? [],
      fotos: c.fotos ?? [],
    })),
  }))
  .filter((p) => p.ativo !== false && p.cores.length > 0)
  .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999) || a.nome.localeCompare(b.nome));

export const categorias = [...new Set(produtos.map((p) => p.categoria))];

/** Fotos de uma cor; se ela não tiver foto própria, usa as fotos gerais ou as da primeira cor que tiver. */
export function fotosDaCor(p: Produto, cor?: Cor): string[] {
  const proprias = cor?.fotos ?? [];
  if (proprias.length) return [...proprias, ...p.fotos_extras];
  if (p.fotos_extras.length) return p.fotos_extras;
  return p.cores.find((c) => c.fotos.length)?.fotos ?? [];
}

/** A cor não tem foto própria, então a foto mostra outra cor. */
export const fotoEhDeOutraCor = (cor?: Cor) => !!cor && cor.fotos.length === 0;

export const corDisponivel = (c: Cor) => c.disponiveis.length > 0;
export const produtoDisponivel = (p: Produto) => p.cores.some(corDisponivel);

/** Primeira cor disponível com foto, para abrir o produto já mostrando algo que dá para comprar. */
export function corInicial(p: Produto): Cor {
  return p.cores.find((c) => corDisponivel(c) && c.fotos.length)
    ?? p.cores.find(corDisponivel)
    ?? p.cores[0];
}

export const precoFinal = (p: Produto) =>
  p.preco_promocional && p.preco_promocional < p.preco ? p.preco_promocional : p.preco;
