# Plano de tagueamento: Lyft (GA4 agora, Meta Pixel depois)

**Site:** lyftbrand.netlify.app (React pré-renderizado, painel Decap)
**GTM:** `GTM-PSDQSDPG` (já carregado pelo site; ID no painel → Configurações do site)
**GA4:** `G-__________` (preencher ao criar a propriedade)
**Meta Pixel:** a criar (etapa 2)
**Código dos eventos:** `src/lib/rastreio.ts` (helpers), `src/components/Lead.tsx` (lead), `src/components/ProductCard.tsx`, `src/pages/*`
**Plano escrito em:** 09/11/2026

---

## 1. Como a medição funciona

O site é nosso, então ele mesmo empurra cada evento para a camada de dados (`dataLayer`) com todos os detalhes: qual botão, em que página, que produto, cor, tamanho, cupom. **O GTM não precisa "descobrir" nada na página.** Ele só repassa para o GA4 (e depois para o Meta).

Regra principal: **um evento de conversão só (`generate_lead`)**, com o botão e o produto como parâmetros. A separação por produto, botão ou cupom é feita nos **relatórios**, não criando uma conversão para cada coisa. Assim a conversão junta volume suficiente para otimizar anúncios.

### Os caminhos até o WhatsApp

| Botão | `botao` | Onde aparece | `tipo_lead` |
|---|---|---|---|
| Pedir pelo WhatsApp (página do produto) | `produto` | produto com estoque | `pedido` |
| Avisar quando repor | `reposicao` | cor esgotada | `reposicao` |
| Flutuante verde "Fale com a Ju" | `flutuante` | todas as páginas | `duvida_produto` na página de produto, senão `contato` |
| Fale com a Ju (topo) | `topo` | todas | idem |
| Menu do celular | `menu` | todas | idem |
| Rodapé | `rodape` | todas | idem |
| Botão do topo da página inicial | `inicio` | início | `contato` |
| Chamada "Quer ajuda para montar seu look?" | `chamada` | início, catálogo, marca | `contato` |

`pagina_tipo` diz em que página o clique aconteceu: `inicio`, `catalogo`, `produto`, `marca`, `privacidade`.

### Quando a conversão conta

1. A cliente toca num botão de WhatsApp → `whatsapp_click`.
2. Se é a primeira vez, abre o formulário → `lead_form_open`.
3. Ela preenche e envia → **`generate_lead`** (`forma_lead = formulario`) e o WhatsApp abre.
4. Se ela já preencheu antes (fica salvo no aparelho), o formulário não abre: o toque já gera **`generate_lead`** (`forma_lead = direto`).
5. Se o formulário estiver desligado no painel: **`generate_lead`** com `forma_lead = sem_formulario`.

Formulário aberto e abandonado **não** gera lead (só `lead_form_open`). Um toque = um lead.

---

## 2. Eventos que o site envia

### Navegação e produto (formato de e-commerce do GA4)

| Evento | Quando | Dados |
|---|---|---|
| `page_view` | toda troca de página, inclusive a primeira | `page_location`, `page_title`, `page_path`, `pagina_tipo` |
| `view_item_list` | uma vitrine de produtos aparece | `item_list_name`: `inicio_mais_amados`, `catalogo`, `catalogo_conjuntos` (filtrado), `relacionados` · `ecommerce.items` |
| `select_item` | clicou num produto de uma vitrine | `item_list_name`, posição (`index`), produto e cor no `ecommerce.items` |
| `view_item` | abriu a página de um produto | `ecommerce.value` (preço), `ecommerce.items` (id, nome, categoria, cor, preço) |

### Interações

