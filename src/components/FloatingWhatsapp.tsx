import { useLocation } from 'react-router-dom';
import { useMensagemPagina } from '../lib/mensagemPagina';
import { BotaoWhatsapp } from './Lead';
import { WhatsappIcon } from './Icons';

/**
 * Botão fixo de WhatsApp, em todas as páginas, com a mensagem da página atual.
 * No celular, na página de produto, sobe para ficar acima da barra de pedido.
 */
export default function FloatingWhatsapp() {
  const produto = useLocation().pathname.startsWith('/produto/');
  const pedido = useMensagemPagina('flutuante');
  return (
    <BotaoWhatsapp
      pedido={pedido}
      ariaLabel="Conversar no WhatsApp"
      className={`fixed z-30 right-4 md:right-6 md:bottom-6 ${produto ? 'bottom-[calc(88px+env(safe-area-inset-bottom))]' : 'bottom-[max(1rem,env(safe-area-inset-bottom))]'} group flex items-center gap-3 rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,.45)] h-14 pl-4 pr-4 md:pr-5 transition-transform hover:-translate-y-0.5`}
    >
      <WhatsappIcon className="w-6 h-6" />
      <span className="hidden md:inline text-sm font-semibold">Fale com a Ju</span>
    </BotaoWhatsapp>
  );
}
