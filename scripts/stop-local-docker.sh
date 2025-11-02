#!/bin/bash

# Stop Local Docker Development Environment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

echo "🛑 Stopping QR Listener Local Docker Environment"
echo "================================================="

# Determine which compose command to use
if docker compose version > /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

print_status "Stopping services..."
$COMPOSE_CMD -f docker-compose.local.yml down

print_success "✅ All services stopped"

