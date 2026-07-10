-- A entidade Clube possui o campo representanteCargo (@Column "representante_cargo")
-- e o ClubeForm captura esse dado, mas a coluna nunca foi criada no schema (V1).
-- Sem ela, o Hibernate gera SELECT com representante_cargo e o Postgres estoura
-- (42703 column does not exist), quebrando GET /api/clubes.
ALTER TABLE clubes ADD COLUMN IF NOT EXISTS representante_cargo VARCHAR(100);
