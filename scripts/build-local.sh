#!/bin/bash

# Build Script for Local Development
# This script builds the entire application for local development

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

echo "🔨 Building QR Listener Application for Local Development"
echo "========================================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Build Backend
print_status "📦 Building Backend..."
if [ ! -f "backend/qr-listener-backend/pom.xml" ]; then
    print_error "Backend pom.xml not found!"
    exit 1
fi

cd backend/qr-listener-backend
print_status "  - Running Maven clean install..."
mvn clean install -DskipTests -Dmaven.test.skip=true

if [ $? -eq 0 ]; then
    print_success "✅ Backend built successfully!"
    print_status "   JAR location: target/qr-listener-backend-1.0.0.jar"
else
    print_error "❌ Backend build failed!"
    exit 1
fi

cd ../../

# Install Frontend Dependencies
print_status "📦 Installing Frontend Dependencies..."
cd frontend

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found!"
    exit 1
fi

print_status "  - Running npm install..."
npm install

if [ $? -eq 0 ]; then
    print_success "✅ Frontend dependencies installed!"
else
    print_error "❌ Frontend dependency installation failed!"
    exit 1
fi

# Build Frontend (optional - for production build)
if [ "$1" == "--production" ]; then
    print_status "  - Building frontend for production..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "✅ Frontend production build completed!"
        print_status "   Build output: .next/"
    else
        print_error "❌ Frontend production build failed!"
        exit 1
    fi
else
    print_status "  - Skipping production build (use --production for full build)"
    print_status "   Run 'npm run dev' to start development server"
fi

cd ../

# Summary
echo ""
print_success "🎉 Local build completed successfully!"
echo ""
print_status "📋 Next Steps:"
echo ""
echo "1. Start Database (if using Docker):"
echo "   docker-compose up -d"
echo ""
echo "2. Start Backend:"
echo "   cd backend/qr-listener-backend"
echo "   mvn spring-boot:run"
echo ""
echo "3. Start Frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8080"
echo "   - Publisher Dashboard: http://localhost:3000/publisher/dashboard"
echo ""
print_success "✨ Happy coding!"

