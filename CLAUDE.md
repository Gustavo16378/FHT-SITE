# CLAUDE.md — FHT-SITE

Contexto persistente do projeto pra eu (Claude) não perder o fio entre sessões e entre as máquinas do Gustavo (PC de mesa + notebook). **Mantenha este arquivo atualizado** quando algo importante mudar — ele é commitado no git, então viaja entre as máquinas.

> ⚠️ **Atenção, repositório:** o repo REAL é este aqui (`FHT-SITE/`), conectado ao GitHub `Gustavo16378/FHT-SITE`, branch `main`. Existe uma pasta-pai `c:\Users\Gustavo\Documents\fht-site\` que virou um repo git por engano ("No commits yet", com `FHT-SITE/` como untracked) — **ignore o repo de fora**, trabalhe e commite sempre dentro de `FHT-SITE/`.

---

## O que é

Site institucional + sistema de gestão da **FHT — Federação de Handebol do Tocantins**.
Monorepo: `backend/` (API Java/Quarkus) + `frontend/` (Vite/React/TS).

Cobre: site público one-page, área administrativa da federação, área do clube filiado e (próximo grande módulo) gestão de competições / check-in de atletas no dia dos jogos.

## Stack

**Backend** (`backend/`, package base `br.org.fht`)
- Java 21 (Temurin) + **Quarkus 3.15.1** (JVM mode) — **não é Spring**
- Hibernate ORM Panache, PostgreSQL 16, **Flyway** (migrations `V1`–`V4`)
- **SmallRye JWT** RSA 2048 (JWT próprio — substituiu Keycloak por decisão)
- Cloudflare **R2** (AWS SDK v2 S3) para uploads de documentos
- Sentry (monitoramento), MicroProfile OpenAPI + **Swagger UI** em `/swagger`
- Deploy: Railway + Docker + GitHub Actions

**Frontend** (`frontend/`)
- **Vite 8 + React 19 + TypeScript ~6 + React Router DOM v7** (`BrowserRouter`)
- Tailwind CSS 3, `lucide-react` (ícones)
- Scripts: `npm run dev` / `build` (`tsc -b && vite build`) / `lint` / `preview`

## Como rodar (qualquer máquina)

```bash
cd FHT-SITE
bash setup.sh            # gera chaves JWT RSA + cria .env
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Swagger: http://localhost:8080/swagger
- Postgres: host `localhost:5433` → container `5432` (db `fht_db`, user `fht_user`, pass `fht_pass`)

Containerização foi feita justamente pra rodar idêntico no PC de mesa e no notebook, sem instalar Java/Maven/Node local. HMR do Vite no Windows/Docker depende de `CHOKIDAR_USEPOLLING=true` (já no compose) — inotify não funciona em volume montado no Windows.

## Credenciais de teste

- `admin@fht.org.br` / `123456` → **ADMIN_FHT** (existe no seed `V4__seed_admin.sql` e no mock do front)
- `clube@fht.org.br` / `123456` → **ADMIN_CLUBE** (só no mock do front; ainda sem usuário real no banco)

`AuthContext.tsx` tenta o mock primeiro e, se não bater, cai pra API real (`POST /api/auth/login`).

## Domínio & arquitetura

**Entidades:** `Atleta`, `Clube`, `Usuario`, `Role`, `DefaultEntity` (base).
**Camadas backend:** `model` → `repository` (Panache) → `service` → `resource` (REST/JAX-RS) + `dto`, `mapper`, `common` (`ApiResponse`, `CPFValidator`, `OpenApiConfig`), `exception` (`GlobalExceptionMapper`), `storage` (`R2StorageService`).
**Resources existentes:** Auth, Admin, Atleta, Clube, Upload.

**Roles (vai crescer — hoje só DOIS no código):**
- **Hierarquia de admins (📄 consolidada em `docs/MODULO-ADMINS-PERMISSOES.md`):** no topo, um nível **DEV/dono (o Gustavo)** com **painel exclusivo** que vê e altera **tudo de todos** (nome, e-mail de admins/clubes/atletas) — pra suporte ("vai que pedem pra alterar dados de alguém"). Abaixo, um **admin "mor"/master** (candidato: Presidente) que **comanda os outros** logins de admin (cria/remove/define scopes). Abaixo, os **membros do comitê** (a diretoria) são admins com **permissões por área** (scope por cargo — arbitragem/comunicação/financeiro/técnico), mas **não** gerenciam outros admins. Todos podem **editar dados dos filiados** (falta `PUT` de clube/atleta no backend). Hoje o banco só tem 1 admin no seed (`V4`).
  - ⚙️ **Consideração de arquitetura (a decidir):** como vem MUITA funcionalidade de admin e níveis diferentes, provavelmente compensa modelar **permissões flexíveis** (flags/scopes por usuário) em vez de criar um role hardcoded pra cada coisa — pra não refatorar o auth a cada feature nova. Decidir antes de começar a gestão de admins.
  - 🔗 **Diretoria ≈ comitê de admins:** os membros da Diretoria do site (Presidente, Vice, Dir. Técnico, Financeira, Arbitragem, Comunicação) provavelmente SÃO os admins do comitê — "cada um edita o próprio perfil" ⇒ cada diretor tem login. Presidente = candidato a master. E os **cargos praticamente desenham as permissões por área** (Arbitragem→árbitros, Comunicação→notícias, Financeira→taxas, Técnico→competições). Ótimo mapa pra modelar os scopes. Ver `docs/MODULO-INSTITUCIONAL.md` §C.
