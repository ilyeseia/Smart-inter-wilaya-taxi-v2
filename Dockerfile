# ============================================
# Multi-stage Production Dockerfile
# Smart Inter-Wilaya Taxi v2
# ============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package.json bun.lock ./

# Install bun
RUN npm install -g bun

# Install dependencies
RUN bun install --frozen-lockfile --production

# ============================================
# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client
RUN bunx prisma generate

# Build the application
RUN bun run build

# ============================================
# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy health check script
COPY docker/healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# Set correct ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD /healthcheck.sh

# Start the application
CMD ["node", "server.js"]
