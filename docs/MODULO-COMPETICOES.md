# Módulo de Competições — Especificação

> Anotações da visão do Gustavo (sessão 2026-07-10). **Ainda NÃO implementado** — este doc é o
> combinado do que a gente vai construir. Botar em prática depois.
> Relacionado: [[CLAUDE.md]] (roadmap geral), módulo de check-in de atletas no dia dos jogos.

---

## 1. Visão em uma frase

O admin (ADMIN_FHT) cria/edita/deleta competições e **alimenta tudo sobre elas** (equipes,
jogos, placares, resultados). O público vê as competições, entra num **modal de detalhes** e,
depois que a competição rola, consulta os **resultados salvos** (quem enfrentou quem, placares,
quem ganhou, quem participou). O atleta logado consulta **no que ele e o clube dele jogaram**.

---

## 2. Estado atual (o que existe hoje)

- Seção pública **"Competições em Andamento"** já existe: [Competitions.tsx](../frontend/src/components/Competitions.tsx),
  alimentada por dados **estáticos** em [data/competitions.ts](../frontend/src/data/competitions.ts).
- Já tem **filtros** por status (Todos / Em andamento / Inscrições abertas / Em breve / Encerrados)
  e por categoria (Todos / Adulto / Sub-18 / Sub-16 / Sub-14 / Sub-12 / Feminino / Masculino).
- Card mostra: badge de status, tags de categoria/gênero, nome, período (datas), local, nº de equipes,
  e um CTA que muda conforme o status (EM ANDAMENTO / INSCREVER EQUIPE / EM BREVE / Encerrado).
- No **AdminDashboard** a aba "Competições" é um **placeholder "V2"** (desabilitada na nav).
- **NÃO existe** backend de competições (sem entidade, migration, resource).
- **NÃO existe** modal de detalhes da competição (é só o card hoje).

### Modelo estático atual (referência dos campos que já usamos)
```
CompetitionStatus = 'em-andamento' | 'inscricoes-abertas' | 'em-breve' | 'encerrado'
CompetitionCategory = 'adulto' | 'sub-18' | 'sub-16' | 'sub-14' | 'sub-12' | 'feminino' | 'masculino'
Competition = { id, name, category[], status, startDate, endDate, location, teams, registrationLink?, color }
```

---

## 3. Requisitos (o que o Gustavo pediu)

1. **Admin CRUD completo de competição**: criar, **alterar** e deletar cada competição.
2. **Admin alimenta TUDO sobre a competição**: além dos dados básicos, também as equipes
   participantes, os jogos (confrontos), placares e resultados.
3. **Modal de detalhes da competição** (falta fazer): ao clicar no card, abre um modal/painel
   com mais informações — tabela de jogos, classificação, equipes, resultados, etc.
4. **Seção começa vazia**: a seção pública só mostra competições que **alguém criou** (fim dos
   dados estáticos). Sem competição cadastrada → seção vazia (ou estado "nenhuma competição ainda").
5. **Resultados persistidos**: quando a competição passa/encerra, os resultados **ficam salvos no
   banco** e continuam consultáveis.
6. **Visão pública dos resultados**: qualquer um consegue ver **quem enfrentou quem, quantos pontos
   (placar), quem ganhou, quem participou**.
7. **Login do atleta** (perfil sem muito foco): o atleta logado vê **no que ELE jogou** e **o que o
   clube dele jogou** (histórico de partidas do atleta + do clube).
   → ⚠️ **EM SUSPENSO** — perfil ATLETA está em análise por custo/peso (ver §7). Não implementar agora.

---

## 3.1 Fluxo inscrição → escalação → check-in (detalhado pelo Gustavo, jul/2026)

