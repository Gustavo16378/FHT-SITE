-- Seed de DEMONSTRAÇÃO (perfil dev). Nunca vai pra produção: só entra na Flyway pelo
-- quarkus.flyway.locations do application-dev.properties (mvn quarkus:dev). Migration REPETÍVEL
-- (R__): roda depois das versionadas e de novo só quando este arquivo muda, então não atrapalha
-- uma V3 futura. No docker compose (perfil prod), aplique na mão:
--   docker exec -i fht_postgres psql -U fht_user -d fht_db < backend/src/main/resources/db/dev/R__seed_dev.sql
-- Idempotente: ids fixos + ON CONFLICT DO NOTHING (pode rodar de novo à vontade).
-- Dados fictícios, com cara de real. Logins: admin@fht.org.br (V2) e clube@fht.org.br / 123456.

-- ── Clube aprovado + acesso do representante ──────────────────────────────────
INSERT INTO clubes (id, nome, cidade, uf, sigla, cnpj, representante_nome, representante_email,
                    representante_telefone, representante_cargo, representante_cpf, status,
                    visivel_na_home, created_at, updated_at)
VALUES ('a1000000-0000-4000-8000-000000000001', 'Palmas Handebol Clube', 'Palmas', 'TO', 'PHC',
        '11.222.333/0001-81', 'Marcos Vinícius Ribeiro', 'clube@fht.org.br', '(63) 99201-4478',
        'Presidente', '123.456.789-09', 'ATIVO', TRUE, '2026-07-06 10:12:00', '2026-07-08 15:40:00')
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (id, nome, email, senha_hash, role, clube_id, ativo)
VALUES ('a1000000-0000-4000-8000-000000000002', 'Marcos Vinícius Ribeiro', 'clube@fht.org.br',
        crypt('123456', gen_salt('bf', 10)), 'ADMIN_CLUBE', 'a1000000-0000-4000-8000-000000000001', TRUE)
ON CONFLICT DO NOTHING;

-- ── Atletas ───────────────────────────────────────────────────────────────────
-- 1) Ana Clara: menor de idade, com responsável legal e consentimentos; anuidade 2026 paga e
--    conferida (lote mais abaixo) → ATIVA.
INSERT INTO atletas (id, clube_id, nome_completo, data_nascimento, sexo, cpf, rg, rg_orgao_emissor,
                     naturalidade_cidade, naturalidade_uf, telefone, email, cep, logradouro, numero,
                     cidade, uf_residencia, posicao, categoria, is_transferencia,
                     responsavel_nome, responsavel_cpf, responsavel_parentesco, responsavel_email,
                     responsavel_telefone, foto_url, rg_url, status, taxa_valor, taxa_ano,
                     aguardando_desde, created_at, updated_at)
VALUES ('a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001',
        'Ana Clara Sousa Martins', '2010-03-14', 'F', '529.982.247-25', '1.987.654', 'SSP/TO',
        'Palmas', 'TO', '(63) 99118-2034', 'anaclara.martins@email.com', '77020-024',
        'Quadra 104 Sul, Rua SE 3', '12', 'Palmas', 'TO', 'Ponta Esquerda', 'Sub-16', FALSE,
        'Fernanda Sousa Martins', '111.444.777-35', 'Mãe', 'fernanda.martins@email.com', '(63) 99118-2033',
        'https://i.pravatar.cc/300?img=47', 'https://picsum.photos/seed/fht-rg-ana/600/400',
        'ATIVO', 35.00, 2026, '2026-08-11 09:30:00', '2026-08-11 09:30:00', '2026-08-22 11:05:00')
ON CONFLICT DO NOTHING;

INSERT INTO consentimentos (id, atleta_id, finalidade, titular_menor, consentido_por_nome,
                            consentido_por_cpf, texto_versao, concedido_em, ip_origem, user_agent)
