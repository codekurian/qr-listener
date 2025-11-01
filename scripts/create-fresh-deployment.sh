#!/bin/bash

# Create Fresh Deployment Package for A2 Hosting
# This script creates a clean deployment package with all latest fixes

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

echo "📦 Creating Fresh Deployment Package for A2 Hosting"
echo "=================================================="

# Define package name with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="qr-listener-docker-clean_${TIMESTAMP}"
OUTPUT_DIR="deployment"
PACKAGE_PATH="${OUTPUT_DIR}/${PACKAGE_NAME}"
ZIP_FILE="${OUTPUT_DIR}/${PACKAGE_NAME}.zip"

# Clean up old package directories
if [ -d "${PACKAGE_PATH}" ]; then
    print_status "Cleaning up old package directory..."
    rm -rf "${PACKAGE_PATH}"
fi

# Create output directory if it doesn't exist
mkdir -p "${OUTPUT_DIR}"
print_status "Creating output directory: ${OUTPUT_DIR}"

# Create package directory
mkdir -p "${PACKAGE_PATH}"
print_status "Creating package directory: ${PACKAGE_PATH}"

print_status "Copying application files..."

# 1. Copy Backend source code (excluding compiled files)
print_status "  - Backend source code..."
mkdir -p "${PACKAGE_PATH}/backend/qr-listener-backend"
rsync -av --progress \
    --exclude='target' \
    --exclude='.git' \
    --exclude='*.class' \
    --exclude='.mvn' \
    backend/qr-listener-backend/ "${PACKAGE_PATH}/backend/qr-listener-backend/"

# 2. Copy Frontend application (excluding node_modules and build files)
print_status "  - Frontend application..."
mkdir -p "${PACKAGE_PATH}/frontend"
rsync -av --progress \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='*.log' \
    --exclude='deployment-packages' \
    --exclude='docker-packages*' \
    --exclude='test-local-docker' \
    frontend/ "${PACKAGE_PATH}/frontend/"

# Ensure frontend env.production has correct HTTP URLs (not HTTPS)
print_status "  - Ensuring frontend env.production uses HTTP..."
if [ -f "${PACKAGE_PATH}/frontend/env.production" ]; then
    sed -i.bak 's|https://graceshoppee.tech|http://graceshoppee.tech:8080|g' "${PACKAGE_PATH}/frontend/env.production"
    sed -i.bak 's|http://graceshoppee.tech[^:0-9]|http://graceshoppee.tech:8080|g' "${PACKAGE_PATH}/frontend/env.production"
    rm -f "${PACKAGE_PATH}/frontend/env.production.bak"
    print_status "  - Updated env.production to use HTTP"
fi

# 3. Create Docker Compose file with correct A2 Hosting configuration
print_status "  - Creating Docker Compose file..."
cat > "${PACKAGE_PATH}/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: qr-listener-postgres-prod
    environment:
      POSTGRES_DB: qr_listener_prod
      POSTGRES_USER: qr_user_prod
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secure_password_1761480397}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db-prod.sql:/docker-entrypoint-initdb.d/init-db-prod.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: qr-listener-redis-prod
    ports:
      - "6379:6379"
    restart: unless-stopped

  backend:
    image: openjdk:17-jdk-slim
    container_name: qr-listener-backend-prod
    working_dir: /app
    command: sh -c "apt-get update && apt-get install -y maven && mvn clean package -DskipTests -Dmaven.test.skip=true && java -Xmx512m -Xms256m -jar target/qr-listener-backend-1.0.0.jar --spring.profiles.active=prod"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/qr_listener_prod
      SPRING_DATASOURCE_USERNAME: qr_user_prod
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-secure_password_1761480397}
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      SERVER_PORT: 8080
      MAVEN_OPTS: "-Xmx512m -Xms256m"
    ports:
      - "8081:8080"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    volumes:
      - ./backend/qr-listener-backend:/app
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  frontend:
    image: node:18-alpine
    container_name: qr-listener-frontend-prod
    working_dir: /app
    command: sh -c "npm install && npm run build && npm start"
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://graceshoppee.tech:8080
      PORT: 3000
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_started
    restart: unless-stopped
    volumes:
      - ./frontend:/app

  nginx:
    image: nginx:alpine
    container_name: qr-listener-nginx-prod
    volumes:
      - ./nginx-config.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    ports:
      - "8080:80"
      - "8443:443"
    depends_on:
      frontend:
        condition: service_started
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    container_name: qr-listener-certbot-prod
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --email ${CERTBOT_EMAIL:-admin@graceshoppee.tech} --agree-tos --no-eff-email -d ${DOMAIN:-graceshoppee.tech} -d ${WWW_DOMAIN:-www.graceshoppee.tech}
    depends_on:
      nginx:
        condition: service_started

