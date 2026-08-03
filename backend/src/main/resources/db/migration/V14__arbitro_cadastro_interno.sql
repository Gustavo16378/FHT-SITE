-- Arbitros passam a ser cadastrados pela propria comissao de arbitragem da FHT.
-- Some o formulario publico "quero ser arbitro": ninguem mais se auto-declara, e arbitro
-- nao tem painel proprio. Ver docs/MODULO-ARBITROS.md.
--
-- Com isso, os campos que existiam SO para a peticao publica perdem funcao. Eram preenchidos
-- pelo candidato sobre si mesmo; agora quem preenche a ficha e a federacao, que ja sabe o
-- nivel, o registro e a formacao real de cada um.
ALTER TABLE arbitros
    DROP COLUMN IF EXISTS ja_arbitro,
    DROP COLUMN IF EXISTS nivel_atual,
    DROP COLUMN IF EXISTS federacao_origem,
    DROP COLUMN IF EXISTS tem_experiencia,
    DROP COLUMN IF EXISTS descricao_experiencia,
    DROP COLUMN IF EXISTS disponibilidade_fds,
    DROP COLUMN IF EXISTS curso_interesse,
    DROP COLUMN IF EXISTS comprovante_escolar_url;

-- Solicitacoes que ficaram penduradas nao tem mais como ser completadas pelo candidato
-- (o formulario nao existe mais). A comissao decide no painel: credenciar ou remover.
-- Nao mexemos no status aqui de proposito — apagar ou promover automaticamente seria
-- decidir no lugar da federacao.
