# ─────────────────────────────────────────────────────────────────
# Dockerfile — Static HTML/CSS/JS site served by Nginx
# Detected stack: plain HTML / CSS / JavaScript (no build step)
# ─────────────────────────────────────────────────────────────────

# ── Stage 1: production ───────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Security: run nginx worker processes as a non-root user.
# The nginx base image already ships an 'nginx' user; we reuse it.
# The master process must stay root to bind port 80, but workers drop
# privileges automatically via the 'user nginx;' directive in nginx.conf.

# Remove the default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy all static site files into the nginx web root
COPY . /usr/share/nginx/html/

# Ensure the nginx user owns the web root
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose the standard HTTP port
EXPOSE 80

# Nginx starts automatically as the default CMD in the base image
