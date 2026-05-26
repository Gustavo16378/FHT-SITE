#!/bin/bash
# Gera par de chaves RSA para assinatura JWT (SmallRye JWT)
# Execute: bash gerar-chaves-jwt.sh
# Os arquivos gerados devem ficar em: src/main/resources/

set -e

OUT_DIR="src/main/resources"

echo "Gerando chave privada RSA 2048..."
openssl genrsa -out "$OUT_DIR/privateKey.pem" 2048

echo "Extraindo chave pública..."
openssl rsa -in "$OUT_DIR/privateKey.pem" -pubout -out "$OUT_DIR/publicKey.pem"

echo ""
echo "Chaves geradas em $OUT_DIR:"
echo "  privateKey.pem  -> assinar tokens (NÃO commitar)"
echo "  publicKey.pem   -> verificar tokens (pode commitar)"
echo ""
echo "Adicione ao .gitignore:"
echo "  src/main/resources/privateKey.pem"
