// Função do painel /admin (só para quem está logado no painel).
// GET: quantas publicações o ciclo de créditos já usou e quantas alterações salvas estão esperando.
// POST: coloca o site no ar (uma publicação = 15 créditos).
// Variáveis de ambiente na Netlify: NETLIFY_TOKEN (token pessoal) e BUILD_HOOK_URL (build hook).

const DIA_RENOVA = 9; // o ciclo do plano começa todo dia 9
const LIMITE = 20; // 300 créditos ÷ 15 por publicação
const EM_ANDAMENTO = ['new', 'pending_review', 'accepted', 'enqueued', 'building', 'uploading', 'uploaded', 'preparing', 'prepared', 'processing'];

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function cicloAtual(agora = new Date()) {
  const ano = agora.getUTCFullYear();
  const mes = agora.getUTCMonth() - (agora.getUTCDate() < DIA_RENOVA ? 1 : 0);
  return { inicio: new Date(Date.UTC(ano, mes, DIA_RENOVA)), renova: new Date(Date.UTC(ano, mes + 1, DIA_RENOVA)) };
}

async function usuario(req) {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const r = await fetch(new URL('/.netlify/identity/user', req.url), { headers: { authorization: auth } });
  return r.ok ? r.json() : null;
}

async function situacao(siteId) {
  const r = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys?per_page=100`, {
    headers: { authorization: `Bearer ${process.env.NETLIFY_TOKEN}` },
  });
  if (!r.ok) throw new Error(`Netlify respondeu ${r.status}`);
  const deploys = (await r.json()).filter((d) => d.context === 'production');
  const { inicio, renova } = cicloAtual();

  // A lista vem da mais nova para a mais antiga.
  const iNoAr = deploys.findIndex((d) => d.state === 'ready');
  const noAr = deploys[iNoAr];
  const depois = iNoAr < 0 ? deploys : deploys.slice(0, iNoAr);
  return {
    publicadas: deploys.filter((d) => d.state === 'ready' && new Date(d.created_at) >= inicio).length,
    limite: LIMITE,
    renova: renova.toISOString(),
    esperando: new Set(depois.filter((d) => !EM_ANDAMENTO.includes(d.state)).map((d) => d.commit_ref)).size,
    publicando: depois.some((d) => EM_ANDAMENTO.includes(d.state)),
    no_ar_desde: noAr?.published_at ?? noAr?.created_at ?? null,
  };
}

export default async (req, context) => {
  const quem = await usuario(req);
  if (!quem) return json({ erro: 'Entre no painel para ver isto.' }, 401);
  if (!process.env.NETLIFY_TOKEN) return json({ erro: 'Falta configurar NETLIFY_TOKEN na Netlify.' }, 500);

  try {
    const s = await situacao(context.site.id);
    if (req.method !== 'POST') return json(s);

    if (!process.env.BUILD_HOOK_URL) return json({ erro: 'Falta configurar BUILD_HOOK_URL na Netlify.' }, 500);
    if (s.publicando) return json({ ...s, erro: 'Já tem uma publicação em andamento.' }, 409);
    if (s.publicadas >= s.limite) return json({ ...s, erro: 'As publicações deste ciclo acabaram.' }, 409);

    const titulo = encodeURIComponent(`Painel: colocado no ar por ${quem.email}`);
    const r = await fetch(`${process.env.BUILD_HOOK_URL}?trigger_title=${titulo}`, { method: 'POST' });
    if (!r.ok) return json({ ...s, erro: `A Netlify recusou (${r.status}).` }, 502);
    return json({ ...s, publicando: true });
  } catch (e) {
    return json({ erro: e.message }, 502);
  }
};

export const config = { path: '/api/painel' };
