// Foto do iPhone (HEIC) vira JPG no navegador antes de o painel enviar.
// Assim a miniatura aparece no painel e o arquivo salvo já é JPG.
// Funciona no botão de escolher arquivo e ao arrastar fotos para a biblioteca de mídia.
(function () {
  const LIB = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
  const ehHeic = (f) => /\.(heic|heif)$/i.test(f.name) || /image\/hei[cf]/i.test(f.type);
  let carregando = null;

  function carregarLib() {
    if (window.heic2any) return Promise.resolve();
    carregando = carregando || new Promise((ok, erro) => {
      const s = document.createElement('script');
      s.src = LIB;
      s.onload = ok;
      s.onerror = () => { carregando = null; erro(new Error('não carregou o conversor')); };
      document.head.appendChild(s);
    });
    return carregando;
  }

  function aviso(texto) {
    let el = document.getElementById('aviso-heic');
    if (!texto) { el && el.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.id = 'aviso-heic';
      el.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:10000;background:#2b2523;color:#f6efea;padding:10px 18px;border-radius:999px;font:14px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.2)';
      document.body.appendChild(el);
    }
    el.textContent = texto;
  }

  async function converter(arquivos) {
    await carregarLib();
    const saida = [];
    for (const f of arquivos) {
      if (!ehHeic(f)) { saida.push(f); continue; }
      const r = await window.heic2any({ blob: f, toType: 'image/jpeg', quality: 0.88 });
      const blob = Array.isArray(r) ? r[0] : r;
      saida.push(new File([blob], f.name.replace(/\.(heic|heif)$/i, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() }));
    }
    const dt = new DataTransfer();
    saida.forEach((f) => dt.items.add(f));
    return dt;
  }

  // Botão de escolher arquivo: segura o evento, converte e devolve ao painel já com JPG.
  document.addEventListener('change', async (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file' || input.dataset.convertido) return;
    const lista = [...(input.files || [])];
    if (!lista.some(ehHeic)) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    try {
      aviso('Convertendo foto do iPhone para JPG…');
      input.files = (await converter(lista)).files;
    } catch (err) {
      aviso('Não deu para converter a foto. Ela será enviada como está.');
      setTimeout(() => aviso(''), 4000);
    }
    aviso('');
    input.dataset.convertido = '1';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    delete input.dataset.convertido;
  }, true);

  // Arrastar fotos para o painel.
  document.addEventListener('drop', async (e) => {
    if (e.__convertido || !e.dataTransfer) return;
    const lista = [...e.dataTransfer.files];
    if (!lista.some(ehHeic)) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const alvo = e.target;
    try {
      aviso('Convertendo foto do iPhone para JPG…');
      const dt = await converter(lista);
      aviso('');
      const novo = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
      novo.__convertido = true;
      alvo.dispatchEvent(novo);
    } catch (err) {
      aviso('Não deu para converter a foto. Tente escolher pelo botão.');
      setTimeout(() => aviso(''), 4000);
    }
  }, true);
})();
