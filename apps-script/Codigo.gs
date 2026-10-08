/**
 * Lyft · Captura de contatos do site → Google Sheets
 * Instalação: veja LEIA-ME.md nesta mesma pasta.
 *
 * Segurança:
 * - A planilha continua privada. O App da Web só ACEITA dados (doPost); ninguém consegue LER a planilha por ele.
 * - Campo-isca contra robôs, limites de tamanho, validação de nome e WhatsApp.
 * - Limite de 6 envios por WhatsApp a cada 10 minutos (evita spam e planilha lotada).
 * - Textos começando com = + - @ são gravados como texto puro (bloqueia injeção de fórmulas).
 * - LockService evita que dois envios ao mesmo tempo se sobreponham.
 */

// E-mail que recebe um aviso a cada novo contato. Deixe '' para não avisar.
var NOTIFICAR_EMAIL = '';

var ABA_PEDIDOS = 'Contatos WhatsApp';
var ABA_REPOSICAO = 'Avise-me (reposição)';

var COLUNAS = [
  ['data_hora', 'Data e hora'],
  ['nome', 'Nome'],
  ['whatsapp', 'WhatsApp'],
  ['email', 'E-mail'],
  ['produto', 'Produto'],
  ['cor', 'Cor'],
  ['tamanho', 'Tamanho'],
  ['preco', 'Preço'],
  ['origem_botao', 'Botão clicado'],
  ['mensagem', 'Mensagem enviada'],
  ['cupom', 'Cupom'],
  ['utm_source', 'UTM Source'],
  ['utm_medium', 'UTM Medium'],
  ['utm_campaign', 'UTM Campaign'],
  ['utm_content', 'UTM Content'],
  ['utm_term', 'UTM Term'],
  ['fbclid', 'fbclid (Meta)'],
  ['gclid', 'gclid (Google)'],
  ['ttclid', 'ttclid (TikTok)'],
  ['referrer', 'Veio de (site)'],
  ['primeira_origem', 'Primeira origem'],
  ['primeira_visita', 'Primeira visita'],
  ['url_produto', 'Link do produto'],
  ['pagina', 'Página'],
  ['dispositivo', 'Dispositivo'],
  ['consentimento_lgpd', 'Aceite LGPD'],
  ['cookies_marketing', 'Aceitou cookies de marketing']
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (d.site) return resposta(true, 'ignorado');                         // robô preencheu o campo-isca
    var nome = limpar(d.nome, 80);
    var whats = limpar(d.whatsapp, 20);
    var digitos = whats.replace(/\D/g, '');
    if (nome.length < 2 || digitos.length < 10 || digitos.length > 13) return resposta(false, 'dados inválidos');
    if (d.consentimento_lgpd !== 'Sim') return resposta(false, 'sem consentimento');

    var cache = CacheService.getScriptCache();
    var chave = 'lim_' + digitos;
    var n = Number(cache.get(chave) || 0);
    if (n >= 6) return resposta(false, 'muitos envios');
    cache.put(chave, String(n + 1), 600);

    lock.waitLock(10000);
    var aba = obterAba(d.origem_botao === 'reposicao' ? ABA_REPOSICAO : ABA_PEDIDOS);
    var linha = COLUNAS.map(function (c) {
      var limite = c[0] === 'mensagem' || c[0] === 'pagina' || c[0] === 'url_produto' || c[0] === 'referrer' ? 500 : 150;
      return seguro(limpar(d[c[0]], limite));
    });
    aba.appendRow(linha);

    if (NOTIFICAR_EMAIL) {
      MailApp.sendEmail(NOTIFICAR_EMAIL, 'Novo contato no site Lyft: ' + nome,
        nome + ' · ' + whats + '\n' + (d.produto ? d.produto + ' · ' + (d.cor || '') + ' · ' + (d.tamanho || '') + '\n' : '') +
        'Origem: ' + (d.utm_source || d.referrer || 'direto'));
    }
    return resposta(true, aba.getName());
  } catch (err) {
    return resposta(false, String(err));
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() {
  return ContentService.createTextOutput('Lyft: captura de contatos funcionando.');
}

function obterAba(nome) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS.map(function (c) { return c[1]; }));
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold').setBackground('#EDE5DE');
    aba.setFrozenRows(1);
  }
  return aba;
}

function limpar(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

// Impede que um texto vire fórmula na planilha (ex.: "=HYPERLINK(...)").
function seguro(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function resposta(ok, info) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok, info: info })).setMimeType(ContentService.MimeType.JSON);
}

// Rode esta função uma vez pelo editor para autorizar o script e criar as abas.
function configurarPlanilha() {
  obterAba(ABA_PEDIDOS);
  obterAba(ABA_REPOSICAO);
}
