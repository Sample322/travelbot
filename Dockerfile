# ---------- Stage 1: build client ----------
FROM node:20-alpine AS client
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client ./client
RUN cd client && npm run build

# ---------- Stage 2: build server ----------
FROM node:20-alpine AS server-build
WORKDIR /app
# Установим зависимости сервера (включая prisma и @prisma/client)
COPY server/package*.json ./server/
RUN cd server && npm ci

# Скопируем исходники сервера и prisma (ОБЯЗАТЕЛЬНО migrations!)
COPY server ./server
# Сборка TS → dist и генерация Prisma Client
RUN cd server && npm run build && npx prisma generate

# ---------- Stage 3: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
# скопируем собранный сервер и prisma
COPY --from=server-build /app/server /app/server
# скопируем собранный фронт в папку, которую раздаёт Express
COPY --from=client /app/client/dist /app/server/dist_client

# стартовый скрипт (миграции + сервер)
COPY server/docker-entrypoint.sh /app/server/docker-entrypoint.sh
RUN chmod +x /app/server/docker-entrypoint.sh

# Timeweb определяет порт по EXPOSE:
EXPOSE 3000

# Важно: старт делаем через скрипт, а не напрямую node
CMD ["sh", "-c", "cd server && ./docker-entrypoint.sh"]
