# Planilha de contatos do site Lyft

Cada vez que alguém preenche o formulário antes do WhatsApp, uma linha é gravada numa planilha Google com nome, WhatsApp, e-mail, produto, cor, tamanho, mensagem, UTMs e de onde a pessoa veio.

Pedidos de reposição ("Avisar quando repor") vão para uma aba separada, que vira a lista de quem avisar quando a peça chegar.

## Instalar (uma vez, uns 5 minutos)

1. Crie uma planilha nova no Google Sheets, com a conta Google da Lyft. Exemplo de nome: **Lyft · Contatos do site**.
2. No menu da planilha, abra **Extensões → Apps Script**.
3. Apague o que estiver lá, cole todo o conteúdo de `Codigo.gs` e salve.
4. Se quiser receber um e-mail a cada contato, preencha `NOTIFICAR_EMAIL` no começo do código.
5. No seletor de funções, escolha **configurarPlanilha** e clique em **Executar**. Autorize o acesso quando o Google pedir. As duas abas são criadas.
6. Clique em **Implantar → Nova implantação → App da Web**:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
7. Copie a URL que termina em `/exec`.
8. No painel do site (`/admin`), abra **Textos e contatos → Configurações do site**, cole a URL em **Endereço da planilha** e clique em **Publicar**.

"Qualquer pessoa" significa apenas que o site pode **enviar** dados para o script. A planilha continua privada: só quem você compartilhar consegue abrir.

## Se mudar o código depois

Use **Implantar → Gerenciar implantações → editar → Nova versão**. Assim a URL continua a mesma e não precisa mexer no site.

## Desligar o formulário

Se o formulário estiver fazendo clientes desistirem, desmarque **Pedir nome e WhatsApp antes de abrir o WhatsApp** no painel. O botão volta a abrir o WhatsApp direto.
