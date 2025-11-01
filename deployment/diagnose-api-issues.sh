#!/bin/bash

# Script to diagnose API connection issues

echo "🔍 Diagnosing API Connection Issues"
echo "==================================="

# Check backend container status
echo "📊 Backend Container Status:"
docker ps | grep backend

echo ""
echo "📋 Backend Logs (last 30 lines):"
docker logs qr-listener-backend-prod --tail 30

echo ""
echo "🧪 Testing Backend Direct Access:"
echo "Testing http://localhost:8081/api/qr/health"
curl -v http://localhost:8081/api/qr/health || echo "❌ Backend not responding on port 8081"

echo ""
echo "🧪 Testing Backend through Nginx:"
echo "Testing http://localhost:8080/api/qr/health"
curl -v http://localhost:8080/api/qr/health || echo "❌ Backend not accessible through Nginx"

echo ""
echo "📋 Nginx Logs (last 20 lines):"
docker logs qr-listener-nginx-prod --tail 20

echo ""
echo "🌐 Frontend Status:"
docker ps | grep frontend
echo ""
echo "Testing http://localhost:3000"
curl -I http://localhost:3000 || echo "❌ Frontend not responding"

echo ""
echo "📝 Network Configuration:"
docker network inspect qr-listener-docker-clean_20251031_215836_default 2>/dev/null | grep -A 5 "Containers" || echo "Network not found"

