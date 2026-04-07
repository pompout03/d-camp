# syntax=docker/dockerfile:1

# ==========================================
# STAGE 1: Base image
# ==========================================
# Changed from 18-alpine to 20-alpine to support Next.js 15+
FROM node:20-alpine AS base
# Install libc6-compat (required by image optimization libraries like Sharp)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ==========================================
# STAGE 2: Install dependencies
# ==========================================
FROM base AS deps
COPY package.json package-lock.json* ./
# npm ci is faster and stricter than npm install for CI/CD
RUN npm ci

# ==========================================
# STAGE 3: Build the application
# ==========================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app
RUN npm run build

# ==========================================
# STAGE 4: Production runner
# ==========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder directly
COPY --from=builder /app/public ./public

# Copy the standalone Next.js build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the secure non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add a healthcheck so Docker knows if the frontend crashes
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# server.js is automatically created by Next.js standalone mode
CMD ["node", "server.js"]