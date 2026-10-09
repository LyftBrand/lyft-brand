import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, X } from 'lucide-react';
import { config } from '../lib/content';
import { contatoSalvo, enviarLead, lembrarContato, type Contato, type Pedido } from '../lib/lead';
import { brl, linkWhatsapp, track } from '../lib/utils';
import { WhatsappIcon } from './Icons';
import Cupom from './Cupom';

const Ctx = createContext<(p: Pedido) => void>(() => {});
export const usePedido = () => useContext(Ctx);

/** Abre o WhatsApp: no celular troca de página (abre o app), no computador abre outra aba. */
function abrirWhatsapp(mensagem: string) {
  const url = linkWhatsapp(mensagem);
  if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) location.href = url;
  else window.open(url, '_blank', 'noopener');
}

const mascara = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
/** "Olá, Ju!" vira "Olá, Ju! Aqui é Maria." para a Ju saber com quem fala. */
const comNome = (msg: string, nome: string) => msg.replace(/^Olá(, Ju)?!/, `Olá$1! Aqui é ${nome.split(' ')[0]}.`);
const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export function LeadProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<Pedido | null>(null);

  const pedir = useCallback((p: Pedido) => {
    track('whatsapp_click', { local: p.origem, item_name: p.produto });
    const salvo = contatoSalvo();
    // Formulário desligado no painel, ou cliente que já preencheu antes: vai direto.
    if (!config.formulario_ativo || salvo) {
      const mensagem = salvo ? comNome(p.mensagem, salvo.nome) : p.mensagem;
      if (salvo) enviarLead(salvo, { ...p, mensagem });
      abrirWhatsapp(mensagem);
      return;
    }
    setPedido(p);
  }, []);

  return (
    <Ctx.Provider value={pedir}>
      {children}
      {pedido && <LeadModal pedido={pedido} onClose={() => setPedido(null)} />}
    </Ctx.Provider>
  );
}

/** Link de WhatsApp que passa pelo formulário. O href real fica como plano B. */
export function BotaoWhatsapp({ pedido, className, children, ariaLabel }: { pedido: Pedido; className?: string; children: ReactNode; ariaLabel?: string }) {
  const pedir = usePedido();
  return (
    <a href={linkWhatsapp(pedido.mensagem)} target="_blank" rel="noopener" className={className} aria-label={ariaLabel}
      onClick={(e) => { if (e.defaultPrevented) return; e.preventDefault(); pedir(pedido); }}>
      {children}
    </a>
  );
}

function LeadModal({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whats, setWhats] = useState('');
  const [aceite, setAceite] = useState(false);
  const [isca, setIsca] = useState('');
  const [tentou, setTentou] = useState(false);
  const primeiro = useRef<HTMLInputElement>(null);

  useEffect(() => {
    track('lead_form_open', { lead_origem: pedido.origem });
    const t = setTimeout(() => primeiro.current?.focus(), 120);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(t); window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [onClose, pedido.origem]);

  const erros = {
    nome: nome.trim().length < 2,
    whats: whats.replace(/\D/g, '').length < 10,
    email: config.email_obrigatorio ? !emailValido(email) : email.trim() !== '' && !emailValido(email),
    aceite: !aceite,
  };
  const valido = !Object.values(erros).some(Boolean);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setTentou(true);
    if (!valido) return;
    if (isca) { onClose(); return; } // robô
    const contato: Contato = { nome: nome.trim().slice(0, 80), email: email.trim().slice(0, 120), whatsapp: whats };
    lembrarContato(contato);
    const mensagem = comNome(pedido.mensagem, contato.nome);
    enviarLead(contato, { ...pedido, mensagem });
    abrirWhatsapp(mensagem);
    onClose();
  };

  const campo = (erro: boolean) =>
    `w-full h-12 px-4 bg-paper border text-[16px] outline-none transition focus:border-ink ${tentou && erro ? 'border-rose-deep' : 'border-line'}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="lead-titulo">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={enviar} noValidate
        className="relative w-full md:max-w-md bg-paper rounded-t-3xl md:rounded-none max-h-[92svh] overflow-y-auto px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-9 animate-[sobe_.35s_var(--ease-soft)]">
        <style>{`@keyframes sobe{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}`}</style>
        <div className="md:hidden mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <button type="button" onClick={onClose} className="absolute right-3 top-3 md:right-4 md:top-4 p-2" aria-label="Fechar"><X className="w-6 h-6" strokeWidth={1.5} /></button>

        <p className="eyebrow text-rose-deep">Atendimento pelo WhatsApp</p>
        <h2 id="lead-titulo" className="display text-[32px] mt-2">Quase lá!</h2>
        <p className="mt-2 text-ink-soft">Deixe seu contato para a Ju te atender. Você só preenche uma vez.</p>

        {pedido.produto && (
          <div className="mt-5 flex items-center justify-between gap-3 bg-nude px-4 py-3 text-[14px]">
            <span className="min-w-0 truncate"><strong className="font-semibold">{pedido.produto}</strong>{pedido.cor && ` · ${pedido.cor}`}{pedido.tamanho && ` · ${pedido.tamanho}`}</span>
            {pedido.preco != null && <span className="shrink-0 font-semibold tabular-nums">{brl(pedido.preco)}</span>}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Seu nome</span>
            <input ref={primeiro} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className={campo(erros.nome)} placeholder="Como podemos te chamar?" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">WhatsApp</span>
            <input value={whats} onChange={(e) => setWhats(mascara(e.target.value))} inputMode="tel" autoComplete="tel-national" className={campo(erros.whats)} placeholder="(19) 99999-9999" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">E-mail {!config.email_obrigatorio && <span className="font-normal text-muted">(opcional)</span>}</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" className={campo(erros.email)} placeholder="seu@email.com" />
          </label>
          <Cupom compacto />
          {/* Campo-isca: invisível para pessoas, robôs costumam preencher */}
          <input value={isca} onChange={(e) => setIsca(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" name="site" />

          <label className="flex gap-3 items-start text-[13px] text-ink-soft leading-relaxed cursor-pointer">
            <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
            <span className={tentou && erros.aceite ? 'text-rose-deep' : ''}>
              Concordo em compartilhar meus dados para ser atendida e receber novidades da Lyft, conforme a{' '}
              <Link to="/politica-de-privacidade" onClick={onClose} className="underline underline-offset-2">Política de Privacidade</Link>.
            </span>
          </label>
        </div>

        {tentou && !valido && (
          <p className="mt-4 text-[13px] text-rose-deep" role="alert">
            {erros.nome ? 'Preencha seu nome.' : erros.whats ? 'Confira o número do WhatsApp com DDD.' : erros.email ? 'Confira o e-mail.' : 'Marque a caixinha de concordância para continuar.'}
          </p>
        )}

        <button type="submit" className="btn btn-dark w-full mt-6 !min-h-14">
          <WhatsappIcon className="w-5 h-5" /> Continuar no WhatsApp
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted"><Lock className="w-3.5 h-3.5" /> Seus dados ficam só com a Lyft. Sem spam.</p>
      </form>
    </div>
  );
}
