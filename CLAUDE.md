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

**Roles (só DOIS por enquanto):**
- `ADMIN_FHT` — acesso total: CMS, clubes, atletas, competições; aprova/rejeita/suspende/deleta.
- `ADMIN_CLUBE` — só o próprio clube; cadastra atletas mas **não** aprova.
- `ATLETA` (terceiro perfil) foi cogitado e **descartado por ora** — Gustavo vai confirmar com o presidente da federação antes de implementar.

**Atleta:** CPF, RG, nascimento, endereço, sexo, posição, categoria, status de transferência, taxa de filiação, 4 documentos (Foto 3x4, RG, Comprovante de residência, Comprovante Pix).
**Clube:** CNPJ, endereço, representante, documentos (Ata, Estatuto), status (`PENDENTE` / aprovado / `SUSPENSO`).

**Frontend — rotas:** `/` (site público one-page), `/login`, `/clube` (protegida `ADMIN_CLUBE`), `/admin` (protegida `ADMIN_FHT`) via `ProtectedRoute` + `AuthContext`.
Site público (componentes em `src/components/`): Hero, Competitions, Registration, News, About, Clubs, Referees, Gallery, Documents, Contact, Footer, CookieBanner, Navbar (hide-on-scroll), ScrollProgress.
Dados ainda **estáticos** em `src/data/*.ts` (clubs, competitions, directors, documents, gallery, news, referees). Utils: `masks.ts`, `ufs.ts`.

## Estado atual (atualizar conforme avança)

**Pronto e funcionando:**
- Stack Docker completa (`fht_postgres`, `fht_backend`, `fht_frontend`).
- Auth com JWT no backend; login real no front (`{email, senha}`) com **fallback pro mock só se o backend estiver fora do ar**. JWT parseado com UTF-8 lendo claims `upn`/`role`/`name`/`clubeId`.
- **Integração frontend ↔ backend FEITA** (era o maior gargalo). Camada nova de API:
  - `frontend/src/services/api.ts` — cliente HTTP central: anexa `Bearer` do `fht_token`, desembrulha o envelope `ApiResponse<T>` retornando só `data`, trata 401 (limpa token), expõe `apiGet/apiPatch/apiDelete/apiPostJson/apiPostForm`.
  - `frontend/src/types/api.ts` — DTOs espelhando o backend (`ClubeDTO`, `AtletaDTO`, `AdminDashboardDTO`, `LoginResponse`, enums de status).
  - `AdminDashboard.tsx` e `ClubeDashboard.tsx` consomem a **API real** (GET clubes/atletas/dashboard, PATCH aprovar/rejeitar/suspender/reativar, POST multipart de atleta). Só resta uma estatística de competições mockada (esperado — sem módulo ainda).
- **Backend:** endpoints `PATCH /{id}/suspender` e `/{id}/reativar` para Clube e Atleta (resource + service + interface), com regra de status (409 se estado inválido).
- `AdminDashboard.tsx`: painéis deslizantes "Ver mais" `ClubeDetailPanel` e `AtletaDetailPanel` (dados completos, documentos, estatísticas, ações por status) + **busca** nas 3 seções. Front compila com `npx tsc --noEmit` sem erros.

**Pendências / lacunas conhecidas:**
- **R2 não conectado de verdade** — código pronto, mas falta criar o bucket e preencher `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`. Sem isso, upload retorna 503.
- **Faltam endpoints no backend:** Competições e Notícias/Documentos.
- Site público ainda consome `src/data/*.ts` estático (clubs, competitions, news, etc.) — só os dashboards foram ligados na API.
- `ArbitroForm.tsx` existe no front sem model/resource/migration `Arbitro` correspondente no backend.

**Próximos passos (ordem provável):**
1. **Módulo de Competições** — montar competição escolhendo clubes/atletas das listas; **check-in** de atletas no dia dos jogos (a base de busca + painéis de detalhe já foi pensada pra alimentar isso).
2. Criar bucket R2 + credenciais pra ativar uploads.
3. Ligar o site público na API real (trocar `data/*.ts` por chamadas HTTP).
4. Endpoints de Notícias.
5. Decidir sobre o role `ATLETA` (depois de falar com o presidente).

## Como o Gustavo gosta de trabalhar

- Português BR, **tom informal e direto**. Trata como parceiro de longa data.
- **Prazo curto** — quer agilidade e saber "onde está no projeto". Pode trabalhar solto, mas **confirme antes de implementar coisa especulativa** (ex.: esperou o presidente pro perfil ATLETA).
- Trabalha em **duas máquinas** → valoriza muito Docker/padronização e contexto que sincroniza via git (este arquivo).
- Gosta de **funcionalidades completas e detalhadas** ("ver TUDO sobre o clube/atleta").
- Pensa o produto pelo **fluxo de negócio real** da federação (competições, check-in, controle de jogos), não telas isoladas.
- Curte usar modelo forte (Fable 5 / Opus, effort máximo) pra codar.
