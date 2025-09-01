FROM node:20-alpine AS server
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server ./server
RUN cd server && npm run build && npx prisma generate
COPY --from=client /app/client/dist ./server/dist_client
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh","-c","cd server && npx prisma migrate deploy && node dist/index.js"]
