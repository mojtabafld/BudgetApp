# Stage 1: Build Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle with Vite
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine AS runner

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
