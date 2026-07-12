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
