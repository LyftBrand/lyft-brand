import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { config, depoimentos } from '../lib/content';
import { linkInstagram, track } from '../lib/utils';
import { BotaoWhatsapp } from './Lead';
import { InstagramIcon, WhatsappIcon } from './Icons';
import SmartImage from './SmartImage';

export function SectionHead({ eyebrow, title, link, className = '' }: { eyebrow?: string; title: React.ReactNode; link?: { to: string; label: string }; className?: string }) {
  return (
    <div className={`flex items-end justify-between gap-6 mb-8 md:mb-12 ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow text-rose-deep mb-3">{eyebrow}</p>}
        <h2 className="display text-[34px] md:text-[52px]">{title}</h2>
      </div>
      {link && (
        <Link to={link.to} className="hidden sm:inline-flex items-center gap-2 eyebrow link-u pb-1 shrink-0">
          {link.label} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      )}
    </div>
  );
}

/** Faixa com os diferenciais que aparecem no catálogo. */
export function FaixaBeneficios() {
  const itens = [...config.beneficios, 'Enviamos para todo o Brasil'];
  return (
    <div className="bg-rose text-paper overflow-hidden" aria-label="Diferenciais">
      <div className="flex w-max animate-[faixa_38s_linear_infinite] motion-reduce:animate-none py-4">
        {[0, 1].map((k) => (
          <ul key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {itens.map((b) => (
              <li key={b} className="flex items-center eyebrow !tracking-[.2em] whitespace-nowrap">
                <span className="px-6 md:px-9">{b}</span>
                <span aria-hidden className="text-paper/60">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <style>{`@keyframes faixa { to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

export function Depoimentos() {
  if (!depoimentos.length) return null;
  return (
    <section className="bg-nude py-20 md:py-28">
      <div className="container-x">
        <SectionHead eyebrow="Momento feedback" title={<>O que elas <em className="italic text-rose-deep">estão dizendo</em></>} />
      </div>
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 md:px-0 md:container-x scroll-px-4">
        {depoimentos.map((d, i) => (
          <figure key={i} className={`snap-start shrink-0 w-[82%] sm:w-[60%] md:w-auto bg-paper p-7 md:p-9 flex flex-col justify-between gap-8 ${i > 2 ? 'md:hidden' : ''}`}>
            <blockquote className="font-display text-[21px] md:text-[23px] leading-snug">
              <span aria-hidden className="block text-rose text-4xl leading-none mb-2">“</span>
              {d.texto}
            </blockquote>
            <figcaption className="eyebrow text-muted !text-[10px]">{d.nome && <span className="text-ink">{d.nome}</span>}{d.nome && ' · '}{d.origem}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function InstagramFaixa() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-x text-center">
        <p className="eyebrow text-rose-deep mb-3">Siga a Lyft</p>
        <a href={linkInstagram()} target="_blank" rel="noopener" className="display text-[34px] md:text-[52px] link-u"
          onClick={() => track('click_instagram', { local: 'home' })}>
          @{config.instagram}
        </a>
      </div>
      <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-1">
        {config.instagram_fotos.map((f, i) => (
          <a key={f} href={linkInstagram()} target="_blank" rel="noopener" className="relative aspect-square overflow-hidden bg-nude group"
            aria-label={`Foto ${i + 1} do Instagram da Lyft`}>
            <SmartImage src={f} alt="" widths={[240, 400]} sizes="(min-width:768px) 17vw, 33vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/25 transition grid place-items-center">
              <InstagramIcon className="w-7 h-7 text-paper opacity-0 group-hover:opacity-100 transition" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ChamadaWhatsapp({ titulo = 'Ficou com dúvida no tamanho ou na cor?', texto = 'A Ju te ajuda a escolher. É só chamar no WhatsApp.' }: { titulo?: string; texto?: string }) {
  return (
    <section className="bg-ink text-paper">
      <div className="container-x py-16 md:py-24 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-xl">
          <h2 className="display text-[34px] md:text-[48px]">{titulo}</h2>
          <p className="mt-4 text-paper/70 text-lg">{texto}</p>
        </div>
        <BotaoWhatsapp pedido={{ origem: 'chamada', mensagem: config.mensagem_padrao }} className="btn btn-light shrink-0">
          <WhatsappIcon className="w-4 h-4 text-[#1DA851]" /> Chamar no WhatsApp
        </BotaoWhatsapp>
      </div>
    </section>
  );
}
