import { useEffect, useState } from 'react';
import { Check, Tag } from 'lucide-react';
import { cupomAtivo, salvarCupom, track } from '../lib/utils';

/**
 * "Tenho um cupom": fica fechado para não alongar a página; aberto, a cliente digita
 * e o cupom vai junto na mensagem do WhatsApp e na planilha.
 * Quem chega por link com ?cupom=XPTO já vê o cupom aplicado.
 */
export default function Cupom({ compacto = false }: { compacto?: boolean }) {
  const [valor, setValor] = useState(cupomAtivo);
  const [aberto, setAberto] = useState(!!valor);
  const [abriuAgora, setAbriuAgora] = useState(false);
  const aplicado = cupomAtivo();

  // Cupom aplicado pela faixa do topo aparece aqui também.
  useEffect(() => {
    const on = () => { const v = cupomAtivo(); setValor(v); if (v) setAberto(true); };
    window.addEventListener('lyft:cupom', on);
    return () => window.removeEventListener('lyft:cupom', on);
  }, []);

  if (!aberto) {
    return (
      <button type="button" onClick={() => { setAberto(true); setAbriuAgora(true); }}
        className={`inline-flex items-center gap-1.5 text-ink-soft link-u ${compacto ? 'text-[13px]' : 'text-[14px]'}`}>
        <Tag className="w-4 h-4" strokeWidth={1.5} /> Tenho um cupom de desconto
      </button>
    );
  }

  return (
    <div>
      <label className={`font-semibold ${compacto ? 'text-[13px]' : 'eyebrow'}`} htmlFor={compacto ? 'cupom-form' : 'cupom'}>Cupom de desconto</label>
      <div className="mt-2 flex gap-2">
        <input
          id={compacto ? 'cupom-form' : 'cupom'}
          value={valor}
          onChange={(e) => setValor(e.target.value.toUpperCase())}
          onBlur={() => { const v = salvarCupom(valor); setValor(v); if (v) track('cupom_informado', { cupom: v }); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
          placeholder="Digite o código"
          autoCapitalize="characters"
          autoComplete="off"
          autoFocus={abriuAgora}
          className="h-12 flex-1 min-w-0 px-4 bg-paper border border-line text-[16px] tracking-wider uppercase outline-none focus:border-ink"
        />
        <button type="button" onClick={() => { const v = salvarCupom(valor); setValor(v); if (v) track('cupom_informado', { cupom: v }); }}
          className="btn btn-line !min-h-12 !px-5 shrink-0">Aplicar</button>
      </div>
      {aplicado && (
        <p className="mt-2 text-[13px] text-ink-soft flex items-start gap-1.5">
          <Check className="w-4 h-4 mt-px shrink-0 text-rose-deep" />
          <span>Cupom <strong className="font-semibold">{aplicado}</strong> vai na sua mensagem. A Ju confirma o desconto no WhatsApp.</span>
        </p>
      )}
    </div>
  );
}
