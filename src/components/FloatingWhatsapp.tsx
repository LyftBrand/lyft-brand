import { useLocation } from 'react-router-dom';
import { linkWhatsapp, track } from '../lib/utils';
import { WhatsappIcon } from './Icons';

/** Botão fixo de WhatsApp. Some na página de produto, que já tem a barra de pedido no rodapé. */
export default function FloatingWhatsapp() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/produto/')) return null;
  return (
    <a
      href={linkWhatsapp()}
      target="_blank"
      rel="noopener"
      aria-label="Conversar no WhatsApp"
      onClick={() => track('whatsapp_click', { local: 'flutuante' })}
      className="fixed z-30 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] md:right-6 md:bottom-6 group flex items-center gap-3 rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,.45)] h-14 pl-4 pr-4 md:pr-5 transition-transform hover:-translate-y-0.5"
    >
      <WhatsappIcon className="w-6 h-6" />
      <span className="hidden md:inline text-sm font-semibold">Fale com a Ju</span>
    </a>
  );
}
