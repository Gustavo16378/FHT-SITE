-- Seed de DADOS DE TESTE (NÃO é produção) — clubes + atletas pra popular o painel admin.
-- Idempotente: pode rodar de novo sem duplicar (ON CONFLICT DO NOTHING).
--
-- Como rodar (com a stack Docker de pé):
--   docker exec -i fht_postgres psql -U fht_user -d fht_db < scripts/seed_teste.sql
--
-- Pra limpar depois:
--   docker exec fht_postgres psql -U fht_user -d fht_db -c "DELETE FROM atletas; DELETE FROM clubes WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');"

-- ── Clubes ─────────────────────────────────────────────────────────────
INSERT INTO clubes (id, nome, cidade, uf, sigla, cnpj, representante_nome, representante_email, representante_telefone, representante_cargo, status, ata_fundacao_url, estatuto_url)
VALUES
 ('11111111-1111-1111-1111-111111111111', 'Palmas Handebol Clube', 'Palmas', 'TO', 'PHC', '12.345.678/0001-90', 'João Carlos Mendonça', 'joao@phc.org.br', '(63) 99111-2233', 'Presidente', 'ATIVO', 'https://www.africau.edu/images/default/sample.pdf', 'https://www.africau.edu/images/default/sample.pdf'),
 ('22222222-2222-2222-2222-222222222222', 'Araguaína Handebol Clube', 'Araguaína', 'TO', 'AHC', '98.765.432/0001-10', 'Ana Paula Ribeiro', 'ana@ahc.org.br', '(63) 99444-5566', 'Diretora', 'PENDENTE', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ── Atletas (status/idades variados; inclui menores Sub-16/Sub-18) ─────
INSERT INTO atletas (clube_id, nome_completo, data_nascimento, sexo, cpf, rg, rg_orgao_emissor, naturalidade_cidade, naturalidade_uf, telefone, email, cep, logradouro, numero, cidade, uf_residencia, posicao, categoria, is_transferencia, clube_anterior, foto_url, rg_url, comprovante_residencia_url, comprovante_pagamento_url, status, taxa_valor, taxa_ano)
VALUES
 ('11111111-1111-1111-1111-111111111111', 'Rafael Souza Lima',      '1998-03-12', 'M', '111.222.333-01', '1234567', 'SSP-TO', 'Palmas', 'TO', '(63) 98111-0001', 'rafael@email.com', '77000-000', 'Quadra 104 Norte', '10', 'Palmas', 'TO', 'Ponta Esquerda', 'Adulto', false, NULL, 'https://i.pravatar.cc/150?img=11', 'https://www.africau.edu/images/default/sample.pdf', 'https://www.africau.edu/images/default/sample.pdf', 'https://www.africau.edu/images/default/sample.pdf', 'ATIVO', 35.00, 2026),
 ('11111111-1111-1111-1111-111111111111', 'Mariana Costa Alves',    '2000-07-25', 'F', '111.222.333-02', '2234567', 'SSP-TO', 'Palmas', 'TO', '(63) 98111-0002', 'mariana@email.com', '77000-000', 'Quadra 204 Sul', '25', 'Palmas', 'TO', 'Armadora Central', 'Adulto', false, NULL, 'https://i.pravatar.cc/150?img=45', NULL, NULL, 'https://www.africau.edu/images/default/sample.pdf', 'ATIVO', 35.00, 2026),
 ('11111111-1111-1111-1111-111111111111', 'Pedro Henrique Gomes',   '2010-11-03', 'M', '111.222.333-03', '3234567', 'SSP-TO', 'Palmas', 'TO', '(63) 98111-0003', 'pedroh@email.com', '77000-000', 'Quadra 305 Norte', '5', 'Palmas', 'TO', 'Goleiro', 'Sub-16', false, NULL, 'https://i.pravatar.cc/150?img=13', NULL, NULL, NULL, 'AGUARDANDO_PAGAMENTO', 35.00, 2026),
 ('11111111-1111-1111-1111-111111111111', 'Beatriz Santos Rocha',   '2008-05-18', 'F', '111.222.333-04', '4234567', 'SSP-TO', 'Palmas', 'TO', '(63) 98111-0004', 'bia@email.com', '77000-000', 'Quadra 406 Sul', '12', 'Palmas', 'TO', 'Pivô', 'Sub-18', false, NULL, 'https://i.pravatar.cc/150?img=47', 'https://www.africau.edu/images/default/sample.pdf', NULL, 'https://www.africau.edu/images/default/sample.pdf', 'ATIVO', 35.00, 2026),
 ('11111111-1111-1111-1111-111111111111', 'Lucas Ferreira Dias',    '1995-09-30', 'M', '111.222.333-05', '5234567', 'SSP-TO', 'Gurupi', 'TO', '(63) 98111-0005', 'lucas@email.com', '77000-000', 'Quadra 107 Norte', '8', 'Palmas', 'TO', 'Ponta Direita', 'Adulto', false, NULL, 'https://i.pravatar.cc/150?img=15', NULL, NULL, 'https://www.africau.edu/images/default/sample.pdf', 'SUSPENSO', 35.00, 2025),
 ('11111111-1111-1111-1111-111111111111', 'Gabriel Oliveira Melo',  '1999-01-22', 'M', '111.222.333-06', '6234567', 'SSP-GO', 'Goiânia', 'GO', '(63) 98111-0006', 'gabriel@email.com', '77000-000', 'Quadra 208 Sul', '30', 'Palmas', 'TO', 'Central', 'Adulto', true, 'Goiânia Handebol', 'https://i.pravatar.cc/150?img=33', 'https://www.africau.edu/images/default/sample.pdf', 'https://www.africau.edu/images/default/sample.pdf', 'https://www.africau.edu/images/default/sample.pdf', 'ATIVO', 35.00, 2026),
 ('22222222-2222-2222-2222-222222222222', 'Juliana Martins Prado',  '2001-04-14', 'F', '111.222.333-07', '7234567', 'SSP-TO', 'Araguaína', 'TO', '(63) 98222-0007', 'juliana@email.com', '77800-000', 'Rua das Mangueiras', '100', 'Araguaína', 'TO', 'Armadora Esquerda', 'Adulto', false, NULL, 'https://i.pravatar.cc/150?img=49', NULL, NULL, NULL, 'AGUARDANDO_PAGAMENTO', 35.00, 2026)
ON CONFLICT (cpf) DO NOTHING;
