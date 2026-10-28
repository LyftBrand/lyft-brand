import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { config } from '../lib/content';
import SmartImage from '../components/SmartImage';
import Seo from '../components/Seo';
import { ChamadaWhatsapp, Depoimentos, FaixaBeneficios } from '../components/Sections';

export default function Marca() {
  const marca = config.marca ?? {};
  const fotos = (marca.fotos ?? []).slice(0, 2);

  return (
    <>
      <Seo title="A marca" description={`A Lyft é a marca de moda fitness de Juliana Colet. ${config.slogan}`} />

      <section className="bg-nude">
        <div className="container-x py-14 md:py-24 grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div>
            <p className="eyebrow text-rose-deep">A marca</p>
            <h1 className="display text-[44px] md:text-[72px] mt-4">
              {marca.titulo}{marca.destaque && <> <em className="italic text-rose-deep">{marca.destaque}</em></>}
            </h1>
            {marca.texto && <p className="mt-6 text-lg text-ink-soft max-w-md">{marca.texto}</p>}
          </div>
          {marca.imagem && (
            <div className="relative aspect-[4/5] overflow-hidden">
              <SmartImage src={marca.imagem} alt="Peças da coleção Lyft" widths={[480, 800, 1100]} sizes="(min-width:768px) 45vw, 100vw" priority
                className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      <FaixaBeneficios />

      <section className="container-x py-14 md:py-28 grid md:grid-cols-[5fr_6fr] gap-8 md:gap-20 items-start">
        {/* No celular a foto fica mais baixa (4:3, focada no rosto) para o texto da Ju caber em menos rolagem. */}
        <div className="relative aspect-[4/3] md:aspect-[4/5] overflow-hidden bg-nude md:sticky md:top-28">
          <SmartImage src={config.sobre.imagem} alt="Juliana Colet, fundadora da Lyft" widths={[480, 800, 1100]} sizes="(min-width:768px) 45vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover object-[50%_15%]" />
        </div>
        <div className="md:pt-10">
          <p className="eyebrow text-rose-deep">Nas palavras da Ju</p>
          <h2 className="display text-[30px] md:text-[52px] mt-3 md:mt-4">“{config.sobre.titulo}”</h2>
          <div className="mt-6 md:mt-8 text-[17px] md:text-[18px] leading-relaxed text-ink-soft flex flex-col gap-4 md:gap-5">
            {config.sobre.texto.split('\n\n').map((par) => <p key={par}>{par}</p>)}
          </div>
          <p className="mt-6 md:mt-8 font-display italic text-xl">{config.sobre.assinatura}</p>

          {fotos.length > 0 && (
            <div className="mt-10 md:mt-14 grid grid-cols-2 gap-3">
              {fotos.map((f, i) => (
                <div key={f} className="relative aspect-square overflow-hidden bg-nude">
                  <SmartImage src={f} alt={`Detalhe da coleção Lyft ${i + 1}`} widths={[360, 600]} sizes="25vw" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <Link to="/catalogo" className="btn btn-dark mt-10">Ver o catálogo <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></Link>
        </div>
      </section>

      <Depoimentos />
      <ChamadaWhatsapp titulo="Quer ajuda para montar seu look?" />
    </>
  );
}
