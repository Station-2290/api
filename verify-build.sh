#!/bin/bash

# Simple build verification script
set -e

echo "🔍 Verifying NestJS build setup..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check required files
print_status "Checking required files..."
for file in "package.json" "tsconfig.json" "nest-cli.json" "src/main.ts"; do
    if [ -f "$file" ]; then
        print_success "✅ $file exists"
    else
        print_error "❌ $file missing"
        exit 1
    fi
done

# Check NestJS CLI
print_status "Checking NestJS CLI availability..."
if command -v nest &> /dev/null; then
    print_success "✅ NestJS CLI available globally"
elif [ -f "node_modules/.bin/nest" ]; then
    print_success "✅ NestJS CLI available locally"
elif grep -q '"@nestjs/cli"' package.json; then
    print_success "✅ @nestjs/cli in devDependencies"
else
    print_error "❌ NestJS CLI not found"
    exit 1
fi

# Check build script
print_status "Checking build script..."
if grep -q '"build":.*"nest build"' package.json; then
    print_success "✅ Build script configured correctly"
else
    print_error "❌ Build script not configured"
    exit 1
fi

# Check TypeScript config
print_status "Checking TypeScript configuration..."
if grep -q '"outDir".*"./dist"' tsconfig.json; then
    print_success "✅ Output directory configured"
else
    print_error "❌ Output directory not configured"
    exit 1
fi

print_success "🎉 All build prerequisites are in place!"
print_status "To test the build locally:"
print_status "1. Run: pnpm install"
print_status "2. Run: pnpm prisma generate"
print_status "3. Run: pnpm run build"
print_status "4. Check: ls -la dist/main.js"