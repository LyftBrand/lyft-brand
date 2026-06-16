# 📋 Guia Lyft Brand — Como atualizar seu site

Olá, Ju! Este guia explica como adicionar produtos, mudar preços, atualizar o hero e incluir novas coleções **sem precisar de programador**.

---

## 🗂️ Estrutura dos arquivos

```
lyft-brand/
├── index.html        ← O site (não precisa mexer)
├── produtos.json     ← TUDO que você edita: hero + produtos
├── links.html        ← Seu painel interno de links
├── README.md         ← Este guia
├── hero/             ← Fotos e vídeos do banner principal
│   ├── foto-1.jpg
│   ├── video-1.mp4
│   └── video-1-thumb.jpg
└── fotos/            ← Fotos dos produtos
    ├── aura-verde-1.jpg
    └── ...
```

---

## 🎬 Como atualizar o banner principal (Hero)

O banner da entrada do site aceita **fotos e vídeos misturados**, na ordem que você quiser.

### Para adicionar uma foto no hero:
1. Suba a foto na pasta `hero/` no GitHub
2. Abra `produtos.json` e adicione dentro de `"hero"`:
```json
{
  "tipo": "foto",
  "src": "hero/nome-da-foto.jpg",
  "alt": "Descrição da imagem"
}
```

### Para adicionar um vídeo no hero:
1. Suba o `.mp4` e uma imagem de capa (thumb) na pasta `hero/`
2. Adicione dentro de `"hero"`:
```json
{
  "tipo": "video",
  "src": "hero/nome-do-video.mp4",
  "poster": "hero/nome-do-video-thumb.jpg"
}
```

### Dicas para o hero:
- **Fotos:** JPG ou PNG, proporção 9:16 (vertical), mínimo 1080x1920px
- **Vídeos:** MP4, duração ideal 8–15 segundos, sem áudio necessário
- **Thumb do vídeo:** foto do primeiro frame do vídeo — aparece enquanto carrega
- A ordem no JSON é a ordem de exibição
- Troca automática: fotos ficam 5 segundos, vídeos ficam o tempo inteiro

---

## ✏️ Como adicionar um novo produto

1. Acesse **github.com** e entre no repositório do site
2. Clique no arquivo **`produtos.json`**
3. Clique no ícone de **lápis** (editar)
4. Dentro de `"produtos"`, cole o bloco abaixo antes do último `]`:

```json
,
{
  "id": "nome-do-produto",
  "nome": "Nome do Produto",
  "categoria": "conjunto",
  "descricao": "Descrição curta do produto aqui.",
  "detalhes": [
    "Tecido: Poliamida + Elastano",
    "Zero transparência",
    "Alta compressão"
  ],
  "preco": 239.90,
  "parcelas": 6,
  "destaque": false,
  "colecao": "Nome da Coleção",
  "cores": [
    {
      "nome": "Verde",
      "hex": "#7A9B8A",
      "fotos": [
        "fotos/nome-do-produto-verde-1.jpg",
        "fotos/nome-do-produto-verde-2.jpg"
      ]
    }
  ],
  "tamanhos": ["P", "M", "G"],
  "badge": ""
}
```

5. Clique em **"Commit changes"** → site atualiza em 1 minuto ✅

---

## 🎨 Categorias disponíveis

| Palavra | Aparece no filtro como |
|---------|----------------------|
| `conjunto` | Conjuntos |
| `macaquinho` | Macaquinho |
| `jaqueta` | Jaquetas |
| `shorts` | Shorts |

Nova categoria → só usar uma palavra nova, aparece automaticamente.

---

## 🖼️ Como adicionar o logo da marca

O site suporta logo em imagem no header e footer. Coloque os arquivos na raiz do repositório:

- `logo.webp` — logo para fundo claro (header)
- `logo-branco.webp` — logo para fundo escuro (footer) — pode ser o mesmo arquivo se o logo já for branco

Se não houver arquivo de logo, o site exibe automaticamente o texto "lyft" como fallback.

**Tamanho recomendado:** altura de 36–40px, fundo transparente (PNG/WebP).

---

## 🖼️ Como adicionar fotos de produto

1. GitHub → pasta **`fotos/`** → **"Add file" → "Upload files"**
2. Nomeie: `nomeproduto-cor-numero.jpg`
   - Ex: `aura-verde-1.jpg`, `aura-verde-2.jpg`
3. Commit changes

