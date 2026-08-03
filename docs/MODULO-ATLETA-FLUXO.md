# Módulo Atleta — Fluxo de Cadastro, Pagamento e Aprovação

> Decisões do Gustavo (sessão 2026-07-12). Este é o **fluxo REAL a construir** (não mock).
> Filosofia: assentar a base/tijolos de verdade agora; o **R2 (upload)** é a última peça a plugar.
> Relacionado: [[LGPD-CONFORMIDADE.md]] (responsável/menores), [[MODULO-DASHBOARD-FINANCEIRO.md]]
> (anuidade), [[CLAUDE.md]].

---

## 1. Decisão: SEM portal do atleta (confirmado)
Não haverá login nem portal do atleta. **Toda interação é via o representante do clube (`ADMIN_CLUBE`).**
O atleta **paga e envia o comprovante ao representante do clube**, que anexa no sistema.
Motivo: menos usuários, banco menor, custo de hospedagem menor (Gustavo + presidente). Se um dia
precisar, a alternativa é **consulta pública por CPF** (sem login) — não um portal.

## 2. Fluxo de cadastro (feito pelo clube)
1. O representante do clube cadastra o atleta pelo painel do clube.
2. No **final** do cadastro, faz o **Pix** da anuidade e **anexa o comprovante de pagamento**.
3. **Documentos OBRIGATÓRIOS no cadastro:** **RG digitalizado** + **Comprovante de pagamento (Pix)**.
4. **Documentos OPCIONAIS (podem ser adicionados depois):** Foto 3x4, Comprovante de residência.
5. Se o atleta for **MENOR** (Sub-12 a Sub-18): **obrigatório** os dados do **responsável legal** +
   **consentimento** dele (LGPD art. 14 — ver [[LGPD-CONFORMIDADE.md]] §2).

## 3. Pagamento + retenção (regra dos "não pagos")
- O pagamento é no final do cadastro (Pix + comprovante). "Não faz sentido cadastrar e não pagar."
- Se o cadastro for iniciado mas **o comprovante de pagamento não for anexado em ~24h → o cadastro é
  APAGADO** (expira). O prazo (24h) é a definir.
- Fluxo prático: o atleta paga → manda o comprovante pro representante do clube → o clube anexa dentro
  do prazo.
- **Implica:** um estado de "rascunho / pendente de pagamento" + uma **rotina agendada** (`@Scheduled`
  no Quarkus) que limpa os rascunhos com > 24h sem comprovante.

## 4. Estados do atleta (a refinar)
Hoje o backend tem `AGUARDANDO_PAGAMENTO → ATIVO`. Fluxo refinado:
```
(rascunho / pendente de pagamento — TTL ~24h, senão apaga)
      → AGUARDANDO_APROVAÇÃO   (comprovante anexado; federação valida docs + pagamento)
      → ATIVO                  (validado + pago → elegível a competir NAQUELE ano)
      → REJEITADO (motivo)  |  SUSPENSO
```

## 5. Regra de aprovação
- Admin/Dir. Financeira só **aprova (→ ATIVO)** quando: **comprovante de pagamento anexado** +
  documentos mínimos ok. **Bloquear o botão "Aprovar"** sem comprovante de pagamento.
- Ativar = confirmar o pagamento da anuidade daquele ano → entra no Financeiro como "Pago" e o atleta
  fica elegível a competir no ano.

## 6. Implicações técnicas — os "tijolos" a assentar (sem depender de R2)
1. **Storage com FALLBACK local** quando o R2 não está configurado (salva no volume/serve local, ou
   aceita e devolve uma URL local). ⚠️ **Destrava tudo:** hoje o cadastro real (multipart) chama o R2
   e **retorna 503** sem credenciais. Com o fallback, o fluxo roda no dev; troca pro R2 no fim.
2. **Migration**: campos do **responsável** (nome, cpf, parentesco, email, telefone) no `Atleta` +
   tabela **`consentimento`** (LGPD). Próxima livre = **V6**.
3. **Cadastro**: tornar documentos opcionais (exceto RG + comprovante de pagamento); exigir responsável
   + consentimento quando menor (validação server-side).
4. **Rotina `@Scheduled`**: apaga rascunhos > 24h sem comprovante de pagamento.
5. **Regra de aprovação** amarrada ao comprovante de pagamento.

