-- Módulo Galeria ("Momentos que ficam"): vitrine pública de fotos curada pelo admin.
-- Ver docs/MODULO-GALERIA.md.
CREATE TABLE fotos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imagem_url  VARCHAR(500) NOT NULL,
    evento      VARCHAR(255) NOT NULL,
    ano         VARCHAR(10),
    categoria   VARCHAR(255),
    tamanho     VARCHAR(10) NOT NULL DEFAULT 'medium',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