| Evento | Quando | Parâmetros |
|---|---|---|
| `select_item_variant` | trocou a cor na página do produto | `item_id`, `produto`, `produto_categoria`, `cor`, `esgotada` |
| `escolher_tamanho` | escolheu um tamanho | `item_id`, `produto`, `produto_categoria`, `cor`, `tamanho` |
| `whatsapp_click` | tocou em qualquer botão de WhatsApp | ver "parâmetros do pedido" abaixo |
| `lead_form_open` | o formulário abriu | ver "parâmetros do pedido" |
| **`generate_lead`** | **foi para o WhatsApp (conversão)** | parâmetros do pedido + `forma_lead`, `event_id`, `user_data`* |
| `cupom_informado` | aplicou um cupom (só quando o cupom muda) | `cupom`, `cupom_local`: `produto`, `formulario`, `faixa_topo`, `link` |
| `filter_produtos` | filtrou o catálogo | `produto_categoria` (ou `Todas`) |
| `share` | compartilhou/copiou o link da peça | `method` (`compartilhar`/`copiar_link`), `item_id`, `produto` |
| `click_instagram` | tocou no Instagram | `botao` (`topo`, `inicio`) |
| `voltar_ao_topo` | usou a seta de voltar ao topo | `profundidade` |
| `cookie_consent_update` | escolheu os cookies | `analiticos`, `marketing` |

**Parâmetros do pedido** (iguais em `whatsapp_click`, `lead_form_open` e `generate_lead`):
`botao`, `pagina_tipo`, `tipo_lead`, `produto`, `produto_categoria`, `item_id`, `cor`, `tamanho`, `cupom`, e `value` + `currency` (`BRL`) quando há produto.

\* `user_data` (e-mail e telefone em `+55…`) **só vai quando a cliente aceitou cookies de marketing**. O GA4 não usa; fica pronto para o Google Ads (conversões otimizadas) e para o Meta (correspondência avançada). `event_id` é único por lead, para o Meta não contar duas vezes no futuro.

### Exemplo real (testado em 09/11/2026)

```json
{
  "event": "generate_lead",
  "botao": "produto", "pagina_tipo": "produto", "tipo_lead": "pedido",
  "produto": "Conjunto Aura", "produto_categoria": "Conjuntos", "item_id": "conjunto-aura",
  "cor": "Preto", "tamanho": "M", "cupom": "",
  "value": 239.9, "currency": "BRL",
  "forma_lead": "formulario", "event_id": "5ce5e025-…"
}
```

```json
{
  "event": "generate_lead",
  "botao": "flutuante", "pagina_tipo": "catalogo", "tipo_lead": "contato",
  "produto": "", "cupom": "TESTE10", "forma_lead": "direto", "event_id": "6799025b-…"
}
```

### Por que o valor é o preço da peça (e não um valor fixo)

Os preços da Lyft ficam numa faixa estreita (≈ R$ 150 a R$ 300), então o preço da peça pedida é uma boa estimativa do que o lead vale. Lead sem produto (botão geral) vai **sem valor**, de propósito: não sabemos o que a cliente vai pedir. Não é erro; não "corrigir" colocando um número inventado.

---

## 3. Passo a passo no GA4 (criar a propriedade)

1. **analytics.google.com → Administrador → Criar → Propriedade**
   - Nome: `Lyft`, fuso: **(GMT-03:00) Brasília**, moeda: **Real (BRL)**.
   - Setor: Compras/Vestuário; objetivos: "Gerar leads".
2. **Coleta de dados → Web**: URL `lyftbrand.netlify.app`, nome do fluxo `Site Lyft`.
3. Copie o **ID da métrica** (`G-XXXXXXX`) e anote no topo deste documento.
4. Ainda no fluxo, em **Medição otimizada → engrenagem**:
   - **Visualizações de página → Configurações avançadas → desmarque "Mudanças de página baseadas em eventos do histórico de navegação"**. O site já envia o `page_view` certo; deixar ligado duplica.
   - **Desligue "Interações com formulários"** (geraria `form_start`/`form_submit` soltos no formulário e no campo de cupom; o nosso `generate_lead` já mede isso melhor).
   - Pode deixar: rolagens, cliques de saída, downloads de arquivos.
5. **Administrador → Coleta e retenção de dados → Retenção de dados**: mude para **14 meses**. O padrão é 2 meses e apaga dados das explorações.
6. **Administrador → Fluxos de dados → Site Lyft → Configurar definições da tag → Definir tráfego interno**: cadastre o IP da sua casa/escritório e o da Ju, se quiser, para os testes não sujarem os dados. Depois, em **Filtros de dados**, ative o filtro "Internal Traffic".

---

## 4. Passo a passo no GTM

Entre em **tagmanager.google.com → contêiner `GTM-PSDQSDPG` → Espaço de trabalho**.

### 4.1 Variáveis