## 7. Ordem de construção sugerida
1. **Storage fallback** (destrava os uploads no dev — pré-requisito de tudo).
2. **Modelo/migration V6**: responsável + consentimento (LGPD).
3. **Cadastro refinado** (obrigatoriedade + responsável no form do clube).
4. **Estados + TTL + rotina de limpeza** dos não-pagos.
5. **Regra de aprovação** (bloquear sem pagamento) no painel admin.
6. **R2 real** — a última peça, no deploy pro Cloudflare.

---

## 8. ✅ STATUS DA IMPLEMENTAÇÃO (jul/2026 — 6º módulo mock→real)

Itens 1 a 5 do §7 **estão feitos**. Só resta o **R2** (item 6, decidido pro fim do projeto).

### Como ficou o fluxo (decisão de projeto)
Os §§2 e 3 acima se contradiziam: um diz que o comprovante é obrigatório no cadastro, o outro
descreve um rascunho com TTL de 24h esperando o comprovante. Resolvido assim, que atende os dois:

| Documento | Regra |
|---|---|
| **RG digitalizado** | **Obrigatório no cadastro** (422 sem ele) |
| **Comprovante Pix** | Opcional no ato. **Com** ele → `AGUARDANDO_APROVACAO`. **Sem** ele → `AGUARDANDO_PAGAMENTO` + prazo de 24h |
| Foto 3x4, Comprovante de residência | Opcionais, anexáveis depois |

Motivo: o clube quase nunca tem o comprovante na hora (o atleta paga e manda depois) — exigir no
cadastro travaria o fluxo real. O prazo de 24h é o que garante que ninguém cadastre sem pagar.

### Ciclo de status (implementado)
```
AGUARDANDO_PAGAMENTO ──(anexa comprovante)──> AGUARDANDO_APROVACAO ──(admin aprova)──> ATIVO
        │                                              │                                 │
   (prazo vence)                                   REJEITADO                         SUSPENSO
        │
   APAGADO pelo AtletaExpurgoJob
```

### Backend
- **Migration `V12__lgpd_responsavel_consentimento.sql`**: campos `responsavel_*` e
  `prazo_pagamento_ate` em `atletas`; tabela **`consentimentos`** (um registro por finalidade, com
  `texto_versao`, `ip_origem`, `user_agent`, `revogado_em`); backfill dos cadastros legados.
- **`Consentimento`** (model + repository). Finalidades: `CADASTRO_ATLETA_MENOR` (obrigatória se
  menor) e `IMAGEM_PUBLICA` (sempre opcional e revogável).
- **Validação server-side no cadastro** (`AtletaServiceImpl`): RG obrigatório; se menor de 18 →
  nome + CPF válido + parentesco + (e-mail ou telefone) do responsável **e** aceite do termo.
- **`POST /api/atletas/{id}/documentos`** (multipart, com escopo de clube): anexa os documentos que
  faltaram. Anexar o Pix tira o atleta da fila de expurgo e o move para `AGUARDANDO_APROVACAO`.
- **`AtletaExpurgoJob`** (`@Scheduled(every = "1h", delayed = "5m")`): apaga os
  `AGUARDANDO_PAGAMENTO` com prazo vencido. Os consentimentos vão junto (FK `ON DELETE CASCADE`).
  Só loga quando encontra algo — silêncio no log significa "nada a expurgar".
- **Aprovação bloqueada** sem comprovante de pagamento **ou** (se menor) sem consentimento do
  responsável.
- **Regularização de menor legado**: o `PUT /api/atletas/{id}` aceita os campos do responsável +
  `consentimentoCadastro`. Sem isso, um menor cadastrado antes da V12 ficaria travado para sempre
  (a aprovação exige um consentimento que não havia como registrar). Valida o CPF, exige nome+CPF
  antes do aceite, não duplica consentimento já ativo e recusa o aceite para atleta adulto.
- Prazo configurável: `atleta.pagamento.prazo-horas` / env `ATLETA_PRAZO_PAGAMENTO_HORAS` (default 24).
- `GET /api/admin/dashboard` agora conta `pendentes` = falta pagar **+** aguardando aprovação, e
  expõe `aguardandoAprovacao` como subconjunto.

### Frontend
- **Cadastro (painel do clube)**: etapa **"Responsável (LGPD)"** que aparece sozinha quando a data de
  nascimento indica menor, com os dois termos em caixa destacada (art. 14, §1 — não é checkbox
  escondido). Adulto vê só o termo de imagem, na etapa final.
- Documentos com obrigatoriedade correta (só o RG é `*`) e aviso do prazo de 24h quando falta o Pix.
- **Detalhe do atleta (clube)**: contador do prazo, e os documentos faltantes viram botão **Anexar**.
- **Detalhe do atleta (admin)**: selo `MENOR`, blocos de **Responsável legal** e **Consentimentos**,
  e o botão **Aprovar** desabilitado com o motivo do bloqueio.
