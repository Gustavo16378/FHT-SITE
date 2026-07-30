-- LGPD art. 14 + fluxo de pagamento do atleta.
-- Ver docs/LGPD-CONFORMIDADE.md §2 e docs/MODULO-ATLETA-FLUXO.md.
--
-- 1) Dados do responsável legal no atleta (obrigatórios quando o atleta é menor de 18).
-- 2) Prazo de pagamento: cadastro sem comprovante Pix expira e é apagado pelo job de expurgo.
-- 3) Tabela de consentimentos — um registro POR FINALIDADE (art. 14, §1: "específico e em
--    destaque"), com evidência de quem consentiu, quando e de onde (art. 6, X — prestação de contas).

ALTER TABLE atletas
    ADD COLUMN responsavel_nome        VARCHAR(255),
    ADD COLUMN responsavel_cpf         VARCHAR(14),
    ADD COLUMN responsavel_parentesco  VARCHAR(30),
    ADD COLUMN responsavel_email       VARCHAR(255),
    ADD COLUMN responsavel_telefone    VARCHAR(20),
    ADD COLUMN prazo_pagamento_ate     TIMESTAMP;

-- Status novo no ciclo: AGUARDANDO_PAGAMENTO -> AGUARDANDO_APROVACAO -> ATIVO.
-- Quem já tem comprovante anexado pula direto para a fila de aprovação da federação.
UPDATE atletas
   SET status = 'AGUARDANDO_APROVACAO'
 WHERE status = 'AGUARDANDO_PAGAMENTO'
   AND comprovante_pagamento_url IS NOT NULL
   AND comprovante_pagamento_url <> '';

-- Cadastros legados sem comprovante ganham o prazo cheio a partir de agora — o job de
-- expurgo não pode apagar de imediato quem foi cadastrado antes desta regra existir.
UPDATE atletas
   SET prazo_pagamento_ate = NOW() + INTERVAL '24 hours'
 WHERE status = 'AGUARDANDO_PAGAMENTO';

CREATE INDEX idx_atletas_prazo_pagamento ON atletas (status, prazo_pagamento_ate);

CREATE TABLE consentimentos (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atleta_id               UUID NOT NULL REFERENCES atletas (id) ON DELETE CASCADE,
    finalidade              VARCHAR(50) NOT NULL,
    titular_menor           BOOLEAN NOT NULL DEFAULT FALSE,
    -- quem deu o consentimento: o responsável legal (menor) ou o próprio titular (adulto)
    consentido_por_nome     VARCHAR(255),
    consentido_por_cpf      VARCHAR(14),
    texto_versao            VARCHAR(20) NOT NULL,
    concedido_em            TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_origem               VARCHAR(64),
    user_agent              VARCHAR(512),
    revogado_em             TIMESTAMP,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consentimentos_atleta ON consentimentos (atleta_id);
