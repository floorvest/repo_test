# ──────────────────────────────────────────────────────────────────
# Dockerfile – Static HTML/CSS/JS site served by nginx
# ──────────────────────────────────────────────────────────────────

# Stage 1 – production server (single-stage; no build step needed)
FROM nginx:1.27-alpine AS production

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Remove the default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy all static site files into the nginx serve directory
COPY --chown=appuser:appgroup . /usr/share/nginx/html/

# Custom nginx config: serve on port 3000, disable server tokens,
# and handle clean URL routing for the static pages.
RUN printf 'server {\n\
    listen 3000;\n\
    server_name _;\n\
    server_tokens off;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Cache static assets\n\
    location ~* \\.(css|js|jpg|jpeg|png|gif|ico|svg|woff2?)$ {\n\
        expires 7d;\n\
        add_header Cache-Control "public, max-age=604800";\n\
    }\n\
\n\
    # Deny hidden files\n\
    location ~ /\\. {\n\
        deny all;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

# nginx runs as root to bind port then drops; chown ensures file access
CMD ["nginx", "-g", "daemon off;"]
