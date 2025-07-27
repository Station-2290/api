#!/bin/bash

# Enhanced deployment script for API with build debugging
set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="api"
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="station2290"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found. Please run this script from the API directory."
    exit 1
fi

# Check if docker-compose.prod.yml exists in parent directory
if [ ! -f "../docker-compose.prod.yml" ]; then
    print_error "../docker-compose.prod.yml not found. Please ensure you're in the api directory."
    exit 1
fi

# Load environment variables from .env.production if it exists
if [ -f "../.env.production" ]; then
    print_status "Loading environment variables from .env.production..."
    set -a
    source ../.env.production
    set +a
fi

# Check for required environment variables
if [ -z "$JWT_SECRET" ]; then
    print_error "JWT_SECRET environment variable is required"
    print_status "Set it in .env.production or export it: export JWT_SECRET=your-secret"
    exit 1
fi

if [ -z "$JWT_REFRESH_SECRET" ]; then
    print_error "JWT_REFRESH_SECRET environment variable is required"
    print_status "Set it in .env.production or export it: export JWT_REFRESH_SECRET=your-secret"
    exit 1
fi

print_status "🚀 Starting enhanced API deployment..."

# Function to cleanup on failure
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed. Showing container logs..."
        cd ..
        docker-compose -f $COMPOSE_FILE logs api --tail=50
    fi
}

trap cleanup EXIT

# Change to parent directory for docker-compose commands
cd ..

print_status "Stopping existing API service..."
docker-compose -f $COMPOSE_FILE stop api || true

print_status "Removing existing API container and image..."
docker-compose -f $COMPOSE_FILE rm -f api || true

# Remove the API image to force a complete rebuild
API_IMAGE=$(docker-compose -f $COMPOSE_FILE config | grep "image:" | grep api | awk '{print $2}' | head -1)
if [ ! -z "$API_IMAGE" ]; then
    print_status "Removing existing API image: $API_IMAGE"
    docker rmi "$API_IMAGE" 2>/dev/null || true
fi

print_status "Building new API image with detailed logging..."
# Build with no cache to ensure clean build
if docker-compose -f $COMPOSE_FILE build --no-cache --progress=plain api; then
    print_success "API image built successfully!"
else
    print_error "API image build failed!"
    exit 1
fi

print_status "Starting API service..."
docker-compose -f $COMPOSE_FILE up -d api

print_status "Waiting for service to start..."
sleep 15

# Check service status
print_status "Checking service status..."
if docker-compose -f $COMPOSE_FILE ps api | grep -q "Up"; then
    print_success "API container is running!"
    
    # Wait a bit more and check if the application actually started
    print_status "Waiting for application to initialize..."
    sleep 10
    
    # Check logs for startup success
    print_status "Checking application logs..."
    docker-compose -f $COMPOSE_FILE logs api --tail=30
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    sleep 5
    
    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "🎉 Health check passed! API is fully operational."
        print_success "API is available at: http://localhost:3000/api"
        print_success "API Documentation: http://localhost:3000/docs"
    else
        print_warning "Health check failed. API might still be starting up."
        print_status "You can check logs with: docker-compose -f $COMPOSE_FILE logs api -f"
    fi
else
    print_error "API service failed to start!"
    print_status "Container logs:"
    docker-compose -f $COMPOSE_FILE logs api --tail=50
    exit 1
fi

print_success "🎉 Deployment process completed!"
print_status "To view live logs: docker-compose -f $COMPOSE_FILE logs api -f"
print_status "To rebuild only: docker-compose -f $COMPOSE_FILE build --no-cache api"