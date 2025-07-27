# API Deployment Guide

## Problem Analysis

The API service was failing with "Cannot find module '/app/dist/main'" error because:

1. **Missing DevDependencies in Build Stage**: The `@nestjs/cli` and TypeScript packages were not available during the build process
2. **Complex Prisma Client Copying**: The previous approach was fragile and error-prone
3. **Silent Build Failures**: No verification that the build actually succeeded
4. **Missing Source Files**: Not all necessary TypeScript config files were being copied

## Fixed Dockerfile Changes

### 1. Enhanced Build Stage
- ✅ Install all dependencies including devDependencies (needed for `@nestjs/cli`)
- ✅ Added explicit source file copying with verification
- ✅ Added build output verification to catch failures early
- ✅ Added debugging output for troubleshooting

### 2. Simplified Production Stage
- ✅ Simplified Prisma client copying strategy
- ✅ Added verification steps for built application
- ✅ Enhanced startup command with debugging

### 3. Key Improvements
- **Build Verification**: Fails fast if `dist/main.js` is not created
- **Debug Output**: Comprehensive logging throughout the build process
- **Reliable Dependencies**: Proper handling of both runtime and build dependencies
- **Prisma Integration**: Simplified and more reliable Prisma client handling

## Deployment Commands

### Quick Deployment (Recommended)
```bash
# From the api directory
cd /Users/hrustalq/Projects/2219/api
./deploy.sh
```

### Manual Deployment Steps
```bash
# From project root
cd /Users/hrustalq/Projects/2219

# Stop existing service
docker-compose -f docker-compose.prod.yml stop api

# Remove existing container and image
docker-compose -f docker-compose.prod.yml rm -f api
docker rmi station2290-api 2>/dev/null || true

# Build new image with no cache
docker-compose -f docker-compose.prod.yml build --no-cache api

# Start the service
docker-compose -f docker-compose.prod.yml up -d api

# Check logs
docker-compose -f docker-compose.prod.yml logs api -f
```

### Local Build Testing
```bash
# From api directory
cd /Users/hrustalq/Projects/2219/api

# Test local build
./verify-build.sh

# Test Docker build
./test-build.sh
```

## Troubleshooting

### If Build Still Fails
1. Check that all source files exist:
   ```bash
   ls -la src/main.ts tsconfig.json nest-cli.json package.json
   ```

2. Test local build:
   ```bash
   pnpm install
   pnpm prisma generate
   pnpm run build
   ls -la dist/main.js
   ```

3. Check Docker logs during build:
   ```bash
   docker-compose -f docker-compose.prod.yml build --no-cache --progress=plain api
   ```

### If Container Starts but Health Check Fails
1. Check application logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs api --tail=50
   ```

2. Test health endpoint manually:
   ```bash
   curl -v http://localhost:3000/api/health
   ```

3. Check if port 3000 is accessible:
   ```bash
   docker-compose -f docker-compose.prod.yml exec api netstat -tlnp
   ```

## Health Check Endpoints

- **API Health**: `http://localhost:3000/api/health`
- **API Documentation**: `http://localhost:3000/docs`
- **API Base**: `http://localhost:3000/api`

## Environment Variables

Ensure these are set in `.env.prod`:
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `DATABASE_URL` - Database connection string (defaults to SQLite)

## File Structure Verification

The following files must be present for successful build:
```
api/
├── Dockerfile (✅ Fixed)
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── nest-cli.json
├── src/
│   ├── main.ts
│   └── ... (other source files)
├── prisma/
│   └── schema.prisma
├── deploy.sh (✅ Enhanced)
├── test-build.sh (✅ Existing)
└── verify-build.sh (✅ New)
```

## Success Indicators

When deployment is successful, you should see:
1. ✅ Build stage completes without errors
2. ✅ `dist/main.js` file is created and verified
3. ✅ Prisma client is properly generated and copied
4. ✅ Container starts and stays running
5. ✅ Health endpoint responds with 200 OK
6. ✅ Application logs show successful startup

## Quick Recovery

If something goes wrong:
```bash
# Quick rollback (if you have a working image)
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Complete restart
cd /Users/hrustalq/Projects/2219/api
./deploy.sh
```