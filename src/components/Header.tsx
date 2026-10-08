import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { categorias, config } from '../lib/content';
import { linkInstagram, linkWhatsapp, track } from '../lib/utils';
import { InstagramIcon, WhatsappIcon } from './Icons';

const nav = [
  { to: '/', label: 'Início', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/a-marca', label: 'A marca' },
];

export function Logo({ className = 'h-7', claro = false }: { className?: string; claro?: boolean }) {
  return <img src={claro ? '/logo-claro.svg' : '/logo.svg'} alt="Lyft" className={className} width={139} height={100} />;
}

export default function Header() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setAberto(false), [pathname]);
  useEffect(() => {
    const on = () => setRolou(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [aberto]);

  return (
    <>
      {config.aviso_topo && (
        <div className="bg-ink text-paper text-center text-[10.5px] sm:text-xs tracking-[.14em] uppercase py-2.5 px-4">
          {config.aviso_topo.split('·').map((parte, i) => (
            <span key={i} className={i > 0 ? 'hidden sm:inline' : ''}>{i > 0 && ' · '}{parte.trim()}</span>
          ))}
        </div>
      )}
      <header className={`sticky top-0 z-40 bg-paper/90 backdrop-blur-md transition-shadow ${rolou ? 'shadow-[0_1px_0_var(--color-line)]' : ''}`}>
        <div className="container-x h-16 md:h-20 grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center">
            <button
              onClick={() => setAberto(true)}
              className="md:hidden -ml-2 p-2"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <nav className="hidden md:flex gap-9">
              {nav.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end}
                  className={({ isActive }) => `eyebrow link-u pb-1 ${isActive ? 'bg-[length:100%_1px]' : 'text-ink-soft'}`}>
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <Link to="/" aria-label="Lyft, página inicial" className="justify-self-center">
            <Logo className="h-8 md:h-10 w-auto" />
          </Link>

          <div className="flex items-center justify-end gap-2">
            <a href={linkInstagram()} target="_blank" rel="noopener" aria-label="Instagram da Lyft"
              className="hidden md:inline-flex p-2 text-ink-soft hover:text-ink"
              onClick={() => track('click_instagram', { local: 'header' })}>
              <InstagramIcon />
            </a>
            <a href={linkWhatsapp()} target="_blank" rel="noopener"
              onClick={() => track('whatsapp_click', { local: 'header' })}
              className="btn btn-dark !min-h-10 !px-4 md:!px-5 !text-[11px]">
              <WhatsappIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Fale com a Ju</span>
              <span className="sm:hidden">Pedir</span>
            </a>
          </div>
        </div>
      </header>

      {/* Menu do celular */}
      <div className={`fixed inset-0 z-50 md:hidden transition ${aberto ? 'visible' : 'invisible'}`} aria-hidden={!aberto}>
        <div className={`absolute inset-0 bg-ink/40 transition-opacity ${aberto ? 'opacity-100' : 'opacity-0'}`} onClick={() => setAberto(false)} />
        <aside className={`absolute left-0 top-0 h-full w-[86%] max-w-sm bg-paper flex flex-col transition-transform duration-300 ${aberto ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-line">
            <Logo className="h-7 w-auto" />
            <button onClick={() => setAberto(false)} className="p-2 -mr-2" aria-label="Fechar menu">
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className="display text-4xl">{n.label}</NavLink>
            ))}
            <div className="pt-4 border-t border-line flex flex-col gap-3">
              <span className="eyebrow text-muted">Categorias</span>
              {categorias.map((c) => (
                <Link key={c} to={`/catalogo?categoria=${encodeURIComponent(c)}`} className="text-lg text-ink-soft">{c}</Link>
              ))}
            </div>
          </nav>
          <div className="p-6 border-t border-line flex flex-col gap-3">
            <a href={linkWhatsapp()} target="_blank" rel="noopener" className="btn btn-dark w-full"
              onClick={() => track('whatsapp_click', { local: 'menu' })}>
              <WhatsappIcon className="w-4 h-4" /> Fale com a Ju
            </a>
            <a href={linkInstagram()} target="_blank" rel="noopener" className="btn btn-line w-full">
              <InstagramIcon className="w-4 h-4" /> @{config.instagram}
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
