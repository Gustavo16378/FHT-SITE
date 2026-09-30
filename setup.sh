#!/bin/bash
set -e

echo "=== Setup FHT-SITE ==="

KEYS_DIR="backend/src/main/resources"

# Chaves JWT
if [ ! -f "$KEYS_DIR/privateKey.pem" ] || [ ! -f "$KEYS_DIR/publicKey.pem" ]; then
    echo "Gerando chaves JWT..."
    openssl genrsa -out "$KEYS_DIR/_raw.pem" 2048 2>/dev/null
    openssl pkcs8 -topk8 -inform PEM -in "$KEYS_DIR/_raw.pem" -outform PEM -nocrypt -out "$KEYS_DIR/privateKey.pem"
    openssl rsa -in "$KEYS_DIR/_raw.pem" -pubout -out "$KEYS_DIR/publicKey.pem" 2>/dev/null
    rm "$KEYS_DIR/_raw.pem"
    echo "  OK - chaves geradas"
else
    echo "  OK - chaves ja existem"
fi

# Arquivo .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "  OK - .env criado (preencha as credenciais do R2 se necessario)"
else
    echo "  OK - .env ja existe"
fi

echo ""
echo "Pronto! Rode agora: docker compose up --build"

# Chaves JWT em base64 pro container do compose (os .pem não entram na imagem — em produção
# vão por env JWT_PUBLIC_KEY / JWT_PRIVATE_KEY do mesmo jeito). Idempotente.
if ! grep -q '^JWT_PUBLIC_KEY=' .env; then
    {
        echo ""
        echo "# Chaves JWT em base64, geradas pelo setup.sh a partir dos .pem locais"
        echo "JWT_PUBLIC_KEY=$(openssl base64 -A -in "$KEYS_DIR/publicKey.pem")"
        echo "JWT_PRIVATE_KEY=$(openssl base64 -A -in "$KEYS_DIR/privateKey.pem")"
    } >> .env
    echo "  OK - chaves JWT gravadas no .env (base64)"
fi
