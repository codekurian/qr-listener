#!/bin/bash

# Quick Deployment Script for A2 Hosting
# This script stops the old deployment and starts the fresh one

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_NAME="qr-listener-docker-clean_20251031_215836"

echo "🔄 A2 Hosting Fresh Deployment Script"
echo "======================================"

# Step 1: Stop current deployment (if exists)
print_status "Step 1: Stopping current deployment..."
if [ -f "docker-compose.yml" ]; then
    print_status "Found existing docker-compose.yml, stopping containers..."
    docker-compose down || print_warning "No running containers to stop"
else
    print_status "No existing deployment found"
fi

# Step 2: Clean up old containers
print_status "Step 2: Cleaning up Docker containers..."
docker container prune -f > /dev/null 2>&1 || true

# Step 3: Check if new package exists
print_status "Step 3: Checking for new package..."
if [ ! -d "${PACKAGE_NAME}" ]; then
    if [ -f "${PACKAGE_NAME}.zip" ]; then
        print_status "Extracting package..."
        unzip -q "${PACKAGE_NAME}.zip"
    else
        print_error "Package ${PACKAGE_NAME}.zip not found!"
        print_status "Please upload the zip file first using FileZilla"
        exit 1
    fi
fi

# Step 4: Navigate to package directory
cd "${PACKAGE_NAME}"
print_status "Step 4: Navigated to ${PACKAGE_NAME}"

# Step 5: Make scripts executable
print_status "Step 5: Making scripts executable..."
chmod +x *.sh

# Step 6: Start fresh deployment
print_status "Step 6: Starting fresh deployment..."
./startup.sh

# Step 7: Wait and check status
print_status "Step 7: Waiting for services to start..."
sleep 15

print_status "Step 8: Checking deployment status..."
./monitor.sh status

print_success "✅ Fresh deployment complete!"
print_status "🌐 Access your application at: https://graceshoppee.tech:8443"

