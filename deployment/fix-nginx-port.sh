#!/bin/bash
# Quick fix for Nginx port configuration on the server

echo "🔧 Fixing Nginx configuration..."

# Fix the nginx-config.conf to listen on port 80 (inside container) instead of 8080
sed -i 's/listen 8080;/listen 80;/g' nginx-config.conf

# Verify the change
echo "✅ Updated Nginx config:"
grep "listen 80;" nginx-config.conf

# Restart Nginx to apply changes
echo ""
echo "🔄 Restarting Nginx..."
docker-compose restart nginx

# Wait a moment
sleep 3

# Test
echo ""
echo "🧪 Testing Nginx routing..."
curl -v http://localhost:8080/api/qr/health

echo ""
echo "✅ Done! If you see a healthy response above, Nginx is working correctly."

