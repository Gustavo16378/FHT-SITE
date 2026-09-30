-- Primeiro ADMIN_FHT.
--
-- A senha vem do placeholder ${admin_senha}, alimentado pela variável de ambiente FHT_ADMIN_SENHA
-- (application.properties: quarkus.flyway.placeholders.admin_senha). Em dev o padrão é 123456.
-- Roda UMA vez: trocar a variável depois não muda a senha — pra isso, UPDATE com crypt() direto
-- no banco (README, "Admin em produção"). Não use aspas simples na senha.
INSERT INTO usuarios (nome, email, senha_hash, role)
VALUES ('Administrador FHT', 'admin@fht.org.br', crypt('${admin_senha}', gen_salt('bf', 10)), 'ADMIN_FHT')
ON CONFLICT (email) DO NOTHING;
