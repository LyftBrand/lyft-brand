import { config } from '../lib/content';

export default function Medidas({ compacto = false }: { compacto?: boolean }) {
  return (
    <div>
      <table className="w-full text-left text-[15px]">
        <thead>
          <tr className="border-b border-ink">
            <th className="eyebrow py-3 font-semibold">Tamanho</th>
            <th className="eyebrow py-3 font-semibold">Veste</th>
          </tr>
        </thead>
        <tbody>
          {config.medidas.map((m) => (
            <tr key={m.tamanho} className="border-b border-line">
              <td className={`${compacto ? 'py-3' : 'py-4'} font-semibold`}>{m.tamanho}</td>
              <td className={`${compacto ? 'py-3' : 'py-4'} text-ink-soft`}>{m.numeracao}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-muted">Na dúvida entre dois tamanhos, chame a Ju no WhatsApp que ela te ajuda.</p>
    </div>
  );
}
