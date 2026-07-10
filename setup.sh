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
