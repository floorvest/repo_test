# ── Stage 1: deps ────────────────────────────────────────────────────────────
# Install dependencies (http-server) so the build stage can reference them.
FROM node:20-alpine AS deps

WORKDIR /app

# Install http-server globally for serving static files
RUN npm install -g http-server

# ── Stage 2: builder ──────────────────────────────────────────────────────────
# Copy static assets — no compilation required for a plain HTML/CSS/JS project.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all static source files
COPY . .

# ── Stage 3: production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Create a non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

WORKDIR /app

# Install http-server in the production image
RUN npm install -g http-server

# Copy static files from the builder stage
COPY --from=builder --chown=appuser:appuser /app /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Healthcheck targeting the correct internal port
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

# Serve static files on port 3000
CMD ["http-server", ".", "-p", "3000", "-a", "0.0.0.0", "--cors"]
