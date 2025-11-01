#!/bin/bash

# Fix frontend API URL by rebuilding with correct environment variable

echo "🔧 Fixing Frontend API URL"
echo "========================="

# Stop frontend
echo "🛑 Stopping frontend..."
docker-compose stop frontend
docker-compose rm -f frontend

# Update docker-compose.yml with correct URL
echo "📝 Updating docker-compose.yml..."
sed -i 's|NEXT_PUBLIC_API_BASE_URL: https://graceshoppee.tech|NEXT_PUBLIC_API_BASE_URL: http://graceshoppee.tech:8080|g' docker-compose.yml
sed -i 's|NEXT_PUBLIC_API_BASE_URL: https://graceshoppee.tech/api|NEXT_PUBLIC_API_BASE_URL: http://graceshoppee.tech:8080|g' docker-compose.yml

# Verify the change
echo "✅ Updated docker-compose.yml:"
grep "NEXT_PUBLIC_API_BASE_URL" docker-compose.yml

# Rebuild and start frontend
echo "🔄 Rebuilding frontend with new environment variable..."
docker-compose up -d --build frontend

echo "⏳ Waiting for frontend to rebuild (this takes 2-3 minutes)..."
echo "💡 Watch progress with: docker logs -f qr-listener-frontend-prod"

echo ""
echo "✅ Frontend is rebuilding with the correct API URL: http://graceshoppee.tech:8080"
echo "📋 Once rebuild completes, the API calls should work!"

