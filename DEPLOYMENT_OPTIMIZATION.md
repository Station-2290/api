# API Service Deployment Optimization

## Problem Fixed

**Issue**: `prisma: not found` error during production Docker build at line 42
```
> [api production  6/10] RUN pnpm install -r --offline --prod:
. postinstall$ prisma generate
. postinstall: sh: prisma: not found
```

**Root Cause**: The original Dockerfile tried to run `pnpm install --prod` which excludes dev dependencies, but the `postinstall` script in package.json requires the Prisma CLI (which is a dev dependency) to run `prisma generate`.

## Solution Applied

### Multi-Stage Build Optimization

The Dockerfile has been restructured with an optimized multi-stage build approach:

1. **Build Stage**: Install all dependencies (including dev deps) and generate Prisma client
2. **Production Stage**: Install only production dependencies and copy pre-generated Prisma client

### Key Changes

#### 1. Proper Dependency Management
- Build stage installs all dependencies with `pnpm install -r --offline --frozen-lockfile`
- This allows the `postinstall` script to run successfully with Prisma CLI available
- Production stage uses `--ignore-scripts` to avoid running postinstall during prod dependency install

#### 2. Prisma Client Copying
- Prisma client is generated once in the build stage
- Pre-generated client files are copied to production stage:
  - `/node_modules/@prisma` - Prisma client package
  - `/node_modules/.prisma` - Generated client files

#### 3. Runtime Prisma CLI
- Prisma CLI is installed globally in production stage for migration commands
- Uses exact version `prisma@6.12.0` to match package.json dev dependency

#### 4. Optimized Build Process
```dockerfile
# Build stage - Full dependencies + Prisma generation
FROM node:18-alpine AS builder
# ... install all deps, generate client, build app

# Production stage - Production deps + pre-generated client
FROM node:18-alpine AS production
# ... install prod deps only, copy generated client
```

## Benefits

### 1. **Eliminates Postinstall Issues**
- No more "prisma: not found" errors
- Separates build-time and runtime dependency concerns

### 2. **Optimized Image Size**
- Production image only contains necessary dependencies
- Pre-generated Prisma client reduces startup time

### 3. **Better Caching**
- Dependency installation layers are properly cached
- Prisma client generation happens once during build

### 4. **Production Ready**
- Supports database migrations at runtime
- Proper health checks and monitoring setup
- SQLite database directory creation

## Build Commands

```bash
# Build the image
docker build -t api-service .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="file:/app/data/dev.db" \
  -e NODE_ENV=production \
  api-service
```

## Best Practices Implemented

### 1. **Security**
- Non-root user execution (alpine base)
- Minimal attack surface
- Explicit dependency versions

### 2. **Performance**
- Multi-stage builds for smaller final image
- Proper layer caching strategy
- Pre-generated Prisma client

### 3. **Reliability**
- Health checks configured
- Database migration on startup
- Proper error handling in CMD

### 4. **Monitoring**
- Health endpoint at `/health`
- Proper logging setup with Winston
- Container health checks

## Troubleshooting

### If Build Still Fails

1. **Clear Docker cache**:
   ```bash
   docker system prune -a
   ```

2. **Check pnpm version**:
   Ensure pnpm version matches `packageManager` in package.json

3. **Verify Prisma versions**:
   Ensure `@prisma/client` and `prisma` versions match

### If Runtime Issues Occur

1. **Database permissions**:
   Ensure SQLite database directory is writable

2. **Prisma client not found**:
   Verify copied client files with:
   ```bash
   docker exec -it <container> ls -la /app/node_modules/@prisma
   ```

3. **Migration failures**:
   Check database connectivity and permissions

## Next Steps

1. **CI/CD Integration**: Update deployment pipelines to use this optimized Dockerfile
2. **Monitoring**: Set up Prometheus metrics collection
3. **Scaling**: Consider PostgreSQL migration for production scale
4. **Security**: Implement secret scanning and vulnerability assessments