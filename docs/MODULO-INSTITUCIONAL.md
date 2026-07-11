# Módulo Institucional (Diretoria + Documentos) — Especificação

> Anotações da visão do Gustavo (sessão 2026-07-10). **Ainda NÃO implementado.**
> Relacionado: [[CLAUDE.md]], [[MODULO-COMPETICOES.md]], [[MODULO-NOTICIAS.md]].
> Cobre duas seções institucionais do site público: **Diretoria** e **Documentos Institucionais**.

---

## PARTE A — DIRETORIA

### A.1 Visão
Os cards da **Diretoria** deixam de ser estáticos: os admins editam, **e cada membro edita o
próprio perfil**, com **foto** e **informações**. Ao clicar num diretor, abre um **modal** com o
**currículo / bio** dele (tempo de trabalho, formação, o que ele quiser colocar).

### A.2 Estado atual
- Seção **"Diretoria"** existe no site: dados estáticos em
  [data/directors.ts](../frontend/src/data/directors.ts).
- Hoje mostra só **iniciais** (JC, AP…), **nome** e **cargo**. Sem foto, sem modal, sem bio.
- 6 cargos atuais: Presidente, Vice-Presidente, Diretor Técnico, Diretora Financeira,
  Diretor de Arbitragem, Diretora de Comunicação.
- Modelo estático: `Director = { id, name, role, photo? }`.

### A.3 Requisitos
1. **Editável pelos admins** e **por cada diretor** (cada um altera o próprio card/perfil).
2. **Foto** de cada diretor + **informações** (bio/currículo).
3. **Modal ao clicar**: mostra o currículo/bio — tempo de trabalho, trajetória, o que colocarem.

### A.4 Modelagem proposta — `Diretor`
- `id`, `nome`, `cargo`, `fotoUrl` (upload — ver nota R2)
- `bio` / `curriculo` (texto longo — trajetória, tempo de trabalho, formação)
- `ordem` (pra ordenar os cards: presidente primeiro, etc.)
- `usuarioId?` (link com o login do membro, pra ele editar o próprio — ver §C)
- timestamps

### A.5 Endpoints propostos
- Público: `GET /api/diretores`, `GET /api/diretores/{id}` (pro modal)
- Admin: `POST` / `PUT /{id}` / `DELETE /{id}`
- Cada diretor: `PUT /api/diretores/me` (editar o próprio) — depende do vínculo usuário↔diretor

---

## PARTE B — DOCUMENTOS INSTITUCIONAIS

### B.1 Visão
Os admins **e a diretoria** disponibilizam documentos oficiais (PDFs) pelo painel — CRUD de
documentos que o público baixa.

### B.2 Estado atual
- A base `data/documents.ts` alimenta **DUAS exibições** (mesma fonte, um CRUD cobre as duas):
  - **"Transparência e Acesso à Informação"** — [Documents.tsx](../frontend/src/components/Documents.tsx):
    lista completa com **filtro por categoria** (Todos/Estatuto/Regulamento/Calendário/Edital/Circular),
    badge de categoria colorido, "Publicado em DD/MM/AAAA" e botão **PDF** (download).
  - **Destaque institucional** dentro de [About.tsx](../frontend/src/components/About.tsx) (Estatuto,
    Ata de Posse…).
- `fileUrl` hoje é `'#'` → **não há arquivo real** pra baixar.
- Modelo estático: `FHTDocument = { id, title, category, publishedAt, fileUrl }`.

### B.3 Requisitos
1. **Controlado pelos admins e diretoria** — eles publicam tudo pelo painel.
2. CRUD de documentos: **adicionar** (upload de PDF, título, categoria, data) e **deletar** (é PDF,
   então o "editar" é mais trocar metadados/substituir o arquivo do que editar conteúdo).
3. Público **baixa** os documentos.
4. 🆕 **Visualizar o PDF no próprio site** (viewer inline, sem forçar download). Tem como sim:
   - Mais simples: `<iframe src="url.pdf">` / `<embed>` — o browser renderiza PDF nativamente.
   - Mais controle (zoom, paginação, UI própria, cross-browser): **PDF.js** (Mozilla) num modal/rota
     `/documentos/{id}`.
   - ✅ **Vantagem de segurança aqui:** documentos institucionais (estatuto, regulamento, edital) são
     **PÚBLICOS por natureza** (é uma seção de *transparência*) — **não** são dados pessoais. Então
     dá pra servir esses PDFs de forma pública e embutir sem as URLs assinadas exigidas pros docs de
     atleta/clube (que são privados — ver [[LGPD-CONFORMIDADE.md]] §5.6). Distinção importante:
     **doc institucional = público; doc de atleta/clube = privado**.

### B.4 Modelagem proposta — `DocumentoInstitucional`
- `id`, `titulo`, `categoria` (Estatuto | Regulamento | Calendário | Edital | Circular)
- `arquivoUrl` (upload — ver nota R2), `dataPublicacao`
- `publicadoPor` (qual admin/diretor subiu), timestamps

### B.5 Endpoints propostos
- Público: `GET /api/documentos` (lista, filtro por categoria)
- Admin/diretoria: `POST` (upload) / `PUT /{id}` / `DELETE /{id}`

---

## PARTE C — CONEXÃO com a hierarquia de admins ⭐

Essas duas seções **amarram forte** com a decisão de "vários admins + hierarquia" (ver CLAUDE.md):

- **A diretoria provavelmente É o comitê de admins.** "Editável por cada um deles" = cada diretor
  tem **login** e edita o próprio perfil → os membros da diretoria são os usuários admin do comitê.
  O **Presidente** é forte candidato a ser o **admin "mor"/master** que comanda os outros.
- **Os cargos praticamente desenham o sistema de PERMISSÕES** que a gente já tinha cogitado:
  - Diretor de **Arbitragem** → módulo de árbitros
  - Diretora de **Comunicação** → módulo de notícias/blog
  - Diretora **Financeira** → taxas/pagamentos de atletas
  - Diretor **Técnico** → competições/atletas
  - **Presidente / Vice** → tudo (master)
  Isso é um ótimo mapa pra modelar as permissões por área em vez de um role hardcoded por feature.

### A confirmar
- [ ] Diretor = usuário admin do comitê (1:1)? Ou dá pra ter diretor **sem** login (só card no site)?
- [ ] As permissões vão seguir os cargos (arbitragem/comunicação/financeiro/técnico) ou serão
      livres (o master marca o que cada um pode, independente do cargo)?
- [ ] Presidente = admin master automaticamente?

---

## Nota sobre uploads (foto de diretor / PDF de documento)
⚠️ **R2 é a ÚLTIMA etapa** (ver CLAUDE.md). Nada no dev depende de R2. Durante o desenvolvimento:
foto e PDF via **URL externa** ou **storage local** de fallback; troca pro R2 só no fim.

## Ordem de ataque sugerida
1. Definir a estrutura de **permissões/hierarquia de admins** primeiro (parte C impacta tudo).
2. Backend `Diretor` + `DocumentoInstitucional` (CRUD, sem upload real ainda).
3. Admin: abas de Diretoria e Documentos (lista + form).
4. Público: ligar seções na API + **modal de currículo** do diretor.
5. Upload real (foto/PDF) junto da ativação do R2, no fim.
