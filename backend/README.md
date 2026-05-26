# FHT Backend

API da Federação de Handebol do Tocantins — **Java 21 + Quarkus 3.15 + PostgreSQL 16**.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Quarkus 3.15.1 (JVM mode) |
| Linguagem | Java 21 (Temurin) |
| ORM | Hibernate ORM Panache |
| Banco | PostgreSQL 16 (Docker local) |
| Migrations | Flyway |
| Autenticação | SmallRye JWT (RSA 2048) |
| Storage | Cloudflare R2 (AWS SDK v2 S3) |
| Validação | Hibernate Validator (Jakarta) |
| Monitoramento | Sentry Core SDK |
| Documentação | MicroProfile OpenAPI + Swagger UI |
| Deploy | Railway + Docker + GitHub Actions |

---

## Pré-requisitos

- **Java 21** (JDK Temurin)
- **Docker + Docker Compose**
- **OpenSSL** (para gerar as chaves JWT)

> Maven não precisa estar instalado globalmente — o `mvnw.cmd` faz o download automático na primeira execução.

---

## Setup inicial

### 1. Banco de dados (Docker)

```bash
docker-compose up -d
```

Sobe PostgreSQL 16 na porta `5432` com healthcheck. Credenciais definidas no `docker-compose.yml`:
- Usuário: `fht_user` / Senha: `fht_pass` / Banco: `fht_db`

### 2. Chaves JWT (RSA 2048)

```bash
bash gerar-chaves-jwt.sh
```

Gera dois arquivos em `src/main/resources/`:
- `privateKey.pem` — assina tokens (**nunca commitar — já no `.gitignore`**)
- `publicKey.pem` — verifica tokens (pode commitar)

### 3. Variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais R2 e Sentry (opcional em dev)
```

### 4. Executar em modo dev

```bash
./mvnw.cmd quarkus:dev      # Windows
./mvnw quarkus:dev          # Linux/Mac
```

API disponível em: `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger`

---

## Credenciais de desenvolvimento

| Role | E-mail | Senha |
|------|--------|-------|
| `ADMIN_FHT` | `admin@fht.org.br` | `123456` |

> Criado automaticamente pela migration `V4__seed_admin.sql` via Flyway na primeira inicialização.

---

## Estrutura do projeto

```
src/main/java/br/org/fht/
├── admin/          # AdminResource — dashboard e gestão de usuários
├── atleta/         # Atleta entity, repository, service, resource + DTOs
├── auth/           # JwtService, AuthResource + DTOs de login
├── clube/          # Clube entity, repository, service, resource + DTOs
├── common/         # ApiResponse, OpenApiConfig, SentryInitializer, exceptions
├── storage/        # R2StorageService (Cloudflare R2 via AWS SDK v2)
├── upload/         # UploadResource — endpoint genérico de upload
└── usuario/        # Usuario entity, UsuarioRepository, Role enum

src/main/resources/
├── application.properties        # Configuração base (prod)
├── application-dev.properties    # Overrides de desenvolvimento
└── db/migration/
    ├── V1__create_clubes.sql
    ├── V2__create_usuarios.sql
    ├── V3__create_atletas.sql
    └── V4__seed_admin.sql
```

---

## Endpoints

### Autenticação — `/api/auth`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/api/auth/login` | Público | Login — retorna `token` + `refreshToken` |
| `POST` | `/api/auth/refresh` | Público | Renova access token com refresh token |
| `POST` | `/api/auth/usuarios` | `ADMIN_FHT` | Cria usuário `ADMIN_CLUBE` |

### Clubes — `/api/clubes`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/api/clubes/solicitar` | Público | Solicitar filiação (multipart: ata + estatuto) |
| `GET` | `/api/clubes` | `ADMIN_FHT` | Listar todos os clubes |
| `GET` | `/api/clubes/{id}` | Ambos | Buscar clube (ADMIN_CLUBE só vê o próprio) |
| `PATCH` | `/api/clubes/{id}/aprovar` | `ADMIN_FHT` | Aprovar clube + criar credenciais |
| `PATCH` | `/api/clubes/{id}/rejeitar` | `ADMIN_FHT` | Rejeitar com motivo |

