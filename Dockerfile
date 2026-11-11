# syntax=docker/dockerfile:1

# Stage 1: Build Frontend and Backend
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install all dependencies without audit or fund network roundtrips
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build both client (Vite) and server (TypeScript)
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/haluan.db

# Copy workspace package manifests
COPY package.json package-lock.json ./
COPY server/package.json ./server/

# Install only production dependencies for the server (express, cors)
RUN npm ci --omit=dev --workspace=server --no-audit --no-fund

# Copy built server and static client dist from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Create persistent storage folder for SQLite
RUN mkdir -p /app/data && chown -R node:node /app

USER node

VOLUME ["/app/data"]

EXPOSE 3000

CMD ["node", "server/dist/index.js"]