**Dicas para as fotos:**
- Formato: **WebP preferencial** (melhor qualidade e menor tamanho)
- Alternativa: JPG ou PNG — o Netlify converte automaticamente para WebP na entrega
- Tamanho ideal: **800x1067px** (proporção 3:4)
- Peso máximo: **300KB** por foto em WebP (use [squoosh.app](https://squoosh.app) para converter e comprimir — escolha WebP no menu)

> 💡 **Dica:** No Squoosh, abra a foto, escolha WebP no lado direito, ajuste qualidade para 80–85% e baixe. Isso reduz o tamanho em até 70% sem perda visual.

---

## 💰 Como mudar preço

No `produtos.json`, encontre o produto e mude `"preco": 239.90`.

---

## 🌟 Produto em destaque

`"destaque": true` → aparece maior no topo. Só um por vez.

---

## 🏷️ Badge (etiquetinha)

`"badge": "Mais vendido"` · `"badge": "Novo"` · `"badge": ""` (sem etiqueta)

---

## 🔗 Painel de links (seu uso interno)

Acesse `lyftbrand.com.br/links.html` para gerar links com cupom e UTMs para seus Stories.

---

## 📱 Contato para mudanças grandes

Para alterações no design ou estrutura, fale com Dárcio.

---

*Site desenvolvido com ❤️ por Lemos83 | Digital Marketing Solutions*

Olá, Ju! Este guia explica como adicionar produtos, mudar preços e incluir novas coleções **sem precisar de programador**.

---

## 🗂️ Estrutura dos arquivos

```
lyft-brand/
├── index.html        ← O site (não precisa mexer)
├── produtos.json     ← SUA LISTA DE PRODUTOS (aqui você edita!)
├── README.md         ← Este guia
└── fotos/            ← Pasta com todas as fotos
    ├── aura-verde-1.jpg
    ├── aura-verde-2.jpg
    └── ...
```

---

## ✏️ Como adicionar um novo produto

1. Acesse **github.com** e entre no repositório do site
2. Clique no arquivo **`produtos.json`**
3. Clique no ícone de **lápis** (editar) no canto superior direito
4. **Copie** o bloco abaixo e cole antes do último `]` do arquivo:

```json
,
{
  "id": "nome-do-produto",
  "nome": "Nome do Produto",
  "categoria": "conjunto",
  "descricao": "Descrição curta do produto aqui.",
  "detalhes": [
    "Tecido: Poliamida + Elastano",
    "Zero transparência",
    "Alta compressão"
  ],
  "preco": 239.90,
  "parcelas": 6,
  "destaque": false,
  "colecao": "Nome da Coleção",
  "cores": [
    {
      "nome": "Verde",
      "hex": "#7A9B8A",
      "fotos": [
        "fotos/nome-do-produto-verde-1.jpg",
        "fotos/nome-do-produto-verde-2.jpg"
      ]
    }
  ],
  "tamanhos": ["P", "M", "G"],
  "badge": ""
}
```

5. Preencha com as informações do seu produto
6. Clique em **"Commit changes"** (botão verde)
7. O site atualiza sozinho em **menos de 1 minuto** ✅

---

## 🎨 Categorias disponíveis

Use exatamente uma destas palavras no campo `"categoria"`:

| Palavra | Aparece no filtro como |
|---------|----------------------|
| `conjunto` | Conjuntos |
| `macaquinho` | Macaquinho |
| `jaqueta` | Jaquetas |
| `shorts` | Shorts |

Para **nova categoria**, é só adicionar a palavra nova — ela aparece automaticamente no filtro do site.

---

## 🖼️ Como adicionar fotos

1. No GitHub, entre na pasta **`fotos/`**
2. Clique em **"Add file" → "Upload files"**
3. Arraste as fotos do produto
4. Nomeie seguindo o padrão: `nomeproduto-cor-numero.jpg`
   - Exemplo: `aura-verde-1.jpg`, `aura-verde-2.jpg`
5. Clique em **"Commit changes"**

### Dicas para as fotos:
- Formato: **JPG ou PNG**
- Tamanho ideal: **800x1067px** (proporção 3:4)
- Peso máximo: **500KB** por foto (use [squoosh.app](https://squoosh.app) para comprimir)

---

## 💰 Como mudar um preço

1. Abra `produtos.json`
2. Encontre o produto pelo nome
3. Mude o número na linha `"preco": 239.90`
4. Salve (Commit changes)

---

## 🌟 Como colocar um produto em destaque

O produto em destaque aparece maior no topo da grade. Para ativar:
- Mude `"destaque": false` para `"destaque": true`

Só deixe **um produto** com destaque por vez.

---

## 📦 Como criar uma nova coleção

No campo `"colecao"` de cada produto, coloque o nome da coleção nova. Exemplo:
```json
"colecao": "Inverno 2026"
```

---

## 🏷️ Badge (etiqueta especial)

O campo `"badge"` mostra uma etiquetinha no canto do produto. Exemplos:
- `"badge": "Mais vendido"`
- `"badge": "Novo"`
- `"badge": "Exclusivo"`
- `"badge": ""` ← vazio = sem etiqueta

---

## 📱 Contato para dúvidas técnicas

Para mudanças maiores no design ou estrutura do site, entre em contato com Dárcio.

---

*Site desenvolvido com ❤️ por Lemos83 | Digital Marketing Solutions*
