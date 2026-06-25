# ─────────────────────────────────────────────────────────────────
# Dockerfile — Static HTML/CSS/JS site
# Served by Nginx on port 80 inside the container.
# Multi-stage build keeps the final image minimal and secure.
# ─────────────────────────────────────────────────────────────────

# ── Stage 1: collect static assets ───────────────────────────────
FROM alpine:3.19 AS builder

WORKDIR /app

# Copy all static files into the builder stage
COPY . .

# ── Stage 2: production (Nginx) ───────────────────────────────────
FROM nginx:1.27-alpine AS production

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy static assets from the builder stage
COPY --from=builder /app /usr/share/nginx/html

# Adjust ownership so appuser can read the files
RUN chown -R appuser:appgroup /usr/share/nginx/html \
 && chown -R appuser:appgroup /var/cache/nginx \
 && chown -R appuser:appgroup /var/log/nginx \
 && touch /var/run/nginx.pid \
 && chown appuser:appgroup /var/run/nginx.pid

# Nginx listens on port 80
EXPOSE 80

# Switch to non-root user
USER appuser

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
