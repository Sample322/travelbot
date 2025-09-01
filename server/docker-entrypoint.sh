#!/usr/bin/env sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

# Выполняем миграции из prisma/migrations (deploy) на рантайме
npx prisma migrate deploy

# Запускаем собранный сервер
node dist/index.js
