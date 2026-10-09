import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, X } from 'lucide-react';
import { lerPreferencias, salvarPreferencias, type Preferencias } from '../lib/consent';

const CATEGORIAS = [
  { id: 'necessarios', titulo: 'Necessários', texto: 'Fazem o site funcionar: navegação, segurança e as suas escolhas de privacidade. Não podem ser desligados.', fixo: true },
  { id: 'analiticos', titulo: 'Analíticos', texto: 'Contam visitas e cliques de forma agregada, para entender quais peças despertam mais interesse e melhorar o site. Ferramenta: Google Analytics.', fixo: false },
  { id: 'marketing', titulo: 'Marketing e anúncios', texto: 'Medem os resultados dos anúncios da Lyft e permitem mostrar peças do seu interesse no Instagram, Facebook, Google e TikTok. Ferramentas: Meta Pixel, Google Ads e TikTok Pixel.', fixo: false },
] as const;

function Chave({ ligado, fixo, onClick, rotulo }: { ligado: boolean; fixo?: boolean; onClick?: () => void; rotulo: string }) {
  return (
    <button type="button" role="switch" aria-checked={ligado} aria-label={rotulo} disabled={fixo} onClick={onClick}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${ligado ? (fixo ? 'bg-ink/45' : 'bg-ink') : 'bg-line'} ${fixo ? 'cursor-not-allowed' : ''}`}>
      <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-paper shadow transition-transform ${ligado ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function CookieConsent() {
  const [banner, setBanner] = useState(false);
  const [central, setCentral] = useState(false);
  const [prefs, setPrefs] = useState<Preferencias>(() => lerPreferencias() ?? { necessarios: true, analiticos: false, marketing: false });

  useEffect(() => {
    // Aparece depois de 2,5s para não atrapalhar o carregamento da página.
    const t = lerPreferencias() ? undefined : setTimeout(() => setBanner(true), 2500);
    const abrir = () => { setPrefs(lerPreferencias() ?? prefs); setCentral(true); setBanner(false); };
    window.addEventListener('lyft:abrir-cookies', abrir);
    return () => { clearTimeout(t); window.removeEventListener('lyft:abrir-cookies', abrir); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const salvar = (p: Preferencias) => { salvarPreferencias(p); setPrefs(p); setBanner(false); setCentral(false); };
  const aceitarTudo = () => salvar({ necessarios: true, analiticos: true, marketing: true });
  const soNecessarios = () => salvar({ necessarios: true, analiticos: false, marketing: false });
  const fecharCentral = () => { setCentral(false); if (!lerPreferencias()) setBanner(true); };

  return (
    <>
      {banner && !central && (
        <div role="region" aria-label="Aviso de cookies"
          className="fixed z-[55] left-3 right-3 bottom-3 md:left-6 md:right-auto md:bottom-6 md:max-w-md bg-paper border border-line shadow-[0_24px_60px_-20px_rgba(26,22,20,.45)] p-6 animate-[sobe_.4s_var(--ease-soft)]">
          <style>{`@keyframes sobe{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}`}</style>
          <p className="eyebrow text-rose-deep">Sua privacidade</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            Usamos cookies para o site funcionar, entender o que você mais gosta e medir nossos anúncios. Você escolhe o que permitir.
            Saiba mais na <Link to="/politica-de-privacidade" className="underline underline-offset-2 text-ink">Política de Privacidade</Link>.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <button onClick={aceitarTudo} className="btn btn-dark !min-h-12 flex-1">Aceitar</button>
            <button onClick={() => setCentral(true)} className="btn btn-line !min-h-12 flex-1">Preferências</button>
          </div>
        </div>
      )}

      {central && (
        <div className="fixed inset-0 z-[75] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="cookies-titulo">
          <div className="absolute inset-0 bg-ink/45" onClick={fecharCentral} />
          <div className="relative w-full md:max-w-xl bg-paper max-h-[92svh] flex flex-col rounded-t-3xl md:rounded-none">
            <div className="flex items-start justify-between gap-4 px-6 md:px-9 pt-7 pb-5 border-b border-line">
              <div>
                <p className="eyebrow text-rose-deep">LGPD · Lei nº 13.709/2018</p>
                <h2 id="cookies-titulo" className="display text-[30px] mt-2">Preferências de cookies</h2>
              </div>
              <button onClick={fecharCentral} className="p-2 -mr-2" aria-label="Fechar"><X className="w-6 h-6" strokeWidth={1.5} /></button>
            </div>
            <div className="overflow-y-auto px-6 md:px-9 py-2 divide-y divide-line">
              {CATEGORIAS.map((c) => (
                <div key={c.id} className="py-5 flex gap-5 items-start justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">{c.titulo}{c.fixo && <span className="inline-flex items-center gap-1 text-[11px] text-muted font-normal"><Lock className="w-3 h-3" /> sempre ativo</span>}</h3>
                    <p className="mt-1.5 text-[14px] text-ink-soft leading-relaxed">{c.texto}</p>
                  </div>
                  <Chave rotulo={c.titulo} ligado={prefs[c.id]} fixo={c.fixo}
                    onClick={() => !c.fixo && setPrefs((p) => ({ ...p, [c.id]: !p[c.id as 'analiticos' | 'marketing'] }))} />
                </div>
              ))}
            </div>
            <div className="px-6 md:px-9 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-line flex flex-col sm:flex-row gap-2.5">
              <button onClick={soNecessarios} className="btn btn-line !min-h-12 !px-5 whitespace-nowrap sm:mr-auto">Só necessários</button>
              <button onClick={() => salvar(prefs)} className="btn btn-line !min-h-12 !px-5 whitespace-nowrap">Salvar escolhas</button>
              <button onClick={aceitarTudo} className="btn btn-dark !min-h-12 !px-5 whitespace-nowrap">Aceitar tudo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
