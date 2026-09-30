# FHT Backend — MVP free tier

API da Federação de Handebol do Tocantins — **Java 21 + Quarkus 3.15.1 + PostgreSQL 16**, rodando
inteira em **free tier** (Render + Neon + Cloudflare R2 + GitHub Actions).

> **Versão completa:** este branch é a regressão do sistema pro escopo mínimo, por decisão do
> presidente (sem orçamento). Tudo o que saiu (árbitros, competições, financeiro além do comprovante,
> comissão técnica do clube, Sentry) continua intacto na tag **`v-full`** (`git checkout v-full`).

---

## Escopo do MVP

**Fica**

- Autenticação JWT com dois perfis: `ADMIN_FHT` e `ADMIN_CLUBE`
- Filiação de clube pelo formulário público, com **um** representante por clube
- Cadastro de atleta pelo painel do clube (dados pessoais, endereço, responsável legal se menor de 18, foto e RG)
- Pagamento da anuidade **em lote**: o clube junta os atletas pendentes, faz um Pix, anexa um comprovante; a federação dá baixa ou rejeita
- Notícias, documentos oficiais e galeria de fotos (CRUD no admin, leitura pública)
- Diretoria e formulário de contato do site institucional
- LGPD: consentimentos por finalidade, responsável legal, expurgo de cadastro abandonado
- Health check, CORS, validação, tratamento de erros, Swagger/OpenAPI

**Saiu** (só na `v-full`): árbitros, competições e tudo derivado (inscrições, jogos, rankings),
relatórios financeiros, pessoas do clube (2º representante/técnico), Sentry.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Quarkus 3.15.1 — **modo JVM** (ver "Por que não nativo") |
| Linguagem | Java 21 |
| ORM / migrations | Hibernate ORM Panache / Flyway (`V1__schema_inicial.sql`) |
| Banco | PostgreSQL 16 — Neon (prod) / Docker (dev) |
| Autenticação | SmallRye JWT, RSA 2048, chaves por variável de ambiente |
| Storage | Cloudflare R2 (AWS SDK v2 S3) com fallback em disco quando não configurado |
| E-mail | Quarkus Mailer — **simulado por padrão** (`SMTP_MOCK=true`, aparece no log) |
| Documentação | MicroProfile OpenAPI + Swagger UI em `/swagger` |
| Health | SmallRye Health em `/q/health` e `/q/health/ready` |
| Deploy | Docker → GHCR → Render (Deploy Hook), via GitHub Actions |

### Por que não nativo

Tentou-se o build nativo (GraalVM/Mandrel 23.1) e ele falha numa dependência incompatível: o AWS
SDK v2 usado pro R2 referencia classes da biblioteca opcional `aws-crt` (`Crc32Checksum` /
`Crc32CChecksum` do módulo `http-auth-aws`) e o `--link-at-build-time` que o Quarkus impõe recusa
o tipo não resolvido. Sair disso exigiria a extensão Quarkiverse do S3 ou substituições GraalVM.
Decisão: JVM enxuta com `-Xmx256m -XX:+UseSerialGC -XX:TieredStopAtLevel=1`, que cabe nos 512 MB
do Render free.

---

## Arquitetura free tier

```
Cloudflare Pages (frontend)  ──HTTPS──▶  Render web service free (esta API, imagem do GHCR)
                                              │                 │
                                              ▼                 ▼
                                     Neon Postgres 16      Cloudflare R2
                                     (banco, free)         (uploads + backups)

GitHub Actions: deploy.yml (build da imagem → GHCR → Deploy Hook do Render)
                backup.yml (pg_dump diário 03:00 UTC → bucket privado fht-backups no R2)
```

- **Render free** hiberna o serviço após 15 min sem tráfego e limita a 512 MB de RAM. O
  keep-alive (abaixo) evita a hibernação. Região **Oregon (EUA)** — o free tier não tem São Paulo.
- **Neon free** hiberna o banco ocioso e limita conexões; por isso o pool Agroal é `max=5`,
  `min=0`, `initial=0`. Crie o projeto em **São Paulo (`sa-east-1`)** se a opção existir no free.
- **Onde os dados ficam:** a aplicação roda nos EUA e o banco fica onde o projeto Neon for criado.
  Isso precisa constar na Política de Privacidade (ver `docs/POLITICA-DE-PRIVACIDADE.md`, seções
  de terceiros e transferência internacional — texto jurídico, não alterado aqui).

---

## Rodar local

Pré-requisitos: Docker Desktop, Git Bash (Windows) ou shell POSIX, OpenSSL. Java 21 só se quiser
rodar a API fora do container.

```bash
cd FHT-SITE
bash setup.sh              # gera as chaves JWT (.pem, fora do git) e o .env, já com as chaves em base64
docker compose up --build  # postgres:16 + backend (JVM) + frontend
```