- **Edição do atleta (clube)**: para menores, os campos do responsável ficam editáveis; se faltar o
  consentimento, aparece um aviso roxo e o termo para registrar o aceite e destravar a aprovação.

### Como testar (validado ponta a ponta em 29/07/2026)
```bash
docker compose up --build -d
docker exec -i fht_postgres psql -U fht_user -d fht_db < scripts/seed_teste.sql
```
O seed já monta os cenários: **Sofia** (menor completo, aguardando aprovação), **Pedro Henrique**
(menor legado **sem** responsável — a aprovação fica bloqueada até regularizar) e **Juliana**
(prazo de pagamento **vencido** — some no próximo tick do expurgo, é o comportamento esperado).

### Pendente deste módulo
- **Revogação de consentimento** pelo titular/responsável (`revogado_em` já existe no banco, falta o
  endpoint + tela). Faz par com os endpoints de direitos do titular — ver `LGPD-CONFORMIDADE.md` §3.
- **Verificação do responsável** (art. 14, §5): hoje é a coleta do CPF + o aceite registrado com
  IP/user-agent. O double opt-in por e-mail ficou de fora.
- Política de Privacidade e Aviso de Privacidade — dependem do texto do advogado.

---

## 9. 🔄 REGRA REVOGADA (ago/2026) — o pagamento virou EM LOTE, pelo clube

⚠️ **Tudo que o §8 descreve sobre pagamento no ato do cadastro está REVOGADO.** A federação mudou
a regra. O que continua valendo do §8: RG obrigatório, responsável legal e consentimento do menor.

### Como funciona agora
1. O clube cadastra os atletas **sem pagar nada** — todos nascem `AGUARDANDO_PAGAMENTO`, sem prazo curto.
2. No painel do clube, a aba **Meus Atletas** mostra uma barra com a **soma dos pendentes**.
3. O clube seleciona quem entra (todos marcados por padrão, **pagamento parcial é permitido**),
   faz **um Pix só** e anexa **um comprovante**.
4. Isso vira um **lote** com protocolo (`FHT-2026-A3F91C`) que sabe **quais atletas cobre**.
5. A federação vê na aba **Financeiro**, com a **lista nominal** e o comprovante, e **dá baixa**.
6. A baixa ativa os atletas que também passam no portão documental.

Não há gateway de pagamento — sem orçamento. A conferência é manual, e é isso que o sistema apoia.

### Os dois portões da aprovação
São **independentes**, e essa separação é deliberada:

| Portão | Exige |
|---|---|
| **Documental** | RG digitalizado + (se menor) consentimento do responsável |
| **Financeiro** | anuidade do ano com baixa confirmada |

**Pagar não ativa um menor sem autorização do responsável.** Dinheiro não compra conformidade com
o art. 14. Na baixa em massa, quem não passa no documental fica em `AGUARDANDO_APROVACAO` e a
federação recebe a lista dos bloqueados com o motivo.

### O que saiu de cena
- O `comprovantePix` no cadastro e no anexo de documentos.
- O `prazoPagamentoAte` (a coluna ficou, sem uso).
- O expurgo de 24h — virou **90 dias** contados do cadastro (`atleta.expurgo.dias`). Com a regra
  nova, o job de 24h apagaria justamente quem espera o lote fechar.
- O QR Code de "R$ 35 por atleta" da tela de cadastro.
- O endereço do atleta: **o endereço é o do clube**, não faz sentido pedir de novo (e coletar sem
  finalidade fere a minimização — LGPD art. 6, III).

### Estrutura (migration V16)
`pagamento_lotes` + `pagamento_lote_itens`. Cada item guarda **snapshot** do nome e do valor: a
linha é prova de pagamento e precisa continuar legível se o atleta for removido (FK
`ON DELETE SET NULL`). Índice único parcial em `(atleta_id, ano) WHERE ativo` trava cobrança dupla
e protege de duplo clique; rejeitar o lote desativa os itens e devolve os atletas para a fila.

O valor da anuidade é config única: `fht.anuidade.valor` (padrão R$ 35). Antes estava escrito em
três lugares diferentes.

### Posições do atleta
São as oficiais da federação — goleiro, ponta direita, ponta esquerda, armador lateral direito,
armador lateral esquerdo, armador central e pivô — e o atleta pode ocupar **mais de uma**
(o mesmo jogador atua como ponta direita e esquerda).
