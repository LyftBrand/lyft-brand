import { useState } from 'react';
import { Link } from 'react-router-dom';
import { corDisponivel, corInicial, fotosDaCor, precoFinal, produtoDisponivel, type Cor, type Produto } from '../lib/content';
import { brl, parcela } from '../lib/utils';
import SmartImage from './SmartImage';

export function Swatch({ cor, ativo, onClick, tamanho = 'w-5 h-5' }: { cor: Cor; ativo?: boolean; onClick?: () => void; tamanho?: string }) {
  const esgotada = !corDisponivel(cor);
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${cor.nome}${esgotada ? ' (esgotada)' : ''}`}
      aria-label={`Cor ${cor.nome}${esgotada ? ', esgotada' : ''}`}
      aria-pressed={ativo}
      className={`relative ${tamanho} rounded-full shrink-0 ring-offset-2 ring-offset-paper transition ${ativo ? 'ring-1 ring-ink' : 'ring-1 ring-transparent hover:ring-line'}`}
    >
      <span className="absolute inset-0 rounded-full border border-black/10" style={{ background: cor.hex }} />
      {esgotada && <span className="absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink/60" />}
    </button>
  );
}

export default function ProductCard({ p, priority = false, sizes = '(min-width:1024px) 25vw, 50vw' }: { p: Produto; priority?: boolean; sizes?: string }) {
  const [cor, setCor] = useState<Cor>(() => corInicial(p));
  const fotos = fotosDaCor(p, cor);
  const disponivel = produtoDisponivel(p);
  const preco = precoFinal(p);
  const href = `/produto/${p.slug}${cor ? `?cor=${cor.chave}` : ''}`;

  return (
    <article className="group">
      <Link to={href} className="block relative aspect-[4/5] overflow-hidden rounded-[2px] bg-nude">
        {fotos[0] && (
          <SmartImage key={fotos[0]} src={fotos[0]} alt={`${p.nome} ${cor?.nome ?? ''}`} widths={[360, 540, 760]} sizes={sizes} priority={priority}
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.03] ${disponivel ? '' : 'grayscale-[35%]'}`} />
        )}
        {fotos[1] && (
          <SmartImage src={fotos[1]} alt="" widths={[360, 540, 760]} sizes={sizes}
            className="absolute inset-0 h-full w-full object-cover !opacity-0 group-hover:!opacity-100 transition-opacity duration-500 hidden md:block" />
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 items-start">
          {!disponivel && <span className="eyebrow !text-[10px] bg-paper/90 text-ink px-2.5 py-1">Esgotado</span>}
          {disponivel && p.novidade && <span className="eyebrow !text-[10px] bg-ink text-paper px-2.5 py-1">Novidade</span>}
        </div>
      </Link>

      <div className="pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <Link to={href} className="min-w-0">
            <h3 className="font-display text-[17px] md:text-[19px] leading-tight">{p.nome}</h3>
            {p.resumo && <p className="text-[13px] text-muted mt-0.5 truncate">{p.resumo}</p>}
          </Link>
        </div>
        <p className="mt-2 text-[15px] font-semibold tabular-nums">
          {p.preco_promocional && p.preco_promocional < p.preco && (
            <span className="text-muted line-through font-normal mr-2 text-[13px]">{brl(p.preco)}</span>
          )}
          {brl(preco)}
        </p>
        <p className="text-[12px] text-muted">{parcela(preco)}</p>
        {p.cores.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2.5" role="group" aria-label="Cores">
            {p.cores.map((c) => (
              <Swatch key={c.chave} cor={c} ativo={c.chave === cor?.chave} tamanho="w-[18px] h-[18px]" onClick={() => setCor(c)} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
