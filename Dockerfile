# Build stage - not needed for static HTML files
# This is a simple static HTML project, so we'll use a basic HTTP server setup

# Production stage - serve static files with a lightweight HTTP server
FROM node:20-alpine

# Create a non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Set working directory
WORKDIR /app

# Copy all static files
COPY --chown=appuser:appuser . .

# Install a lightweight HTTP server to serve static files
RUN npm install -g http-server

# Change to the appuser
USER appuser

# Expose port 3000
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

# Start the HTTP server
CMD ["http-server", "-p", "3000", "-H", "0.0.0.0"]