- API: http://localhost:8080 — Swagger: http://localhost:8080/swagger — Health: http://localhost:8080/q/health
- Postgres: `localhost:5433`, banco `fht_db`, usuário `fht_user`, senha `fht_pass`

> **Volume de dev antigo:** se a sua máquina já rodou a versão completa, o volume do Postgres guarda
> o histórico das migrations V1–V19 e a `V1` nova não bate com ele (checksum mismatch). Uma vez só:
> `docker compose down -v` (apaga os dados de dev) e suba de novo.

No compose a API roda em perfil **prod**: nasce só o admin. Pra ter os dados de demonstração:

```bash
docker exec -i fht_postgres psql -U fht_user -d fht_db < backend/src/main/resources/db/dev/R__seed_dev.sql
```

Sem Docker pra API (banco ainda no compose):

```bash
cd backend
mvnw.cmd quarkus:dev     # Windows: baixa o Maven na primeira execução
mvn quarkus:dev          # Linux/Mac, com Maven instalado
```

Os jars do Maven não vão pro git (`*.jar` no `.gitignore`), então num clone novo o
`.mvn/wrapper/apache-maven-3.9.9/bin/mvn` só funciona depois que o `mvnw.cmd` rodar uma vez.

No perfil **dev** o Hibernate roda com `database.generation=validate` (confere a `V1` contra as
entidades ao subir) e a Flyway aplica também o seed de demonstração (`db/dev/R__seed_dev.sql`,
repetível e idempotente).

### Credenciais de desenvolvimento

| Perfil | E-mail | Senha |
|--------|--------|-------|
| `ADMIN_FHT` | `admin@fht.org.br` | `123456` |
| `ADMIN_CLUBE` | `clube@fht.org.br` | `123456` |

O admin vem da migration `V2__seed_admin.sql` (senha do placeholder `FHT_ADMIN_SENHA`, padrão
`123456`); o clube e o resto dos dados de demonstração vêm do seed do perfil dev.

---

## Variáveis de ambiente

Nada de segredo é commitado: `.env`, `*.pem` estão no `.gitignore` e no `.dockerignore`.

| Variável | Obrigatória em prod | Descrição |
|----------|:---:|-----------|
| `PORT` | auto | Porta HTTP. O Render injeta; local cai em 8080 |
| `DATABASE_URL` | ✅ | URL JDBC do Neon: `jdbc:postgresql://ep-xxx.<região>.aws.neon.tech/neondb?sslmode=require` |
| `DATABASE_USER` / `DATABASE_PASSWORD` | ✅ | Credenciais do Neon (ou embuta na URL como `?user=…&password=…`) |
| `JWT_PUBLIC_KEY` / `JWT_PRIVATE_KEY` | ✅ | O arquivo `.pem` **inteiro em base64, numa linha**: `openssl base64 -A -in publicKey.pem`. Sem elas o serviço **não sobe** (fail-fast: `Failed to load config value ... mp.jwt.verify.publickey.location`) |
| `CORS_ORIGINS` | ✅ | Origens permitidas, separadas por vírgula: a URL do Pages e o domínio |
| `TZ` | ✅ | `America/Araguaina` — regras de data usam o fuso do Tocantins |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | ✅ | Credenciais do R2. Sem elas o upload cai em disco (só serve pra dev) |
| `R2_BUCKET` | | Bucket dos uploads (`fht-documentos`) |
| `R2_PUBLIC_URL` | ✅ | URL pública do bucket (as URLs gravadas no banco começam com ela) |
| `FHT_ADMIN_SENHA` | ✅ sempre | Senha do primeiro `ADMIN_FHT`. A `V2__seed_admin.sql` usa o valor **uma vez** e grava só o hash bcrypt. Sem default em prod: se faltar, a app não sobe (`SRCFG00011 ... quarkus.flyway.placeholders.admin_senha`), inclusive nos boots seguintes. Sem aspas simples |
| `SMTP_MOCK` | | `true` (padrão) = e-mail simulado no log. Pra enviar: `false` + `SMTP_HOST/PORT/USER/PASS/FROM` |
| `FHT_EMAIL_ADMIN` | | Caixa que recebe os avisos (padrão `contato@fht.org.br`) |
| `FHT_ANUIDADE_VALOR` | | Valor da anuidade (padrão `35.00`) |
| `ATLETA_EXPURGO_DIAS` | | Dias até apagar cadastro nunca pago (padrão `90`) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | | Só pro docker compose; `DATABASE_URL` vence quando existe |

---

## Deploy em produção (passo a passo, nessa ordem)

### 1. Neon (banco)

