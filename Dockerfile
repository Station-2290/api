# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema (needed for client generation)
COPY prisma ./prisma/

# Fetch all dependencies to the store (cached layer)
RUN pnpm fetch

# Install all dependencies including devDependencies (needed for @nestjs/cli and TypeScript)
RUN pnpm install -r --offline --frozen-lockfile

# Explicitly generate Prisma client to ensure it exists
RUN pnpm prisma generate

# Verify Prisma client was generated
RUN echo "=== Verifying Prisma client generation ===" && \
    find node_modules -name "index.js" -path "*/.prisma/client/*" -print && \
    echo "=== Prisma client verification complete ==="

# Copy source code (ensure all source files are included)
COPY src ./src/
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Debug: List source files to ensure they're copied
RUN echo "=== Source files copied ===" && \
    ls -la src/ && \
    echo "=== Build configuration files ===" && \
    ls -la *.json

# Build the application with verbose output
RUN echo "=== Starting NestJS build ===" && \
    pnpm run build && \
    echo "=== Build completed ==="

# Verify build output
RUN echo "=== Verifying build output ===" && \
    ls -la dist/ && \
    echo "=== Checking for main.js in subdirectories ===" && \
    find dist -name "main.js" -print && \
    (test -f dist/main.js && echo "✅ main.js exists at root" || echo "❌ main.js not found at root") && \
    (test -f dist/src/main.js && echo "✅ main.js exists in src/" || echo "❌ main.js not found in src/") && \
    echo "=== Build verification complete ==="

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install pnpm and prisma CLI globally for runtime operations
RUN npm install -g pnpm prisma@6.12.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma files
COPY prisma ./prisma/

# Fetch production dependencies to the store (cached layer)
RUN pnpm fetch --prod

# Install production dependencies from store
RUN pnpm install -r --offline --prod --frozen-lockfile

# Generate Prisma client in production stage (more reliable with pnpm)
RUN echo "=== Generating Prisma client in production stage ===" && \
    pnpm prisma generate && \
    echo "=== Prisma client generation complete ==="

# Verify Prisma client is available
RUN echo "=== Verifying Prisma client in production stage ===" && \
    find node_modules -name "index.js" -path "*/.prisma/client/*" -print && \
    echo "=== Prisma client verification complete ==="

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Verify built application is copied
RUN echo "=== Verifying dist directory ===" && \
    ls -la dist/ && \
    echo "=== Checking for main.js in production stage ===" && \
    find dist -name "main.js" -print && \
    (test -f dist/main.js && echo "✅ main.js found at dist/main.js" || echo "❌ main.js not found at dist/main.js") && \
    (test -f dist/src/main.js && echo "✅ main.js found at dist/src/main.js" || echo "❌ main.js not found at dist/src/main.js")

# Create directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dev.db"

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run database migrations and start the application
CMD ["sh", "-c", "echo '=== Starting application ===' && echo 'Looking for main.js...' && find dist -name 'main.js' -print && echo 'Running migrations...' && prisma migrate deploy && echo 'Starting NestJS application...' && if [ -f dist/main.js ]; then node dist/main; elif [ -f dist/src/main.js ]; then node dist/src/main; else echo 'ERROR: main.js not found' && exit 1; fi"]