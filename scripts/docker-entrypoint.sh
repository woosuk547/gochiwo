#!/bin/sh
set -eu

DATA_DIR="${DATA_DIR:-/data}"
SEED_DB="/app/prisma/seed.db"
RUNTIME_DB="${DATA_DIR}/dev.db"

mkdir -p "$DATA_DIR"

if [ ! -f "$RUNTIME_DB" ]; then
  if [ -f "$SEED_DB" ]; then
    cp "$SEED_DB" "$RUNTIME_DB"
  else
    touch "$RUNTIME_DB"
  fi
fi

export DATABASE_URL="file:${RUNTIME_DB}"

# 스키마만 동기화. 기존 데이터는 유지 (--accept-data-loss 금지)
if node /app/node_modules/prisma/build/index.js db push --skip-generate --schema=/app/prisma/schema.prisma; then
  echo "prisma db push ok"
else
  echo "warn: prisma db push skipped or failed — starting app anyway" >&2
fi

exec node server.js
