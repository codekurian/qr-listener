#!/bin/bash

# Fix Nginx to work without SSL certificates initially

echo "🔍 Checking Nginx error logs..."
docker logs qr-listener-nginx-prod 2>&1 | tail -30

echo ""
echo "🔧 Fixing Nginx configuration (removing SSL requirement)..."

# Create nginx config without SSL for initial deployment
cat > nginx-config.conf << 'EOF'
server {
    listen 8080;
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
EOF

echo "✅ Updated nginx-config.conf (HTTP only, no SSL)"
echo ""
echo "🔄 Restarting Nginx..."
docker-compose restart nginx

echo ""
echo "⏳ Waiting 5 seconds..."
sleep 5

echo ""
echo "📊 Checking Nginx status..."
docker-compose ps nginx

echo ""
echo "🧪 Testing API endpoint..."
curl -I http://localhost:8080/api/qr/health 2>&1 | head -5

echo ""
echo "✅ Done! Nginx should now be running."
echo "🌐 Access your app at: http://graceshoppee.tech:8080"

