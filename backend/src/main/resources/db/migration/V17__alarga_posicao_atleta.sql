-- O atleta passou a poder ter MAIS DE UMA posicao (ex.: joga nas duas pontas), e o cadastro
-- envia as escolhas concatenadas numa string so. VARCHAR(50) nao cabe: tres posicoes longas
-- ("Ponta Direita, Armador Lateral Direito, Armador Lateral Esquerdo") dao 64 caracteres, o
-- INSERT estourava no Postgres e o clube recebia "Erro interno do servidor" DEPOIS de preencher
-- os quatro passos e subir o RG.
--
-- 200 cobre as sete posicoes do handebol juntas (112 caracteres) com folga.
ALTER TABLE atletas ALTER COLUMN posicao TYPE VARCHAR(200);