1. Crie o projeto (Postgres **16**, região São Paulo se o free permitir), banco `neondb`.
2. Copie a connection string. Você vai precisar dela em dois formatos:
   - **JDBC** (Render → `DATABASE_URL`): `jdbc:postgresql://<host>/neondb?sslmode=require`, com usuário e senha em `DATABASE_USER`/`DATABASE_PASSWORD`;
   - **libpq** (GitHub → `DATABASE_URL_BACKUP`): `postgresql://<user>:<senha>@<host>/neondb?sslmode=require`.

### 2. Cloudflare R2

1. Bucket `fht-documentos` (uploads) — ligue o acesso público ou um domínio e anote a URL (`R2_PUBLIC_URL`).
2. Bucket `fht-backups` (dumps) — **privado, sem URL pública**: os dumps contêm dados de menores.
3. Token de API S3 com leitura/escrita nos dois buckets → `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`; o `R2_ACCOUNT_ID` está no painel.

### 3. Chaves JWT de produção

Gere um par **novo** (não use o de dev) e converta pra base64 numa linha:

```bash
openssl genrsa -out _raw.pem 2048
openssl pkcs8 -topk8 -inform PEM -in _raw.pem -outform PEM -nocrypt -out privateKey.pem
openssl rsa -in _raw.pem -pubout -out publicKey.pem && rm _raw.pem
openssl base64 -A -in publicKey.pem    # → JWT_PUBLIC_KEY
openssl base64 -A -in privateKey.pem   # → JWT_PRIVATE_KEY
```

Guarde os `.pem` num cofre e apague da máquina.

### 4. Render (API)

1. **Blueprint:** New → Blueprint → aponte pro repositório; o `render.yaml` da raiz cria o serviço
   `fht-backend` (plano free, Oregon, imagem `ghcr.io/gustavo16378/fht-backend:latest`, health
   check em `/q/health/ready`) e pede os valores marcados `sync: false`.
   **Se o free tier recusar blueprint com imagem:** New → Web Service → *Existing image* →
   `ghcr.io/gustavo16378/fht-backend:latest`, plano Free, região Oregon, Health Check Path
   `/q/health/ready`, e cadastre as variáveis da tabela acima à mão.
2. A imagem no GHCR nasce **privada**. Ou torne o pacote público (GitHub → Packages →
   `fht-backend` → Package settings → Change visibility), ou cadastre no Render uma credencial de
   registry (Settings → Registry Credentials) com um PAT do GitHub de escopo `read:packages`.
3. Copie o **Deploy Hook** do serviço (Settings → Deploy Hook) → secret `RENDER_DEPLOY_HOOK_URL`.

### 5. Secrets no GitHub (Settings → Secrets and variables → Actions)

| Secret | Usado por | Valor |
|--------|-----------|-------|
| `RENDER_DEPLOY_HOOK_URL` | `deploy.yml` | URL do Deploy Hook do serviço no Render |
| `DATABASE_URL_BACKUP` | `backup.yml` | Connection string **libpq** do Neon (passo 1) |
| `R2_ACCOUNT_ID` | `backup.yml` | ID da conta Cloudflare |
| `R2_ACCESS_KEY_ID` | `backup.yml` | Token S3 do R2 |
| `R2_SECRET_ACCESS_KEY` | `backup.yml` | Token S3 do R2 |

`GITHUB_TOKEN` é automático (push no GHCR). Sem `RENDER_DEPLOY_HOOK_URL` o workflow publica a
imagem e só avisa que não disparou o deploy.

### 6. Primeiro deploy

