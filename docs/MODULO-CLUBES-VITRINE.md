# Módulo Clubes — Vitrine Pública + Modal — Especificação

> Anotações da visão do Gustavo (sessão 2026-07-10). **Ainda NÃO implementado.**
> Relacionado: [[CLAUDE.md]], [[MODULO-COMPETICOES.md]] (competições que o clube participou).
> Obs: o **backend de Clube já existe** (CRUD admin, aprovar/rejeitar/suspender/reativar). Este
> módulo é a **vitrine pública** + **modal de detalhes** + **integração com a aprovação**.

---

## 1. Visão em uma frase

A seção **"Clubes que fazem o handebol acontecer"** deixa de ser estática: **todo clube aprovado
aparece aqui automaticamente**, clicar num clube abre um **modal com mais informações** (de onde é,
quem participa, competições que disputou na FHT), e os **admins podem tirar um clube da vitrine**
por algum motivo.

---

## 2. Estado atual

- Seção **"Clubes..."** existe: dados **estáticos** em [data/clubs.ts](../frontend/src/data/clubs.ts).
- Card mostra: **sigla** (PHC…), **nome**, **cidade** (📍), **categorias** (tags: Adulto Masc./Fem.,
  Sub-18/16/14/12). Sem clique, **sem modal**.
- Botão **"FILIAR MEU CLUBE"** aponta pra `#contato` (fluxo de cadastro já existe:
  `Registration.tsx` → `POST /api/clubes/solicitar`).
- Modelo estático: `Club = { id, name, city, initials, categories[], logo? }`.
- **Backend de Clube JÁ EXISTE** com status `PENDENTE | ATIVO | REJEITADO | SUSPENSO`. Hoje o
  `GET /api/clubes` é **protegido (ADMIN_FHT)** — a vitrine pública vai precisar de um GET público.

---

## 3. Requisitos (o que o Gustavo pediu)

1. **Clube aprovado entra automático na vitrine.** Assim que o admin aprova (status → ATIVO), o
   clube aparece na seção pública (fim do `data/clubs.ts` estático).
2. **Modal ao clicar** com mais informações:
   - de onde é (cidade/região),
   - **quem participa** (atletas do clube),
   - **competições/provas da FHT que o clube participou**,
   - e o que mais fizer sentido (categorias, fundação, etc.).
3. **Admin pode desativar o clube da vitrine** por algum motivo (tirar da home).

---

## 4. Pontos de modelagem / integração

### 4.1 Vitrine pública ← clubes ATIVOS
- Precisa de um **endpoint público** que liste só os clubes **ATIVOS** (e visíveis), retornando
  **apenas dados públicos**. ⚠️ **Não** expor CNPJ, documentos, e-mail/telefone do representante
  no endpoint público (isso é do admin). Segurança.

### 4.2 "Categorias" do clube (as tags do card)
- Hoje é campo estático. No backend o `Clube` **não** tem esse campo. Opções (ver §6):
  - **Derivar** das categorias dos atletas ATIVOS do clube (sempre atualizado, automático), ou
  - Campo próprio no `Clube` preenchido no cadastro.

### 4.3 "Desativar da vitrine" — ✅ DECIDIDO: flag separada
- **Flag `visivelNaHome` (bool) no `Clube`.** Desativar da vitrine **NÃO** tira a afiliação — o
  clube continua **ATIVO** (pode cadastrar atletas, etc.), só **some da home**. É controle de
  vitrine, independente do status. (Opção A/suspender **descartada** — suspender é outra coisa.)

### 4.4 Modal: "quem participa" e "competições participadas"
- Atletas: já temos (`GET /api/atletas`, filtra por clube). Versão pública mostra nome/posição/
  categoria (sem CPF/docs).
- Competições participadas: **depende do módulo de Competições** (`Participacao` liga clube↔competição).
  ✅ **Regra:** o histórico de competições no modal é alimentado quando a competição que o clube
  participou é **ENCERRADA** (só entram competições finalizadas, com resultado). Enquanto Competições
  não existe, o modal mostra o resto (atletas, cidade) e essa aba fica pra depois.

---

## 5. Endpoints propostos

**Público (sem auth, só dados públicos):**
- `GET /api/clubes/publico` — lista clubes ATIVOS + visíveis (sigla, nome, cidade, categorias)
- `GET /api/clubes/publico/{id}` — detalhe pro modal (dados públicos + atletas + competições)

**Admin (ADMIN_FHT):** já existem aprovar/suspender/reativar. Se for a **Opção B** (§4.3):
- `PATCH /api/clubes/{id}/vitrine` — liga/desliga `visivelNaHome`

---

## 6. Decisões em aberto / a confirmar

- [x] ~~"Desativar da vitrine" = suspender ou flag?~~ → **DECIDIDO: flag `visivelNaHome`**, não perde
      afiliação (§4.3).
- [ ] **Categorias do card**: derivar dos atletas ou campo próprio do clube?
- [ ] **Logo do clube**: os cards usam sigla hoje. Vai ter upload de logo? (se sim, depende do R2 —
      última etapa; no dev, sigla como fallback).
- [ ] O que exatamente aparece no modal além de atletas/competições (fundação, redes sociais,
      responsável público, títulos)?

---

## 7. Ordem de ataque sugerida

1. Endpoint público `GET /api/clubes/publico` (só ATIVOS, dados públicos).
2. Ligar a seção `Clubs` da home na API (fim do `data/clubs.ts`).
3. **Modal de detalhes** do clube (dados + atletas).
4. Ação de "desativar da vitrine" no admin (decidir §4.3 antes).
5. Aba "competições participadas" no modal — **depois** do módulo de Competições.
6. (Opcional) upload de logo — junto do R2, no fim.