**Variáveis → Variáveis definidas pelo usuário → Nova → Variável da camada de dados** (versão 2). O nome do campo "Nome da variável da camada de dados" é exatamente o da coluna "Chave". Use o mesmo texto com o prefixo `DL - ` no nome da variável:

| Nome no GTM | Chave na camada de dados |
|---|---|
| `DL - botao` | `botao` |
| `DL - pagina_tipo` | `pagina_tipo` |
| `DL - tipo_lead` | `tipo_lead` |
| `DL - forma_lead` | `forma_lead` |
| `DL - produto` | `produto` |
| `DL - produto_categoria` | `produto_categoria` |
| `DL - item_id` | `item_id` |
| `DL - cor` | `cor` |
| `DL - tamanho` | `tamanho` |
| `DL - cupom` | `cupom` |
| `DL - cupom_local` | `cupom_local` |
| `DL - value` | `value` |
| `DL - currency` | `currency` |
| `DL - event_id` | `event_id` |
| `DL - item_list_name` | `item_list_name` |
| `DL - page_location` | `page_location` |
| `DL - page_title` | `page_title` |
| `DL - method` | `method` |
| `DL - esgotada` | `esgotada` |

Depois crie uma variável que junta tudo, para não repetir parâmetro em cada tag:

**Nova → Configurações de evento do Google** (tipo "Google Tag: Event Settings"), nome `GA4 - parâmetros Lyft`. Em **Parâmetros de evento**, adicione uma linha por item:

| Parâmetro | Valor |
|---|---|
| `botao` | `{{DL - botao}}` |
| `pagina_tipo` | `{{DL - pagina_tipo}}` |
| `tipo_lead` | `{{DL - tipo_lead}}` |
| `forma_lead` | `{{DL - forma_lead}}` |
| `produto` | `{{DL - produto}}` |
| `produto_categoria` | `{{DL - produto_categoria}}` |
| `item_id` | `{{DL - item_id}}` |
| `cor` | `{{DL - cor}}` |
| `tamanho` | `{{DL - tamanho}}` |
| `cupom` | `{{DL - cupom}}` |
| `cupom_local` | `{{DL - cupom_local}}` |
| `value` | `{{DL - value}}` |
| `currency` | `{{DL - currency}}` |
| `method` | `{{DL - method}}` |
| `esgotada` | `{{DL - esgotada}}` |

Parâmetro vazio (o evento não tem aquele dado) não é enviado ao GA4. Não precisa se preocupar.

### 4.2 Acionadores

**Acionadores → Novo → Evento personalizado**:

| Nome | Nome do evento | Regex? |
|---|---|---|
| `CE - page_view` | `page_view` | não |
| `CE - ecommerce` | `^(view_item_list\|select_item\|view_item)$` | **sim** |
| `CE - interacoes` | `^(select_item_variant\|escolher_tamanho\|whatsapp_click\|lead_form_open\|cupom_informado\|filter_produtos\|share\|click_instagram\|voltar_ao_topo)$` | **sim** |
| `CE - generate_lead` | `generate_lead` | não |

(No GTM, digite as barras `|` sem a contrabarra; ela só aparece aqui por causa da tabela.)

### 4.3 Tags

**1. `GA4 - Tag do Google`**
- Tipo: **Tag do Google** · ID: `G-XXXXXXX`
- **Configurações → Parâmetro de configuração**: `send_page_view` = `false` (quem manda o page_view é a tag 2)
- Acionador: **Initialization - All Pages**

**2. `GA4 - page_view`**
- Tipo: **Google Analytics: evento do GA4** · ID: `G-XXXXXXX` · Nome do evento: `page_view`
- Parâmetros: `page_location` = `{{DL - page_location}}`, `page_title` = `{{DL - page_title}}`, `pagina_tipo` = `{{DL - pagina_tipo}}`
- Acionador: `CE - page_view`

**3. `GA4 - ecommerce`**
- Tipo: evento do GA4 · ID `G-XXXXXXX` · Nome do evento: `{{Event}}`
- Parâmetros: `pagina_tipo` = `{{DL - pagina_tipo}}`, `item_list_name` = `{{DL - item_list_name}}`
- **Mais configurações → Enviar dados de comércio eletrônico** ✔ · Origem: **Camada de dados**
- Acionador: `CE - ecommerce`

