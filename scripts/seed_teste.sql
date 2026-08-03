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

-- ── Fluxo LGPD/pagamento (V12) ─────────────────────────────────────────
-- Menor COM responsável e consentimento, já pago: caso "feliz" do fluxo novo.
-- Pedro Henrique (acima) fica de propósito como menor SEM responsável — é o cadastro
-- legado que a federação NÃO consegue aprovar, para testar o bloqueio.
INSERT INTO atletas (id, clube_id, nome_completo, data_nascimento, sexo, cpf, rg, rg_orgao_emissor, naturalidade_cidade, naturalidade_uf, telefone, email, cep, logradouro, numero, cidade, uf_residencia, posicao, categoria, is_transferencia, foto_url, rg_url, comprovante_pagamento_url, responsavel_nome, responsavel_cpf, responsavel_parentesco, responsavel_email, responsavel_telefone, status, taxa_valor, taxa_ano)
VALUES
 ('aa000000-0000-0000-0000-0000000000a1', '11111111-1111-1111-1111-111111111111', 'Sofia Almeida Nunes', '2012-02-20', 'F', '111.222.333-08', '8234567', 'SSP-TO', 'Palmas', 'TO', '(63) 98111-0008', NULL, '77000-000', 'Quadra 110 Norte', '42', 'Palmas', 'TO', 'Ponta Direita', 'Sub-14', false, 'https://i.pravatar.cc/150?img=26', 'https://www.africau.edu/images/default/sample.pdf', 'https://www.africau.edu/images/default/sample.pdf', 'Carla Almeida Nunes', '111.222.333-99', 'Mãe', 'carla.nunes@email.com', '(63) 98111-9999', 'AGUARDANDO_APROVACAO', 35.00, 2026)
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO consentimentos (atleta_id, finalidade, titular_menor, consentido_por_nome, consentido_por_cpf, texto_versao, concedido_em, ip_origem, user_agent)
VALUES
 ('aa000000-0000-0000-0000-0000000000a1', 'CADASTRO_ATLETA_MENOR', true, 'Carla Almeida Nunes', '111.222.333-99', '1.0', NOW() - INTERVAL '2 days', '187.0.0.1', 'Mozilla/5.0 (seed de teste)'),
 ('aa000000-0000-0000-0000-0000000000a1', 'IMAGEM_PUBLICA',        true, 'Carla Almeida Nunes', '111.222.333-99', '1.0', NOW() - INTERVAL '2 days', '187.0.0.1', 'Mozilla/5.0 (seed de teste)')
ON CONFLICT DO NOTHING;

-- O prazo de pagamento por atleta acabou (ago/2026): agora o clube paga em lote, quando puder,
-- e o expurgo só apaga cadastro abandonado há 90 dias. Os dois atletas AGUARDANDO_PAGAMENTO do
-- seed ficam pendentes de propósito — são eles que alimentam a soma do botão de pagamento.
UPDATE atletas SET prazo_pagamento_ate = NULL WHERE prazo_pagamento_ate IS NOT NULL;

-- ── Usuário ADMIN_CLUBE de teste (senha: 123456) — vinculado ao Palmas HC ──
-- (o admin admin@fht.org.br já vem no seed V4). Hash bcrypt de "123456".
INSERT INTO usuarios (nome, email, senha_hash, role, clube_id, ativo)
VALUES ('Palmas Handebol Clube', 'clube@fht.org.br', '$2a$10$OCUw.OlNjbQtqBxK0QUo3O2fXD98b7jcO2YE6xyssv56z00pgG0ze', 'ADMIN_CLUBE', '11111111-1111-1111-1111-111111111111', true)
ON CONFLICT (email) DO NOTHING;

