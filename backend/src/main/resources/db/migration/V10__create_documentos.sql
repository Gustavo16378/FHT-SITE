-- Módulo Institucional (Parte B): documentos institucionais (transparência).
-- PÚBLICOS por natureza (estatuto, regulamento, edital...) — não são dados pessoais.
-- Ver docs/MODULO-INSTITUCIONAL.md §B.
CREATE TABLE documentos (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo           VARCHAR(255) NOT NULL,
    categoria        VARCHAR(50)  NOT NULL,
    arquivo_url      VARCHAR(500) NOT NULL,
    data_publicacao  DATE NOT NULL,
    publicado_por    VARCHAR(255),
    tamanho_bytes    BIGINT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documentos_categoria_data ON documentos (categoria, data_publicacao DESC);
