# Stage 1: build client
FROM node:20-alpine AS client
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client ./client
RUN cd client && npm run build

# Stage 2: build server
FROM node:20-alpine AS server-build
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server ./server
RUN cd server && npm run build && npx prisma generate

# Stage 3: runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=server-build /app/server /app/server
COPY --from=client /app/client/dist /app/server/dist_client

COPY server/docker-entrypoint.sh /app/server/docker-entrypoint.sh
RUN chmod +x /app/server/docker-entrypoint.sh

EXPOSE 3000
CMD ["sh", "-c", "cd server && ./docker-entrypoint.sh"]