- `ADMIN_FHT` (no código hoje) — acesso total: CMS, clubes, atletas, competições; aprova/rejeita/suspende/deleta. É o perfil que vai se desdobrar em "master" + "comitê" acima.
- `ADMIN_CLUBE` — só o próprio clube; cadastra atletas mas **não** aprova.
- `ATLETA` (terceiro perfil) — ❌ **DESCARTADO (confirmado jul/2026): NÃO haverá portal/login de atleta.** Toda interação é via o representante do clube (o atleta paga e manda o comprovante pro clube anexar). Motivo: menos usuários, banco menor, custo de hospedagem menor. Alternativa futura, se precisar: **consulta pública por CPF** (sem login). Ver `docs/MODULO-ATLETA-FLUXO.md`.

**Atleta:** CPF, RG, nascimento, endereço, sexo, posição, categoria, status de transferência, taxa de filiação, 4 documentos (Foto 3x4, RG, Comprovante de residência, Comprovante Pix).
**⭐ Regra de anuidade (nova):** a taxa de filiação é **ANUAL** (`taxaAno`). Pagar a anuidade do ano **habilita participar dos eventos/competições daquele ano** → elegibilidade pra competir = anuidade do ano paga; a filiação vence e renova por ano. Amarra Financeiro ↔ Competições. Ver `docs/MODULO-DASHBOARD-FINANCEIRO.md` §4.1.
**⭐ Fluxo de cadastro/pagamento (a construir de verdade — 📄 `docs/MODULO-ATLETA-FLUXO.md`):** clube cadastra → no fim faz Pix e anexa **comprovante de pagamento** (obrigatório junto com RG; foto/comprovante de residência podem vir depois); **menor** exige dados+consentimento do responsável (LGPD). Cadastro sem pagamento em **~24h → apagado** (rotina `@Scheduled`). **Aprovar só com comprovante de pagamento** anexado. Pré-requisito técnico: **storage com fallback local** (sem isso o upload dá 503 sem R2).
**Clube:** CNPJ, endereço, representante, documentos (Ata, Estatuto), status (`PENDENTE` / aprovado / `SUSPENSO`).

**Frontend — rotas:** `/` (site público one-page), `/login`, `/clube` (protegida `ADMIN_CLUBE`), `/admin` (protegida `ADMIN_FHT`) via `ProtectedRoute` + `AuthContext`.
Site público (componentes em `src/components/`): Hero, Competitions, Registration, News, About, Clubs, Referees, Gallery, Documents, Contact, Footer, CookieBanner, Navbar (hide-on-scroll), ScrollProgress.
Dados ainda **estáticos** em `src/data/*.ts` (clubs, competitions, directors, documents, gallery, news, referees). Utils: `masks.ts`, `ufs.ts`.

## Estado atual (atualizar conforme avança)

**🗓️ Prazo & contexto (jul/2026):** Gustavo tem **reunião com o presidente da federação em 13/07/2026** (segunda). **Meta de lançamento: agosto/2026.** O backlog despejado é grande (ver abaixo) → o lançamento de agosto quase certamente é um **MVP com escopo cortado**, não tudo. Bloqueador real pro lançamento com cadastro de atletas: **conformidade LGPD de menores** (art. 14 — ver diretriz LGPD). Levar corte de escopo MVP × pós-lançamento pra reunião.

**Pronto e funcionando:**
- Stack Docker completa (`fht_postgres`, `fht_backend`, `fht_frontend`).
- Auth com JWT no backend; login real no front (`{email, senha}`) com **fallback pro mock só se o backend estiver fora do ar**. JWT parseado com UTF-8 lendo claims `upn`/`role`/`name`/`clubeId`.
- **Integração frontend ↔ backend FEITA** (era o maior gargalo). Camada nova de API:
  - `frontend/src/services/api.ts` — cliente HTTP central: anexa `Bearer` do `fht_token`, desembrulha o envelope `ApiResponse<T>` retornando só `data`, trata 401 (limpa token), expõe `apiGet/apiPatch/apiDelete/apiPostJson/apiPostForm`.
  - `frontend/src/types/api.ts` — DTOs espelhando o backend (`ClubeDTO`, `AtletaDTO`, `AdminDashboardDTO`, `LoginResponse`, enums de status).
  - `AdminDashboard.tsx` e `ClubeDashboard.tsx` consomem a **API real** (GET clubes/atletas/dashboard, PATCH aprovar/rejeitar/suspender/reativar, POST multipart de atleta). Só resta uma estatística de competições mockada (esperado — sem módulo ainda).
