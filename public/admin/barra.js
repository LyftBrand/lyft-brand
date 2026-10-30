// Barra do painel: contador de publicações do ciclo e botão "Colocar o site no ar".
// "Publicar" de cada produto só salva; o site muda quando alguém clica no botão desta barra.
(function () {
  const barra = document.createElement('div');
  barra.id = 'barra-publicar';
  barra.innerHTML = '<span class="info">Carregando publicações…</span><button type="button" disabled>Colocar o site no ar</button>';
  const info = barra.querySelector('.info');
  const botao = barra.querySelector('button');
  let dados = null;
  let timer = null;

  const data = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });

  async function chamar(metodo) {
    const user = window.netlifyIdentity && window.netlifyIdentity.currentUser();
    if (!user) return null;
    const token = await user.jwt();
    const r = await fetch('/api/painel', { method: metodo, headers: { authorization: 'Bearer ' + token } });
    const j = await r.json().catch(() => ({ erro: 'Resposta inválida' }));
    return j;
  }

  function mostrar(d) {
    dados = d;
    barra.className = '';
    if (!d) return;
    if (d.erro && d.publicadas === undefined) {
      info.textContent = 'Contador indisponível: ' + d.erro;
      botao.disabled = true;
      return;
    }
    const restam = d.limite - d.publicadas;
    const ciclo = `Publicações neste ciclo: <b>${d.publicadas} de ${d.limite}</b> · renova em ${data(d.renova)}`;
    let status;
    if (d.publicando) status = '<b>Publicando…</b> leva cerca de 1 minuto.';
    else if (d.esperando > 0) status = `<b>${d.esperando} ${d.esperando === 1 ? 'alteração salva esperando' : 'alterações salvas esperando'}</b>`;
    else status = 'Tudo no ar.';
    let aviso = '';
    if (restam <= 0) aviso = ' · Acabaram as publicações do mês. O que for salvo entra no ar na renovação.';
    else if (restam === 1) aviso = ' · Resta só 1 publicação até a renovação.';
    else if (restam <= 5) aviso = ` · Restam ${restam} publicações.`;

    info.innerHTML = `${status} · ${ciclo}${aviso}` + (d.erro ? ` · ${d.erro}` : '');
    if (restam <= 1) barra.className = 'perigo';
    else if (restam <= 5) barra.className = 'atencao';
    botao.disabled = d.publicando || d.esperando === 0 || restam <= 0;
  }

  async function atualizar() {
    try { mostrar(await chamar('GET')); } catch (e) { info.textContent = 'Contador indisponível.'; }
  }

  botao.addEventListener('click', async () => {
    if (!dados) return;
    const n = dados.esperando;
    const ok = window.confirm(`Colocar no ar ${n === 1 ? 'a alteração salva' : 'as ' + n + ' alterações salvas'}?\n\nIsso usa 1 das ${dados.limite} publicações do mês (restam ${dados.limite - dados.publicadas}).`);
    if (!ok) return;
    botao.disabled = true;
    info.textContent = 'Enviando…';
    try { mostrar(await chamar('POST')); } catch (e) { info.textContent = 'Não deu certo. Tente de novo em instantes.'; }
  });

  function iniciar() {
    if (!document.body.contains(barra)) document.body.appendChild(barra);
    atualizar();
    clearInterval(timer);
    timer = setInterval(() => { if (!document.hidden) atualizar(); }, 30000);
  }

  function ligar() {
    const id = window.netlifyIdentity;
    if (!id) return;
    id.on('init', (u) => u && iniciar());
    id.on('login', iniciar);
    id.on('logout', () => { clearInterval(timer); barra.remove(); });
    if (id.currentUser()) iniciar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar);
  else ligar();
})();
