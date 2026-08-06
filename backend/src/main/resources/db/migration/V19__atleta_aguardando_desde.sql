-- O expurgo de cadastro abandonado contava a partir de created_at. Isso tem dois furos:
--
-- 1. Um atleta REJEITADO ha mais de 90 dias que a federacao devolve pra fila com "reconsiderar"
--    volta pra AGUARDANDO_PAGAMENTO com o created_at antigo — e a varredura seguinte apaga o
--    cadastro em ate 24h, levando os consentimentos LGPD por cascata. O admin acha que devolveu
--    o atleta pra analise e no dia seguinte o atleta sumiu.
--
-- 2. Nao existia distincao entre "cadastro abandonado" e "cadastro esperando a federacao dar
--    baixa no lote": os dois ficam em AGUARDANDO_PAGAMENTO. O clube que pagou em marco e nao
--    teve o comprovante conferido perdia o atleta em junho.
--
-- aguardando_desde marca QUANDO o cadastro entrou na fila de pagamento — e reinicia quando ele
-- volta pra fila. E o relogio do expurgo; created_at continua sendo a data de cadastro.
ALTER TABLE atletas ADD COLUMN aguardando_desde TIMESTAMP;

-- Backfill: para quem ja esta na fila, o relogio sempre foi o cadastro.
UPDATE atletas SET aguardando_desde = created_at WHERE aguardando_desde IS NULL;

CREATE INDEX idx_atletas_aguardando_desde ON atletas (aguardando_desde)
    WHERE status = 'AGUARDANDO_PAGAMENTO';