volumes:
  postgres_data:
EOF

# 4. Create Nginx configuration for A2 Hosting (ports 8080 and 8443)
# This config works without SSL certificates initially - SSL can be added later
print_status "  - Creating Nginx configuration (HTTP only, SSL optional)..."
cat > "${PACKAGE_PATH}/nginx-config.conf" << 'EOF'
# HTTP Server (port 80 inside container, mapped to 8080 on host) - Works immediately without SSL certificates
server {
    listen 80;
    server_name graceshoppee.tech www.graceshoppee.tech localhost;

    # Increase timeouts for long-running requests
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;

    # Backend API - MUST come before frontend location to match /api/ first
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Cache control
        proxy_cache_bypass $http_upgrade;
        
        # Don't buffer responses
        proxy_buffering off;
    }

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache control
        proxy_cache_bypass $http_upgrade;
    }

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Favicon
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }
}

# HTTPS Server (port 443 inside container, mapped to 8443 on host) - Only works after SSL certificates are obtained
# Uncomment and configure this section after running certbot
# To enable SSL:
# 1. Run: docker-compose run --rm certbot
# 2. Uncomment the server block below
# 3. Restart nginx: docker-compose restart nginx

# server {
#     listen 443 ssl http2;
#     server_name graceshoppee.tech www.graceshoppee.tech;
# 
#     # SSL Configuration (requires certbot first)
#     ssl_certificate /etc/letsencrypt/live/graceshoppee.tech/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/graceshoppee.tech/privkey.pem;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
#     ssl_prefer_server_ciphers off;
#     ssl_session_cache shared:SSL:10m;
#     ssl_session_timeout 10m;
# 
#     # Security headers
#     add_header X-Frame-Options DENY;
#     add_header X-Content-Type-Options nosniff;
#     add_header X-XSS-Protection "1; mode=block";
#     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
# 
#     # Increase timeouts
#     proxy_connect_timeout 300s;
#     proxy_send_timeout 300s;
#     proxy_read_timeout 300s;
#     send_timeout 300s;
# 
#     # Backend API
#     location /api/ {
#         proxy_pass http://backend:8080;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_set_header X-Forwarded-Host $host;
#         proxy_set_header X-Forwarded-Port $server_port;
#         proxy_cache_bypass $http_upgrade;
#         proxy_buffering off;
#     }
# 
#     # Frontend
#     location / {
#         proxy_pass http://frontend:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# 
#     # Let's Encrypt challenge
#     location /.well-known/acme-challenge/ {
#         root /var/www/certbot;
#     }
# 
#     # Favicon
#     location = /favicon.ico {
#         access_log off;
#         log_not_found off;
#     }
# }
EOF

# 5. Copy database initialization script
print_status "  - Copying database scripts..."
mkdir -p "${PACKAGE_PATH}/scripts"
cp scripts/init-db-prod.sql "${PACKAGE_PATH}/scripts/"

# 6. Create startup script
print_status "  - Creating startup script..."
cat > "${PACKAGE_PATH}/startup.sh" << 'EOF'
#!/bin/bash

# QR Listener Startup Script for A2 Hosting
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🚀 Starting QR Listener Application"
echo "===================================="

# Create directories
mkdir -p certbot/conf certbot/www logs

# Check Docker
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running"
    exit 1
fi

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services
print_status "Waiting for services to be ready..."
sleep 30

# Show status
docker-compose ps

