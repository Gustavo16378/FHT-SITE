# Módulo de Notícias / Blog — Especificação

> Anotações da visão do Gustavo (sessão 2026-07-10). **Ainda NÃO implementado** — combinado do
> que vamos construir. Relacionado: [[CLAUDE.md]], [[MODULO-COMPETICOES.md]].

---

## 1. Visão em uma frase

A seção **"Últimas do Handebol"** vira um **blog de verdade**: os admins criam/editam/deletam
posts (imagem, texto, data, categoria), o público vê os últimos na home e tem uma **página
"todas as notícias"** (que hoje **não existe**), além de **abrir cada notícia** por completo.

---

## 2. Estado atual (o que existe hoje)

- Seção **"Últimas do Handebol"** já existe na home: [News.tsx](../frontend/src/components/News.tsx),
  alimentada por dados **estáticos** em [data/news.ts](../frontend/src/data/news.ts).
- Layout: 1 notícia **featured** (grande) + 2 laterais menores + 1 embaixo.
- Card mostra: **categoria** (tag colorida), **título**, **data**, **imagem**, e **resumo** (só no featured).
- Botão **"ver todas as notícias"** aponta pra `href="#"` → **não leva a lugar nenhum**. A página de
  listagem completa **não existe** (nem rota, nem componente).
- **Não existe** página de notícia individual (abrir o post inteiro).
- No **AdminDashboard** a aba "Notícias" é **placeholder "V2"** (desabilitada).
- **Não existe** backend de notícias (sem entidade, migration, resource).

### Modelo estático atual (referência)
```
NewsCategory = 'Competição' | 'Seleção' | 'Arbitragem' | 'Institucional'
NewsItem = { id, title, category, date, image, excerpt, featured? }
```

---

## 3. Requisitos (o que o Gustavo pediu)

1. **Blog editável pelos admins**: criar, **editar** e deletar notícias.
2. **Conteúdo rico**: colocar **imagens, textos, datas** — "blog mesmo". Ou seja, corpo de post
   completo (não só o resumo), com imagens no meio do texto.
3. **Página "todas as notícias"**: o botão "ver todas as notícias" tem que **levar a uma página**
   com todas as notícias (hoje não vai a lugar nenhum).
4. **Abrir cada notícia**: página individual do post (ler o conteúdo completo).

---

## 4. Modelagem de dados proposta (backend — a validar)

### `Noticia`
- `id` (UUID)
- `titulo`
- `slug` (pra URL amigável: `/noticias/fht-lanca-calendario-2025`) — gerado do título
- `categoria` (Competição | Seleção | Arbitragem | Institucional) — enum ou tabela
- `resumo` / `excerpt` (texto curto pro card)
- `conteudo` (corpo completo — **formato a decidir**, ver §7: markdown ou HTML rich text)
- `imagemCapaUrl` (capa — upload no R2)
- `dataPublicacao`
- `destaque` / `featured` (bool — controla o card grande)
- `status` (RASCUNHO | PUBLICADO) — se quisermos salvar sem publicar (ver §7)
- `autor` (qual admin escreveu — liga com o usuário logado)
- timestamps

> Imagens **dentro** do corpo do post também vão pro R2 (reusa o `R2StorageService` já existente).

---

## 5. Endpoints propostos

**Público (sem auth):**
- `GET /api/noticias` — lista paginada (filtro opcional por categoria; só `PUBLICADO`)
- `GET /api/noticias/{slug}` — uma notícia completa
- `GET /api/noticias/destaques` — as N mais recentes pra home (ou derivar da lista)

**Admin (ADMIN_FHT):**
- `POST /api/noticias` — criar
- `PUT /api/noticias/{id}` — editar
- `DELETE /api/noticias/{id}` — deletar
- `POST /api/noticias/{id}/imagem` (ou upload genérico) — subir imagem de capa/corpo no R2

---

## 6. Telas / UI

### Admin (`AdminDashboard` → aba Notícias, hoje placeholder)
- Lista de notícias com busca (padrão Clubes/Atletas).
- Botão **"Nova notícia"** → **editor**: título, categoria, capa (upload), corpo (editor de texto
  rico), data, toggle "destaque".
- **Editar** e **deletar** por notícia.
- (Opcional) salvar como **rascunho** antes de publicar.

### Público
- Seção `News` da home passa a consumir a **API real** (fim do `data/news.ts`) — mantém o layout
  featured + laterais.
- **NOVA rota `/noticias`**: página com **todas** as notícias (grid + filtro por categoria +
  paginação). O botão "ver todas as notícias" passa a apontar pra cá.
- **NOVA rota `/noticias/{slug}`**: página do **post individual** (capa, título, data, categoria,
  corpo completo). Estilo blog.

---

## 7. Decisões (sessão 2026-07-10)

### ✅ Já decidido
- **Editor = WYSIWYG** (rich text, não markdown). Motivo: os admins são não-devs — provavelmente
  o próprio Gustavo é que vai escrever — então tem que ser simples ("botãozinho de negrito/imagem").
  Simplificar a vida de quem escreve. → falta escolher a **lib** de editor.
- **Rascunho = SIM**, com certeza. Status `RASCUNHO | PUBLICADO` (salva sem sair no ar).
- **CRUD completo, sem trava por data.** Editar e deletar **qualquer** notícia a qualquer momento,
  independente de quando foi publicada — "o bom e velho CRUD". Nada de bloquear post por ser antigo.

### ❓ Ainda em aberto
- [ ] **Slug automático** do título (tratar acento/duplicado) — confirmar.
- [ ] **Paginação**: quantas por página na `/noticias`? Scroll infinito ou paginado?
- [ ] **Categorias**: manter fixas (as 4 atuais) ou o admin poder criar novas?
- [ ] **Featured**: uma só notícia em destaque por vez, ou várias? (o layout da home usa 1 grande).

---

## 8. Ordem de ataque sugerida (quando for implementar)

1. Backend: entidade `Noticia` + migration + CRUD (`GET/POST/PUT/DELETE`) + upload de imagem no R2.
2. Admin: aba Notícias com lista + editor (criar/editar/deletar).
3. Público: ligar a seção `News` da home na API.
4. Rota `/noticias` (listagem completa + filtro) → conectar o botão "ver todas".
5. Rota `/noticias/{slug}` (post individual).

> ⚠️ **R2 é a ÚLTIMA coisa do projeto** (decisão do Gustavo): só conecta quando for pro Cloudflare,
> praticamente indo pro ar. Ou seja, **não dá pra depender de R2 durante o dev do blog**. Plano pra
> desenvolver antes:
> - Fazer todo o CRUD de texto/rascunho/categorias primeiro (não precisa de imagem).
> - Pra imagem no dev: ou aceitar **URL externa colada**, ou um **storage local** (salvar no volume
>   do container) como fallback quando o R2 não está configurado — e trocar pro R2 só no fim.
> - Deixar o "upload de imagem de verdade" como uma das últimas tarefas, junto da ativação do R2.
