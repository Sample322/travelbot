#!/usr/bin/env sh
set -e

# Проверяем, что DATABASE_URL задан
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

# Применяем миграции на рантайме
npx prisma migrate deploy

# Запускаем сервер
node dist/index.js
