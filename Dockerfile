# ==============================================================================
# CampusFlow — Production Multi-Stage Dockerfile
# Optimized for minimal image footprint (~150MB), layer caching, and rootless execution
# ==============================================================================

# --- Stage 1: Base Alpine Image ---
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production

# --- Stage 2: Dependencies Cache ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
# Install all dependencies (including devDependencies required for Next.js build)
RUN npm ci --include=dev

# Generate Prisma Client
RUN npx prisma generate

# --- Stage 3: Source Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during container build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build standalone Next.js production bundle
RUN npm run build

# --- Stage 4: Production Runner (Non-root minimal runtime) ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Create non-root system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and pre-rendered static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Install curl for docker healthcheck
RUN apk add --no-cache curl

# Drop root privileges
USER nextjs

EXPOSE 3000

# Docker Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
