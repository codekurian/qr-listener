#!/bin/bash

# Verification script for QR Listener deployment

echo "🔍 Verifying QR Listener Deployment"
echo "===================================="

echo ""
echo "1️⃣ Checking Container Status..."
docker-compose ps

echo ""
echo "2️⃣ Testing Backend Direct (port 8081)..."
curl -s http://localhost:8081/api/qr/health && echo " ✅" || echo " ❌ FAILED"

echo ""
echo "3️⃣ Testing Backend through Nginx (port 8080)..."
curl -s http://localhost:8080/api/qr/health && echo " ✅" || echo " ❌ FAILED"

echo ""
echo "4️⃣ Testing Admin API Endpoints..."
echo "  - Stats endpoint:"
curl -s http://localhost:8080/api/admin/qr-codes/stats && echo " ✅" || echo " ❌ FAILED"

echo ""
echo "5️⃣ Testing Frontend (port 8080)..."
curl -I -s http://localhost:8080 | head -1 && echo " ✅" || echo " ❌ FAILED"

echo ""
echo "6️⃣ Checking Backend Logs (last 5 lines)..."
docker logs qr-listener-backend-prod --tail 5

echo ""
echo "7️⃣ Checking Nginx Logs (last 5 lines)..."
docker logs qr-listener-nginx-prod --tail 5

echo ""
echo "8️⃣ Resource Usage..."
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "✅ Verification complete!"
echo ""
echo "🌐 Access your application:"
echo "   - Frontend: http://graceshoppee.tech:8080"
echo "   - Backend API: http://graceshoppee.tech:8080/api"
echo "   - Health Check: http://graceshoppee.tech:8080/api/qr/health"

