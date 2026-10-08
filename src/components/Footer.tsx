import { Link } from 'react-router-dom';
import { categorias, config } from '../lib/content';
import { linkInstagram, linkWhatsapp, track } from '../lib/utils';
import { Logo } from './Header';
import { InstagramIcon, WhatsappIcon } from './Icons';

const telefone = (n: string) => {
  const d = n.replace(/\D/g, '').replace(/^55/, '');
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : n;
};

export default function Footer() {
  return (
    <footer className="bg-ink text-paper/80 pb-24 md:pb-0">
      <div className="container-x py-16 md:py-20 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo claro className="h-11 w-auto" />
          <p className="mt-5 display text-2xl text-paper">{config.slogan}</p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="eyebrow text-paper/50">Catálogo</span>
          <Link to="/catalogo" className="link-u w-fit">Ver todas as peças</Link>
          {categorias.map((c) => (
            <Link key={c} to={`/catalogo?categoria=${encodeURIComponent(c)}`} className="link-u w-fit">{c}</Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="eyebrow text-paper/50">A Lyft</span>
          <Link to="/a-marca" className="link-u w-fit">A marca</Link>
          <Link to="/catalogo#medidas" className="link-u w-fit">Tabela de medidas</Link>
          <span>{config.parcelamento}</span>
          <span>Enviamos para todo o Brasil</span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="eyebrow text-paper/50">Atendimento</span>
          <a href={linkWhatsapp()} target="_blank" rel="noopener" className="link-u w-fit inline-flex items-center gap-2"
            onClick={() => track('whatsapp_click', { local: 'rodape' })}>
            <WhatsappIcon className="w-4 h-4" /> {telefone(config.whatsapp)}
          </a>
          <a href={linkInstagram()} target="_blank" rel="noopener" className="link-u w-fit inline-flex items-center gap-2">
            <InstagramIcon className="w-4 h-4" /> @{config.instagram}
          </a>
          <a href={`mailto:${config.email}`} className="link-u w-fit break-all">{config.email}</a>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="container-x py-6 flex flex-col sm:flex-row gap-2 justify-between text-xs text-paper/45">
          <span>© {new Date().getFullYear()} Lyft · {config.colecao}</span>
          <span>Site por Lemos83</span>
        </div>
      </div>
    </footer>
  );
}