- **Backend:** endpoints `PATCH /{id}/suspender` e `/{id}/reativar` para Clube e Atleta (resource + service + interface), com regra de status (409 se estado inválido).
- `AdminDashboard.tsx`: painéis deslizantes "Ver mais" `ClubeDetailPanel` e `AtletaDetailPanel` (dados completos, documentos, estatísticas, ações por status) + **busca** nas 3 seções. Front compila com `npx tsc --noEmit` sem erros.
- **Navegação do painel admin reestruturada** (jul/2026, working tree — não commitado): sidebar agrupada em **Gestão** (Clubes, Atletas, Árbitros, Competições, Financeiro), **Conteúdo do site** (Notícias, Galeria, Diretoria, Documentos) e **Sistema** (Usuários & Admins). Abas ainda não construídas mostram placeholder "🚧 em construção". Locais/posições montados pra guiar a construção módulo a módulo.
- **Árbitros:** painel de detalhe `ArbitroDetailPanel` ("ver tudo") + credenciar/rejeitar/desativar/reativar, com campos ricos (mock local — sem backend ainda). Ver `docs/MODULO-ARBITROS.md`.
- **Dados de teste:** `scripts/seed_teste.sql` popula 2 clubes + 7 atletas (status/idades variados, inclui menores) + o **usuário de clube** `clube@fht.org.br`/`123456` (ADMIN_CLUBE, vinculado ao Palmas HC) direto no Postgres. Rodar: `docker exec -i fht_postgres psql -U fht_user -d fht_db < scripts/seed_teste.sql`.
- **Painel do CLUBE funcional:** login real de clube (era mock — agora tem usuário no banco); lista de atletas **com escopo** (clube vê só os próprios); cadastro multi-step; **detalhe "ver tudo" + edição** dos próprios atletas via `PUT /api/atletas/{id}` (backend com escopo: clube só edita os seus, admin edita qualquer); **gráficos** no dashboard (elenco por categoria = real; desempenho em competições = mock).
- **Sessão logada (UX):** Navbar da home mostra **"Meu Painel"** (leva ao /admin ou /clube) + "Sair" quando logado; botão **"Ver site"** no rodapé dos painéis → circula painel↔site sem deslogar (token no `localStorage`).
- **3 bugfixes de backend** (jul/2026): `@Transactional` faltando em `criarUsuarioClube`; query Panache malformada em `findByClubeId`; ambos davam 500 e travavam o fluxo do clube. Achados testando ao vivo.
- **Telas de DEMO (mock) do painel admin** (jul/2026, pra reunião): as 7 seções antes em placeholder agora têm telas **navegáveis mock** em `frontend/src/pages/admin/*Page.tsx` (Competições, Financeiro, Notícias, Diretoria, Documentos, Galeria, Usuários/Admins) — self-contained, dados de exemplo, modais/abas/painéis via `useState`, **sem backend**. Dashboard do admin ganhou gráficos (SVG puro). ⚠️ **São mock pra demonstração** — trocar por API real quando cada módulo for implementado no backend. Roteiro da demo em `docs/ROTEIRO-DEMO.md`.

**⚖️ Diretriz transversal — LGPD:** decisão do Gustavo: **tudo é feito com base nas normas da LGPD** (Lei 13.709/2018). O sistema trata dados pessoais de **menores de idade** (atletas Sub-12/14/16/18) → tratamento reforçado (art. 14). Guia prático de conformidade em [`docs/LGPD-CONFORMIDADE.md`](docs/LGPD-CONFORMIDADE.md) (consentimento de responsável, direitos do titular, minimização, log de auditoria, política de privacidade, Encarregado/DPO). Considerar em cada módulo com dado pessoal.

**Pendências / lacunas conhecidas:**
- **R2 não conectado de verdade** — código pronto, mas falta criar o bucket e preencher `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`. Sem isso, upload retorna 503. 🗓️ **DECISÃO: R2 é a ÚLTIMA etapa do projeto** — só conecta quando for pro Cloudflare, praticamente indo pro ar. Consequência: **nada no dev pode depender de R2**. Features com upload (docs de atleta/clube, imagens de notícias) se desenvolvem com URL externa ou storage local como fallback, e trocam pro R2 só no fim.
- **Faltam endpoints no backend:** Competições e Notícias/Documentos.
- Site público ainda consome `src/data/*.ts` estático (clubs, competitions, news, etc.) — só os dashboards foram ligados na API.
- `ArbitroForm.tsx` existe no front sem model/resource/migration `Arbitro` correspondente no backend.

