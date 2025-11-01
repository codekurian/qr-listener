#!/bin/bash

# Docker Monitoring Script for QR Listener
# This script helps monitor and manage the Docker containers

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

echo "🐳 QR Listener Docker Monitor"
echo "============================="

# Function to show container status
show_status() {
    print_status "📊 Container Status:"
    docker-compose -f deployment/docker-compose-a2hosting.yml ps
    echo ""
    
    print_status "📈 Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Function to show logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_status "📋 Available services: db, redis, backend, frontend, nginx, certbot"
        echo "Usage: $0 logs [service_name]"
        echo "Example: $0 logs backend"
        return
    fi
    
    print_status "📋 Showing logs for $service:"
    docker-compose -f deployment/docker-compose-a2hosting.yml logs -f $service
}

# Function to restart services
restart_services() {
    local service=$1
    if [ -z "$service" ]; then
        print_status "🔄 Restarting all services..."
        docker-compose -f deployment/docker-compose-a2hosting.yml restart
    else
        print_status "🔄 Restarting $service..."
        docker-compose -f deployment/docker-compose-a2hosting.yml restart $service
    fi
    print_success "✅ Restart complete"
}

# Function to stop services
stop_services() {
    print_status "🛑 Stopping all services..."
    docker-compose -f deployment/docker-compose-a2hosting.yml down
    print_success "✅ All services stopped"
}

# Function to start services
start_services() {
    print_status "🚀 Starting all services..."
    docker-compose -f deployment/docker-compose-a2hosting.yml up -d
    print_success "✅ All services started"
}

# Function to check health
check_health() {
    print_status "🏥 Health Check:"
    
    # Check database
    if docker-compose -f deployment/docker-compose-a2hosting.yml exec db pg_isready -U qr_user_prod -d qr_listener_prod > /dev/null 2>&1; then
        print_success "✅ Database: Healthy"
    else
        print_error "❌ Database: Unhealthy"
    fi
    
    # Check backend
    if curl -f http://localhost:8080/api/qr/health > /dev/null 2>&1; then
        print_success "✅ Backend: Healthy"
    else
        print_error "❌ Backend: Unhealthy"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "✅ Frontend: Healthy"
    else
        print_error "❌ Frontend: Unhealthy"
    fi
    
    # Check Nginx
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        print_success "✅ Nginx: Healthy"
    else
        print_error "❌ Nginx: Unhealthy"
    fi
}

# Function to show help
show_help() {
    echo "QR Listener Docker Monitor"
    echo ""
    echo "Usage: $0 [command] [service]"
    echo ""
    echo "Commands:"
    echo "  status              Show container status and resource usage"
    echo "  logs [service]      Show logs for a specific service"
    echo "  restart [service]   Restart all services or a specific service"
    echo "  start               Start all services"
    echo "  stop                Stop all services"
    echo "  health              Check health of all services"
    echo "  help                Show this help message"
    echo ""
    echo "Services: db, redis, backend, frontend, nginx, certbot"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 logs backend"
    echo "  $0 restart frontend"
    echo "  $0 health"
}

# Main script logic
case "${1:-status}" in
    "status")
        show_status
        ;;
    "logs")
        show_logs $2
        ;;
    "restart")
        restart_services $2
        ;;
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "health")
        check_health
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
