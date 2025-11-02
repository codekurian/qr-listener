# Deployment Verification Checklist

## ✅ Services Status (All Running)

Your services are all up:
- ✅ **PostgreSQL**: Up 6 minutes (healthy)
- ✅ **Redis**: Up 6 minutes
- ✅ **Backend**: Up 6 minutes
- ✅ **Frontend**: Up 6 minutes
- ✅ **Nginx**: Up 6 minutes

## Additional Verification

### 1. Test Content Publisher API
```bash
# Check publication stats
curl http://localhost:8080/api/publisher/publications/stats

# List publications
curl http://localhost:8080/api/publisher/publications?page=0&size=10
```

### 2. Test QR Code API
```bash
# QR Code stats
curl http://localhost:8080/api/admin/qr-codes/stats

# List QR codes
curl http://localhost:8080/api/admin/qr?limit=5
```

### 3. Test Public Endpoints
```bash
# Test a publication (if you have one with slug 'test-slug')
curl http://localhost:8080/api/public/publications/test-slug

# Test QR redirect (if you have a QR code)
curl http://localhost:8080/api/qr/{qr-id}
```

### 4. Check Frontend Pages
```bash
# Dashboard
curl -I http://localhost:8080/dashboard

# Publisher Dashboard
curl -I http://localhost:8080/publisher/dashboard

# Create Publication
curl -I http://localhost:8080/publisher/create
```

### 5. External Access Test
From your local machine or browser:
- http://graceshoppee.tech:8080
- http://graceshoppee.tech:8080/dashboard
- http://graceshoppee.tech:8080/publisher/dashboard

### 6. Database Verification
```bash
# Check if publications table exists
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "\d publications"

# Check if publication_photos table exists
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "\d publication_photos"

# Count existing data
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT COUNT(*) FROM publications;"
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT COUNT(*) FROM qr_codes;"
```

## Complete Status Check Command

```bash
cd /app/qr-listener-production_20251101_200154

echo "=== Container Status ==="
docker-compose ps

echo ""
echo "=== Backend Health ==="
curl -s http://localhost:8080/api/qr/health

echo ""
echo "=== Content Publisher API ==="
curl -s http://localhost:8080/api/publisher/publications/stats | jq . || curl -s http://localhost:8080/api/publisher/publications/stats

echo ""
echo "=== Frontend Check ==="
curl -sI http://localhost:8080 | head -1

echo ""
echo "=== Database Check ==="
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT COUNT(*) as qr_codes FROM qr_codes; SELECT COUNT(*) as publications FROM publications;" 2>/dev/null || echo "Database check failed"

echo ""
echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -6
```

## Deployment Success Indicators

✅ **All containers running** - Confirmed
✅ **Backend responding** - Confirmed ("QR Generation Service is healthy")
✅ **Frontend responding** - Confirmed (HTTP 200)
✅ **Nginx proxying** - Confirmed (port 8080 accessible)
✅ **Database healthy** - Confirmed (healthy status)

## Next Steps

1. **Access the application** in your browser:
   - Main: http://graceshoppee.tech:8080
   - Dashboard: http://graceshoppee.tech:8080/dashboard
   - Publisher: http://graceshoppee.tech:8080/publisher/dashboard

2. **Test Content Publisher**:
   - Create a new publication
   - Upload photos
   - Write content with rich text editor
   - Publish and view public page

3. **Monitor logs** if you encounter any issues:
   ```bash
   ./monitor.sh logs
   ```

## Troubleshooting

If you see any errors:

```bash
# Check backend logs
docker logs qr-listener-backend-prod --tail=100

# Check frontend logs
docker logs qr-listener-frontend-prod --tail=100

# Check Nginx logs
docker logs qr-listener-nginx-prod --tail=50

# Restart a service
docker-compose restart backend
```