print_success "✅ Application started!"
print_status "Access at: http://graceshoppee.tech:8080"
EOF

chmod +x "${PACKAGE_PATH}/startup.sh"

# 7. Create monitoring script
print_status "  - Creating monitoring script..."
cat > "${PACKAGE_PATH}/monitor.sh" << 'EOF'
#!/bin/bash

# QR Listener Monitoring Script
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

case "${1:-status}" in
    "status")
        echo "📊 Container Status:"
        docker-compose ps
        echo ""
        echo "📈 Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        ;;
    "logs")
        docker-compose logs -f ${2:-}
        ;;
    "restart")
        docker-compose restart ${2:-}
        ;;
    "health")
        echo "🏥 Health Check:"
        curl -f http://localhost:8081/api/qr/health && echo "✅ Backend: Healthy" || echo "❌ Backend: Unhealthy"
        curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend: Healthy" || echo "❌ Frontend: Unhealthy"
        ;;
    *)
        echo "Usage: $0 [status|logs|restart|health] [service]"
        ;;
esac
EOF

chmod +x "${PACKAGE_PATH}/monitor.sh"

# 8. Create .env.example file
print_status "  - Creating environment file..."
cat > "${PACKAGE_PATH}/.env.example" << 'EOF'
# Environment Variables for QR Listener
DB_PASSWORD=secure_password_1761480397
CERTBOT_EMAIL=admin@graceshoppee.tech
DOMAIN=graceshoppee.tech
WWW_DOMAIN=www.graceshoppee.tech
NEXT_PUBLIC_API_BASE_URL=http://graceshoppee.tech:8080
EOF

# 9. Create README
print_status "  - Creating README..."
cat > "${PACKAGE_PATH}/README.md" << 'EOF'
# QR Listener Deployment Package

## Quick Start

1. Extract the package:
   ```bash
   unzip qr-listener-docker-clean_*.zip
   cd qr-listener-docker-clean_*
   ```

2. Make scripts executable:
   ```bash
   chmod +x *.sh
   ```

3. Start the application:
   ```bash
   ./startup.sh
   ```

## Access

- Frontend: http://graceshoppee.tech:8080
- Backend API: http://graceshoppee.tech:8080/api

## Management

- Check status: `./monitor.sh status`
- View logs: `./monitor.sh logs [service]`
- Restart: `./monitor.sh restart [service]`
- Health check: `./monitor.sh health`

## Ports

- Nginx HTTP: 8080
- Nginx HTTPS: 8443
- Backend: 8081
- Frontend: 3000
- PostgreSQL: 5432
- Redis: 6379
EOF

# 10. Create package info
cat > "${PACKAGE_PATH}/PACKAGE_INFO.txt" << EOF
QR Listener Fresh Deployment Package
Created: $(date)
Package: ${PACKAGE_NAME}
Version: 1.0.0

Latest Fixes Included:
- ✅ Redirect URL fix (uses environment variable)
- ✅ CORS configuration updated
- ✅ Nginx ports configured for A2 Hosting (8080, 8443)
- ✅ Backend port mapping (8081:8080)
- ✅ All hardcoded URLs removed from frontend

Files:
- backend/: Spring Boot application
- frontend/: Next.js application
- docker-compose.yml: Docker configuration
- nginx-config.conf: Nginx reverse proxy config
- startup.sh: Startup script
- monitor.sh: Monitoring script
EOF

# Create the zip archive
print_status "Creating zip package..."
(cd "${OUTPUT_DIR}" && zip -r "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}" > /dev/null)

# Clean up the temporary directory
rm -rf "${PACKAGE_PATH}"

# Show results
print_success "✅ Fresh deployment package created!"
print_success "📦 Package: ${ZIP_FILE}"
print_success "📏 Size: $(du -h "${ZIP_FILE}" | awk '{print $1}')"

print_status "📋 Next Steps:"
echo "1. Upload ${ZIP_FILE} to A2 Hosting via FileZilla"
echo "2. Extract: unzip ${PACKAGE_NAME}.zip"
echo "3. Run: cd ${PACKAGE_NAME} && ./startup.sh"

print_success "🎉 Ready for deployment!"

