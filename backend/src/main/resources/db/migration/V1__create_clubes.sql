CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE clubes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    uf VARCHAR(2) NOT NULL DEFAULT 'TO',
    sigla VARCHAR(10),
    cnpj VARCHAR(18),
    representante_nome VARCHAR(255) NOT NULL,
    representante_email VARCHAR(255) NOT NULL,
    representante_telefone VARCHAR(20) NOT NULL,
    ata_fundacao_url VARCHAR(500),
    estatuto_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    motivo_rejeicao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clubes_status ON clubes(status);