**Backlog de módulos (brain-dump da visão do Gustavo em jul/2026 — ORDEM A DEFINIR no fim do despejo).**
Tema comum: quase tudo é "admin/diretoria alimenta conteúdo que hoje é estático em `src/data/*.ts`".
0. **Admins, hierarquia & permissões** — provável PRIMEIRO passo: impacta todos os módulos. Níveis: **DEV/dono (Gustavo, painel exclusivo, vê/altera tudo de todos)** → admin master (Presidente?) → comitê com **permissões por área** (scopes por cargo) → ADMIN_CLUBE. Inclui **edição dos dados dos filiados** pelo painel (falta `PUT` de clube/atleta). 📄 [`docs/MODULO-ADMINS-PERMISSOES.md`](docs/MODULO-ADMINS-PERMISSOES.md).
1. **Competições** — CRUD + alimenta jogos/placares/resultados; modal público; resultados salvos e visíveis; **painel operacional "ao vivo"** (admin lança placar/próximo jogo/horários manualmente → sistema propaga p/ todos, sensação de tempo real via polling); inscrição → escalação → **check-in visual (sem facial)** + troca de atleta. 📄 [`docs/MODULO-COMPETICOES.md`](docs/MODULO-COMPETICOES.md).
2. **Notícias / Blog** — CRUD WYSIWYG + rascunho, seção da home na API, página `/noticias` (não existe — botão "ver todas" aponta pra `#`) e post `/noticias/{slug}`. 📄 [`docs/MODULO-NOTICIAS.md`](docs/MODULO-NOTICIAS.md).
3. **Institucional (Diretoria + Documentos)** — Diretoria editável (foto, bio, modal de currículo; cada diretor edita o próprio); Documentos institucionais CRUD (upload PDF). 📄 [`docs/MODULO-INSTITUCIONAL.md`](docs/MODULO-INSTITUCIONAL.md).
4. **Clubes — vitrine pública + modal** — clube aprovado (ATIVO) entra automático na home; modal com dados/atletas/competições participadas (competições entram quando **encerradas**); admin tira da vitrine via **flag `visivelNaHome`** (não perde afiliação). Precisa de GET **público** (só dados públicos). 📄 [`docs/MODULO-CLUBES-VITRINE.md`](docs/MODULO-CLUBES-VITRINE.md).
5. **Galeria ("Momentos que ficam")** — vitrine de fotos controlada pelo admin (CRUD imagem + legenda evento/ano/categoria); legenda aparece automaticamente (hoje só no hover). 📄 [`docs/MODULO-GALERIA.md`](docs/MODULO-GALERIA.md).
5b. **Dashboard (analytics) + Financeiro** — dashboard ganha gráficos (afiliações no tempo, comparações mensais); **módulo financeiro completo** (taxas/pagamentos — atleta já tem `taxaValor`/`taxaAno`) + exportar **balanço/relatório** (PDF/Excel). Acesso restrito (scope Dir. Financeira). 📄 [`docs/MODULO-DASHBOARD-FINANCEIRO.md`](docs/MODULO-DASHBOARD-FINANCEIRO.md).
6. **Árbitros** — backend (model/migration/resource) + ligar a UI do admin (hoje mock) + `ArbitroForm` público. Painel de detalhe "ver tudo" + credenciar/rejeitar/ativar/desativar **já feito no front (mock)**; campos propostos em 📄 [`docs/MODULO-ARBITROS.md`](docs/MODULO-ARBITROS.md).
5. **R2 (uploads)** — 🗓️ ÚLTIMA etapa, só no deploy pro Cloudflare. Nada no dev depende disso.
- Perfil `ATLETA` — **em análise, tendência a NÃO fazer** (custo/peso — ver Roles).

## Como o Gustavo gosta de trabalhar

- Português BR, **tom informal e direto**. Trata como parceiro de longa data.
- **Prazo curto** — quer agilidade e saber "onde está no projeto". Pode trabalhar solto, mas **confirme antes de implementar coisa especulativa** (ex.: esperou o presidente pro perfil ATLETA).
- Trabalha em **duas máquinas** → valoriza muito Docker/padronização e contexto que sincroniza via git (este arquivo).
- Gosta de **funcionalidades completas e detalhadas** ("ver TUDO sobre o clube/atleta").
- Pensa o produto pelo **fluxo de negócio real** da federação (competições, check-in, controle de jogos), não telas isoladas.
- Curte usar modelo forte (Fable 5 / Opus, effort máximo) pra codar.
