-- Módulo Árbitros: corpo arbitral da FHT. Solicitação pública ("quero ser árbitro"),
-- credenciamento pela federação (nível/registro) e exibição dos credenciados no site.
-- Ver docs/MODULO-ARBITROS.md. Espelha o ciclo de status de Clube/Atleta.
CREATE TABLE arbitros (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                      VARCHAR(255) NOT NULL,
    cpf                       VARCHAR(20),
    rg                        VARCHAR(30),
    orgao_emissor             VARCHAR(50),
    data_nascimento           DATE,
    sexo                      VARCHAR(20),
    telefone                  VARCHAR(30),
    email                     VARCHAR(255),
    cidade                    VARCHAR(255),
    uf                        VARCHAR(2) DEFAULT 'TO',
    foto_url                  VARCHAR(500),
    rg_url                    VARCHAR(500),
    comprovante_escolar_url   VARCHAR(500),
    ja_arbitro                BOOLEAN NOT NULL DEFAULT FALSE,
    nivel_atual               VARCHAR(50),
    federacao_origem          VARCHAR(255),
    tem_experiencia           BOOLEAN NOT NULL DEFAULT FALSE,
    descricao_experiencia     TEXT,
    disponibilidade_fds       BOOLEAN NOT NULL DEFAULT FALSE,
    curso_interesse           VARCHAR(255),
    nivel                     VARCHAR(50),
    registro                  VARCHAR(50),
    inicio_arbitragem         VARCHAR(20),
    formacao                  VARCHAR(500),
    status                    VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    motivo_rejeicao           TEXT,
    created_at                TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_arbitros_status ON arbitros (status);
