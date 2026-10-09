import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { track } from '../lib/utils';

/**
 * Seta de voltar ao topo. Fica acima do botão do WhatsApp e é menor que ele:
 * num catálogo, o botão que deve chamar atenção é o de pedir.
 */
export default function VoltarAoTopo() {
  const [visivel, setVisivel] = useState(false);
  const produto = useLocation().pathname.startsWith('/produto/');

  useEffect(() => {
    // Só aparece depois de quase uma tela de rolagem; antes disso o topo ainda está perto.
    let travado = false;
    const aoRolar = () => {
      if (travado) return;
      travado = true;
      requestAnimationFrame(() => {
        setVisivel(window.scrollY > Math.max(window.innerHeight * 0.9, 600));
        travado = false;
      });
    };
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  const subir = () => {
    const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    track('voltar_ao_topo', { profundidade: Math.round(window.scrollY) });
    window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
  };

  // Sempre logo acima do WhatsApp flutuante (que, no celular, sobe na página de produto).
  const posicao = produto
    ? 'bottom-[calc(156px+env(safe-area-inset-bottom))] md:bottom-[100px]'
    : 'bottom-[calc(84px+env(safe-area-inset-bottom))] md:bottom-[100px]';

  return (
    <button
      type="button"
      onClick={subir}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      tabIndex={visivel ? 0 : -1}
      aria-hidden={!visivel}
      className={`fixed z-30 right-[22px] md:right-6 ${posicao} w-11 h-11 grid place-items-center rounded-full bg-ink/85 hover:bg-ink text-paper ring-1 ring-paper/20 backdrop-blur-sm shadow-[0_8px_24px_-8px_rgba(26,22,20,.5)] transition-all duration-300 ${
        visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={1.6} />
    </button>
  );
}
