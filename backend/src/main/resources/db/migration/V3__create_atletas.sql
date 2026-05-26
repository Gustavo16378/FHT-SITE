CREATE TABLE atletas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id UUID NOT NULL REFERENCES clubes(id),
    nome_completo VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo VARCHAR(10) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(30) NOT NULL,
    rg_orgao_emissor VARCHAR(50),
    naturalidade_cidade VARCHAR(100),
    naturalidade_uf VARCHAR(2),
    telefone VARCHAR(20),
    email VARCHAR(255),
    cep VARCHAR(9),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    cidade VARCHAR(100),
    uf_residencia VARCHAR(2),
    posicao VARCHAR(50) NOT NULL,
    categoria VARCHAR(20) NOT NULL,
    is_transferencia BOOLEAN NOT NULL DEFAULT false,
    clube_anterior VARCHAR(255),
    foto_url VARCHAR(500),
    rg_url VARCHAR(500),
    comprovante_residencia_url VARCHAR(500),
    comprovante_pagamento_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    motivo_rejeicao TEXT,
    taxa_valor DECIMAL(10,2) NOT NULL DEFAULT 35.00,
    taxa_ano INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_atletas_clube_id ON atletas(clube_id);
CREATE INDEX idx_atletas_status ON atletas(status);
CREATE INDEX idx_atletas_cpf ON atletas(cpf);
