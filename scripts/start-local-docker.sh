#!/bin/bash

# Start Local Docker Development Environment
# This script starts all services using Docker Compose for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🐳 Starting QR Listener Local Docker Environment"
echo "================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
    print_error "Docker Compose is not available."
    exit 1
fi

# Determine which compose command to use
if docker compose version > /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

print_status "Using: $COMPOSE_CMD"

# Check if we're in the project root
if [ ! -f "docker-compose.local.yml" ]; then
    print_error "docker-compose.local.yml not found. Please run from project root."
    exit 1
fi

# Stop any existing containers
print_status "🛑 Stopping any existing containers..."
$COMPOSE_CMD -f docker-compose.local.yml down 2>/dev/null || true

# Pull required images
print_status "📥 Pulling Docker images..."
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull eclipse-temurin:17-jdk
docker pull node:18-alpine

# Start services
print_status "🚀 Starting services..."
$COMPOSE_CMD -f docker-compose.local.yml up -d

# Wait for database to be ready
print_status "⏳ Waiting for database to be ready..."
sleep 10

MAX_WAIT=60
COUNTER=0
while ! $COMPOSE_CMD -f docker-compose.local.yml exec -T db pg_isready -U qr_user -d qr_listener > /dev/null 2>&1; do
    if [ $COUNTER -ge $MAX_WAIT ]; then
        print_error "Database failed to start in time"
        $COMPOSE_CMD -f docker-compose.local.yml logs db
        exit 1
    fi
    sleep 2
    COUNTER=$((COUNTER + 2))
    echo -n "."
done
echo ""
print_success "✅ Database is ready"

# Wait for backend to build and start
print_status "⏳ Waiting for backend to build and start (this may take a few minutes)..."
print_warning "   First time build will take longer (downloading dependencies)"

MAX_WAIT=300
COUNTER=0
while ! curl -f http://localhost:8080/api/qr/health > /dev/null 2>&1; do
    if [ $COUNTER -ge $MAX_WAIT ]; then
        print_error "Backend failed to start in time"
        print_status "Checking backend logs..."
        $COMPOSE_CMD -f docker-compose.local.yml logs backend | tail -50
        exit 1
    fi
    sleep 5
    COUNTER=$((COUNTER + 5))
    echo -n "."
done
echo ""
print_success "✅ Backend is ready"

# Wait for frontend to start
print_status "⏳ Waiting for frontend to start..."
sleep 15

MAX_WAIT=120
COUNTER=0
while ! curl -f http://localhost:3000 > /dev/null 2>&1; do
    if [ $COUNTER -ge $MAX_WAIT ]; then
        print_warning "Frontend may still be starting (this is normal on first run)"
        break
    fi
    sleep 3
    COUNTER=$((COUNTER + 3))
    echo -n "."
done
echo ""

# Show status
print_status "📊 Service Status:"
$COMPOSE_CMD -f docker-compose.local.yml ps

echo ""
print_success "✅ All services are starting!"
echo ""
print_status "🌐 Access your application:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8080"
echo "  - Dashboard: http://localhost:3000/dashboard"
echo "  - Publisher Dashboard: http://localhost:3000/publisher/dashboard"
echo "  - Create Publication: http://localhost:3000/publisher/create"
echo ""
print_status "📋 Useful Commands:"
echo "  - View logs: $COMPOSE_CMD -f docker-compose.local.yml logs -f [service]"
echo "  - Stop services: $COMPOSE_CMD -f docker-compose.local.yml down"
echo "  - Restart service: $COMPOSE_CMD -f docker-compose.local.yml restart [service]"
echo "  - View status: $COMPOSE_CMD -f docker-compose.local.yml ps"
echo ""
print_status "📝 Services:"
echo "  - db (PostgreSQL): localhost:5432"
echo "  - redis: localhost:6379"
echo "  - backend: localhost:8080"
echo "  - frontend: localhost:3000"
echo ""

print_success "🎉 Local Docker environment is ready!"

