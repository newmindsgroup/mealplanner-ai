# ============================================================================
# NourishAI — Meal Plan Assistant
# Multi-stage Docker build for production deployment
# ============================================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files for dependency caching
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy source and build
COPY . .
RUN npm run build

# --- Stage 2: Production Server ---
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies for the Express server
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy server code
COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Copy configuration files
COPY ecosystem.config.js .
COPY .env.example .env.example

# Create upload directory
RUN mkdir -p uploads

# Expose ports
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Run with Node
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
