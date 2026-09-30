# CLAUDE.md — FHT-SITE

Contexto persistente do projeto pra eu (Claude) não perder o fio entre sessões e entre as máquinas do Gustavo (PC de mesa + notebook). **Mantenha este arquivo atualizado** quando algo importante mudar — ele é commitado no git, então viaja entre as máquinas.

> ⚠️ **Atenção, repositório:** o repo REAL é este aqui (`FHT-SITE/`), conectado ao GitHub `Gustavo16378/FHT-SITE`, branch `main`. Existe uma pasta-pai `c:\Users\Gustavo\Documents\fht-site\` que virou um repo git por engano ("No commits yet", com `FHT-SITE/` como untracked) — **ignore o repo de fora**, trabalhe e commite sempre dentro de `FHT-SITE/`.

> 🔻 **Branch `mvp-free-tier` (set/2026) — regressão pro MVP em free tier**, por decisão do presidente (sem orçamento). A versão completa está congelada na tag **`v-full`**. Nesta branch **saíram** árbitros, competições, pessoas do clube (2º representante/técnico) e Sentry; as migrations viraram `V1__schema_inicial.sql` + `V2__seed_admin.sql` (senha do admin pela env **obrigatória** `FHT_ADMIN_SENHA`, só o hash vai pro banco) + seed de demo `db/dev/R__seed_dev.sql` (só perfil dev). Infra: Render (Oregon, imagem JVM do GHCR — o nativo falha no AWS SDK do R2) + Neon + R2 + Actions (`.github/workflows/deploy.yml` e `backup.yml` na raiz; o backup só roda depois do merge na `main`). Chaves JWT em prod vêm de `JWT_PUBLIC_KEY`/`JWT_PRIVATE_KEY` em base64. **Backend (Parte A) pronto e commitado, NÃO pushado** (Gustavo vai tornar o repo privado antes). **Frontend (Parte B) não começou** — esperar o Gustavo mandar. Tudo o que está abaixo neste arquivo descreve a versão completa. Guia de deploy: `backend/README.md`. Volume de dev antigo precisa de `docker compose down -v` uma vez (histórico V1–V19).

---

## O que é

Site institucional + sistema de gestão da **FHT — Federação de Handebol do Tocantins**.
Monorepo: `backend/` (API Java/Quarkus) + `frontend/` (Vite/React/TS).

Cobre: site público one-page, área administrativa da federação, área do clube filiado e (próximo grande módulo) gestão de competições / check-in de atletas no dia dos jogos.

## Stack

**Backend** (`backend/`, package base `br.org.fht`)
- Java 21 (Temurin) + **Quarkus 3.15.1** (JVM mode) — **não é Spring**
- Hibernate ORM Panache, PostgreSQL 16, **Flyway** (migrations `V1`–`V16`)
- **Quarkus Scheduler** (`@Scheduled`) — hoje só o expurgo de cadastros de atleta abandonados
- **Quarkus Mailer** — avisos de filiação e pagamento. ⚠️ **Envio SIMULADO por padrão** (`SMTP_MOCK=true`): aparece no log e não sai. Para ligar: preencher `SMTP_HOST/USER/PASS` e `SMTP_MOCK=false` — nenhum código muda
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

- `admin@fht.org.br` / `123456` → **ADMIN_FHT** (seed `V4__seed_admin.sql`)
- `clube@fht.org.br` / `123456` → **ADMIN_CLUBE** (usuário real no banco, via `scripts/seed_teste.sql`)

`AuthContext.tsx` usa **só a API real** — o fallback offline com credenciais embutidas foi removido (ago/2026, `d410a51`): iam parar no bundle JS publicado. Falha de rede agora devolve 503 com mensagem clara.

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

**Atleta:** CPF, RG, nascimento, endereço, sexo, posição, categoria, status de transferência, taxa de filiação, 4 documentos (Foto 3x4, RG, Comprovante de residência, Comprovante Pix) + **dados do responsável legal** (menores).
**⭐ Regra de anuidade (nova):** a taxa de filiação é **ANUAL** (`taxaAno`). Pagar a anuidade do ano **habilita participar dos eventos/competições daquele ano** → elegibilidade pra competir = anuidade do ano paga; a filiação vence e renova por ano. Amarra Financeiro ↔ Competições. Ver `docs/MODULO-DASHBOARD-FINANCEIRO.md` §4.1.
**⭐ Fluxo de cadastro — ✅ FEITO (jul/2026):** clube cadastra (**RG obrigatório**; foto e comprovante de residência podem vir depois). **Menor de 18** exige dados + consentimento do responsável (LGPD art. 14), validado no servidor. 📄 `docs/MODULO-ATLETA-FLUXO.md` §8.
**⭐ Fluxo de PAGAMENTO — ✅ FEITO (ago/2026), migration `V16`:** o atleta **não paga no cadastro**. O clube cadastra à vontade (todos nascem `AGUARDANDO_PAGAMENTO`), e usa o **botão de pagamento** que soma os pendentes: **um Pix só, um comprovante só, N atletas**, com **pagamento parcial permitido**. Vira um lote com protocolo (`FHT-2026-A3F91C`) que sabe quais atletas cobre; chega no Financeiro do admin **com a lista nominal** + comprovante, e a federação dá baixa. Sem gateway (sem orçamento) — conferência manual.
**⭐ Os DOIS PORTÕES da aprovação do atleta** (independentes de propósito): **documental** (RG + consentimento do responsável se menor) e **financeiro** (anuidade do ano com baixa). **Pagar não ativa menor sem autorização** — dinheiro não compra conformidade com o art. 14. Valor da anuidade: config única `fht.anuidade.valor`. O `AtletaExpurgoJob` virou **90 dias** (era 24h, que apagaria quem espera o lote).
**Clube:** CNPJ, endereço, representante (nome, **CPF**, cargo, e-mail, telefone), documentos (Ata, Estatuto), status (`PENDENTE` / aprovado / `SUSPENSO`).
**⭐ Filiação ponta a ponta — ✅ FEITA (ago/2026), migration `V15`:** o clube **escolhe a senha** no cadastro público e a conta nasce ali, **inativa**; **aprovar = liberar o acesso**; rejeitar/suspender **fecham** o acesso. (Antes, aprovar gerava senha aleatória que nunca era exibida a ninguém — a conta nascia inutilizável.) Tabela **`clube_pessoas`**: 2 representantes + **técnico** (quem define a escalação). São **dados cadastrais** — login por pessoa depende do módulo de permissões.

**Frontend — rotas:** `/` (site público one-page), `/login`, `/clube` (protegida `ADMIN_CLUBE`), `/admin` (protegida `ADMIN_FHT`) via `ProtectedRoute` + `AuthContext`.
Site público (componentes em `src/components/`): Hero, Competitions, Registration, News, About, Clubs, Referees, Gallery, Documents, Contact, Footer, CookieBanner, Navbar (hide-on-scroll), ScrollProgress.
✅ **Nada mais é estático no site público.** O único `src/data/*.ts` que sobrou é `referees.ts`, e só guarda os **cursos** de arbitragem (sem módulo). Utils: `masks.ts`, `ufs.ts`.

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
- **Ecossistema de FILIAÇÃO ponta a ponta (ago/2026)** — o pedido do Gustavo: "que a filiação funcione, crie um clube, esse clube vá pro painel do admin, ele aprove, depois o clube adiciona técnico, atleta e etc, faz o pagamento e sobe o comprovante". **Está fechado e validado rodando**: clube se cadastra escolhendo a senha → cai na fila do admin → aprovação libera o acesso → clube entra → monta a comissão técnica → cadastra atletas → barra de pagamento soma os pendentes → paga em lote com um comprovante → cai no Financeiro do admin com a lista nominal → baixa ativa os atletas. Migrations `V15` (credenciais + pessoas do clube) e `V16` (pagamento em lote). E-mail em cada etapa (simulado até plugar o SMTP).
- **Competições — Fatia 1 (jul/2026, 7º módulo mock→real)** — CRUD real no admin (`CompeticoesPage` perdeu 285 linhas de dados fictícios), status derivado das datas com override manual, toggle de vitrine, e `Competitions.tsx`/`Hero.tsx` consumindo a API. Migration `V13`. 📄 `docs/MODULO-COMPETICOES.md` §9.
- **Fluxo de filiação do atleta com LGPD (jul/2026, 6º módulo mock→real)** — o bloqueador de lançamento. Migration `V12`, entidade `Consentimento`, etapa de **responsável legal** no cadastro do clube (aparece sozinha quando a data de nascimento indica menor), `POST /api/atletas/{id}/documentos` pra anexar o comprovante depois, `AtletaExpurgoJob` (`@Scheduled`) apagando os não pagos, e aprovação bloqueada sem comprovante/consentimento. 📄 `docs/MODULO-ATLETA-FLUXO.md` §8.
- **Telas de DEMO (mock) do painel admin** (jul/2026, pra reunião): as 7 seções antes em placeholder agora têm telas **navegáveis mock** em `frontend/src/pages/admin/*Page.tsx` (Competições, Financeiro, Notícias, Diretoria, Documentos, Galeria, Usuários/Admins) — self-contained, dados de exemplo, modais/abas/painéis via `useState`, **sem backend**. Dashboard do admin ganhou gráficos (SVG puro). ⚠️ **São mock pra demonstração** — trocar por API real quando cada módulo for implementado no backend. Roteiro da demo em `docs/ROTEIRO-DEMO.md`.

**⚖️ Diretriz transversal — LGPD:** decisão do Gustavo: **tudo é feito com base nas normas da LGPD** (Lei 13.709/2018). O sistema trata dados pessoais de **menores de idade** (atletas Sub-12/14/16/18) → tratamento reforçado (art. 14). Guia prático de conformidade em [`docs/LGPD-CONFORMIDADE.md`](docs/LGPD-CONFORMIDADE.md) (consentimento de responsável, direitos do titular, minimização, log de auditoria, política de privacidade, Encarregado/DPO). Considerar em cada módulo com dado pessoal.
> ✅ **A maior lacuna (art. 14) foi fechada em jul/2026** — responsável legal + tabela `consentimentos` (um por finalidade, com versão do termo, IP e user-agent) no fluxo de cadastro. **Ainda em aberto** do checklist §5: revogação de consentimento e demais direitos do titular (§5.8), log de auditoria (§5.5), bucket R2 privado com URL assinada (§5.6), Política de Privacidade (§5.2) e os itens organizacionais (§6).

**Pendências / lacunas conhecidas:**
- 📄 **[`docs/REQUISITOS-PENDENTES.md`](docs/REQUISITOS-PENDENTES.md) é a lista COMPLETA e priorizada do que falta pro ar** (varredura de 03/08/2026, 53 pontas soltas): 15 bloqueiam o lançamento, 24 importantes, 14 de polimento, 8 fora do escopo por decisão, **+ 14 perguntas pra federação responder** (chave Pix, domínio, regra de categoria, renovação da anuidade…). É o documento de trabalho da reta final — consultar antes de escolher a próxima tarefa. Os itens abaixo são o resumo histórico.
- **R2 não conectado de verdade** — código pronto, mas falta criar o bucket e preencher `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`. Sem isso, upload retorna 503. 🗓️ **DECISÃO: R2 é a ÚLTIMA etapa do projeto** — só conecta quando for pro Cloudflare, praticamente indo pro ar. Consequência: **nada no dev pode depender de R2**. Features com upload (docs de atleta/clube, imagens de notícias) se desenvolvem com URL externa ou storage local como fallback, e trocam pro R2 só no fim.
- ✅ **O site público NÃO consome mais nenhum dado estático** (jul/2026). O único `src/data/*.ts` que sobrou é `referees.ts`, e ele guarda só os **cursos** de árbitro — que não têm módulo. `competitions.ts` foi deletado com a Fatia 1 de Competições.
- **Ainda mock no painel admin (sem backend):** só **Usuários & Admins**. O **Financeiro virou real** (fila de baixa dos pagamentos em lote). Do módulo de Competições, as abas de chaveamento/check-in/jogos ficam vazias até as Fatias 2-4.
- **⚠️ Pendências de LGPD levantadas em `docs/LGPD-INVENTARIO-DADOS.md`** (o insumo da Política de Privacidade). As de gravidade **alta**, ainda em aberto: o consentimento de **imagem é decorativo** (gravado mas nunca consultado — o site publica de qualquer jeito) e a **revogação não existe** (`setRevogadoEm` nunca é chamado), embora o termo prometa; **nome + categoria de menor** vão ao ar no modal público do clube sem filtro; **documentos servidos sem autenticação** (`FileResource` não tem `@RolesAllowed`); **apagar o cadastro não apaga os arquivos**; **não há log de auditoria**; e o **formulário de contato não envia nada** enquanto diz que enviou.

**Backlog de módulos (brain-dump da visão do Gustavo em jul/2026 — ORDEM A DEFINIR no fim do despejo).**
Tema comum: quase tudo é "admin/diretoria alimenta conteúdo que hoje é estático em `src/data/*.ts`".
0. **Admins, hierarquia & permissões** — provável PRIMEIRO passo: impacta todos os módulos. Níveis: **DEV/dono (Gustavo, painel exclusivo, vê/altera tudo de todos)** → admin master (Presidente?) → comitê com **permissões por área** (scopes por cargo) → ADMIN_CLUBE. Inclui **edição dos dados dos filiados** pelo painel (falta `PUT` de clube/atleta). 📄 [`docs/MODULO-ADMINS-PERMISSOES.md`](docs/MODULO-ADMINS-PERMISSOES.md).
1. **Competições** — 🔪 **FATIADO EM 6** (não cabe inteiro até agosto). **Fatia 1 ✅ FEITA (jul/2026, 7º módulo mock→real):** CRUD de competição no admin + vitrine pública real; status **derivado das datas** com override manual (`PATCH /status`, `/status-automatico`), toggle de vitrine, migration `V13`. Com ela o **site público saiu 100% do estático** (Competições era o último consumidor de `src/data/*.ts`) e o `Hero` parou de mostrar número inventado. **Falta:** Fatia 2 (equipes + jogos + placares + modal público), 3 (inscrição do clube + escalação com elegibilidade), 4 (check-in + painel ao vivo), 5 (agregados) e 6 (chaveamento/classificação/artilharia). 📄 [`docs/MODULO-COMPETICOES.md`](docs/MODULO-COMPETICOES.md) §9.
2. ~~**Notícias / Blog**~~ ✅ **FEITO PONTA A PONTA (jul/2026)** — 1º módulo mock→real em produção. Backend: `Noticia` (model/migration V6/repository/service/resource), GET público (lista + `/{slug}` + filtro categoria), CRUD admin protegido, upload de imagem (storage local, sem R2), slug único auto. Front: aba **Notícias** do admin é CRUD real; seção da home (`News.tsx`) lê da API; rotas novas `/noticias` (listagem+filtro) e `/noticias/:slug` (post). Navbar/Footer com âncoras route-aware. **Pendente (polimento):** editor de corpo é `textarea` — falta a lib WYSIWYG de rich text. 📄 [`docs/MODULO-NOTICIAS.md`](docs/MODULO-NOTICIAS.md).
3. ~~**Institucional (Diretoria + Documentos)**~~ ✅ **FEITO PONTA A PONTA (jul/2026)** — 4º módulo mock→real. Backend: `Diretor` (V9) + `DocumentoInstitucional` (V10), GET públicos + CRUD admin + upload (foto/PDF, storage local). Front: `About.tsx` (home) real com **modal de currículo** do diretor; `Documents.tsx` (Transparência) real com **viewer de PDF inline** (iframe); `DiretoriaPage`/`DocumentosPage` admin com CRUD real. Removidos os `data/*.ts` órfãos (news/clubs/gallery/directors/documents). **Pendente:** "cada diretor edita o próprio perfil" (self-edit) — depende do módulo de Admins/hierarquia (Parte C do doc); por ora é CRUD por ADMIN_FHT. 📄 [`docs/MODULO-INSTITUCIONAL.md`](docs/MODULO-INSTITUCIONAL.md).
4. ~~**Clubes — vitrine pública + modal**~~ ✅ **FEITO PONTA A PONTA (jul/2026)** — 2º módulo mock→real. Backend: flag `visivelNaHome` (migration V7) + `GET /api/clubes/publico` (lista, categorias derivadas dos atletas ATIVOS, **sem** CNPJ/docs/contato — LGPD) + `GET /api/clubes/publico/{id}` (modal com elenco) + `PATCH /api/clubes/{id}/vitrine` (admin liga/desliga, não altera status). Front: `Clubs.tsx` real + modal com elenco; toggle "Ocultar/Mostrar na home" no `ClubeDetailPanel` do admin. **Pendente:** aba "competições participadas" no modal (depende do módulo de Competições). 📄 [`docs/MODULO-CLUBES-VITRINE.md`](docs/MODULO-CLUBES-VITRINE.md).
5. ~~**Galeria ("Momentos que ficam")**~~ ✅ **FEITO PONTA A PONTA (jul/2026)** — 3º módulo mock→real. Backend: `Foto` (model/migration V8/repository), `GET /api/galeria` público + CRUD admin + upload (storage local). Front: `Gallery.tsx` (home) real com **legenda sempre visível** (era só no hover); `GaleriaPage` admin com CRUD real + upload de imagem + `tamanho` (large/medium/small) no mosaico. 📄 [`docs/MODULO-GALERIA.md`](docs/MODULO-GALERIA.md).
5b. **Dashboard (analytics) + Financeiro** — dashboard ganha gráficos (afiliações no tempo, comparações mensais); **módulo financeiro completo** (taxas/pagamentos — atleta já tem `taxaValor`/`taxaAno`) + exportar **balanço/relatório** (PDF/Excel). Acesso restrito (scope Dir. Financeira). 📄 [`docs/MODULO-DASHBOARD-FINANCEIRO.md`](docs/MODULO-DASHBOARD-FINANCEIRO.md).
6. ~~**Árbitros**~~ ✅ **FEITO PONTA A PONTA (jul/2026)** — 5º módulo mock→real. **🔄 INVERTIDO em ago/2026:** a federação informou que **existe uma comissão de arbitragem** que cuida do cadastro. Saiu o formulário público "quero ser árbitro" (`ArbitroForm.tsx` deletado, `POST /solicitar` removido) e entrou o cadastro interno (`POST`/`PUT`/`DELETE /api/arbitros`, só ADMIN_FHT) — o árbitro **nasce CREDENCIADO** e **não tem painel próprio**. Migration `V14` dropou as 8 colunas de auto-declaração. Consertou de graça um bug: `nivel`/`registro`/`formacao` apareciam na ficha mas nenhum endpoint os gravava. Cursos de árbitro seguem estáticos (`referees.ts`, sem módulo). 📄 [`docs/MODULO-ARBITROS.md`](docs/MODULO-ARBITROS.md).
5. **R2 (uploads)** — 🗓️ ÚLTIMA etapa, só no deploy pro Cloudflare. Nada no dev depende disso.
- Perfil `ATLETA` — **em análise, tendência a NÃO fazer** (custo/peso — ver Roles).

## Como o Gustavo gosta de trabalhar

- Português BR, **tom informal e direto**. Trata como parceiro de longa data.
- **Prazo curto** — quer agilidade e saber "onde está no projeto". Pode trabalhar solto, mas **confirme antes de implementar coisa especulativa** (ex.: esperou o presidente pro perfil ATLETA).
- Trabalha em **duas máquinas** → valoriza muito Docker/padronização e contexto que sincroniza via git (este arquivo).
- Gosta de **funcionalidades completas e detalhadas** ("ver TUDO sobre o clube/atleta").
- Pensa o produto pelo **fluxo de negócio real** da federação (competições, check-in, controle de jogos), não telas isoladas.
- Curte usar modelo forte (Fable 5 / Opus, effort máximo) pra codar.
