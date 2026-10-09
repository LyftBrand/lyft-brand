import { Link, useLocation } from 'react-router-dom';
import { categorias, config } from '../lib/content';
import { linkInstagram } from '../lib/utils';
import { abrirCentralCookies } from '../lib/consent';
import { BotaoWhatsapp } from './Lead';
import { useMensagemPagina } from '../lib/mensagemPagina';
import { Logo } from './Header';
import { InstagramIcon, WhatsappIcon } from './Icons';

const telefone = (n: string) => {
  const d = n.replace(/\D/g, '').replace(/^55/, '');
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : n;
};

export default function Footer() {
  const pedido = useMensagemPagina('rodape');
  // No celular, a página de produto tem a barra de pedido + WhatsApp + seta empilhados embaixo.
  const produto = useLocation().pathname.startsWith('/produto/');
  return (
    <footer className="bg-ink text-paper/80">
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
          <Link to="/politica-de-privacidade" className="link-u w-fit">Política de Privacidade</Link>
          <button onClick={abrirCentralCookies} className="link-u w-fit text-left">Preferências de cookies</button>
        </div>

        <div className="flex flex-col gap-3">
          <span className="eyebrow text-paper/50">Atendimento</span>
          <BotaoWhatsapp pedido={pedido} className="link-u w-fit inline-flex items-center gap-2">
            <WhatsappIcon className="w-4 h-4" /> {telefone(config.whatsapp)}
          </BotaoWhatsapp>
          <a href={linkInstagram()} target="_blank" rel="noopener" className="link-u w-fit inline-flex items-center gap-2">
            <InstagramIcon className="w-4 h-4" /> @{config.instagram}
          </a>
          <a href={`mailto:${config.email}`} className="link-u w-fit break-all">{config.email}</a>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className={`container-x pt-6 ${produto ? 'pb-[230px]' : 'pb-40'} md:pb-16 flex flex-col gap-1.5 text-xs text-paper/45`}>
          <span>© {new Date().getFullYear()} Lyft · {config.colecao}</span>
          <span>Feito com <span aria-label="amor">🤎</span> por Lemos83 | Digital Marketing Solutions</span>
        </div>
      </div>
    </footer>
  );
}
