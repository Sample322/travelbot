## Multi-stage build for TravelBot
# The first stage builds the frontend assets using Node.js and Vite. The
# second stage installs server dependencies and copies over the compiled
# frontend into the server's static directory. The final container only
# contains the built artefacts and runtime dependencies.

### Stage 1: build the client
FROM node:20-alpine AS client
WORKDIR /app
# Install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm install --silent
# Copy client sources and build
COPY client ./client
RUN cd client && npm run build

### Stage 2: build the server
FROM node:20-alpine AS server
WORKDIR /app
# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --silent
# Copy server sources
COPY server ./server
# Copy built client into server's public directory
COPY --from=client /app/client/dist ./server/dist_client
# Generate Prisma client
WORKDIR /app/server
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]