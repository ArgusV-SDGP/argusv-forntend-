# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  ArgusV Frontend — multi-stage build (Next.js 15 App Router)            ║
# ║                                                                          ║
# ║  Stage 1 (deps)     — install node_modules with npm ci                  ║
# ║  Stage 2 (builder)  — next build → .next/standalone                     ║
# ║  Stage 3 (runner)   — minimal node:alpine + standalone output           ║
# ║                                                                          ║
# ║  Requires next.config.ts: output: "standalone"                          ║
# ╚══════════════════════════════════════════════════════════════════════════╝

# ── Stage 1: install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package manifests only — layer-cache friendly
COPY package.json package-lock.json* ./

# Clean install — reproducible, locks to exact versions
RUN npm ci

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Bring node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build-time env — these become embedded in the static bundle.
# Override at build time with: --build-arg NEXT_PUBLIC_BASE_URL=https://...
ARG NEXT_PUBLIC_BASE_URL=http://localhost:8000
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

ARG NEXT_PUBLIC_STREAM_BASE_URL=http://localhost:8888
ENV NEXT_PUBLIC_STREAM_BASE_URL=${NEXT_PUBLIC_STREAM_BASE_URL}

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output (self-contained server.js + minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static assets (CSS, JS chunks, images)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# next.config output: standalone generates server.js
CMD ["node", "server.js"]
