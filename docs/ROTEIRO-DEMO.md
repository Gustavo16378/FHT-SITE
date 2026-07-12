# Roteiro de Demonstração — FHT (reunião com o presidente)

> Guia pra apresentar o sistema. **Regra de ouro:** deixe claro o que é **REAL** (funciona de
> verdade, salva no banco) e o que é **DEMONSTRAÇÃO** (tela pronta, dados de exemplo, backend vem
> nas próximas etapas). Isso passa credibilidade — mostra o que já existe E a visão completa.

## Antes de começar
- Suba a stack: `docker compose up -d` (na pasta FHT-SITE). Se o banco estiver vazio, rode o seed:
  `docker exec -i fht_postgres psql -U fht_user -d fht_db < scripts/seed_teste.sql`
- Front: http://localhost:5173 · Login: http://localhost:5173/login
- **Credenciais:** admin `admin@fht.org.br` / `123456` · clube `clube@fht.org.br` / `123456`

---

## Roteiro (ordem sugerida — ~10-15 min)

### 1. O site público (a cara da federação) — REAL
Abra `http://localhost:5173`. Role pelas seções: Hero, Competições, Notícias, Sobre, Clubes,
Árbitros, Galeria, Transparência/Documentos, Contato. Destaque: **está no ar, responsivo, moderno**.
Mostre o menu e o rodapé.

### 2. Login e área restrita — REAL
Clique em **Entrar** → logue como **admin**. Cai no painel `/admin`.

### 3. Painel do Admin — o que JÁ FUNCIONA (real, salva no banco)
- **Dashboard**: números reais + gráficos (afiliações por mês, composição de atletas).
- **Clubes**: clique em "Ver mais" num clube → mostra **tudo** (dados, representante, documentos,
  atletas). **Aprove/suspenda** um clube — isso é real, muda o status no banco.
- **Atletas**: "Ver mais" mostra o cadastro completo + documentos. **Aprovar/rejeitar/suspender** é real.
  Repare no aviso de "clube suspenso" quando aplicável.
> Frase: "Esse fluxo de gestão de filiados já está funcionando de verdade."

### 4. Painel do Admin — a VISÃO (telas prontas, dados de exemplo)
Passeie pelas seções do menu — todas navegáveis:
- **Competições** ⭐: crie uma (botão), e em "Gerenciar" mostre as abas **Equipes / Jogos /
  Classificação** + o **painel de placar ao vivo**. É o coração do sistema.
- **Financeiro**: KPIs, gráfico de receita por mês, **balanço (entradas × saídas)**, tabela de
  anuidades. Explique a regra: **anuidade anual habilita competir no ano**.
- **Notícias**: abra "Nova notícia" → o **editor de blog** (WYSIWYG).
- **Diretoria**: cards dos diretores → clique num → **currículo editável**.
- **Documentos**: clique em "Visualizar" → **viewer de PDF**.
- **Galeria**: mosaico de fotos com legendas.
- **Usuários & Admins**: a **hierarquia** (DEV → Master → Comitê → Clube) + permissões por área.
> Frase: "Essas telas mostram a visão completa; os dados são de exemplo, e a gente liga no banco
> módulo a módulo nas próximas etapas."

### 5. Painel do Clube — REAL
No rodapé do menu, clique em **"Ver site"** (mostra que circula logado) → depois **Sair** →
logue como **clube**. No `/clube`:
- **Dashboard** com gráficos (elenco por categoria = real; desempenho = exemplo).
- **Meus Atletas**: "Ver / editar" → veja tudo e **edite os dados** (real, salva). Escopo: o clube
  só vê e edita **os próprios** atletas.
- **Cadastrar Atleta**: mostre o formulário **multi-step** (dados, endereço com busca de CEP,
  posição/categoria, documentos + Pix).

### 6. Fechamento — a conversa estratégica
- **O que entra no lançamento de agosto (MVP)** vs. o que vem depois (ex.: Competições completo,
  Financeiro real). Ver backlog no `CLAUDE.md`.
- **LGPD**: como cadastramos **menores** (Sub-12 a Sub-18), o cadastro vai exigir **consentimento do
  responsável** (art. 14). Já temos um guia de conformidade (`docs/LGPD-CONFORMIDADE.md`). Passar
  segurança de que isso está sendo tratado.
- **Decisão pro presidente**: vão abrir o cadastro de atletas já no lançamento? (isso define o
  esforço de LGPD antes de agosto).

---

## Dicas
- Se algo de "demonstração" for questionado, seja direto: "essa tela está pronta; falta ligar no
  banco — é a próxima etapa". Não venda mock como pronto.
- Tenha o **site público** e um **clube já aprovado com atletas** prontos (o seed já cria isso).
- Se cair a stack, `docker compose up -d` e recarregue.