VALUES
  ('a3000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'CADASTRO_ATLETA_MENOR',
   TRUE, 'Fernanda Sousa Martins', '111.444.777-35', '1.0', '2026-08-11 09:30:00', '177.54.10.21',
   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0'),
  ('a3000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001', 'IMAGEM_PUBLICA',
   TRUE, 'Fernanda Sousa Martins', '111.444.777-35', '1.0', '2026-08-11 09:30:00', '177.54.10.21',
   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0')
ON CONFLICT DO NOTHING;

-- 2) João Pedro: adulto, cadastro completo, esperando o clube pagar a anuidade (aparece na
--    fila do botão de pagamento do painel do clube).
INSERT INTO atletas (id, clube_id, nome_completo, data_nascimento, sexo, cpf, rg, rg_orgao_emissor,
                     naturalidade_cidade, naturalidade_uf, telefone, email, cep, logradouro, numero,
                     cidade, uf_residencia, posicao, categoria, is_transferencia,
                     foto_url, rg_url, status, taxa_valor, taxa_ano, aguardando_desde, created_at, updated_at)
VALUES ('a2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001',
        'João Pedro Alencar Batista', '2001-08-22', 'M', '390.533.447-05', '2.345.678', 'SSP/TO',
        'Porto Nacional', 'TO', '(63) 99245-7710', 'joaopedro.batista@email.com', '77006-116',
        'Avenida Teotônio Segurado', '1550', 'Palmas', 'TO', 'Armador Central', 'Adulto', FALSE,
        'https://i.pravatar.cc/300?img=12', 'https://picsum.photos/seed/fht-rg-joao/600/400',
        'AGUARDANDO_PAGAMENTO', 35.00, 2026, '2026-09-05 18:20:00', '2026-09-05 18:20:00', '2026-09-05 18:20:00')
ON CONFLICT DO NOTHING;

INSERT INTO consentimentos (id, atleta_id, finalidade, titular_menor, consentido_por_nome,
                            consentido_por_cpf, texto_versao, concedido_em, ip_origem, user_agent)
VALUES ('a3000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000002', 'IMAGEM_PUBLICA',
        FALSE, 'João Pedro Alencar Batista', '390.533.447-05', '1.0', '2026-09-05 18:20:00', '187.102.44.9',
        'Mozilla/5.0 (Linux; Android 14) Chrome/128.0 Mobile')
ON CONFLICT DO NOTHING;

-- ── Pagamento em lote já conferido pela federação (cobre a Ana Clara) ─────────
INSERT INTO pagamento_lotes (id, clube_id, protocolo, ano, valor_total, quantidade_atletas,
                             comprovante_url, status, observacao, enviado_em, baixado_em, baixado_por)
VALUES ('a4000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'FHT-2026-DEMO01',
        2026, 35.00, 1, 'https://picsum.photos/seed/fht-pix-demo01/700/1000', 'CONFIRMADO',
        'Anuidade 2026 — Ana Clara', '2026-08-20 14:02:00', '2026-08-22 11:05:00', 'admin@fht.org.br')
ON CONFLICT DO NOTHING;

INSERT INTO pagamento_lote_itens (id, lote_id, atleta_id, atleta_nome, ano, valor, ativo)
VALUES ('a4000000-0000-4000-8000-000000000101', 'a4000000-0000-4000-8000-000000000001',
        'a2000000-0000-4000-8000-000000000001', 'Ana Clara Sousa Martins', 2026, 35.00, TRUE)
ON CONFLICT DO NOTHING;

-- ── Notícias ──────────────────────────────────────────────────────────────────
INSERT INTO noticias (id, titulo, slug, categoria, resumo, conteudo, imagem_capa_url, autor_nome,
                      data_publicacao, destaque, status)
VALUES
  ('a5000000-0000-4000-8000-000000000001',
   'FHT divulga o calendário estadual da temporada 2026',
   'fht-divulga-calendario-estadual-temporada-2026', 'Institucional',
   'Torneio de Abertura em Gurupi, Estadual Adulto em Palmas e festivais de base em quatro cidades.',
   'A Federação de Handebol do Tocantins apresentou nesta semana o calendário oficial da temporada 2026. A abertura fica por conta do Torneio de Abertura, em Gurupi, no fim de setembro.' || E'\n\n' ||
   'O Estadual Adulto masculino e feminino será disputado em Palmas, em outubro, e os festivais das categorias mirim e infantil passam por Araguaína, Porto Nacional, Paraíso do Tocantins e Palmas ao longo de novembro.' || E'\n\n' ||
   'Os clubes filiados recebem o regulamento por e-mail e podem tirar dúvidas pelo canal de contato do site.',
   'https://picsum.photos/seed/fht-noticia-1/1200/675', 'Assessoria FHT', '2026-08-30', FALSE, 'PUBLICADO'),
  ('a5000000-0000-4000-8000-000000000002',
   'Filiação de clubes 2026 já pode ser feita pelo site',
   'filiacao-de-clubes-2026-pelo-site', 'Institucional',
   'Clubes de todo o estado enviam ata, estatuto e dados do representante pelo formulário do site e acompanham a análise pelo painel.',
   'A partir de agora, a filiação de clubes à FHT é feita inteiramente pelo site. O representante preenche o formulário, anexa a ata de fundação e o estatuto, escolhe uma senha e aguarda a análise da federação.' || E'\n\n' ||
   'Aprovado o clube, o acesso ao painel é liberado no mesmo e-mail cadastrado. Por lá o clube cadastra os atletas, incluindo os dados do responsável legal quando o atleta é menor de idade, e paga a anuidade em lote, com um único comprovante Pix.' || E'\n\n' ||
   'O prazo para a filiação com direito a participar da temporada 2026 vai até 30 de setembro.',
   'https://picsum.photos/seed/fht-noticia-2/1200/675', 'Assessoria FHT', '2026-09-08', TRUE, 'PUBLICADO'),
  ('a5000000-0000-4000-8000-000000000003',
   'Seleção tocantinense sub-16 convoca 18 atletas para período de treinos em Palmas',
   'selecao-tocantinense-sub-16-convoca-18-atletas', 'Seleção',
   'Convocadas atletas de Palmas, Araguaína, Gurupi e Porto Nacional. Treinos acontecem no ginásio Ayrton Senna.',
   'A comissão técnica da seleção tocantinense feminina sub-16 divulgou a lista de 18 atletas convocadas para o período de treinos de setembro, em Palmas. A relação reúne jogadoras de quatro cidades do estado.' || E'\n\n' ||
   'As atividades acontecem no ginásio Ayrton Senna, sempre no período da tarde, e a delegação segue depois para a etapa regional em Goiânia.' || E'\n\n' ||
   'A lista completa está disponível na secretaria da federação e foi enviada aos clubes das atletas.',
   'https://picsum.photos/seed/fht-noticia-3/1200/675', 'Assessoria FHT', '2026-09-12', FALSE, 'PUBLICADO')
ON CONFLICT DO NOTHING;

-- ── Documentos oficiais (transparência) ───────────────────────────────────────
INSERT INTO documentos (id, titulo, categoria, arquivo_url, data_publicacao, publicado_por, tamanho_bytes)
VALUES
  ('a6000000-0000-4000-8000-000000000001', 'Estatuto Social da FHT', 'Estatuto',
   'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '2023-02-10', 'Diretoria FHT', 184320),
  ('a6000000-0000-4000-8000-000000000002', 'Edital de Filiação 2026', 'Edital',
   'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '2026-08-01', 'Secretaria FHT', 96512)
ON CONFLICT DO NOTHING;

-- ── Galeria ───────────────────────────────────────────────────────────────────
INSERT INTO fotos (id, imagem_url, evento, ano, categoria, tamanho, created_at, updated_at)
VALUES
  ('a7000000-0000-4000-8000-000000000001', 'https://picsum.photos/seed/fht-foto-1/1200/800',
   'Final do Estadual Adulto Masculino', '2025', 'Adulto', 'large', '2025-11-20 20:10:00', '2025-11-20 20:10:00'),
  ('a7000000-0000-4000-8000-000000000002', 'https://picsum.photos/seed/fht-foto-2/900/900',
   'Festival Mirim de Palmas', '2026', 'Mirim', 'medium', '2026-05-18 17:40:00', '2026-05-18 17:40:00'),
  ('a7000000-0000-4000-8000-000000000003', 'https://picsum.photos/seed/fht-foto-3/800/600',
   'Treino da seleção sub-16 em Araguaína', '2026', 'Sub-16', 'small', '2026-06-02 16:00:00', '2026-06-02 16:00:00'),
  ('a7000000-0000-4000-8000-000000000004', 'https://picsum.photos/seed/fht-foto-4/900/900',
   'Torneio de Abertura em Gurupi', '2026', 'Adulto', 'medium', '2026-03-09 19:30:00', '2026-03-09 19:30:00'),
  ('a7000000-0000-4000-8000-000000000005', 'https://picsum.photos/seed/fht-foto-5/800/600',
   'Clínica técnica para treinadores em Porto Nacional', '2025', 'Formação', 'small', '2025-08-16 10:00:00', '2025-08-16 10:00:00'),
  ('a7000000-0000-4000-8000-000000000006', 'https://picsum.photos/seed/fht-foto-6/1200/800',
   'Estadual Feminino Sub-18 em Paraíso do Tocantins', '2025', 'Sub-18', 'large', '2025-10-04 21:15:00', '2025-10-04 21:15:00')
ON CONFLICT DO NOTHING;
