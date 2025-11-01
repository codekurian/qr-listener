#!/bin/bash

# Script to fix Nginx SSL certificate issue for initial deployment

echo "🔧 Fixing Nginx SSL Configuration..."

# Step 1: Check Nginx logs to see the exact error
echo "📋 Checking Nginx logs..."
docker logs qr-listener-nginx-prod 2>&1 | tail -20

echo ""
echo "🛠️  Fixing Nginx configuration for initial deployment..."

# Step 2: Create a temporary nginx config without SSL (for initial setup)
cat > nginx-config-temp.conf << 'EOF'
server {
    listen 8080;
    server_name graceshoppee.tech www.graceshoppee.tech;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 8443;
    server_name graceshoppee.tech www.graceshoppee.tech;

    # Frontend (without SSL for now)
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Step 3: Update docker-compose to use temp config temporarily
echo "📝 Updating docker-compose to use temporary config..."
sed -i 's|nginx-config.conf|nginx-config-temp.conf|g' docker-compose.yml

# Step 4: Restart nginx
echo "🔄 Restarting Nginx..."
docker-compose restart nginx

echo ""
echo "✅ Nginx should now be running without SSL"
echo "🌐 Access at: http://graceshoppee.tech:8080"
echo ""
echo "📋 Next steps:"
echo "1. Test the application at http://graceshoppee.tech:8080"
echo "2. Once working, obtain SSL certificate:"
echo "   docker-compose run --rm certbot"
echo "3. Then switch back to full SSL config"