**4. `GA4 - interações`**
- Tipo: evento do GA4 · ID `G-XXXXXXX` · Nome do evento: `{{Event}}`
- Configurações de evento: `{{GA4 - parâmetros Lyft}}`
- (Não marcar "Enviar dados de comércio eletrônico": senão os produtos da última página vão junto em todo clique.)
- Acionador: `CE - interacoes`

**5. `GA4 - generate_lead` (conversão)**
- Tipo: evento do GA4 · ID `G-XXXXXXX` · Nome do evento: `generate_lead`
- Configurações de evento: `{{GA4 - parâmetros Lyft}}`
- Acionador: `CE - generate_lead`

Se a variável `{{Event}}` não aparecer na lista: **Variáveis → Variáveis integradas → Configurar → marcar "Event"**.

**Consentimento:** não precisa mexer. O site já manda o Consent Mode v2 (tudo negado até a pessoa aceitar) e as tags do Google respeitam sozinhas. Quem recusa cookies continua contando de forma anônima e modelada pelo Google.

### 4.4 Testar antes de publicar

1. No GTM, clique em **Visualizar** e abra `https://lyftbrand.netlify.app`. Teste numa **janela anônima, sem bloqueador de anúncios**: o bloqueador faz tudo parecer quebrado.
2. **Aceite os cookies** no aviso do site (sem isso o GA4 não grava cookie e o DebugView fica vazio).
3. Faça o roteiro:
   - página inicial → `page_view` + `view_item_list` (`inicio_mais_amados`)
   - clique numa peça → `select_item` → `page_view` → `view_item`
   - troque a cor → `select_item_variant`; escolha tamanho → `escolher_tamanho`
   - "Tenho um cupom" → digite `TESTE` → Aplicar → `cupom_informado` (`cupom_local = produto`)
   - **Pedir pelo WhatsApp** → `whatsapp_click` → `lead_form_open` → preencha → `generate_lead`
   - volte, toque no botão verde flutuante → `whatsapp_click` + `generate_lead` com `botao = flutuante`, `forma_lead = direto`
4. Em cada evento, confira no Tag Assistant: a tag certa disparou **uma vez**, e na aba **Camada de dados** os valores estão preenchidos.
5. Em paralelo, **GA4 → Administrador → DebugView** mostra os eventos chegando com os parâmetros.
6. Tudo certo → **Enviar → Nome da versão: "GA4 v1 – eventos Lyft" → Publicar**.

Os testes vão gerar linhas na planilha de contatos com o nome que você usar. Use "Teste Dárcio" e apague depois.

---

## 5. Depois de publicar, no GA4

### 5.1 Conversão
**Administrador → Exibição de dados → Eventos**: quando `generate_lead` aparecer na lista (até 24 h depois do primeiro lead), marque **"Marcar como evento principal"**.

### 5.2 Dimensões personalizadas
**Administrador → Exibição de dados → Definições personalizadas → Criar dimensão personalizada**, escopo **Evento**. Nome igual ao parâmetro:

| Nome da dimensão | Parâmetro do evento | Para quê |
|---|---|---|
| Botão | `botao` | qual botão gera mais lead |
| Tipo de página | `pagina_tipo` | de qual página sai o lead |
| Tipo de lead | `tipo_lead` | pedido × dúvida × reposição × contato |
| Forma do lead | `forma_lead` | formulário × direto (cliente que volta) |
| Produto | `produto` | quais peças geram pedido |
| Categoria do produto | `produto_categoria` | conjuntos × macaquinhos… |
| Cor | `cor` | cores mais pedidas |
| Tamanho | `tamanho` | grade mais procurada (ajuda a comprar estoque) |
| Cupom | `cupom` | qual cupom traz lead |
| Local do cupom | `cupom_local` | link × faixa do topo × campo |

**Faça isso logo no primeiro dia.** Dimensão personalizada **não vale para trás**: só começa a contar a partir de quando é criada.

### 5.3 Vincular
- **Search Console** (Administrador → Vinculações de produtos), quando o Search Console estiver verificado.
- **Google Ads**, quando houver conta. Atenção: quando o Ads tiver a própria tag de conversão, **não** importe o `generate_lead` do GA4 como conversão principal no Ads. Seria o mesmo lead contado duas vezes.

---

## 6. Relatórios que respondem às perguntas da Lyft

Crie em **Explorar → Exploração livre** (vale salvar cada uma):

