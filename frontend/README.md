# FHT Frontend

Site oficial da Federação de Handebol do Tocantins — **React 19 + Vite + TypeScript + Tailwind CSS**.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 19 |
| Build | Vite 8 |
| Linguagem | TypeScript 6 |
| Estilo | Tailwind CSS 3 |
| Roteamento | React Router DOM v7 |
| Ícones | Lucide React |
| Auth | JWT decode nativo (`atob`) |

---

## Pré-requisitos

- **Node.js 18+**
- **npm 9+** (ou pnpm/yarn)

---

## Setup

```bash
npm install
npm run dev
```

Site disponível em: `http://localhost:5173`

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção (`dist/`) |
| `npm run preview` | Prévia do build de produção |
| `npm run lint` | Lint com ESLint |

---

## Estrutura do projeto

```
src/
├── components/          # Seções da landing page
│   ├── Navbar.tsx       # Navbar com hide-on-scroll + menu mobile
│   ├── Hero.tsx         # Banner principal
│   ├── About.tsx        # Sobre a FHT
│   ├── Clubs.tsx        # Clubes filiados
│   ├── Competitions.tsx # Competições
│   ├── News.tsx         # Notícias
│   ├── Documents.tsx    # Documentos e regulamentos
│   ├── Gallery.tsx      # Galeria de fotos
│   ├── Referees.tsx     # Árbitros + formulário de candidatura
│   ├── Contact.tsx      # Contato
│   ├── Footer.tsx       # Rodapé
│   ├── Registration.tsx # Modal de cadastro de clube
│   ├── ArbitroForm.tsx  # Modal de candidatura de árbitro
│   ├── ScrollProgress.tsx  # Barra de progresso de scroll (amarela)
│   ├── SocialIcons.tsx  # Ícones flutuantes de redes sociais
│   └── CookieBanner.tsx # Banner de cookies
│
├── pages/               # Páginas do sistema (rotas protegidas)
│   ├── Login.tsx        # Página de login
│   ├── AdminDashboard.tsx   # Painel do administrador FHT
│   └── ClubeDashboard.tsx   # Painel do representante de clube
│
├── context/
│   └── AuthContext.tsx  # Contexto de autenticação + mock credentials
│
├── App.tsx              # Roteamento principal (BrowserRouter)
└── main.tsx             # Entry point
```

---

## Roteamento

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/` | Landing page completa | Público |
| `/login` | Login | Público |
| `/admin` | AdminDashboard | `ADMIN_FHT` |
| `/clube` | ClubeDashboard | `ADMIN_CLUBE` |

Rotas protegidas redirecionam para `/login` se não autenticado, e para a rota correta de acordo com o role se autenticado com role diferente.

---

## Autenticação

O sistema usa JWT armazenado em `localStorage`. A decodificação é feita nativamente via `atob(token.split('.')[1])` — sem dependência externa.

### Credenciais de mock (desenvolvimento)

Funcionam sem backend rodando:

| Role | E-mail | Senha | Destino |
|------|--------|-------|---------|
| `ADMIN_FHT` | `admin@fht.com.br` | `123456` | `/admin` |
| `ADMIN_CLUBE` | `clube@fht.com.br` | `123456` | `/clube` |

> As credenciais reais do backend são `admin@fht.org.br` / `123456` (diferentes das de mock).
> Quando o backend estiver rodando, qualquer e-mail não listado no mock fará chamada real à API.

### Variável de ambiente

```bash
# .env.local
VITE_API_URL=http://localhost:8080
```

---

## Tema e design

O design segue a identidade visual da FHT:

| Token | Valor | Uso |
|-------|-------|-----|
| `federation` | `#003087` | Azul federação (cor primária) |
| `gold` | `#FFD700` | Dourado (destaques e CTAs) |
| `fht-white` | `#F0F4FF` | Branco frio (textos) |
| `gray-soft` | `#94A3B8` | Cinza suave (textos secundários) |
| `dark-bg` | `#0A0E1A` | Fundo escuro principal |

Fontes: **Bebas Neue** (headings) + **Inter** (body).

---

## Funcionalidades

### Landing page
- Navbar com hide-on-scroll e menu mobile com portal + scroll lock
- Barra de progresso de scroll amarela (substitui scrollbar nativa)
- Modal de cadastro de clube (formulário de filiação)
- Modal de candidatura de árbitro
- Cookie banner
- Ícones flutuantes de redes sociais

### Painel Admin FHT (`/admin`)
- Dashboard com totais de clubes e atletas
- Lista de clubes pendentes com ações de aprovar/rejeitar
- Lista de atletas pendentes com ações de aprovar/rejeitar
- Visualização de documentos enviados

### Painel Clube (`/clube`)
- Dashboard do clube com status da filiação
- Lista de atletas do clube
- Formulário de cadastro de novo atleta
- Upload de comprovante de pagamento

---

## Build de produção

```bash
npm run build
```

Gera a pasta `dist/` pronta para deploy em qualquer servidor estático (Netlify, Vercel, Railway Static, etc.).

Para roteamento com React Router funcionar em produção, configure o servidor para redirecionar todas as rotas para `index.html`.

**Exemplo para Netlify** (`public/_redirects`):
```
/* /index.html 200
```

**Exemplo para Nginx:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