1. Existe uma competição criada (pelo admin).
2. O **clube se inscreve** na competição — **tudo pelo sistema**.
3. Ao se inscrever, o clube **escolhe quais atletas vão jogar** (escalação/relação de inscritos).
4. Essa **relação (competição × clube × atletas escalados)** é o que **alimenta o check-in no dia**.
5. ✅ **Check-in é conferência VISUAL, SEM reconhecimento facial.** No dia, a pessoa olha o sistema,
   vê a **foto + dados** do atleta escalado e **compara na mão** com quem está ali (confere na porta).
   → é por isso que a foto importa: **conferência humana**, não biometria. Confirma a decisão da LGPD:
   foto = dado pessoal **comum**, não sensível. Ver [[LGPD-CONFORMIDADE.md]] §1.2.
6. 🆕 **Troca de atleta na competição** — precisa de opção de **substituir** um atleta escalado por
   outro depois da inscrição (lesão, corte, imprevisto). Registrar a troca.

**Reflexo no modelo (§4):** `Participacao` (clube na competição) carrega a **escalação** = lista de
atletas escalados; a troca edita essa lista; o check-in marca presença por atleta escalado
(`PartidaAtleta`). Elegibilidade dos escalados checa a **anuidade do ano paga**
(ver [[MODULO-DASHBOARD-FINANCEIRO.md]] §4.1).

## 3.2 Painel operacional + acompanhamento "ao vivo" (jul/2026)

Cada competição tem um **painel operacional** onde o admin (ou **outros com permissão** — scope de
competições / Dir. Técnico) entra pra **gerir a competição no dia**: fazer **check-in** dos atletas
escalados e **lançar os resultados**. Conforme lançam, o sistema **reflete pra todo mundo**:

- quem **ganhou / perdeu** (placar de cada jogo),
- **próximo jogo** (quem enfrenta quem),
- **horários** das partidas,
- classificação / chaveamento atualizados,
- tudo mais da competição.

⚠️ **A atualização é MANUAL** — não é sensor nem API externa: o admin **alimenta** placar/resultado a
cada jogo e o sistema propaga. O efeito pra quem acompanha (público + painel) é de "**tempo real**".

**Decisão técnica (a definir):** como dar a sensação de "ao vivo":
- **Polling** (o front recarrega a cada X segundos) — simples, suficiente pra começar. ✅ sugerido.
- **SSE / WebSocket** — atualização instantânea, mais elaborado. Pode ser V2.

Reaproveita a base de busca/painéis do admin (já pensada pra alimentar competições) e amarra com o
check-in (§3.1) e os resultados públicos (§6 / modal do clube).

## 3.3 Painel operacional em TELA CHEIA — o painel do dia do jogo (jul/2026)

Ao clicar em "Gerenciar / Ver mais" numa competição, abre em **TELA CHEIA** (não painel lateral —
tem informação demais). É o painel que a organização usa **ao vivo, no dia do campeonato**.
Organizado em **abas**:

- **Chaveamento (bracket):** visual de mata-mata com as fases (Quartas → Semifinal → Final), cada
  confronto com os 2 clubes + placar, com destaque de **quem avançou** (vencedor) e **quem perdeu**
  (esmaecido). Conectores entre as fases.
- **Equipes & Atletas:** clubes participantes; expandir um clube mostra os **atletas escalados com
  posição**.
- **Check-in (dia do jogo):** lista dos atletas escalados com **busca**, botão **confirmar presença**,
  contador **presentes × faltam** e destaque de **quem falta**. Sem facial — conferência visual (§3.1).
- **Jogos & Placar:** lançar/mostrar **placares** com os clubes e atletas envolvidos; painel "ao vivo".
- **Progressão:** marcar quem **avançou / foi eliminado** → reflete no chaveamento.

É a estrela do módulo — atualização manual, sensação de tempo real (§3.2).

## 4. Modelagem de dados proposta (backend — a validar)

Entidades novas (package `br.org.fht.model`), com migrations Flyway `V6+`:

