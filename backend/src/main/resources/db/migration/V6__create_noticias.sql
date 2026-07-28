-- Módulo de Notícias / Blog: posts editáveis pelos admins e exibidos no site público.
-- Ver docs/MODULO-NOTICIAS.md.
CREATE TABLE noticias (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo           VARCHAR(255) NOT NULL,
    slug             VARCHAR(280) NOT NULL UNIQUE,
    categoria        VARCHAR(50)  NOT NULL,
    resumo           VARCHAR(500),
    conteudo         TEXT,
    imagem_capa_url  VARCHAR(500),
    autor_nome       VARCHAR(255),
    data_publicacao  DATE NOT NULL,
    destaque         BOOLEAN NOT NULL DEFAULT FALSE,
    status           VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- A listagem pública filtra por status e ordena por data de publicação (mais recente primeiro).
CREATE INDEX idx_noticias_status_data ON noticias (status, data_publicacao DESC);
