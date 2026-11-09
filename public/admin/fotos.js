// Prepara as fotos no navegador antes de o painel enviar:
// - HEIC (iPhone) vira JPG, para a miniatura aparecer no painel e no site;
// - foto com mais de 2000 px no lado maior é reduzida para 2000 px (envio mais rápido, repositório leve).
// O site ainda otimiza tudo na publicação (scripts/otimizar-uploads.mjs) e na entrega (Netlify Image CDN).
// Funciona no botão de escolher arquivo e ao arrastar fotos para a biblioteca de mídia.
(function () {
  const LADO_MAX = 2000;
  const QUALIDADE = 0.86;
  const LIB_HEIC = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
  const ehHeic = (f) => /\.(heic|heif)$/i.test(f.name) || /image\/hei[cf]/i.test(f.type);
  const ehFoto = (f) => ehHeic(f) || /^image\/(jpeg|png|webp)$/i.test(f.type);
  let carregando = null;

  function carregarHeic() {
    if (window.heic2any) return Promise.resolve();
    carregando = carregando || new Promise((ok, erro) => {
      const s = document.createElement('script');
      s.src = LIB_HEIC;
      s.onload = ok;
      s.onerror = () => { carregando = null; erro(new Error('não carregou o conversor')); };
      document.head.appendChild(s);
    });
    return carregando;
  }

  function aviso(texto) {
    let el = document.getElementById('aviso-fotos');
    if (!texto) { el && el.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.id = 'aviso-fotos';
      el.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:10000;background:#2b2523;color:#f6efea;padding:10px 18px;border-radius:999px;font:14px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.2)';
      document.body.appendChild(el);
    }
    el.textContent = texto;
  }

  const semExtensao = (nome) => nome.replace(/\.[^.]+$/, '');

  /** Reduz para no máximo 2000 px. PNG continua PNG (pode ter fundo transparente); o resto vira JPG. */
  async function reduzir(arquivo) {
    const bmp = await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
    const escala = Math.min(1, LADO_MAX / Math.max(bmp.width, bmp.height));
    const png = arquivo.type === 'image/png';
    if (escala === 1 && arquivo.type === 'image/jpeg') { bmp.close(); return arquivo; }
    if (escala === 1 && png) { bmp.close(); return arquivo; }
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * escala);
    c.height = Math.round(bmp.height * escala);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close();
    const tipo = png ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((ok) => c.toBlob(ok, tipo, QUALIDADE));
    if (!blob || (escala === 1 && blob.size >= arquivo.size)) return arquivo;
    return new File([blob], semExtensao(arquivo.name) + (png ? '.png' : '.jpg'), { type: tipo, lastModified: Date.now() });
  }

  async function preparar(arquivo) {
    let f = arquivo;
    if (ehHeic(f)) {
      await carregarHeic();
      const r = await window.heic2any({ blob: f, toType: 'image/jpeg', quality: 0.92 });
      f = new File([Array.isArray(r) ? r[0] : r], semExtensao(f.name) + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });
    }
    try { return await reduzir(f); } catch { return f; }
  }

  async function prepararTodos(lista) {
    const dt = new DataTransfer();
    for (const f of lista) dt.items.add(ehFoto(f) ? await preparar(f) : f);
    return dt;
  }

  const textoAviso = (lista) => (lista.some(ehHeic) ? 'Convertendo foto do iPhone para JPG…' : 'Preparando foto…');

  // Botão de escolher arquivo: segura o evento, prepara e devolve ao painel.
  document.addEventListener('change', async (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file' || input.dataset.preparado) return;
    const lista = [...(input.files || [])];
    if (!lista.some(ehFoto)) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    try {
      aviso(textoAviso(lista));
      input.files = (await prepararTodos(lista)).files;
      aviso('');
    } catch (err) {
      aviso('Não deu para preparar a foto. Ela será enviada como está.');
      setTimeout(() => aviso(''), 4000);
    }
    input.dataset.preparado = '1';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    delete input.dataset.preparado;
  }, true);

  // Arrastar fotos para o painel.
  document.addEventListener('drop', async (e) => {
    if (e.__preparado || !e.dataTransfer) return;
    const lista = [...e.dataTransfer.files];
    if (!lista.some(ehFoto)) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const alvo = e.target;
    let dt = e.dataTransfer;
    try {
      aviso(textoAviso(lista));
      dt = await prepararTodos(lista);
      aviso('');
    } catch (err) {
      aviso('Não deu para preparar a foto. Ela será enviada como está.');
      setTimeout(() => aviso(''), 4000);
    }
    const novo = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
    novo.__preparado = true;
    alvo.dispatchEvent(novo);
  }, true);
})();