### `Competicao`
- `id` (UUID), `nome`, `descricao` (texto longo, opcional)
- `categorias` (lista — adulto/sub-18/.../feminino/masculino) → tabela auxiliar ou coluna array/CSV
- `status` (EM_ANDAMENTO | INSCRICOES_ABERTAS | EM_BREVE | ENCERRADO) — **ou derivar de datas?** (ver §7)
- `dataInicio`, `dataFim`
- `local` (texto), `cidade`, `uf`
- `temporada`/`ano`
- `linkInscricao` (opcional), `cor` (opcional, visual do card)
- `regulamentoUrl` (opcional — doc no R2)
- timestamps

### `Participacao` (clube inscrito numa competição) — N:N Clube↔Competicao
- `id`, `competicaoId`, `clubeId`
- Campos de classificação (se pontos corridos): `pontos`, `vitorias`, `empates`, `derrotas`,
  `golsPro`, `golsContra`, `saldo`, `jogos` — **ou derivar das partidas** (ver §7)
- `grupo` (opcional, se houver fase de grupos)

### `Partida` / `Jogo`
- `id`, `competicaoId`
- `clubeMandanteId`, `clubeVisitanteId`
- `dataHora`, `local`
- `placarMandante`, `placarVisitante` (null enquanto não jogada)
- `status` (AGENDADA | ENCERRADA | ADIADA/CANCELADA)
- `fase`/`rodada` (opcional — rodada 1, semifinal, final…)
- vencedor → **derivado** do placar (não precisa coluna)

### `PartidaAtleta` (quem jogou cada partida) — habilita o histórico do atleta e o check-in
- `id`, `partidaId`, `atletaId`, `clubeId`
- opcional: `gols`, `cartoes`, `presente` (check-in no dia)
- **Este é o elo com o módulo de check-in** já previsto no roadmap: registrar presença do
  atleta no jogo. Vale desenhar junto.

> Obs: o campo `teams`/"nº de equipes" do card vira **derivado** = `count(Participacao)`.

---

## 5. Endpoints propostos (a detalhar)

**Público (sem auth):**
- `GET /api/competicoes` — lista (com filtro por status/categoria)
- `GET /api/competicoes/{id}` — detalhe (dados + equipes + jogos + classificação) → alimenta o modal
- `GET /api/competicoes/{id}/jogos` — confrontos e placares
- `GET /api/competicoes/{id}/classificacao` — tabela de pontos

**Admin (ADMIN_FHT):**
- `POST /api/competicoes` — criar
- `PUT /api/competicoes/{id}` — **alterar** (edição completa)
- `DELETE /api/competicoes/{id}` — deletar
- `POST /api/competicoes/{id}/equipes` — inscrever/adicionar clube participante
- `DELETE /api/competicoes/{id}/equipes/{clubeId}` — remover participante
- `POST /api/competicoes/{id}/jogos` — criar confronto
- `PUT /api/jogos/{id}` — lançar/editar placar e status
- `POST /api/jogos/{id}/atletas` — registrar atletas que jogaram (check-in)

**Atleta (perfil ATLETA — ver §7):**
- `GET /api/atletas/me/jogos` — partidas em que o atleta jogou
- `GET /api/clubes/{id}/jogos` (ou `/me/clube/jogos`) — histórico do clube

---

## 6. Telas / UI

### Admin (`AdminDashboard` → aba Competições, hoje placeholder)
- Lista de competições com busca (mesmo padrão de Clubes/Atletas).
- Botão **"Nova competição"** → form (nome, categorias, datas, local, status, etc.).
- **Editar** e **deletar** por competição.
- Painel de detalhe do admin pra **alimentar**: abas/seções pra
  (a) equipes participantes (escolher entre os clubes ATIVOS),
  (b) jogos (criar confrontos, definir data/local),
  (c) lançar placar/resultado,
  (d) registrar atletas/check-in por jogo.
- Reusar componentes existentes: `SearchBar`, `ConfirmModal`, painel deslizante (estilo `ClubeDetailPanel`).

### Público (site one-page)
- Seção `Competitions` passa a consumir a **API real** (fim do `data/competitions.ts`).
- **Modal/painel de detalhes** (NOVO): ao clicar no card, abre com jogos, classificação, equipes,
  resultados. Público, sem login.