`git push` na branch `mvp-free-tier` (ou `main`, depois do merge) com mudança em `backend/**`
dispara `deploy.yml`: build da imagem → push `latest` + `sha` no GHCR → Deploy Hook. Acompanhe em
Actions e nos logs do Render. Na primeira subida a Flyway cria o schema (`V1`) e o admin (`V2`) com
a senha de `FHT_ADMIN_SENHA`. O disparo manual (*Run workflow*) e o backup agendado só existem
depois que os workflows chegam na `main` (ver [Backup](#backup)).

### 7. Keep-alive (não dá pra automatizar por código)

O Render free hiberna após 15 min sem requisição, e o Neon também dorme. Cadastre um monitor
gratuito batendo em `https://<serviço>.onrender.com/q/health` a cada **10 minutos**:

- **cron-job.org:** Create cronjob → URL acima → Schedule "every 10 minutes" → Save; ou
- **UptimeRobot:** New monitor → HTTP(s) → URL acima → interval 10 min (o free permite 5).

O `/q/health` também toca o banco, então mantém os dois acordados.

### 8. Admin em produção

O `ADMIN_FHT` (`admin@fht.org.br`) nasce na `V2__seed_admin.sql` com a senha de `FHT_ADMIN_SENHA`.
A variável continua obrigatória no Render depois disso, mas mudar o valor dela não muda a senha.
Pra trocar a senha, no SQL Editor do Neon:

```sql
UPDATE usuarios SET senha_hash = crypt('NOVA-SENHA', gen_salt('bf', 10)) WHERE email = 'admin@fht.org.br';
```

### 9. Frontend

Configure `VITE_API_URL` no Cloudflare Pages com a URL do Render e inclua a URL do Pages em
`CORS_ORIGINS`. Detalhes em `frontend/README.md`.

---

## Backup

`.github/workflows/backup.yml` roda todo dia às **03:00 UTC** (00:00 em Palmas) e também sob demanda
(*Run workflow*): `pg_dump` com a imagem `postgres:16` (mesma major do Neon) → gzip → `aws s3 cp`
pro bucket **privado** `fht-backups` (prefixo `postgres/`), mantendo os **últimos 30** dumps.
O conteúdo nunca vai pro log.

> ⚠️ **O backup só começa depois do merge na `main`.** É regra do GitHub: workflow agendado
> (`schedule`) só roda a partir da branch padrão do repositório, e o botão *Run workflow* também só
> aparece quando o arquivo existe nela. Enquanto o deploy sair da `mvp-free-tier`, **nenhum backup
> roda**. Depois do merge, abra Actions → "Backup diário do banco" e dispare um *Run workflow* de
> teste pra conferir o dump no bucket.

Pra restaurar:

```bash
aws s3 cp s3://fht-backups/postgres/fht-AAAAMMDD-HHMMSS.sql.gz . --endpoint-url https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
gunzip -c fht-AAAAMMDD-HHMMSS.sql.gz | psql "postgresql://<user>:<senha>@<host>/neondb?sslmode=require"
```

---

## Estrutura

```
src/main/java/br/org/fht/
├── common/      ApiResponse, Campos, CPFValidator, Escopo, Fuso, JwtKeysEnvConfigSource, OpenApiConfig, OrigemRequisicao, SlugGenerator
├── dto/         atleta, auth, clube, contato, galeria, institucional, noticia, pagamento
├── exception/   GlobalExceptionMapper, ValidacaoExceptionMapper, ValidationException
├── mapper/      Atleta, Clube, Diretor, Documento, Foto, Noticia
├── model/       Usuario, Role, Clube, Atleta, Consentimento, PagamentoLote(+Item), Noticia, Foto, Diretor, DocumentoInstitucional
├── repository/  Panache, um por entidade
├── resource/    Auth, Admin, Clube, Atleta, Pagamento, Noticia, Documento, Galeria, Diretor, Contato, Upload, File
├── service/     Clube, Atleta, Pagamento, Noticia, Documento, Galeria, Diretor, Email, Jwt, AtletaExpurgoJob
└── storage/     R2StorageService

src/main/resources/
├── application.properties         # base (prod): tudo por env
├── application-dev.properties     # perfil dev: banco local, SQL no log, validate
├── META-INF/services/…ConfigSource # registra o JwtKeysEnvConfigSource
└── db/migration/V1__schema_inicial.sql, V2__seed_admin.sql
```

## Endpoints

Todos devolvem `ApiResponse<T>` (`{ data, message, status }`). Lista completa e testável no Swagger.

| Grupo | Rotas |
|-------|-------|
| Auth | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/usuarios` |
| Admin | `GET /api/admin/dashboard`, `POST /api/admin/usuarios` |
| Clubes | `POST /api/clubes/solicitar` (público), `GET /api/clubes`, `GET/PUT /api/clubes/{id}`, `PATCH …/aprovar|rejeitar|reconsiderar|suspender|reativar|vitrine`, `GET /api/clubes/publico[/{id}]` (vitrine da home) |
| Atletas | `POST /api/atletas`, `GET /api/atletas`, `GET/PUT/DELETE /api/atletas/{id}`, `POST …/documentos`, `PATCH …/aprovar|rejeitar|reconsiderar|suspender|reativar` |
| Pagamentos | `GET /api/pagamentos/pendentes`, `POST /api/pagamentos` (lote + comprovante), `GET /api/pagamentos[/meus|/{id}]`, `PATCH …/baixar|rejeitar` |
| Notícias | `GET /api/noticias[/{slug}]` (público), `GET /api/noticias/gerenciar`, `POST/PUT/DELETE`, `POST …/upload-imagem` |
| Documentos / Galeria / Diretores | `GET` público + `POST/PUT/DELETE` + upload (admin) |
| Contato | `POST /api/contato` (público, vira e-mail) |
| Upload / Files | `POST /api/upload/arquivo`, `GET /api/files/{path}` (fallback local sem R2) |
| Infra | `GET /q/health`, `GET /q/health/ready`, `GET /swagger`, `GET /q/openapi` |
