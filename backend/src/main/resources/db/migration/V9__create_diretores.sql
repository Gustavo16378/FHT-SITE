-- Módulo Institucional (Parte A): diretoria editável pelo painel, exibida no site.
-- Ver docs/MODULO-INSTITUCIONAL.md. Contato aqui é institucional (público por natureza).
CREATE TABLE diretores (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(255) NOT NULL,
    cargo       VARCHAR(255) NOT NULL,
    area        VARCHAR(100),
    mandato     VARCHAR(50),
    email       VARCHAR(255),
    telefone    VARCHAR(50),
    desde       VARCHAR(50),
    bio         TEXT,
    foto_url    VARCHAR(500),
    ordem       INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diretores_ordem ON diretores (ordem, created_at);
