# Stage 1: Build Application (Frontend + Server)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build Vite PWA frontend and backend server bundle
RUN npm run build

# Stage 2: Production Lightweight Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

# Copy package manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Expose standard container port
EXPOSE 80

# Run production server connected to PostgreSQL & serving PWA
CMD ["node", "dist-server/index.js"]