-- ── Notícias (blog) — mistura de categorias, 1 destaque e 1 rascunho ─────
-- Limpar depois: DELETE FROM noticias WHERE id::text LIKE 'aaaaaaaa-%';
INSERT INTO noticias (id, titulo, slug, categoria, resumo, conteudo, imagem_capa_url, autor_nome, data_publicacao, destaque, status, created_at, updated_at)
VALUES
 ('aaaaaaaa-0000-0000-0000-000000000001',
  'FHT lança calendário oficial de competições para a temporada 2026',
  'fht-lanca-calendario-2026', 'Institucional',
  'A Federação de Handebol do Tocantins divulgou o calendário completo da temporada, com competições em todas as categorias de base e adulto.',
  E'A Federação de Handebol do Tocantins (FHT) apresentou nesta semana, em Palmas, o calendário oficial da temporada 2026.\n\nSão oito competições ao longo do ano, contemplando as categorias de base (Sub-12 a Sub-18) e o adulto masculino e feminino. A temporada abre em junho com a Copa Tocantins de base.\n\n"Queremos dar previsibilidade aos clubes para que possam planejar suas equipes com antecedência", afirmou a presidência durante o anúncio.',
  'https://picsum.photos/seed/fht-calendario/800/450', 'Administração FHT', '2026-07-20', true, 'PUBLICADO', NOW(), NOW()),

 ('aaaaaaaa-0000-0000-0000-000000000002',
  'Campeonato Tocantinense tem rodada emocionante em Palmas',
  'campeonato-tocantinense-rodada-palmas', 'Competição',
  'Equipes disputaram duas rodadas no Ginásio Ayrton Senna com casa cheia e grande nível técnico.',
  E'O fim de semana foi de handebol intenso no Ginásio Ayrton Senna, em Palmas.\n\nDuas rodadas do Campeonato Tocantinense movimentaram as arquibancadas, com jogos equilibrados e definições apenas nos minutos finais. O Palmas HC segue na liderança.\n\nA próxima rodada acontece em Araguaína, no próximo mês.',
  'https://picsum.photos/seed/fht-rodada/800/450', 'Administração FHT', '2026-07-14', false, 'PUBLICADO', NOW(), NOW()),

 ('aaaaaaaa-0000-0000-0000-000000000003',
  'Curso de formação de árbitros abre vagas para Palmas e Araguaína',
  'curso-formacao-arbitros-2026', 'Arbitragem',
  'A FHT abre inscrições para o curso de formação de árbitros, em parceria com a CBHb, com vagas nas duas maiores cidades do estado.',
  E'A FHT abriu as inscrições para o curso de formação de árbitros de handebol.\n\nA capacitação, em parceria com a Confederação Brasileira de Handebol (CBHb), terá módulos teóricos e práticos e vagas em Palmas e Araguaína. As inscrições vão até o fim do mês.\n\nO objetivo é ampliar o quadro de arbitragem do estado para as competições da temporada.',
  'https://picsum.photos/seed/fht-arbitros/800/450', 'Administração FHT', '2026-07-05', false, 'PUBLICADO', NOW(), NOW()),

 ('aaaaaaaa-0000-0000-0000-000000000004',
  'Seleção Tocantinense Sub-18 se prepara para os Jogos do Interior',
  'selecao-sub18-jogos-do-interior', 'Seleção',
  'O grupo de trabalho se reuniu para os primeiros treinos da temporada visando representar o estado nos Jogos do Interior.',
  E'A comissão técnica da Seleção Tocantinense Sub-18 iniciou a preparação para os Jogos do Interior.\n\nO grupo, formado por atletas de seis clubes filiados, realizou os primeiros treinos de avaliação em Porto Nacional. A convocação final será divulgada nas próximas semanas.',
  'https://picsum.photos/seed/fht-selecao/800/450', 'Administração FHT', '2026-06-28', false, 'PUBLICADO', NOW(), NOW()),

 ('aaaaaaaa-0000-0000-0000-000000000005',
  'Assembleia geral aprova novo estatuto e taxa de anuidade 2026',
  'assembleia-estatuto-anuidade-2026', 'Institucional',
  'Clubes filiados aprovam ajustes no estatuto e o valor da anuidade que habilita atletas às competições do ano.',
  E'Rascunho em edição — publicar após revisão da diretoria.',
  NULL, 'Administração FHT', '2026-07-25', false, 'RASCUNHO', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Galeria (fotos) — mosaico com tamanhos variados ─────────────────────
-- Limpar depois: DELETE FROM fotos WHERE id::text LIKE 'bbbbbbbb-%';
INSERT INTO fotos (id, imagem_url, evento, ano, categoria, tamanho, created_at, updated_at)
VALUES
 ('bbbbbbbb-0000-0000-0000-000000000001', 'https://picsum.photos/seed/fht-g1/800/600', 'Campeonato Estadual', '2024', 'Adulto Masculino', 'large', NOW(), NOW()),
 ('bbbbbbbb-0000-0000-0000-000000000002', 'https://picsum.photos/seed/fht-g2/600/600', 'Copa FHT Sub-18', '2024', 'Sub-18 Feminino', 'medium', NOW(), NOW()),
 ('bbbbbbbb-0000-0000-0000-000000000003', 'https://picsum.photos/seed/fht-g3/600/600', 'Festival Sub-14', '2023', 'Sub-14', 'medium', NOW(), NOW()),
 ('bbbbbbbb-0000-0000-0000-000000000004', 'https://picsum.photos/seed/fht-g4/600/600', 'Circuito Interior', '2023', 'Adulto Feminino', 'small', NOW(), NOW()),
 ('bbbbbbbb-0000-0000-0000-000000000005', 'https://picsum.photos/seed/fht-g5/600/600', 'Jogos do Interior', '2022', 'Seleção TO', 'small', NOW(), NOW()),
 ('bbbbbbbb-0000-0000-0000-000000000006', 'https://picsum.photos/seed/fht-g6/800/600', 'Final da Taça FHT', '2023', 'Adulto Masculino', 'large', NOW(), NOW()),
 ('bbbbbbbb-0000-0000-0000-000000000007', 'https://picsum.photos/seed/fht-g7/600/600', 'Abertura da Temporada', '2024', 'Sub-16', 'medium', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Diretoria ───────────────────────────────────────────────────────────
-- Limpar depois: DELETE FROM diretores WHERE id::text LIKE 'cccccccc-%';
INSERT INTO diretores (id, nome, cargo, area, mandato, email, telefone, desde, bio, ordem, created_at, updated_at)
VALUES
 ('cccccccc-0000-0000-0000-000000000001', 'João Carlos Mendonça', 'Presidente', 'Gestão Geral', '2023–2027', 'presidencia@fht.org.br', '(63) 98111-2023', 'Fevereiro/2023',
  E'Natural de Palmas, atua no handebol tocantinense há mais de duas décadas, tendo iniciado como atleta antes de assumir a gestão esportiva.\n\nÀ frente da presidência, prioriza a profissionalização administrativa da FHT, a ampliação do calendário estadual e a filiação de novos clubes no interior.', 1, NOW(), NOW()),
 ('cccccccc-0000-0000-0000-000000000002', 'Ana Paula Ribeiro', 'Vice-Presidente', 'Gestão Geral', '2023–2027', 'vice@fht.org.br', '(63) 98222-4477', 'Fevereiro/2023',
  E'Formada em Educação Física e pós-graduada em Gestão Esportiva. Coordenou projetos sociais de iniciação ao handebol em escolas públicas.\n\nDá suporte direto à presidência e coordena a integração entre as diretorias.', 2, NOW(), NOW()),
 ('cccccccc-0000-0000-0000-000000000003', 'Roberto Alves Neto', 'Diretor Técnico', 'Competições', '2023–2027', 'tecnico@fht.org.br', '(63) 98333-1590', 'Março/2023',
  E'Treinador de equipes adultas e de base, com certificação técnica da CBHb.\n\nResponsável pelo calendário estadual, regulamento das competições e homologação de resultados oficiais.', 3, NOW(), NOW()),
 ('cccccccc-0000-0000-0000-000000000004', 'Silvia Monteiro', 'Diretora Financeira', 'Financeiro', '2023–2027', 'financeiro@fht.org.br', '(63) 98444-7788', 'Fevereiro/2023',
  E'Contadora com atuação em entidades esportivas sem fins lucrativos.\n\nResponsável pelo controle das anuidades, taxas de filiação e pela prestação de contas anual da FHT.', 4, NOW(), NOW()),
 ('cccccccc-0000-0000-0000-000000000005', 'Alexandre Costa', 'Diretor de Arbitragem', 'Arbitragem', '2023–2027', 'arbitragem@fht.org.br', '(63) 98555-3120', 'Março/2023',
  E'Árbitro por mais de quinze anos, com atuação em competições estaduais e nacionais.\n\nCoordena o quadro de árbitros, as escalas dos jogos e os cursos de formação.', 5, NOW(), NOW()),
 ('cccccccc-0000-0000-0000-000000000006', 'Renata Pinheiro', 'Diretora de Comunicação', 'Comunicação', '2023–2027', 'comunicacao@fht.org.br', '(63) 98666-9041', 'Abril/2023',
  E'Jornalista com experiência em assessoria de imprensa esportiva e mídias sociais.\n\nResponde pela comunicação oficial: notícias, cobertura das competições e redes sociais.', 6, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Documentos institucionais (transparência) — PDF de exemplo público ──
-- Limpar depois: DELETE FROM documentos WHERE id::text LIKE 'dddddddd-%';
INSERT INTO documentos (id, titulo, categoria, arquivo_url, data_publicacao, publicado_por, tamanho_bytes, created_at, updated_at)
VALUES
 ('dddddddd-0000-0000-0000-000000000001', 'Estatuto da FHT — Versão 2023', 'Estatuto', 'https://www.africau.edu/images/default/sample.pdf', '2023-03-14', 'Administração FHT', 1887436, NOW(), NOW()),
 ('dddddddd-0000-0000-0000-000000000002', 'Regulamento Geral de Competições 2026', 'Regulamento', 'https://www.africau.edu/images/default/sample.pdf', '2026-01-10', 'Administração FHT', 2516582, NOW(), NOW()),
 ('dddddddd-0000-0000-0000-000000000003', 'Calendário Oficial de Competições 2026', 'Calendário', 'https://www.africau.edu/images/default/sample.pdf', '2026-01-05', 'Administração FHT', 655360, NOW(), NOW()),
 ('dddddddd-0000-0000-0000-000000000004', 'Edital de Credenciamento de Árbitros 2026', 'Edital', 'https://www.africau.edu/images/default/sample.pdf', '2026-02-14', 'Administração FHT', 942080, NOW(), NOW()),
 ('dddddddd-0000-0000-0000-000000000005', 'Circular nº 01/2026 — Prazo de Transferências', 'Circular', 'https://www.africau.edu/images/default/sample.pdf', '2026-02-28', 'Administração FHT', 317440, NOW(), NOW()),
 ('dddddddd-0000-0000-0000-000000000006', 'Ata de Posse da Diretoria 2023–2027', 'Estatuto', 'https://www.africau.edu/images/default/sample.pdf', '2023-04-01', 'Administração FHT', 524288, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Árbitros (status variados; credenciados aparecem no site) ───────────
-- Limpar depois: DELETE FROM arbitros WHERE id::text LIKE 'eeeeeeee-%';
INSERT INTO arbitros (id, nome, cpf, data_nascimento, sexo, telefone, email, cidade, uf, foto_url, nivel, registro, inicio_arbitragem, formacao, status, created_at, updated_at)
VALUES
 ('eeeeeeee-0000-0000-0000-000000000001', 'Carlos Eduardo Nunes', '222.333.444-07', '1985-10-08', 'Masculino', '(63) 98333-1007', 'carlos.arb@email.com', 'Gurupi', 'TO', 'https://i.pravatar.cc/150?img=14', 'Nacional', 'ARB-TO-0007', '2008', 'Curso CBHb + Arbitragem Nacional 2018', 'CREDENCIADO', NOW(), NOW()),
 ('eeeeeeee-0000-0000-0000-000000000002', 'Renata Alves Souza', '222.333.444-08', '1992-02-20', 'Feminino', '(63) 98333-1008', 'renata.arb@email.com', 'Porto Nacional', 'TO', 'https://i.pravatar.cc/150?img=48', 'Estadual B', 'ARB-TO-0042', '2013', 'Curso CBHb 2013 + Reciclagem 2020', 'CREDENCIADO', NOW(), NOW()),
 ('eeeeeeee-0000-0000-0000-000000000003', 'Marcos Vinicius Alves', '222.333.444-09', '1990-05-11', 'Masculino', '(63) 98333-1009', 'marcos.arb@email.com', 'Palmas', 'TO', 'https://i.pravatar.cc/150?img=33', 'Estadual A', 'ARB-TO-0021', '2016', 'Curso de Formação CBHb 2016', 'CREDENCIADO', NOW(), NOW()),
 ('eeeeeeee-0000-0000-0000-000000000004', 'Fábio Martins Rocha', '222.333.444-10', '1988-06-15', 'Masculino', '(63) 98333-1010', 'fabio.arb@email.com', 'Palmas', 'TO', 'https://i.pravatar.cc/150?img=12', NULL, NULL, NULL, NULL, 'PENDENTE', NOW(), NOW()),
 ('eeeeeeee-0000-0000-0000-000000000005', 'Patrícia Gomes Lima', '222.333.444-11', '1990-12-01', 'Feminino', '(63) 98333-1011', 'patricia.arb@email.com', 'Araguaína', 'TO', 'https://i.pravatar.cc/150?img=44', 'Regional', 'ARB-TO-0055', '2019', 'Curso de Formação CBHb 2019', 'SUSPENSO', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Competições (V13) — cobre os status derivados e o override manual ───
-- O status NÃO é gravado: sai das datas. Por isso as datas são relativas a NOW(),
-- pra o seed continuar cobrindo os 3 estados independente de quando for rodado.
INSERT INTO competicoes (id, nome, descricao, data_inicio, data_fim, local, cidade, uf, temporada, numero_equipes, cor, status_override, visivel_na_home)
VALUES
 -- futura → deriva EM_BREVE
 ('cccccccc-0000-0000-0000-000000000001', 'Campeonato Tocantinense Adulto',
  'Principal competição do estado, disputada em turno e returno.',
  (NOW() + INTERVAL '40 days')::date, (NOW() + INTERVAL '120 days')::date,
  'Ginásio Ayrton Senna', 'Palmas', 'TO', EXTRACT(YEAR FROM NOW())::int, 8, '#1A3A8F', NULL, TRUE),
 -- acontecendo → deriva EM_ANDAMENTO
 ('cccccccc-0000-0000-0000-000000000002', 'Copa FHT Sub-18 Feminino',
  'Competição de base feminina, categoria Sub-18.',
  (NOW() - INTERVAL '10 days')::date, (NOW() + INTERVAL '20 days')::date,
  'Centro Esportivo Governador', 'Palmas', 'TO', EXTRACT(YEAR FROM NOW())::int, 6, '#1E4DB7', NULL, TRUE),
 -- futura, mas com override manual → INSCRICOES_ABERTAS vence a derivação
 ('cccccccc-0000-0000-0000-000000000003', 'Festival de Handebol Sub-14 e Sub-12',
  'Festival de base, sem caráter competitivo.',
  (NOW() + INTERVAL '25 days')::date, (NOW() + INTERVAL '27 days')::date,
  'Ginásio Municipal', 'Araguaína', 'TO', EXTRACT(YEAR FROM NOW())::int, 10, '#1A3A8F', 'INSCRICOES_ABERTAS', TRUE),
 -- passada → deriva ENCERRADO
 ('cccccccc-0000-0000-0000-000000000004', 'Campeonato Estadual Adulto Feminino',
  'Edição do ano passado, mantida para consulta dos resultados.',
  (NOW() - INTERVAL '380 days')::date, (NOW() - INTERVAL '300 days')::date,
  'Ginásio Ayrton Senna', 'Palmas', 'TO', (EXTRACT(YEAR FROM NOW()) - 1)::int, 6, '#1A3A8F', NULL, TRUE),
 -- oculta da home → só o admin enxerga
 ('cccccccc-0000-0000-0000-000000000005', 'Circuito Interior Sub-16 (rascunho)',
  'Ainda sendo montado — não deve aparecer no site.',
  (NOW() + INTERVAL '60 days')::date, (NOW() + INTERVAL '90 days')::date,
  'Diversas cidades', 'Palmas', 'TO', EXTRACT(YEAR FROM NOW())::int, 0, '#1E4DB7', NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO competicao_categorias (competicao_id, categoria)
VALUES
 ('cccccccc-0000-0000-0000-000000000001', 'adulto'),
 ('cccccccc-0000-0000-0000-000000000001', 'masculino'),
 ('cccccccc-0000-0000-0000-000000000002', 'sub-18'),
 ('cccccccc-0000-0000-0000-000000000002', 'feminino'),
 ('cccccccc-0000-0000-0000-000000000003', 'sub-14'),
 ('cccccccc-0000-0000-0000-000000000003', 'sub-12'),
 ('cccccccc-0000-0000-0000-000000000004', 'adulto'),
 ('cccccccc-0000-0000-0000-000000000004', 'feminino'),
 ('cccccccc-0000-0000-0000-000000000005', 'sub-16')
ON CONFLICT DO NOTHING;

-- ── Comissão técnica do Palmas HC (V15) ────────────────────────────────
-- O representante principal já vem do backfill da migration. Aqui entram o 2º
-- representante e o TÉCNICO — que é quem vai definir a escalação quando o módulo
-- de competições chegar. São dados cadastrais: ninguém aqui tem login próprio.
INSERT INTO clube_pessoas (id, clube_id, nome, cpf, funcao, cargo, email, telefone, principal)
VALUES
 ('bbbbbbbb-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
  'Ana Paula Vice', NULL, 'REPRESENTANTE', 'Vice-presidente', 'ana@palmashc.com', '(63) 98777-2211', FALSE),
 ('bbbbbbbb-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
  'Sérgio Técnico Silva', NULL, 'TECNICO', 'Técnico principal', 'sergio@palmashc.com', '(63) 98777-1122', FALSE)
ON CONFLICT (id) DO NOTHING;