- Estado vazio quando não há competição.

### Atleta logado (área do atleta — perfil novo, ver §7)
- Tela simples: "Minhas partidas" (no que joguei) + "Jogos do meu clube".

---

## 7. Decisões (sessão 2026-07-10)

> **Contexto novo:** vai existir **mais de um admin**. Cada membro do comitê da federação terá
> seu próprio login `ADMIN_FHT`, e **todos os admins fazem tudo** (acesso total, sem hierarquia
> entre eles por ora). Hoje o banco só tem 1 admin no seed (`V4`) — vai precisar de gestão de
> múltiplos usuários admin. Isso pesou na decisão de status abaixo.

### ✅ Já decidido
- **Status = AUTOMÁTICO (derivado das datas).** `em-breve` antes de `dataInicio`, `em-andamento`
  entre início/fim, `encerrado` depois. **Motivo:** com vários admins, alguém sempre esquece de
  mudar na mão. → Prever um **override manual** só pros casos que datas não capturam:
  `inscricoes-abertas`, `adiado`, `cancelado`. Regra: se tem override manual setado, ele vence;
  senão, calcula pelas datas. Assim resolve tanto "admin esquece" quanto "jogo foi adiado".
- **Perfil ATLETA = EM ANÁLISE, tendência a NÃO fazer por ora.** O presidente e o Gustavo acham
  que adicionar login de atleta **complica e pesa o sistema sem necessidade** (muito mais usuários,
  banco bem maior, custo de hospedagem podendo ~dobrar). **Consequência prática:** a parte
  "**login do atleta / minhas partidas**" (§3.7) fica **em suspenso** — não implementar agora.
  Se um dia quiserem algo leve, avaliar alternativa **sem login** (ex.: consulta pública do
  histórico por CPF/nome), que não infla a base de usuários.

### ❓ Ainda em aberto
- [ ] **Formato da competição**: pontos corridos, grupos+mata-mata, só lista de jogos? O Gustavo
      não é da área de handebol — **definir depois com o presidente / quem entende do esporte**.
      Isso decide se precisa de classificação, grupos, fases, etc.
- [ ] **Classificação: derivada ou armazenada?** Preferência: derivar das partidas (menos risco de
      inconsistência), calcular no `GET /classificacao`.
- [ ] **Inscrição de equipe**: o botão "INSCREVER EQUIPE" (público) cria uma solicitação, ou é o admin
      que adiciona os clubes manualmente? Hoje o CTA é um link `#cadastro`.
- 🔗 **Regra de elegibilidade (do Financeiro):** a taxa de filiação é **ANUAL** — só pode
      inscrever/escalar atleta cuja **anuidade do ano da competição esteja PAGA**. Ver
      [[MODULO-DASHBOARD-FINANCEIRO.md]] §4.1. Isso vira uma validação na inscrição/escalação.
- [ ] **Stats por atleta**: registrar só presença (check-in) ou também gols/cartões? (meio ligado ao
      perfil atleta, que está em análise).
- [ ] **Categorias**: manter como lista fixa (enum) ou permitir o admin criar categorias?

---

## 8. Ordem de ataque sugerida (quando for implementar)

1. Backend base: entidade `Competicao` + migration + CRUD (`GET/POST/PUT/DELETE`).
2. Admin: aba Competições com lista + form de criar/editar/deletar.
3. Público: ligar a seção `Competitions` na API + **modal de detalhes**.
4. Participantes + Jogos: inscrever clubes, criar confrontos, lançar placares.
5. Resultados públicos: classificação + confrontos visíveis.
6. Check-in de atletas por jogo (`PartidaAtleta`).
7. ~~Perfil ATLETA + tela "minhas partidas / jogos do clube"~~ → **em suspenso** (ver §7: análise de
   custo/peso). Não fazer agora. Se voltar, avaliar versão sem login.
