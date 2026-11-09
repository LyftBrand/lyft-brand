# Sessão de configuração: SEO, domínio, GTM e anúncios

Checklist para fazer junto, em ordem. O site já está pronto do lado técnico; aqui é só cadastro e ligação das contas.

---

## 0. O que já está pronto no site (não precisa fazer nada)

- Cada página é gerada pronta no build, com título, descrição, endereço canônico, imagem de compartilhamento (WhatsApp/Instagram/Facebook) e dados estruturados para o Google (loja, produto com preço e estoque, trilha de navegação, lista do catálogo).
- `sitemap.xml` e `robots.txt` gerados sozinhos. Endereços de teste ficam **fora** do Google; só a produção é indexada.
- Endereço que não existe devolve página 404 de verdade.
- Fontes servidas pelo próprio site, CSS embutido, imagens no tamanho certo para cada tela (AVIF/WebP automático pela Netlify).
- Modo de Consentimento do Google: nada de cookie analítico ou de anúncio antes do aceite.
- Campos no painel (`/admin` → Textos e contatos → Configurações do site): **ID do Google Tag Manager**, **verificação do Search Console**, **verificação de domínio do Meta**.

PageSpeed no celular (endereço de teste, 08/10/2026): Desempenho 92 · Acessibilidade 100 · Práticas recomendadas 100. O SEO aparece 69 só porque o teste está bloqueado para o Google de propósito; em produção esse item passa.

---

## 1. Colocar o site novo no ar (eu faço)

1. Trocar no `public/admin/config.yml` o `branch: site-novo` para `branch: main`.
2. Levar a branch `site-novo` para a `main` (o site antigo continua guardado na branch `site-antigo`).
3. Conferir **lyftbrand.netlify.app** e convidar a Ju no Netlify Identity.

## 2. Domínio próprio (quando comprar o lyftbrand.com.br)

1. Comprar em **registro.br** (CPF/CNPJ da Ju ou de quem for administrar).
2. Netlify → lyftbrand → **Domain management → Add a domain** → `lyftbrand.com.br`.
3. A Netlify mostra os servidores DNS (ex.: `dns1.p0X.nsone.net`). No registro.br → domínio → **Alterar servidores DNS** → colar os da Netlify.
4. Esperar propagar (de minutos a algumas horas). A Netlify ativa o HTTPS sozinha.
5. Marcar `lyftbrand.com.br` como **Primary domain**. `www.lyftbrand.com.br` e `lyftbrand.netlify.app` passam a redirecionar para ele.
6. Fazer um novo deploy (ou publicar qualquer coisa no painel). Canonical, sitemap e imagens de compartilhamento passam a usar o domínio novo automaticamente.

## 3. Google Search Console

**Sem domínio próprio ainda (lyftbrand.netlify.app):**
1. search.google.com/search-console → **Adicionar propriedade → Prefixo do URL** → `https://lyftbrand.netlify.app/`.
2. Método **Tag HTML**: copiar só o código de `content="..."`.
3. Colar no painel do site em **Verificação do Google Search Console** → Publicar → esperar 1 min → **Verificar**.

**Com domínio próprio:** adicionar propriedade do tipo **Domínio** (`lyftbrand.com.br`) e verificar pelo registro TXT no DNS (na Netlify: Domain management → DNS records → Add TXT).

Depois de verificar:
- **Sitemaps** → enviar `sitemap.xml`.
- **Inspeção de URL** → pedir indexação da página inicial e do catálogo.

## 4. Google Tag Manager

1. tagmanager.google.com → criar conta **Lyft** → contêiner **Web** → `lyftbrand.com.br` (ou o netlify.app).
2. Copiar o ID `GTM-XXXXXXX` e colar no painel do site em **ID do Google Tag Manager** → Publicar.
3. Não precisa colar código nenhum no site: ele já carrega o GTM (na primeira interação ou 3,5 s após abrir, para não pesar no PageSpeed).

### Eventos, variáveis e GA4
O plano completo (eventos, parâmetros, tags do GTM e configuração do GA4 passo a passo) está em **`docs/PLANO-DE-TAGUEAMENTO.md`**. Ele substitui a lista que ficava aqui.

### Consentimento
O site já envia o *Consent Mode v2* (padrão negado, atualiza quando a pessoa aceita). No GTM, em cada tag de anúncio (Meta, TikTok, Google Ads), em **Configurações de consentimento** exigir `ad_storage`. Nas tags do Google isso já é automático.

## 5. Meta (Instagram/Facebook)

1. Gerenciador de Eventos → criar **Pixel/Conjunto de dados** "Lyft".
2. No GTM: template **Facebook Pixel** (ou HTML personalizado) com o ID, disparando PageView em `page_view`, ViewContent em `view_item`, Contact em `whatsapp_click`, **Lead** em `lead_whatsapp`. Exigir consentimento `ad_storage`.
3. Business Manager → Segurança da marca → **Domínios** → adicionar o domínio → método meta tag → colar o código no painel em **Verificação de domínio do Meta**.
4. Públicos personalizados: a planilha de contatos (nome, e-mail, WhatsApp) pode ser enviada como lista; o Meta criptografa antes de comparar. Já está previsto na Política de Privacidade.

## 6. Google Ads

1. Ferramentas → Conversões → **Nova ação → Site → Configurar manualmente** → "Lead WhatsApp".
2. No GTM: tag **Acompanhamento de conversões do Google Ads** com o ID/rótulo, gatilho `lead_whatsapp`; e a tag **Vinculador de conversões** em todas as páginas.
3. Opcional: conversões otimizadas (e-mail/telefone do formulário) — dá para fazer depois.
4. Os cliques de anúncio (GCLID, GBRAID, WBRAID) já são guardados por 90 dias e gravados na planilha, para importar conversões offline se quiser.

## 7. TikTok (se for anunciar)

Pixel no TikTok Events Manager → template TikTok no GTM → `SubmitForm` em `lead_whatsapp`. O TTCLID também já vai para a planilha.

## 8. Planilha de contatos

Ver `apps-script/LEIA-ME.md` (uns 5 minutos). Depois colar a URL no painel em **Endereço da planilha**.

## 9. Depois de tudo no ar: conferir

- PageSpeed Insights (pagespeed.web.dev) no domínio final, celular e computador.
- GTM → **Visualizar** (Tag Assistant): navegar, abrir produto, pedir pelo WhatsApp e ver os eventos chegando.
- Search Console → Cobertura/Páginas depois de alguns dias.
- Testar a prévia do link no WhatsApp (mandar o link de um produto para si mesmo).

## 10. Créditos da Netlify e como publicar

- Plano Free: 300 créditos por mês, cada publicação gasta 15 (cerca de 20 por mês). O ciclo renova todo dia 9.
- No painel `/admin`, o botão **Publicar** de cada produto só **salva** (não gasta crédito).
- O site muda quando alguém clica em **Colocar o site no ar**, na barra do rodapé do painel. A barra mostra quantas publicações o ciclo já usou e quantas alterações salvas estão esperando.
- Mudanças no código do site publicam sozinhas (e também gastam 15 créditos).
- Variáveis na Netlify (Project configuration → Environment variables), já criadas: `BUILD_HOOK_URL` (build hook "Painel", em Developer settings → Build hooks) e `NETLIFY_TOKEN` (token pessoal, em User settings → Applications).
- Se os créditos acabarem, o site continua no ar, mas nada novo é publicado até o dia 9. Nada se perde: na primeira publicação depois disso, tudo o que foi salvo entra junto.
