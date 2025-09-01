#!/usr/bin/env sh
set -e

# Проверка наличия DATABASE_URL (нужен на рантайме, не на билде)
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

# Применяем миграции перед стартом сервера
npx prisma migrate deploy

# Запуск Node-сервера
node dist/index.js