### Atletas — `/api/atletas`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/api/atletas` | `ADMIN_CLUBE` | Cadastrar atleta (multipart: foto + docs) |
| `GET` | `/api/atletas` | Ambos | Listar (FHT: todos | Clube: só do próprio) |
| `GET` | `/api/atletas/{id}` | Ambos | Buscar atleta por ID |
| `PATCH` | `/api/atletas/{id}/aprovar` | `ADMIN_FHT` | Aprovar (exige comprovante de pagamento) |
| `PATCH` | `/api/atletas/{id}/rejeitar` | `ADMIN_FHT` | Rejeitar com motivo |
| `DELETE` | `/api/atletas/{id}` | `ADMIN_FHT` | Deletar permanentemente |

### Admin — `/api/admin`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/api/admin/dashboard` | `ADMIN_FHT` | Totais: clubes, atletas, usuários |
| `POST` | `/api/admin/usuarios` | `ADMIN_FHT` | Criar usuário ADMIN_CLUBE manualmente |

### Upload — `/api/upload`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/api/upload/arquivo` | Autenticado | Upload de arquivo para Cloudflare R2 |

---

## Formato de resposta

Todos os endpoints retornam `ApiResponse<T>`:

```json
{
  "data": { ... },
  "message": "Descrição do resultado",
  "status": 200
}
```

Erros retornam `data: null` e `status` com o código HTTP correspondente.

---

## Status de entidades

### Clube
| Status | Significado |
|--------|-------------|
| `PENDENTE` | Aguardando análise da FHT |
| `ATIVO` | Aprovado e filiado |
| `REJEITADO` | Documentação recusada |
| `SUSPENSO` | Suspenso pela federação |

### Atleta
| Status | Significado |
|--------|-------------|
| `AGUARDANDO_PAGAMENTO` | Cadastrado, aguardando comprovante Pix |
| `ATIVO` | Aprovado e filiado |
| `REJEITADO` | Cadastro recusado |
| `SUSPENSO` | Suspenso pela federação |

---

## Variáveis de ambiente (produção)

| Variável | Descrição |
|----------|-----------|
| `DB_HOST` | Host do PostgreSQL |
| `DB_NAME` | Nome do banco |
| `DB_USER` | Usuário do banco |
| `DB_PASS` | Senha do banco |
| `R2_ACCOUNT_ID` | ID da conta Cloudflare |
| `R2_ACCESS_KEY_ID` | Access Key ID do R2 |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key do R2 |
| `R2_BUCKET` | Nome do bucket R2 |
| `R2_PUBLIC_URL` | URL pública do bucket R2 |
| `SENTRY_DSN` | DSN do projeto Sentry (opcional) |

> Em desenvolvimento, as variáveis R2 são opcionais — o upload ficará desabilitado com aviso no log.

---

## Build e deploy

### Build local

```bash
./mvnw.cmd package -DskipTests      # Windows
./mvnw package -DskipTests           # Linux/Mac
```

### Docker

```bash
docker build -t fht-backend .
docker run -p 8080:8080 --env-file .env fht-backend
```

### GitHub Actions (CI/CD)

O arquivo `.github/workflows/deploy.yml` faz:
1. Build com Maven (Java 21 Temurin)
2. Build e push da imagem Docker para o registry
3. Trigger de deploy no Railway via webhook

Dispara automaticamente em push na branch `main` com alterações em `backend/**`.

**Secrets necessários no repositório:**
- `REGISTRY_URL`, `REGISTRY_USER`, `REGISTRY_PASSWORD`
- `RAILWAY_WEBHOOK_URL`
