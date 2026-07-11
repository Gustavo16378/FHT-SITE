# Módulo Admins, Hierarquia & Permissões — Especificação

> Anotações da visão do Gustavo (sessões jul/2026). **Ainda NÃO implementado.**
> Consolida o que estava espalhado: hierarquia de admins, painel DEV do Gustavo, permissões por
> área e edição dos dados dos filiados. Relacionado: [[CLAUDE.md]], [[MODULO-INSTITUCIONAL.md]] (§C).
> ⭐ **Provável PRIMEIRO módulo a implementar** — impacta o acesso de todos os outros.

---

## 1. Níveis de acesso (hierarquia)

```
DEV / DONO (Gustavo)         ← topo absoluto, painel exclusivo, vê e altera TUDO de todos
   └─ ADMIN MASTER (Presidente?) ← comanda os outros admins (cria/remove/define permissões)
        └─ ADMINS DO COMITÊ       ← diretoria, com permissões POR ÁREA (cargo)
             └─ ADMIN_CLUBE       ← só o próprio clube (já existe)
```

### 1.1 DEV / DONO — painel exclusivo do Gustavo ⭐ (novo pedido)
- Um **painel de dev só dele**, acima de tudo.
- **Acesso a TUDO de TODO MUNDO** — inclusive **nome e e-mail** de admins, clubes e atletas.
- Pode **alterar qualquer dado de qualquer um**. Motivo real: suporte — "vai que alguém pede pra
  eu alterar os dados de alguém".
- Gustavo: "acho que não mudaria muita coisa" → na prática é o **painel admin com acesso total
  irrestrito** (todos os scopes ligados) + visão de coisas que nem os admins veem (ex.: dados/
  logins de outros admins). Pode ser um **role `DEV`/`OWNER`** no topo, ou uma flag `isDev`.

### 1.2 ADMIN MASTER (candidato: Presidente)
- Único que **gerencia os outros logins de admin**: criar, remover, e **definir o que cada um pode**.
- Ver [[MODULO-INSTITUCIONAL.md]] §C: Presidente ≈ master.

### 1.3 ADMINS DO COMITÊ (a diretoria)
- Cada membro da diretoria tem login e **permissões por área**, seguindo o cargo:
  | Cargo | Área (scope) |
  |---|---|
  | Presidente / Vice | tudo (master) |
  | Dir. de Arbitragem | árbitros |
  | Dir. de Comunicação | notícias/blog + galeria |
  | Dir. Financeira | taxas/pagamentos de atletas |
  | Dir. Técnico | competições / atletas |
- **Todos** conseguem ver e (ver §3) **alterar dados dos filiados**.

### 1.4 ADMIN_CLUBE — já existe (só o próprio clube).

---

## 2. Modelo de permissões (a decidir) ⚙️

Como vem MUITA funcionalidade e níveis diferentes, a recomendação é **permissões flexíveis por
scope** em vez de um role hardcoded por feature:

- Manter os **roles** de alto nível (`DEV`, `ADMIN_FHT`, `ADMIN_CLUBE`) e adicionar um conjunto de
  **permissões/scopes** por usuário admin (ex.: `noticias:write`, `arbitros:write`,
  `competicoes:write`, `financeiro:write`, `admins:manage`).
- O **master** liga/desliga scopes de cada admin do comitê. **DEV** tem todos. Presidente também.
- Vantagem: adicionar feature nova = adicionar um scope, sem refatorar o auth.
- **A confirmar:** scopes seguem automaticamente o cargo, ou o master marca manualmente?

---

## 3. Edição dos dados dos filiados (novo pedido)

- **Admins podem VER e ALTERAR os dados dos filiados** (clubes e atletas) pelo painel — nome, e-mail,
  etc. Não só aprovar/rejeitar/suspender: **editar os campos**.
- Hoje o backend **NÃO tem** endpoint de edição: só existe aprovar/rejeitar/suspender/reativar e
  (atleta) deletar. **Falta** `PUT /api/clubes/{id}` e `PUT /api/atletas/{id}` + os forms de edição
  no painel de detalhe.
- **DEV** edita qualquer um; **admins** editam os filiados; (a confirmar) admin do comitê edita
  conforme scope.

### Consideração de boas práticas (sugestão minha)
- ⚙️ Como vários admins + o dev vão **alterar dados de terceiros** "a pedido", vale um **log de
  auditoria** (quem alterou o quê e quando). Barato de fazer e salva a pele em disputa. + atenção a
  **LGPD/privacidade**: nome/e-mail/CPF são dados pessoais; acesso amplo deve ser consciente.

---

## 4. Impacto no que já existe

- **Backend:** `Usuario` já tem `role` (ADMIN_FHT | ADMIN_CLUBE) e `clubeId`. Vai precisar de:
  nível DEV, tabela/coluna de **scopes**, e um seed do usuário DEV (Gustavo).
- **Auth/JWT:** o token já carrega `role`; passaria a carregar também os **scopes** (ou buscar no
  backend). O front usa isso pra mostrar/esconder seções do painel.
- **Frontend:** o `AdminDashboard` renderiza abas conforme os scopes; painel DEV é uma extensão
  (mesmo dashboard, tudo liberado + gestão de admins + visão global).

---

## 5. Decisões em aberto
- [ ] `DEV` como role próprio no topo, ou flag `isDev` sobre `ADMIN_FHT`?
- [ ] Scopes automáticos por cargo vs. marcados à mão pelo master?
- [ ] Presidente = master automaticamente, ou o dev define quem é o master?
- [ ] Log de auditoria de alterações: fazer desde já ou depois?
- [ ] Lista final de scopes (fechar quando o backlog de features estabilizar).

---

## 6. Ordem de ataque sugerida
1. Definir modelo: roles + scopes + nível DEV (this doc §2).
2. Backend: coluna/tabela de scopes em `Usuario`; seed do DEV; JWT carregando scopes.
3. `PUT` de edição de clube e atleta + (opcional) log de auditoria.
4. Admin: gestão de usuários admin (master cria/edita admins e seus scopes) + criar login de clube
   (aquele elo perdido já identificado no fluxo admin).
5. Front: dashboard sensível a scopes; painel DEV (visão global).
