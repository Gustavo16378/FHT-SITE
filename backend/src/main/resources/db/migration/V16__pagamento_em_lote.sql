-- Pagamento da anuidade EM LOTE, pelo clube (ago/2026).
--
-- Regra nova da federacao: o atleta nao paga mais no ato do cadastro. O clube cadastra a vontade,
-- e quando puder faz UM Pix cobrindo varios atletas e anexa UM comprovante. A federacao confere e
-- da baixa — nao ha gateway de pagamento (sem orcamento), a conferencia e manual.
--
-- Por isso o pagamento deixa de ser atributo DO ATLETA (a coluna comprovante_pagamento_url, que
-- fica como legado dos cadastros antigos) e vira entidade propria, com N atletas por comprovante.

CREATE TABLE pagamento_lotes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id            UUID NOT NULL REFERENCES clubes (id) ON DELETE CASCADE,
    -- Codigo curto para o clube citar ao falar com a federacao (ex.: FHT-2026-A3F91C)
    protocolo           VARCHAR(30) NOT NULL UNIQUE,
    ano                 INTEGER NOT NULL,
    valor_total         NUMERIC(10,2) NOT NULL,
    quantidade_atletas  INTEGER NOT NULL,
    comprovante_url     VARCHAR(500),
    -- AGUARDANDO_BAIXA -> CONFIRMADO | REJEITADO
    status              VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_BAIXA',
    observacao          TEXT,
    motivo_rejeicao     TEXT,
    enviado_em          TIMESTAMP NOT NULL DEFAULT NOW(),
    baixado_em          TIMESTAMP,
    -- quem deu a baixa, para a federacao saber a quem perguntar
    baixado_por         VARCHAR(255),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_pagamento_lotes_status CHECK (status IN ('AGUARDANDO_BAIXA', 'CONFIRMADO', 'REJEITADO'))
);

CREATE INDEX idx_pagamento_lotes_clube ON pagamento_lotes (clube_id, ano DESC);
CREATE INDEX idx_pagamento_lotes_status ON pagamento_lotes (status);

-- Um item por atleta coberto pelo lote. Guarda SNAPSHOT do nome e do valor: o comprovante e
-- prova de pagamento e precisa continuar legivel mesmo que o atleta seja removido depois
-- (por isso o ON DELETE SET NULL, e nao CASCADE — a linha fiscal nao pode sumir).
CREATE TABLE pagamento_lote_itens (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_id        UUID NOT NULL REFERENCES pagamento_lotes (id) ON DELETE CASCADE,
    atleta_id      UUID REFERENCES atletas (id) ON DELETE SET NULL,
    atleta_nome    VARCHAR(255) NOT NULL,
    ano            INTEGER NOT NULL,
    valor          NUMERIC(10,2) NOT NULL,
    -- Vira FALSE quando o lote e rejeitado, devolvendo o atleta para a fila de pendentes.
    ativo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pagamento_lote_itens_lote ON pagamento_lote_itens (lote_id);

-- Trava contra cobranca dupla: o mesmo atleta nao pode estar em dois lotes vivos do mesmo ano.
-- E o que protege de duplo clique no botao de pagamento. Itens de lote rejeitado saem da trava
-- (ativo = false) e podem entrar num lote novo.
CREATE UNIQUE INDEX idx_pagamento_lote_itens_atleta_ano
    ON pagamento_lote_itens (atleta_id, ano) WHERE ativo;
