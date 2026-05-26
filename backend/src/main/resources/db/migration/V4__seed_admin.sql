-- Admin FHT inicial (senha: 123456)
INSERT INTO usuarios (nome, email, senha_hash, role)
VALUES (
    'Administrador FHT',
    'admin@fht.org.br',
    crypt('123456', gen_salt('bf', 10)),
    'ADMIN_FHT'
)
ON CONFLICT (email) DO NOTHING;
