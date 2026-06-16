// ═══════════════════════════════════════════════════════
//  LYFT BRAND — Apps Script
//  Cole este código em: Extensions > Apps Script
//  Depois: Deploy > New Deployment > Web App
//  Execute as: Me | Who has access: Anyone
// ═══════════════════════════════════════════════════════

const SHEET_LEADS   = 'Leads WA';
const SHEET_VIP     = 'Grupo VIP';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss   = SpreadsheetApp.getActiveSpreadsheet();

    if (data.tipo === 'lead_wa') {
      salvarLead(ss, data);
    } else if (data.tipo === 'grupo_vip') {
      salvarVIP(ss, data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, erro: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function salvarLead(ss, data) {
  let sheet = ss.getSheetByName(SHEET_LEADS);

  // Cria aba se não existir e adiciona cabeçalho
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_LEADS);
    sheet.appendRow([
      'Data/Hora', 'Nome', 'E-mail', 'Telefone/WA',
      'Produto', 'Cor', 'Tamanho', 'Cupom',
      'UTM Source', 'UTM Medium', 'UTM Campaign',
      'URL de origem'
    ]);
    // Formata cabeçalho
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#1A1614').setFontColor('#FAF8F5');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    data.nome       || '',
    data.email      || '',
    data.telefone   || '',
    data.produto    || '',
    data.cor        || '',
    data.tamanho    || '',
    data.cupom      || '',
    data.utm_source   || '',
    data.utm_medium   || '',
    data.utm_campaign || '',
    data.url          || ''
  ]);
}

function salvarVIP(ss, data) {
  let sheet = ss.getSheetByName(SHEET_VIP);

  // Cria aba se não existir e adiciona cabeçalho
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_VIP);
    sheet.appendRow([
      'Data/Hora', 'Nome', 'E-mail', 'Telefone/WA',
      'UTM Source', 'UTM Medium', 'UTM Campaign',
      'URL de origem'
    ]);
    // Formata cabeçalho
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#6B7B5E').setFontColor('#FAF8F5');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    data.nome       || '',
    data.email      || '',
    data.telefone   || '',
    data.utm_source   || '',
    data.utm_medium   || '',
    data.utm_campaign || '',
    data.url          || ''
  ]);
}

// Teste via GET (abre no browser para verificar se está funcionando)
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Lyft Brand Script ativo ✓' }))
    .setMimeType(ContentService.MimeType.JSON);
}
