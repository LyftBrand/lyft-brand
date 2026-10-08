import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Link2, Ruler, X } from 'lucide-react';
import { config, corDisponivel, corInicial, fotoEhDeOutraCor, fotosDaCor, precoFinal, produtos, type Cor } from '../lib/content';
import { brl, img, linkWhatsapp, parcela, track } from '../lib/utils';
import { usePedido } from '../components/Lead';
import SmartImage from '../components/SmartImage';
import ProductCard, { Swatch } from '../components/ProductCard';
import Seo from '../components/Seo';
import Medidas from '../components/Medidas';
import { WhatsappIcon } from '../components/Icons';
import NaoEncontrada from './NaoEncontrada';

function Galeria({ fotos, nome, nota }: { fotos: string[]; nome: string; nota?: string }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => { setI(0); trilho.current?.scrollTo({ left: 0 }); }, [fotos]);
  useEffect(() => {
    if (zoom === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(null);
      if (e.key === 'ArrowRight') setZoom((z) => (z! + 1) % fotos.length);
      if (e.key === 'ArrowLeft') setZoom((z) => (z! - 1 + fotos.length) % fotos.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [zoom, fotos.length]);

  const onScroll = () => {
    const el = trilho.current;
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth));
  };

  // Tudo dentro de um único bloco: senão o aviso da foto vira um item solto da grade e empurra as informações para baixo.
  return (
    <div className="min-w-0">
      {/* Celular: carrossel com arrastar */}
      <div className="md:hidden relative -mx-4">
        <div ref={trilho} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
          {fotos.map((f, k) => (
            <button key={f} onClick={() => setZoom(k)} className="relative shrink-0 w-full aspect-[4/5] snap-center bg-nude" aria-label={`Ampliar foto ${k + 1}`}>
              <SmartImage src={f} alt={`${nome}, foto ${k + 1}`} widths={[480, 760, 1000]} sizes="100vw" priority={k === 0} className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ))}
        </div>
        {fotos.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {fotos.map((f, k) => <span key={f} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-paper' : 'w-1.5 bg-paper/60'}`} />)}
          </div>
        )}
      </div>

      {/* Computador: fotos em grade */}
      <div className="hidden md:grid grid-cols-2 gap-2">
        {fotos.map((f, k) => (
          <button key={f} onClick={() => setZoom(k)}
            className={`relative bg-nude overflow-hidden cursor-zoom-in ${k === 0 && fotos.length % 2 === 1 ? 'col-span-2 aspect-[4/5]' : 'aspect-[4/5]'}`}
            aria-label={`Ampliar foto ${k + 1}`}>
            <SmartImage src={f} alt={`${nome}, foto ${k + 1}`} widths={[600, 900, 1300]} sizes={k === 0 && fotos.length % 2 === 1 ? '55vw' : '28vw'} priority={k < 2}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]" />
          </button>
        ))}
      </div>
      {nota && <p className="mt-3 text-[13px] text-muted">{nota}</p>}

      {/* Foto ampliada */}
      {zoom !== null && (
        <div className="fixed inset-0 z-[60] bg-ink/95 flex items-center justify-center" role="dialog" aria-label="Foto ampliada" onClick={() => setZoom(null)}>
          <img src={img(fotos[zoom], 1600, 85)} alt={nome} className="max-h-[92svh] max-w-[94vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-4 right-4 p-3 text-paper" onClick={() => setZoom(null)} aria-label="Fechar"><X className="w-7 h-7" strokeWidth={1.5} /></button>
          {fotos.length > 1 && <>
            <button className="absolute left-2 md:left-6 p-3 text-paper" aria-label="Foto anterior"
              onClick={(e) => { e.stopPropagation(); setZoom((zoom - 1 + fotos.length) % fotos.length); }}><ChevronLeft className="w-8 h-8" strokeWidth={1.2} /></button>
            <button className="absolute right-2 md:right-6 p-3 text-paper" aria-label="Próxima foto"
              onClick={(e) => { e.stopPropagation(); setZoom((zoom + 1) % fotos.length); }}><ChevronRight className="w-8 h-8" strokeWidth={1.2} /></button>
            <span className="absolute bottom-5 text-paper/70 text-sm tabular-nums">{zoom + 1} / {fotos.length}</span>
          </>}
        </div>
      )}
    </div>
  );
}

