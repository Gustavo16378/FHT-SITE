# Módulo Árbitros — Especificação

> Anotações da sessão 2026-07-10. Relacionado: [[CLAUDE.md]], [[MODULO-ADMINS-PERMISSOES.md]]
> (scope Dir. de Arbitragem), [[MODULO-COMPETICOES.md]] (árbitro apita jogos).

---

## 1. Estado atual
- No painel admin, Árbitros é **mock local** (`arbitrosMock` em
  [AdminDashboard.tsx](../frontend/src/pages/AdminDashboard.tsx)) — **sem backend**
  (nenhum model/migration/resource `Arbitro`).
- ✅ **Feito nesta sessão:** árbitro enriquecido com campos de verdade + **painel de detalhe
  `ArbitroDetailPanel`** ("ver tudo") + ações **Credenciar / Rejeitar / Desativar / Reativar**
  (status `PENDENTE → CREDENCIADO → SUSPENSO`, e `REJEITADO`). Tudo em estado local por enquanto.
- Existe um `ArbitroForm.tsx` público (site) que faz `POST /api/arbitros/solicitar` — **endpoint
  ainda não existe** no backend, então hoje quebra.

## 2. Campos propostos do árbitro (o "o que precisa pra ser árbitro" — validar)
Definidos pra destravar o cadastro/aprovação. Ajustar com o Gustavo / Dir. de Arbitragem:

**Dados pessoais:** nome, CPF, data de nascimento, foto, cidade, UF, telefone, e-mail.
**Arbitragem:**
- `nivel` / categoria — **Regional, Estadual B, Estadual A, Nacional** (definido na credencial).
- `registro` — nº da credencial (ex.: `ARB-TO-0042`).
- `inicioArbitragem` — desde quando apita (ano).
- `formacao` — curso de formação / reciclagem (ex.: "Curso de Formação de Árbitros CBHb 2015").
**Status:** `PENDENTE` (solicitou) → `CREDENCIADO` (aprovado, com nível) → `SUSPENSO` (desativado) /
`REJEITADO` (com motivo).

> ❓ A confirmar com quem entende: precisa de **documentos** (certificado do curso, doc de identidade)?
> Exame físico/teste? Categoria muda por temporada? Árbitro tem anuidade também?

## 3. O que falta (backend do módulo)
- Entidade `Arbitro` + migration + repository + service + `ArbitroResource` (CRUD + credenciar/
  rejeitar/suspender/reativar), espelhando o padrão de Clube/Atleta.
- Endpoint público `POST /api/arbitros/solicitar` (o `ArbitroForm` já chama).
- Trocar o mock do painel por chamadas reais (igual foi feito com Clubes/Atletas).
- Upload de foto/certificado → depende do R2 (última etapa).

## 4. Ordem sugerida
1. Fechar os campos (§2) com o Gustavo/Dir. de Arbitragem.
2. Backend `Arbitro` (CRUD + ações de status).
3. Ligar o painel na API (tirar o mock).
4. Endpoint público de solicitação + `ArbitroForm`.
