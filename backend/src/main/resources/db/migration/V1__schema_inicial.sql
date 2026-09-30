-- Schema inicial do MVP free tier (set/2026).
--
-- Consolida as migrations V1-V19 da versão completa (tag v-full) SEM as tabelas dos módulos que
-- saíram do escopo do MVP (as quatro tabelas ficam só na v-full). O banco de produção nasce do
-- zero no Neon, então não há histórico a carregar. Derivado do estado atual das
-- entidades em br.org.fht.model: nomes, tipos, índices, constraints e FKs preservados.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── clubes ──────────────────────────────────────────────────────────────────
CREATE TABLE clubes (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                    VARCHAR(255) NOT NULL,
    cidade                  VARCHAR(255) NOT NULL,
    uf                      VARCHAR(2) NOT NULL DEFAULT 'TO',
    sigla                   VARCHAR(10),
    cnpj                    VARCHAR(18),
    -- representante legal: um por clube, é o dono do login
    representante_nome      VARCHAR(255) NOT NULL,
    representante_email     VARCHAR(255) NOT NULL,
    representante_telefone  VARCHAR(20) NOT NULL,
    representante_cargo     VARCHAR(100),
    representante_cpf       VARCHAR(14),
    ata_fundacao_url        VARCHAR(500),
    estatuto_url            VARCHAR(500),
    -- PENDENTE -> ATIVO | REJEITADO | SUSPENSO
    status                  VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    motivo_rejeicao         TEXT,
    -- vitrine pública da home, independente do status
    visivel_na_home         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clubes_status ON clubes (status);

-- ── usuarios ────────────────────────────────────────────────────────────────
CREATE TABLE usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    senha_hash  VARCHAR(255) NOT NULL,
    -- ADMIN_FHT | ADMIN_CLUBE
    role        VARCHAR(50) NOT NULL,
    clube_id    UUID REFERENCES clubes (id) ON DELETE SET NULL,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios (email);
CREATE INDEX idx_usuarios_clube_id ON usuarios (clube_id);

-- ── atletas ─────────────────────────────────────────────────────────────────
CREATE TABLE atletas (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id                    UUID NOT NULL REFERENCES clubes (id),
    nome_completo               VARCHAR(255) NOT NULL,
    data_nascimento             DATE NOT NULL,
    sexo                        VARCHAR(10) NOT NULL,
    cpf                         VARCHAR(14) UNIQUE NOT NULL,
    rg                          VARCHAR(30) NOT NULL,
    rg_orgao_emissor            VARCHAR(50),
    naturalidade_cidade         VARCHAR(100),
    naturalidade_uf             VARCHAR(2),
    telefone                    VARCHAR(20),
    email                       VARCHAR(255),
    cep                         VARCHAR(9),
    logradouro                  VARCHAR(255),
    numero                      VARCHAR(20),
    cidade                      VARCHAR(100),
    uf_residencia               VARCHAR(2),
    -- 200 porque o atleta pode ter mais de uma posição, concatenadas numa string só
    posicao                     VARCHAR(200) NOT NULL,
    categoria                   VARCHAR(20) NOT NULL,
    is_transferencia            BOOLEAN NOT NULL DEFAULT FALSE,
    clube_anterior              VARCHAR(255),
    -- responsável legal: obrigatório quando o atleta é menor de 18 (LGPD art. 14)
    responsavel_nome            VARCHAR(255),
    responsavel_cpf             VARCHAR(14),
    responsavel_parentesco      VARCHAR(30),
    responsavel_email           VARCHAR(255),
    responsavel_telefone        VARCHAR(20),
    prazo_pagamento_ate         TIMESTAMP,
    foto_url                    VARCHAR(500),
    rg_url                      VARCHAR(500),
    comprovante_residencia_url  VARCHAR(500),
    -- comprovante por atleta (legado); o fluxo oficial é o pagamento em lote
    comprovante_pagamento_url   VARCHAR(500),
    -- AGUARDANDO_PAGAMENTO -> AGUARDANDO_APROVACAO -> ATIVO | REJEITADO | SUSPENSO
    status                      VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    motivo_rejeicao             TEXT,
    taxa_valor                  DECIMAL(10,2) NOT NULL DEFAULT 35.00,
    taxa_ano                    INTEGER,
    -- quando entrou na fila de pagamento: relógio do expurgo (reinicia no "reconsiderar")
    aguardando_desde            TIMESTAMP,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_atletas_clube_id ON atletas (clube_id);
CREATE INDEX idx_atletas_status ON atletas (status);
CREATE INDEX idx_atletas_cpf ON atletas (cpf);
CREATE INDEX idx_atletas_prazo_pagamento ON atletas (status, prazo_pagamento_ate);
CREATE INDEX idx_atletas_aguardando_desde ON atletas (aguardando_desde)
    WHERE status = 'AGUARDANDO_PAGAMENTO';

-- ── consentimentos (LGPD) ───────────────────────────────────────────────────
-- Um registro POR FINALIDADE (art. 14, §1), com evidência de quem consentiu, quando e de onde.
CREATE TABLE consentimentos (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atleta_id            UUID NOT NULL REFERENCES atletas (id) ON DELETE CASCADE,
    -- CADASTRO_ATLETA_MENOR | IMAGEM_PUBLICA
    finalidade           VARCHAR(50) NOT NULL,
    titular_menor        BOOLEAN NOT NULL DEFAULT FALSE,
    -- quem deu o consentimento: o responsável legal (menor) ou o próprio titular (adulto)
    consentido_por_nome  VARCHAR(255),
    consentido_por_cpf   VARCHAR(14),
    texto_versao         VARCHAR(20) NOT NULL,
    concedido_em         TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_origem            VARCHAR(64),
    user_agent           VARCHAR(512),
    revogado_em          TIMESTAMP,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consentimentos_atleta ON consentimentos (atleta_id);

-- ── pagamento da anuidade em lote ───────────────────────────────────────────
-- O clube junta os atletas pendentes, faz UM Pix, anexa UM comprovante; a federação confere
-- na mão e dá baixa. Não há gateway.
CREATE TABLE pagamento_lotes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id            UUID NOT NULL REFERENCES clubes (id) ON DELETE CASCADE,
    -- código curto para o clube citar (ex.: FHT-2026-A3F91C)
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
    -- quem deu a baixa
    baixado_por         VARCHAR(255),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_pagamento_lotes_status CHECK (status IN ('AGUARDANDO_BAIXA', 'CONFIRMADO', 'REJEITADO'))
);

CREATE INDEX idx_pagamento_lotes_clube ON pagamento_lotes (clube_id, ano DESC);
CREATE INDEX idx_pagamento_lotes_status ON pagamento_lotes (status);

-- Um item por atleta coberto. Guarda SNAPSHOT do nome e do valor: a linha é prova de pagamento e
-- precisa sobreviver à remoção do atleta (por isso ON DELETE SET NULL, não CASCADE).
CREATE TABLE pagamento_lote_itens (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_id      UUID NOT NULL REFERENCES pagamento_lotes (id) ON DELETE CASCADE,
    atleta_id    UUID REFERENCES atletas (id) ON DELETE SET NULL,
    atleta_nome  VARCHAR(255) NOT NULL,
    ano          INTEGER NOT NULL,
    valor        NUMERIC(10,2) NOT NULL,
    -- FALSE quando o lote é rejeitado: devolve o atleta à fila e libera a trava abaixo
    ativo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pagamento_lote_itens_lote ON pagamento_lote_itens (lote_id);

-- Trava contra cobrança dupla: o mesmo atleta não entra em dois lotes vivos do mesmo ano.
CREATE UNIQUE INDEX idx_pagamento_lote_itens_atleta_ano
    ON pagamento_lote_itens (atleta_id, ano) WHERE ativo;

-- ── conteúdo do site ────────────────────────────────────────────────────────
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
    -- RASCUNHO | PUBLICADO
    status           VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_noticias_status_data ON noticias (status, data_publicacao DESC);

CREATE TABLE fotos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imagem_url  VARCHAR(500) NOT NULL,
    evento      VARCHAR(255) NOT NULL,
    ano         VARCHAR(10),
    categoria   VARCHAR(255),
    -- large | medium | small (posição no mosaico da home)
    tamanho     VARCHAR(10) NOT NULL DEFAULT 'medium',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

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

-- Documentos institucionais (transparência): públicos por natureza, não são dados pessoais.
CREATE TABLE documentos (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo           VARCHAR(255) NOT NULL,
    -- Estatuto | Regulamento | Calendário | Edital | Circular
    categoria        VARCHAR(50)  NOT NULL,
    arquivo_url      VARCHAR(500) NOT NULL,
    data_publicacao  DATE NOT NULL,
    publicado_por    VARCHAR(255),
    tamanho_bytes    BIGINT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documentos_categoria_data ON documentos (categoria, data_publicacao DESC);
