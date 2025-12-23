# Cloudflare Containers Dockerfile
# This container uses Bun as a lightweight, fast runtime for TypeScript

FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Copy application files
COPY server.ts .

# Expose the port the app runs on
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["bun", "run", "server.ts"]

