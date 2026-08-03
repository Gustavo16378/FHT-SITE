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

---

## ⚠️ MUDANÇA DE REGRA (ago/2026) — cadastro passou a ser INTERNO

A federação informou que **existe uma comissão de arbitragem que cuida disso**. O módulo foi
invertido:

| Antes | Agora |
|---|---|
| Qualquer um pedia pelo site ("Quero ser árbitro") | **Só a comissão da FHT cadastra** |
| Nascia `PENDENTE`, a FHT credenciava | **Nasce `CREDENCIADO`** |
| Candidato se auto-declarava (já é árbitro? tem experiência?) | A federação preenche a ficha oficial |

**Árbitro não tem painel próprio** — não é usuário do sistema, é um cadastro que a federação
mantém e publica no site.

### O que mudou no código
- **Migration `V14`**: dropou as 8 colunas que só existiam para a petição pública
  (`ja_arbitro`, `nivel_atual`, `federacao_origem`, `tem_experiencia`, `descricao_experiencia`,
  `disponibilidade_fds`, `curso_interesse`, `comprovante_escolar_url`).
- **Saiu** `POST /api/arbitros/solicitar` (era o único endpoint público de escrita do sistema).
- **Entraram** `POST /api/arbitros`, `PUT /api/arbitros/{id}` e `DELETE /api/arbitros/{id}`,
  todos `ADMIN_FHT`.
- **Frontend**: `ArbitroForm.tsx` deletado; em `Referees.tsx` o botão "QUERO SER ÁRBITRO" virou
  "FALE COM A ARBITRAGEM" (âncora para o contato), com o aviso de que o credenciamento é interno.
- **Painel admin**: botão "Cadastrar árbitro" + modal de ficha (cadastro e edição), e ação
  "Editar" na linha de cada árbitro.

### Um bug que a inversão consertou de graça
`nivel`, `registro`, `inicioArbitragem` e `formacao` existiam no modelo e apareciam na ficha do
painel, mas **nenhum endpoint os gravava** — não havia `PUT`, e o `/solicitar` não os setava.
Metade da ficha só podia ser preenchida por SQL. Agora o `PUT` grava tudo.

### Pendências
- Os status `PENDENTE` e `REJEITADO` continuam existindo só para os registros que vieram do
  formulário antigo. A migration não os apagou de propósito — quem decide o que fazer com uma
  solicitação pendurada é a federação, no painel.
- Os **cursos de arbitragem** exibidos na home seguem estáticos em `src/data/referees.ts` (não há
  módulo de cursos).
