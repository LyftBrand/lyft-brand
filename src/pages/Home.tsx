import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categorias, config, corInicial, fotosDaCor, produtos } from '../lib/content';
import { BotaoWhatsapp } from '../components/Lead';
import ProductCard from '../components/ProductCard';
import SmartImage from '../components/SmartImage';
import Seo, { jsonLdMarca } from '../components/Seo';
import { SITE_URL } from '../lib/utils';
import { WhatsappIcon } from '../components/Icons';
import { ChamadaWhatsapp, Depoimentos, FaixaBeneficios, InstagramFaixa, SectionHead } from '../components/Sections';

/** Quebra o slogan na vírgula: a segunda parte vai em itálico, como no catálogo. */
function Titulo({ texto }: { texto: string }) {
  const i = texto.indexOf(',');
  if (i < 0) return <>{texto}</>;
  return <>{texto.slice(0, i + 1)}<br /><em className="italic text-rose-deep">{texto.slice(i + 1).trim()}</em></>;
}

export default function Home() {
  const destaques = produtos.filter((p) => p.destaque).slice(0, 8);
  const vitrine = destaques.length >= 4 ? destaques : produtos.slice(0, 8);
  const capas = categorias.map((c) => {
    const p = produtos.find((x) => x.categoria === c && x.destaque) ?? produtos.find((x) => x.categoria === c)!;
    return { nome: c, foto: fotosDaCor(p, corInicial(p))[0], qtd: produtos.filter((x) => x.categoria === c).length };
  });

  return (
    <>
      <Seo
        jsonLd={[jsonLdMarca(), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Lyft', url: SITE_URL + '/', inLanguage: 'pt-BR' }]}
      />

      {/* Topo */}
      <section className="md:grid md:grid-cols-2 md:min-h-[calc(100svh-120px)] bg-nude">
        <div className="relative aspect-[4/5] md:aspect-auto md:order-2 overflow-hidden">
          <SmartImage src={config.hero.imagem} alt="Juliana Colet com o Conjunto Paty e a sacola Lyft" priority
            widths={[480, 640, 800, 1000, 1300, 1600]} sizes="(min-width:768px) 50vw, 100vw" quality={75}
            className="absolute inset-0 h-full w-full object-cover object-[50%_25%]" />
        </div>
        <div className="flex flex-col justify-center px-4 py-12 md:px-12 lg:px-20 md:py-16">
          <p className="eyebrow text-rose-deep">{config.colecao}</p>
          <h1 className="display text-[44px] sm:text-[56px] lg:text-[76px] mt-5"><Titulo texto={config.hero.titulo} /></h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-soft max-w-md">{config.hero.texto}</p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link to="/catalogo" className="btn btn-dark">Ver catálogo <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></Link>
            <BotaoWhatsapp pedido={{ origem: 'inicio', mensagem: config.mensagem_padrao }} className="btn btn-line">
              <WhatsappIcon className="w-4 h-4" /> Pedir pelo WhatsApp
            </BotaoWhatsapp>
          </div>
          <p className="mt-8 text-sm text-muted">{config.parcelamento} · {produtos.length} modelos no catálogo</p>
        </div>
      </section>

      <FaixaBeneficios />

      {/* Categorias */}
      <section className="container-x py-20 md:py-28">
        <SectionHead eyebrow="Explore" title="Escolha seu look" />
        <div className={`grid gap-3 md:gap-5 grid-cols-2 ${capas.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {capas.map((c) => (
            <Link key={c.nome} to={`/catalogo?categoria=${encodeURIComponent(c.nome)}`} className="group relative aspect-[3/4] overflow-hidden bg-nude">
              {c.foto && <SmartImage src={c.foto} alt="" widths={[360, 600, 800]} sizes="(min-width:1024px) 25vw, 50vw"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/0 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-paper flex items-end justify-between">
                <div>
                  <h3 className="display text-[26px] md:text-[34px]">{c.nome}</h3>
                  <p className="text-[12px] text-paper/80 mt-1">{c.qtd} {c.qtd === 1 ? 'modelo' : 'modelos'}</p>
                </div>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Destaques */}
      <section className="container-x pb-20 md:pb-28">
        <SectionHead eyebrow="Mais amados" title={<>Os <em className="italic">queridinhos</em> da coleção</>} link={{ to: '/catalogo', label: 'Ver tudo' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-5 md:gap-y-14">
          {vitrine.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 2} />)}
        </div>
        <div className="mt-12 text-center">
          <Link to="/catalogo" className="btn btn-line">Ver as {produtos.length} peças <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></Link>
        </div>
      </section>

      {/* Editorial */}
      <section className="grid md:grid-cols-2 bg-ink text-paper">
        <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[640px] overflow-hidden">
          <SmartImage src={config.hero.imagem_2} alt="Conjunto Isis verde botânico" widths={[480, 640, 800, 1000, 1300]} sizes="(min-width:768px) 50vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center px-4 py-14 md:px-16 lg:px-24">
          <p className="eyebrow text-rose">Dentro e fora da academia</p>
          <h2 className="display text-[38px] md:text-[56px] mt-5">Do treino ao café, <em className="italic text-rose">sem precisar trocar de look.</em></h2>
          <p className="mt-6 text-paper/70 text-lg max-w-md">Conforto, estilo e versatilidade para acompanhar todos os momentos do seu dia.</p>
          <Link to="/catalogo" className="btn btn-light mt-9 self-start">Montar meu look <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></Link>
        </div>
      </section>

      {/* Fundadora */}
      <section className="container-x py-20 md:py-28 grid md:grid-cols-[5fr_6fr] gap-10 md:gap-20 items-center">
        <div className="relative aspect-[4/5] overflow-hidden bg-nude">
          <SmartImage src={config.sobre.imagem} alt="Juliana Colet, fundadora da Lyft" widths={[480, 800, 1100]} sizes="(min-width:768px) 45vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div>
          <p className="eyebrow text-rose-deep">A fundadora</p>
          <h2 className="display text-[34px] md:text-[50px] mt-4">“{config.sobre.titulo}”</h2>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-soft whitespace-pre-line">{config.sobre.texto.split('\n\n').slice(0, 2).join('\n\n')}</p>
          <p className="mt-6 font-display italic text-lg">{config.sobre.assinatura}</p>
          <Link to="/a-marca" className="mt-8 inline-flex items-center gap-2 eyebrow link-u pb-1">Conheça a Lyft <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></Link>
        </div>
      </section>

      <Depoimentos />

      {/* Embalagem */}
      <section className="container-x py-20 md:py-28 grid md:grid-cols-[4fr_5fr] gap-10 md:gap-16 items-center">
        <div>
          <p className="eyebrow text-rose-deep">Do nosso cuidado até você</p>
          <h2 className="display text-[34px] md:text-[48px] mt-4">{config.embalagem.titulo}</h2>
          <p className="mt-5 text-ink-soft text-lg">Cada pedido vai na sacola Lyft, com o cartão “Obrigada por escolher a Lyft”. Enviamos para todo o Brasil.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="relative row-span-2 aspect-[3/5] overflow-hidden bg-nude">
            <SmartImage src={config.embalagem.imagem} alt="Ju separando um pedido" widths={[400, 700]} sizes="(min-width:768px) 28vw, 50vw" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          {['/uploads/marca/cartao.jpg', '/uploads/marca/sacola.jpg'].map((f) => (
            <div key={f} className="relative aspect-[4/5] md:aspect-auto overflow-hidden bg-nude">
              <SmartImage src={f} alt="" widths={[300, 600]} sizes="(min-width:768px) 28vw, 50vw" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <InstagramFaixa />
      <ChamadaWhatsapp />
    </>
  );
}
