# Módulo Dashboard (Analytics) + Financeiro — Especificação

> Anotações da visão do Gustavo (sessão 2026-07-10). **Ainda NÃO implementado.**
> Relacionado: [[CLAUDE.md]], [[MODULO-ADMINS-PERMISSOES.md]] (acesso financeiro = scope da Dir.
> Financeira), [[LGPD-CONFORMIDADE.md]].

---

## 1. Visão
O **Dashboard do admin** deixa de ser só 3 números e ganha **gráficos** (afiliações ao longo do
tempo, comparações mensais) e uma **área financeira completa**, com opção de **baixar o balanço /
relatório financeiro** (PDF/Excel).

## 2. Estado atual
- Dashboard hoje = 3 cards de contagem (Clubes, Atletas, Usuários), alimentados por
  `GET /api/admin/dashboard` (`AdminDashboardDTO` — só totais/pendentes/ativos). Ver
  [AdminDashboard.tsx](../frontend/src/pages/AdminDashboard.tsx) `DashboardPage`.
- **Sem gráficos, sem série temporal, sem financeiro.**
- Base financeira que JÁ existe no backend: o atleta tem `taxaValor`, `taxaAno`,
  `comprovantePagamentoUrl` e status `AGUARDANDO_PAGAMENTO → ATIVO`. É o embrião da parte financeira
  (taxa de filiação por atleta).

## 3. Requisitos (o que o Gustavo pediu)
1. **Gráficos no dashboard:**
   - Quantos estão se **afiliando** (novos clubes/atletas ao longo do tempo).
   - **Comparações mensais** (mês a mês).
   - Visão da **parte financeira**.
2. **Parte financeira COMPLETA** — gestão de receitas/taxas/pagamentos.
3. **Baixar o balanço / relatório financeiro** (exportar — PDF e/ou Excel/CSV).

## 4. Escopo do financeiro — ✅ A + B (taxas E contabilidade)
Decisão do Gustavo: fazer os **DOIS** — controle de taxas/anuidades (A) **e** contabilidade completa
com **entradas e saídas / balanço** (B). É o módulo mais robusto do backlog (peso alto — pesar no
corte de escopo do lançamento de agosto).

### 4.1 ⭐ Regra de negócio: ANUIDADE
- A taxa de filiação é **ANUAL** (por temporada/ano). O modelo já tem `taxaAno` no atleta.
- **Pagar a anuidade do ano habilita a participar dos eventos daquele ano** (competições da temporada).
  → **elegibilidade pra competir = anuidade do ano PAGA.**
- Consequência: a filiação **vence e renova por ano**. Um atleta ATIVO em 2025 precisa renovar (pagar)
  2026 pra continuar elegível. Status/elegibilidade ganha dimensão de **ANO** (não é "ativo pra sempre").
- 🔗 Amarra com [[MODULO-COMPETICOES.md]]: inscrever/escalar atleta numa competição **checa a anuidade
  do ano da competição**.
- [ ] A confirmar: anuidade é só do **atleta**, ou o **clube** também paga anuidade própria?

### 4.2 Fontes de receita e lançamentos
- **Anuidade de atleta** (base já existe: `taxaValor`/`taxaAno`, comprovante Pix).
- Anuidade de clube? (a confirmar).
- Inscrição em competições? (quando o módulo existir).
- **Despesas / saídas** (parte B): custos de competição, despesas administrativas, patrocínios
  (entrada), etc. → alimentam o **balanço** (entradas × saídas).

## 5. Backend necessário
- **Endpoints de analytics/agregação** (novos), ex.:
  - `GET /api/admin/analytics/afiliacoes?por=mes` → série temporal de novos clubes/atletas.
  - `GET /api/admin/analytics/financeiro?ano=2026` → receita por mês, pago vs. pendente.
- **Modelo financeiro** — decidir o nível:
  - Mínimo: derivar dos atletas (soma de `taxaValor` por status/mês).
  - Completo: entidade `Pagamento`/`Lancamento` (valor, tipo, data, status, origem: atleta/clube/
    competição), pra sustentar um balanço de verdade.
- **Exportação**: endpoint `GET /api/admin/financeiro/relatorio?formato=pdf|csv` gerando o arquivo.

## 6. Frontend
- **Lib de gráficos** — sugestão **Recharts** (React-first, leve, fácil) ou Chart.js. Definir (§7).
- Dashboard: cards atuais + gráficos (linha/área pra afiliações no tempo; barras pra comparação
  mensal; pizza/barras pro financeiro pago×pendente).
- Aba/pág **Financeiro** dedicada (dentro do painel) com a visão completa + botão "Baixar balanço".
- ⚠️ Exportar PDF no front pode usar lib (jsPDF) OU o backend gera — decidir.

## 7. Decisões em aberto
- [x] ~~Escopo: taxas ou contabilidade?~~ → **DECIDIDO: A + B** (taxas/anuidades **e** contabilidade
      entradas×saídas com balanço). Escopo grande — pesar no MVP.
- [x] ~~Palavra?~~ → **"balanço"**.
- [ ] Anuidade: só atleta, ou clube também paga? (§4.1)
- [ ] Quais fontes de receita/despesa entram no balanço (competições, patrocínios, custos)?
- [ ] Lib de gráficos (Recharts recomendado).
- [ ] Exportação: PDF, Excel/CSV, ou os dois? Gerado no back ou no front?
- [ ] **Acesso restrito:** a área financeira deve ser visível só pra quem tem o scope financeiro
      (Dir. Financeira / master / DEV) — ver [[MODULO-ADMINS-PERMISSOES.md]]. Não é todo admin que vê
      valores.

## 8. Ordem de ataque sugerida
1. Fechar escopo do financeiro (§7) — é o que mais varia em tamanho.
2. Endpoints de analytics de afiliação (série temporal) — dá pra fazer já, com os dados existentes.
3. Gráficos no dashboard (afiliações + comparação mensal).
4. Modelo/gestão financeira conforme o escopo decidido.
5. Exportação do balanço/relatório.
6. Restringir a área financeira por permissão.
