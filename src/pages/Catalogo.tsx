import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categorias, precoFinal, produtoDisponivel, produtos } from '../lib/content';
import { track } from '../lib/utils';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import Medidas from '../components/Medidas';
import { ChamadaWhatsapp } from '../components/Sections';

type Ordem = 'destaques' | 'menor' | 'maior';

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') ?? '';
  const soDisponiveis = params.get('disponiveis') === '1';
  const ordem = (params.get('ordem') as Ordem) || 'destaques';

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v); else n.delete(k);
    setParams(n, { replace: true });
  };

  const lista = useMemo(() => {
    let l = produtos.filter((p) => (!categoria || p.categoria === categoria) && (!soDisponiveis || produtoDisponivel(p)));
    if (ordem === 'menor') l = [...l].sort((a, b) => precoFinal(a) - precoFinal(b));
    else if (ordem === 'maior') l = [...l].sort((a, b) => precoFinal(b) - precoFinal(a));
    else l = [...l].sort((a, b) => Number(produtoDisponivel(b)) - Number(produtoDisponivel(a)));
    return l;
  }, [categoria, soDisponiveis, ordem]);

  const chip = (ativo: boolean) =>
    `shrink-0 h-10 px-5 rounded-full border text-[13px] font-medium transition ${ativo ? 'bg-ink text-paper border-ink' : 'border-line text-ink-soft hover:border-ink'}`;

  return (
    <>
      <Seo title={categoria ? `${categoria} fitness` : 'Catálogo'} description={`Catálogo Lyft: ${produtos.length} modelos de moda fitness feminina. Veja cores, tamanhos disponíveis e peça pelo WhatsApp.`} />

      <section className="bg-nude">
        <div className="container-x pt-12 pb-10 md:pt-20 md:pb-14">
          <p className="eyebrow text-rose-deep">Catálogo</p>
          <h1 className="display text-[44px] md:text-[72px] mt-3">{categoria || 'Todas as peças'}</h1>
          <p className="mt-3 text-ink-soft">{lista.length} {lista.length === 1 ? 'modelo' : 'modelos'} · toque na cor para ver a peça</p>
        </div>
      </section>

      <div className="sticky top-16 md:top-20 z-30 bg-paper/95 backdrop-blur border-b border-line">
        <div className="container-x py-3 flex items-center gap-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 -mx-4 px-4 md:mx-0 md:px-0">
            <button className={chip(!categoria)} onClick={() => set('categoria', '')}>Todas</button>
            {categorias.map((c) => (
              <button key={c} className={chip(categoria === c)} onClick={() => { set('categoria', c); track('filter_produtos', { categoria: c }); }}>{c}</button>
            ))}
          </div>
        </div>
        <div className="container-x pb-3 flex items-center justify-between gap-4 text-[13px]">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" className="peer sr-only" checked={soDisponiveis} onChange={(e) => set('disponiveis', e.target.checked ? '1' : '')} />
            <span className="w-9 h-5 rounded-full bg-line peer-checked:bg-ink relative transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-paper after:transition peer-checked:after:translate-x-4" />
            Só disponíveis
          </label>
          <label className="inline-flex items-center gap-2 text-ink-soft">
            <span className="hidden sm:inline">Ordenar:</span>
            <select value={ordem} onChange={(e) => set('ordem', e.target.value === 'destaques' ? '' : e.target.value)}
              className="bg-transparent font-medium text-ink outline-none cursor-pointer">
              <option value="destaques">Disponíveis primeiro</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </label>
        </div>
      </div>

      <section className="container-x py-10 md:py-14">
        {lista.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-5 md:gap-y-14">
            {lista.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 4} />)}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="display text-3xl">Nada por aqui agora.</p>
            <button className="btn btn-line mt-6" onClick={() => setParams({}, { replace: true })}>Ver todas as peças</button>
          </div>
        )}
      </section>

      <section id="medidas" className="container-x pb-20 md:pb-28 scroll-mt-40">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 border-t border-line pt-14">
          <div>
            <p className="eyebrow text-rose-deep">Tabela de medidas</p>
            <h2 className="display text-[34px] md:text-[48px] mt-3">Qual é o meu tamanho?</h2>
            <p className="mt-4 text-ink-soft max-w-md">Muitos modelos são tamanho único e vestem do 36 ao 40. Os modelos com grade P, M e G seguem a tabela ao lado.</p>
          </div>
          <Medidas />
        </div>
      </section>

      <ChamadaWhatsapp />
    </>
  );
}
