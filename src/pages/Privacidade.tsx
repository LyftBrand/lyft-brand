import { useState } from 'react';
import { Check } from 'lucide-react';
import { config } from '../lib/content';
import { abrirCentralCookies } from '../lib/consent';
import { esquecerContato } from '../lib/lead';
import Seo from '../components/Seo';

function Bloco({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="py-10 md:py-12 border-t border-line grid md:grid-cols-[260px_1fr] gap-4 md:gap-12">
      <h2 className="display text-[26px] md:text-[30px] leading-tight"><span className="text-rose-deep italic mr-2">{String(n).padStart(2, '0')}</span>{titulo}</h2>
      <div className="text-[16px] leading-relaxed text-ink-soft flex flex-col gap-4">{children}</div>
    </section>
  );
}

const Item = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <li className="flex gap-3"><Check className="w-4 h-4 mt-1.5 shrink-0 text-rose-deep" /><span><strong className="font-semibold text-ink">{t}:</strong> {children}</span></li>
);

export default function Privacidade() {
  const [esquecido, setEsquecido] = useState(false);
  const email = config.email;

  return (
    <>
      <Seo title="Política de Privacidade" description="Como a Lyft coleta, usa e protege seus dados, em conformidade com a LGPD." />
      <section className="bg-nude">
        <div className="container-x max-w-4xl py-14 md:py-20">
          <p className="eyebrow text-rose-deep">LGPD · Lei nº 13.709/2018</p>
          <h1 className="display text-[42px] md:text-[64px] mt-4">Política de Privacidade <em className="italic text-rose-deep">e cookies</em></h1>
          <p className="mt-5 text-ink-soft max-w-2xl">Aqui explicamos, sem juridiquês, quais dados a Lyft coleta neste site, para que usa e como você pode pedir para ver, corrigir ou apagar suas informações.</p>
          <p className="mt-4 text-sm text-muted">Última atualização: outubro de 2026</p>
        </div>
      </section>

      <div className="container-x max-w-4xl pb-20">
        <Bloco n={1} titulo="Quem somos">
          <p>A <strong className="text-ink">Lyft</strong> é a marca de moda fitness de Juliana Colet. Somos responsáveis pelos dados pessoais tratados neste site, que funciona como catálogo: os pedidos são combinados pelo WhatsApp.</p>
          <p>Contato para assuntos de privacidade: <a href={`mailto:${email}`} className="text-ink underline underline-offset-2 break-all">{email}</a>.</p>
        </Bloco>

        <Bloco n={2} titulo="Dados que coletamos">
          <p>Quando você toca em um botão de WhatsApp e preenche o formulário, recebemos:</p>
          <ul className="flex flex-col gap-2">
            <Item t="Seus dados">nome, número de WhatsApp e e-mail.</Item>
            <Item t="O que você quer">a peça, a cor, o tamanho e a mensagem enviada.</Item>
            <Item t="De onde você veio">o link ou anúncio que te trouxe ao site (parâmetros UTM e identificadores de clique de anúncios), a página e a data e hora do contato.</Item>
            <Item t="Aparelho">se o acesso foi pelo celular ou pelo computador.</Item>
          </ul>
          <p>Durante a navegação, e só se você permitir nos cookies, ferramentas de medição registram páginas visitadas e cliques de forma agregada.</p>
        </Bloco>

        <Bloco n={3} titulo="Para que usamos">
          <ul className="flex flex-col gap-2">
            <Item t="Atender você">responder no WhatsApp, separar sua peça e combinar pagamento e envio (base legal: consentimento e procedimentos preliminares a um contrato).</Item>
            <Item t="Avisar sobre novidades e reposições">quando você pedir, ou para clientes que já falaram com a gente (base legal: consentimento e legítimo interesse). Você pode pedir para parar a qualquer momento.</Item>
            <Item t="Entender e melhorar">saber quais peças e anúncios funcionam melhor (base legal: legítimo interesse e consentimento para cookies).</Item>
            <Item t="Anúncios mais relevantes">usar seu e-mail e telefone, de forma criptografada (hash), para criar públicos no Meta e no Google: por exemplo, mostrar novidades a quem já falou com a Lyft ou deixar de mostrar anúncios a quem já é cliente. As plataformas só comparam os códigos criptografados, sem receber seus dados abertos (base legal: consentimento). Você pode pedir para sair desses públicos a qualquer momento.</Item>
          </ul>
          <p>Não vendemos seus dados.</p>
        </Bloco>

        <Bloco n={4} titulo="Onde os dados ficam">
          <p>Os contatos do formulário são gravados em uma planilha Google com acesso restrito à equipe da Lyft. O site é hospedado na Netlify e todo o tráfego é criptografado (HTTPS).</p>
          <p>Para você não precisar preencher de novo, seu nome, WhatsApp e e-mail ficam guardados <strong className="text-ink">só no seu aparelho</strong>. Você pode apagar quando quiser:</p>
          <div>
            <button className="btn btn-line !min-h-11" onClick={() => { esquecerContato(); setEsquecido(true); }} disabled={esquecido}>
              {esquecido ? 'Pronto, dados apagados deste aparelho' : 'Apagar meus dados deste aparelho'}
            </button>
          </div>
          <p>Também ficam só no seu aparelho: de onde veio a sua visita e o clique em anúncio que te trouxe (por até 90 dias), o cupom que você aplicou (até fechar o navegador) e as suas escolhas de cookies.</p>
          <p>Mantemos os dados enquanto forem necessários para o atendimento e o relacionamento com você, ou até você pedir a exclusão.</p>
          <p>Algumas ferramentas que usamos (Google, Meta, TikTok e Netlify) guardam dados em servidores fora do Brasil. Essa transferência segue as garantias exigidas pela LGPD (art. 33), por meio dos contratos e políticas de proteção de dados dessas empresas.</p>
        </Bloco>

        <Bloco n={5} titulo="Cookies">
          <p>Cookies são pequenos arquivos guardados no navegador. Usamos três tipos:</p>
          <ul className="flex flex-col gap-2">
            <Item t="Necessários">fazem o site funcionar e guardam suas escolhas. Sempre ativos.</Item>
            <Item t="Analíticos">contam visitas e cliques de forma agregada. Ferramenta: Google Analytics 4, instalado pelo Google Tag Manager. Cookies: _ga e _ga_* (até 2 anos).</Item>
            <Item t="Marketing">medem e direcionam anúncios. Ferramentas e cookies: Google Ads (_gcl_au, até 90 dias), Meta Pixel do Instagram e Facebook (_fbp e _fbc, até 90 dias) e TikTok Pixel (_ttp, até 13 meses).</Item>
          </ul>
          <p>Analíticos e de marketing só funcionam se você permitir. Usamos o Modo de Consentimento do Google: enquanto você não aceitar, essas ferramentas não gravam cookies no seu navegador. Você pode mudar sua escolha a qualquer momento:</p>
          <div><button className="btn btn-dark !min-h-11" onClick={abrirCentralCookies}>Preferências de cookies</button></div>
        </Bloco>

        <Bloco n={6} titulo="Com quem compartilhamos">
          <p>Somente com as ferramentas necessárias para o site e o atendimento funcionarem: Google (planilha, Tag Manager e Analytics), Netlify (hospedagem), WhatsApp (conversa) e, se você permitir os cookies de marketing, Meta, Google Ads e TikTok. Os públicos de anúncios do item 3 usam apenas dados criptografados.</p>
        </Bloco>

        <Bloco n={7} titulo="Seus direitos">
          <p>Pela LGPD (art. 18), você pode pedir gratuitamente para:</p>
          <ul className="flex flex-col gap-2">
            <Item t="Acessar">saber quais dados temos sobre você.</Item>
            <Item t="Corrigir">atualizar dados errados ou incompletos.</Item>
            <Item t="Apagar">excluir seus dados ou revogar o consentimento.</Item>
            <Item t="Parar contatos">deixar de receber mensagens sobre novidades.</Item>
          </ul>
          <p>É só escrever para <a href={`mailto:${email}`} className="text-ink underline underline-offset-2 break-all">{email}</a> ou mandar uma mensagem no WhatsApp.</p>
        </Bloco>

        <Bloco n={8} titulo="Mudanças nesta política">
          <p>Se mudarmos a forma de usar seus dados, atualizamos esta página e a data no topo.</p>
        </Bloco>
      </div>
    </>
  );
}
