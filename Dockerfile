# dev-mcp — Multi-stage Dockerfile
# Uses oven/bun for minimal image size (< 100MB)
#
# Build:  docker build -t dev-mcp .
# Run:    docker run -p 3001:3001 --env-file .env dev-mcp

# ── Stage 1: Install dependencies ──────────────────────────────────
FROM oven/bun:1.3 AS installer
WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package.json bun.lock ./
COPY packages/mcp-core/package.json packages/mcp-core/
COPY mcp-server/package.json mcp-server/
COPY mcp-personal/package.json mcp-personal/

# Install with frozen lockfile (ensures reproducible builds)
RUN bun install --frozen-lockfile --production

# ── Stage 2: Build / typecheck (optional verification) ────────────
FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY --from=installer /app /app
COPY . .

# Verify TypeScript compiles cleanly
RUN bun run typecheck

# ── Stage 3: Production runner ────────────────────────────────────
FROM oven/bun:1.3-slim AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 app

# Copy production dependencies
COPY --from=installer --chown=app:app /app/node_modules ./node_modules
COPY --from=installer --chown=app:app /app/package.json ./

# Copy workspace manifests (needed for bun workspace resolution)
COPY --from=installer --chown=app:app /app/packages/mcp-core/package.json ./packages/mcp-core/
COPY --from=installer --chown=app:app /app/mcp-server/package.json ./mcp-server/
COPY --from=installer --chown=app:app /app/mcp-personal/package.json ./mcp-personal/

# Copy source code (only what's needed at runtime)
COPY --chown=app:app packages/mcp-core/src ./packages/mcp-core/src
COPY --chown=app:app mcp-server/src ./mcp-server/src

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 3001
USER app

# Start the HTTP server
CMD ["bun", "run", "mcp-server/src/index.ts"]