function Detalhe({ titulo, children, aberto = false }: { titulo: string; children: React.ReactNode; aberto?: boolean }) {
  return (
    <details className="group border-b border-line" open={aberto}>
      <summary className="flex items-center justify-between py-5 cursor-pointer list-none eyebrow">
        {titulo}
        <span className="text-xl font-light transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="pb-6 text-ink-soft leading-relaxed">{children}</div>
    </details>
  );
}

export default function Produto() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const p = produtos.find((x) => x.slug === slug);

  const cor: Cor | undefined = useMemo(() => {
    if (!p) return undefined;
    return p.cores.find((c) => c.chave === params.get('cor')) ?? corInicial(p);
  }, [p, params]);

  const [tamanho, setTamanho] = useState('');
  const [aviso, setAviso] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [medidas, setMedidas] = useState(false);
  const pedirLead = usePedido();

  // Ao trocar de cor: se só há um tamanho disponível, ele já vem marcado.
  useEffect(() => {
    setAviso(false);
    setTamanho(cor && cor.disponiveis.length === 1 ? cor.disponiveis[0] : '');
  }, [cor?.chave, slug]);

  useEffect(() => {
    if (p) track('view_item', { item_id: p.slug, item_name: p.nome, price: precoFinal(p) });
  }, [p?.slug]);

  if (!p || !cor) return <NaoEncontrada />;

  const fotos = fotosDaCor(p, cor);
  const preco = precoFinal(p);
  const disponivel = corDisponivel(cor);
  const unico = p.grade.length === 1;
  const url = `${location.origin}/produto/${p.slug}?cor=${cor.chave}`;
  const nota = p.nota_foto || (fotoEhDeOutraCor(cor) ? `Foto ilustrativa em outra cor. Cor escolhida: ${cor.nome.toLowerCase()}.` : '');

  const escolherCor = (c: Cor) => {
    const n = new URLSearchParams(params);
    n.set('cor', c.chave);
    setParams(n, { replace: true });
    track('select_item_variant', { item_id: p.slug, cor: c.nome });
  };

  const mensagem = disponivel
    ? `Olá, Ju! Vi no site e quero o *${p.nome}*\nCor: *${cor.nome}*\nTamanho: *${tamanho || cor.disponiveis[0]}*\nValor: ${brl(preco)}\n\n${url}`
    : `Olá, Ju! O *${p.nome}* na cor *${cor.nome}* está esgotado no site. Você me avisa quando repor?\n\n${url}`;

  const pedir = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disponivel && !tamanho && !unico) {
      setAviso(true);
      document.getElementById('tamanhos')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!disponivel) track('whatsapp_reposicao', { item_id: p.slug, cor: cor.nome });
    pedirLead({
      origem: disponivel ? 'produto' : 'reposicao',
      mensagem, produto: p.nome, cor: cor.nome,
      tamanho: disponivel ? (tamanho || cor.disponiveis[0]) : '',
      preco, url_produto: url,
    });
  };

  const copiar = async () => {
    try {
      if (navigator.share && matchMedia('(pointer:coarse)').matches) {
        await navigator.share({ title: p.nome, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2200);
      }
      track('share', { item_id: p.slug });
    } catch { /* usuária cancelou */ }
  };

  const relacionados = produtos.filter((x) => x.slug !== p.slug && x.categoria === p.categoria).slice(0, 4);
  const botaoTexto = disponivel ? 'Pedir pelo WhatsApp' : 'Avisar quando repor';

  return (
    <>
      <Seo
        title={`${p.nome} ${cor.nome}`}
        description={`${p.nome}${p.resumo ? ` (${p.resumo.toLowerCase()})` : ''} na cor ${cor.nome.toLowerCase()}. ${brl(preco)}, ${config.parcelamento.toLowerCase()}. Peça pelo WhatsApp.`}
        image={fotos[0] ? img(fotos[0], 1200, 80) : undefined}
        jsonLd={{
          '@context': 'https://schema.org', '@type': 'Product', name: p.nome, brand: { '@type': 'Brand', name: 'Lyft' },
          image: fotos.map((f) => location.origin + f), description: p.descricao || p.resumo, color: cor.nome,
          offers: { '@type': 'Offer', priceCurrency: 'BRL', price: preco.toFixed(2), availability: disponivel ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url },
        }}
      />

      <div className="container-x pt-4 md:pt-8 pb-28 md:pb-24">
        <nav className="hidden md:flex gap-2 text-[13px] text-muted mb-6" aria-label="Você está em">
          <Link to="/" className="link-u">Início</Link><span>/</span>
          <Link to={`/catalogo?categoria=${encodeURIComponent(p.categoria)}`} className="link-u">{p.categoria}</Link><span>/</span>
          <span className="text-ink">{p.nome}</span>
        </nav>

        <div className="grid md:grid-cols-[1.25fr_1fr] gap-8 md:gap-14 lg:gap-20 items-start">
          <Galeria fotos={fotos} nome={`${p.nome} ${cor.nome}`} nota={nota} />

          <div className="md:sticky md:top-28">
            <p className="eyebrow text-rose-deep">{p.categoria}{p.novidade ? ' · Novidade' : ''}</p>
            <h1 className="display text-[38px] md:text-[52px] mt-3">{p.nome}</h1>
            {p.resumo && <p className="mt-2 text-ink-soft text-[17px]">{p.resumo}</p>}

            <div className="mt-6 flex items-baseline gap-3">
              {p.preco_promocional && p.preco_promocional < p.preco && <span className="text-muted line-through">{brl(p.preco)}</span>}
              <span className="text-[26px] font-semibold tabular-nums">{brl(preco)}</span>
            </div>
            <p className="text-sm text-muted">{parcela(preco)} no cartão</p>

            {/* Cor */}
            <div className="mt-8">
              <p className="text-[14px]"><span className="eyebrow mr-2">Cor</span>{cor.nome}{!disponivel && <span className="text-muted"> (esgotada)</span>}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {p.cores.map((c) => <Swatch key={c.chave} cor={c} ativo={c.chave === cor.chave} onClick={() => escolherCor(c)} tamanho="w-9 h-9" />)}
              </div>
            </div>

            {/* Tamanho */}
            <div id="tamanhos" className="mt-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Tamanho</p>
                <button onClick={() => setMedidas(true)} className="inline-flex items-center gap-1.5 text-[13px] link-u text-ink-soft">
                  <Ruler className="w-4 h-4" strokeWidth={1.5} /> Tabela de medidas
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {p.grade.map((t) => {
                  const tem = cor.disponiveis.includes(t);
                  const sel = tamanho === t;
                  return (
                    <button key={t} disabled={!tem} onClick={() => { setTamanho(t); setAviso(false); }}
                      aria-pressed={sel}
                      className={`relative h-12 ${t.length > 2 ? 'px-5' : 'w-14'} rounded-full border text-[15px] font-medium transition
                        ${sel ? 'bg-ink text-paper border-ink' : tem ? 'border-line hover:border-ink' : 'border-line text-sold cursor-not-allowed'}`}>
                      {t}
                      {!tem && <span className="absolute left-1/2 top-1/2 h-px w-[70%] -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] bg-sold" />}
                    </button>
                  );
                })}
              </div>
              {!disponivel && (
                <p className="mt-3 text-[14px] text-ink-soft bg-nude px-4 py-3">
                  Esta cor esgotou. Escolha outra cor ou toque em <strong className="font-semibold">Avisar quando repor</strong> para pedir aviso pelo WhatsApp.
                </p>
              )}
              {p.observacao && <p className="mt-3 text-[14px] text-ink-soft">{p.observacao}</p>}
              {aviso && <p className="mt-3 text-[14px] text-rose-deep font-medium" role="alert">Escolha o tamanho para a gente separar sua peça.</p>}
              {disponivel && cor.disponiveis.length > 0 && !unico && (
                <p className="mt-3 text-[13px] text-muted">Disponível nesta cor: {cor.disponiveis.join(', ')}</p>
              )}
            </div>

            {/* Pedido */}
            <div className="mt-8 hidden md:flex flex-col gap-3">
              <a href={linkWhatsapp(mensagem)} target="_blank" rel="noopener" onClick={pedir}
                className={`btn w-full !min-h-14 ${disponivel ? 'btn-dark' : 'btn-line'}`}>
                <WhatsappIcon className="w-5 h-5" /> {botaoTexto}
              </a>
              <button onClick={copiar} className="inline-flex items-center justify-center gap-2 text-[13px] text-ink-soft h-10">
                {copiado ? <><Check className="w-4 h-4" /> Link copiado</> : <><Link2 className="w-4 h-4" strokeWidth={1.5} /> Copiar link desta peça</>}
              </button>
            </div>

            <div className="mt-6 md:mt-4">
              {(p.descricao || p.detalhes.length > 0) && (
                <Detalhe titulo="Sobre a peça" aberto>
                  {p.descricao && <p>{p.descricao}</p>}
                  {p.detalhes.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {p.detalhes.map((d) => <li key={d} className="flex gap-2"><Check className="w-4 h-4 mt-1 shrink-0 text-rose-deep" />{d}</li>)}
                    </ul>
                  )}
                </Detalhe>
              )}
              <Detalhe titulo="Tecido e caimento">
                <ul className="flex flex-col gap-1.5">
                  {config.beneficios.filter((b) => !/x no cart/i.test(b)).map((b) => (
                    <li key={b} className="flex gap-2"><Check className="w-4 h-4 mt-1 shrink-0 text-rose-deep" />{b}</li>
                  ))}
                </ul>
              </Detalhe>
              <Detalhe titulo="Pagamento e envio">
                <p>{config.parcelamento}. Enviamos para todo o Brasil.</p>
                <p className="mt-2">O pedido é fechado direto com a Ju pelo WhatsApp.</p>
              </Detalhe>
            </div>
          </div>
        </div>

        {relacionados.length > 0 && (
          <section className="mt-20 md:mt-28">
            <h2 className="display text-[30px] md:text-[42px] mb-8">Você também vai gostar</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-5">
              {relacionados.map((r) => <ProductCard key={r.slug} p={r} />)}
            </div>
          </section>
        )}
      </div>

      {/* Barra de pedido fixa no celular */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-paper/95 backdrop-blur border-t border-line px-4 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tabular-nums">{brl(preco)}</p>
          <p className="text-[12px] text-muted truncate">{cor.nome}{tamanho ? ` · ${tamanho}` : ''}</p>
        </div>
        <a href={linkWhatsapp(mensagem)} target="_blank" rel="noopener" onClick={pedir}
          className={`btn flex-1 !min-h-12 !px-4 !text-[12px] ${disponivel ? 'btn-dark' : 'btn-line'}`}>
          <WhatsappIcon className="w-4 h-4" /> {disponivel ? 'Pedir no WhatsApp' : 'Avisar quando repor'}
        </a>
        <button onClick={copiar} className="h-12 w-12 shrink-0 rounded-full border border-line grid place-items-center" aria-label="Compartilhar esta peça">
          {copiado ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Tabela de medidas */}
      {medidas && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" role="dialog" aria-label="Tabela de medidas">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMedidas(false)} />
          <div className="relative bg-paper w-full md:max-w-md p-6 md:p-8 rounded-t-2xl md:rounded-none pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="display text-3xl">Tabela de medidas</h2>
              <button onClick={() => setMedidas(false)} className="p-2 -mr-2" aria-label="Fechar"><X className="w-6 h-6" strokeWidth={1.5} /></button>
            </div>
            <Medidas compacto />
          </div>
        </div>
      )}
    </>
  );
}
