-- Modulo Competicoes — Fatia 1: cadastro da competicao e vitrine publica.
-- Ver docs/MODULO-COMPETICOES.md. Equipes participantes, jogos e placares vem na Fatia 2
-- (tabelas participacoes e partidas), por isso aqui nao ha nenhuma FK ainda.
--
-- STATUS: nao existe coluna "status". O status efetivo e DERIVADO das datas
-- (em breve -> em andamento -> encerrado) porque com varios admins alguem sempre esquece
-- de mudar na mao. A coluna status_override existe so para os casos que as datas nao
-- capturam (inscricoes abertas, adiado, cancelado, encerramento antecipado) e, quando
-- preenchida, vence a derivacao. Ver §7 do doc.
CREATE TABLE competicoes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome              VARCHAR(255) NOT NULL,
    descricao         TEXT,
    data_inicio       DATE NOT NULL,
    data_fim          DATE NOT NULL,
    local             VARCHAR(255),
    cidade            VARCHAR(100),
    uf                VARCHAR(2) DEFAULT 'TO',
    temporada         INTEGER NOT NULL,
    -- Preenchido a mao pelo admin enquanto nao existem participacoes (Fatia 2),
    -- quando passa a ser derivado de count(participacoes).
    numero_equipes    INTEGER NOT NULL DEFAULT 0,
    link_inscricao    VARCHAR(500),
    cor               VARCHAR(20) NOT NULL DEFAULT '#1A3A8F',
    regulamento_url   VARCHAR(500),
    status_override   VARCHAR(30),
    visivel_na_home   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_competicoes_periodo CHECK (data_fim >= data_inicio),
    CONSTRAINT ck_competicoes_status_override CHECK (
        status_override IS NULL OR status_override IN
        ('INSCRICOES_ABERTAS', 'EM_ANDAMENTO', 'ENCERRADO', 'ADIADO', 'CANCELADO')
    )
);

CREATE INDEX idx_competicoes_temporada ON competicoes (temporada DESC, data_inicio DESC);
CREATE INDEX idx_competicoes_vitrine ON competicoes (visivel_na_home);

-- Categorias da competicao (adulto, sub-18, feminino...). Tabela auxiliar em vez de CSV
-- para o filtro do site publico poder ser feito no banco quando precisar.
CREATE TABLE competicao_categorias (
    competicao_id  UUID NOT NULL REFERENCES competicoes (id) ON DELETE CASCADE,
    categoria      VARCHAR(30) NOT NULL,
    PRIMARY KEY (competicao_id, categoria)
);
