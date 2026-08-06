#!/bin/sh
set -e

echo "▶ Forja — aplicando migrações do banco…"
npx prisma migrate deploy

echo "▶ Forja — aplicando seed (idempotente)…"
node build/prisma/seed.js || echo "  (seed já aplicado)"

echo "▶ Forja — iniciando na porta $PORT…"
exec "$@"