| Pergunta | Linhas | Colunas / filtros | Métrica |
|---|---|---|---|
| Qual botão traz mais lead? | Botão | Tipo de página | Eventos principais (`generate_lead`) |
| Quais peças geram pedido? | Produto | filtro Tipo de lead = `pedido` | Eventos principais · Valor do evento |
| Que tamanho e cor mais pedem? | Tamanho | Cor | Eventos principais |
| Os cupons funcionam? | Cupom | Local do cupom | Contagem de `cupom_informado` e de `generate_lead` |
| De onde vem quem vira lead? | Origem/mídia da sessão | Campanha da sessão | Sessões · Eventos principais · Taxa de evento principal |
| Reposição: o que mais pedem de volta? | Produto | Cor, filtro Tipo de lead = `reposicao` | Eventos principais |

**Funil** (Explorar → Exploração de funil), etapas: `view_item` → `escolher_tamanho` → `whatsapp_click` → `lead_form_open` → `generate_lead`. Mostra onde a cliente desiste. Se muita gente para no formulário, vale testar desligá-lo no painel.

**E-commerce** (Relatórios → Monetização → Compras de e-commerce): visualizações e cliques por produto e por vitrine (`item_list_name`): a vitrine "mais amados" da home vende mais que o catálogo?

---

## 7. Origem dos cliques (UTMs)

O GA4 lê as UTMs sozinho. O site **também** guarda as UTMs, o GCLID e o FBCLID e manda tudo para a planilha a cada lead. Padrão sugerido (sempre minúsculas):

| Onde o link é usado | Link |
|---|---|
| Link da bio do Instagram | `…/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Stories | `…&utm_source=instagram&utm_medium=social&utm_campaign=stories_2026-11` |
| WhatsApp (status, lista) | `…?utm_source=whatsapp&utm_medium=social&utm_campaign=lista_novembro` |
| Anúncio no Meta | `utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}` |
| Anúncio no Google | automático pelo GCLID (não precisa UTM) |
| Influenciadora | `…?utm_source=influencer&utm_medium=social&utm_campaign=nome_da_pessoa&cupom=CUPOMDELA` |

Juntando cupom e UTM no mesmo link (`&cupom=X`), o cupom já entra aplicado e aparece no GA4 como `cupom_local = link`. Dá para medir cada influenciadora pelo cupom **e** pela origem.

---

## 8. Números do GA4 × planilha

A planilha recebe **todo** lead. O GA4 perde uma parte: quem usa bloqueador de anúncios e o modelado de quem recusou cookies. É normal o GA4 mostrar de 10% a 30% menos. Para contar leads, a planilha é a fonte. Para **origem, funil e comportamento**, use o GA4.

---

## 9. Pendências

| Item | Quem | Prioridade |
|---|---|---|
| Publicar a versão do site com os eventos novos | Claude (com seu OK) | alta, antes de tudo |
| Criar a propriedade GA4 e anotar o `G-` aqui | Dárcio | alta |
| Montar variáveis, acionadores e tags no GTM, testar e publicar | Dárcio | alta |
| Marcar `generate_lead` como evento principal | Dárcio | alta, no dia seguinte |
| Criar as 10 dimensões personalizadas | Dárcio | alta, no primeiro dia |
| Retenção de dados 14 meses e filtro de tráfego interno | Dárcio | média |
| Meta Pixel (etapa 2): `PageView`, `ViewContent` (view_item), `Contact` (whatsapp_click), `Lead` (generate_lead, com `event_id` e `user_data`) | próxima conversa | — |
| Google Ads: conversão na tag `generate_lead` + conversões otimizadas (`user_data`) | quando houver conta | — |

## 10. Limitações conhecidas

- **Lead = foi para o WhatsApp**, não "comprou". A venda acontece na conversa com a Ju, fora do site. Para medir venda de verdade, o caminho futuro é a Ju marcar na planilha quem comprou e subir isso como conversão offline (Google Ads e Meta).
- Se a cliente desistir na tela do WhatsApp sem mandar a mensagem, o lead já foi contado. Não há como o site saber.
- `tipo_lead = duvida_produto` vem dos botões gerais (flutuante, topo) quando a cliente está numa página de produto. Ela ainda não escolheu tamanho, por isso não conta como `pedido`.
