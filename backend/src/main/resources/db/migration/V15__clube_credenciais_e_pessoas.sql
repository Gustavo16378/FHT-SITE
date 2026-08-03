-- Filiacao de clube ponta a ponta (ago/2026):
--   1) o clube ESCOLHE a senha no cadastro publico e a conta ja nasce aqui, INATIVA;
--      a aprovacao da federacao apenas libera o acesso (usuarios.ativo = true).
--      Antes, a conta so era criada na aprovacao, com senha aleatoria que NUNCA era exibida
--      nem enviada a ninguem — ou seja, nascia inutilizavel.
--   2) o clube passa a ter VARIAS pessoas (2 representantes + tecnico), nao uma so.

-- O formulario publico ja pedia e validava o CPF do representante, mas jogava fora:
-- nao havia coluna. Coletar sem armazenar nem usar viola a minimizacao (LGPD art. 6, III).
ALTER TABLE clubes ADD COLUMN representante_cpf VARCHAR(14);

-- Pessoas do clube. O representante principal continua tambem nas colunas representante_* de
-- clubes (contato oficial da filiacao); esta tabela e quem permite ter o 2o representante e o
-- TECNICO — que e quem define a escalacao quando o modulo de competicoes chegar.
--
-- Nesta etapa sao apenas DADOS CADASTRAIS: ninguem aqui tem login proprio ainda. Login por
-- pessoa depende do modulo de permissoes, que nao existe — e criar um papel novo agora quebraria
-- as checagens de escopo espalhadas pelo sistema.
CREATE TABLE clube_pessoas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id    UUID NOT NULL REFERENCES clubes (id) ON DELETE CASCADE,
    nome        VARCHAR(255) NOT NULL,
    cpf         VARCHAR(14),
    -- REPRESENTANTE | TECNICO | AUXILIAR
    funcao      VARCHAR(30) NOT NULL,
    cargo       VARCHAR(60),
    email       VARCHAR(255),
    telefone    VARCHAR(20),
    -- o representante que responde oficialmente pelo clube (o dono do login)
    principal   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_clube_pessoas_funcao CHECK (funcao IN ('REPRESENTANTE', 'TECNICO', 'AUXILIAR'))
);

CREATE INDEX idx_clube_pessoas_clube ON clube_pessoas (clube_id);

-- Um unico principal por clube.
CREATE UNIQUE INDEX idx_clube_pessoas_principal ON clube_pessoas (clube_id) WHERE principal;

-- Backfill: o representante que ja estava nas colunas de clubes vira a pessoa principal.
INSERT INTO clube_pessoas (clube_id, nome, funcao, cargo, email, telefone, principal)
SELECT id, representante_nome, 'REPRESENTANTE', representante_cargo,
       representante_email, representante_telefone, TRUE
  FROM clubes
 WHERE representante_nome IS NOT NULL AND representante_nome <> '';
