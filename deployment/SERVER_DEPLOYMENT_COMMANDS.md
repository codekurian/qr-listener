# A2 Hosting Server Deployment Commands

## 📦 Package File
**File:** `qr-listener-production_20251101_205839.zip`

## 🛑 Step 1: Stop Current Deployment (Preserves Data)

```bash
# Navigate to current deployment
cd /app/qr-listener-production_*

# Stop containers (preserves volumes - NO -v flag!)
docker-compose down

# Verify volumes still exist (data is safe!)
docker volume ls | grep postgres_data

# Return to /app
cd /app
```

## 📥 Step 2: Upload Package via FileZilla

1. Connect to A2 Hosting via FileZilla
2. Navigate to `/app` directory
3. Upload: `qr-listener-production_20251101_205839.zip`

## 🚀 Step 3: Extract and Deploy

```bash
# Navigate to /app
cd /app

# Extract the new package
unzip -o qr-listener-production_20251101_205839.zip

# Navigate to extracted directory
cd qr-listener-production_20251101_205839

# Make scripts executable
chmod +x *.sh

# Start deployment
./startup.sh
```

## ⏳ Step 4: Monitor Startup

```bash
# Watch backend build logs (takes 2-3 minutes)
docker logs -f qr-listener-backend-prod

# Wait for: "Started QrListenerApplication"
# Then press Ctrl+C to exit logs
```

## ✅ Step 5: Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Test backend health
curl http://localhost:8080/api/qr/health

# Test Content Publisher API
curl http://localhost:8080/api/publisher/publications/stats

# Test frontend
curl -I http://localhost:8080

# Check services status
./monitor.sh status
```

## 🎯 Quick One-Liner Commands

### Complete Deployment (All Steps)
```bash
cd /app && cd qr-listener-production_* && docker-compose down && cd /app && unzip -o qr-listener-production_20251101_205839.zip && cd qr-listener-production_20251101_205839 && chmod +x *.sh && ./startup.sh
```

### Check Status
```bash
cd /app/qr-listener-production_* && docker-compose ps && curl -s http://localhost:8080/api/qr/health
```

### View Logs
```bash
cd /app/qr-listener-production_* && docker-compose logs --tail=50
```

### Restart Services
```bash
cd /app/qr-listener-production_* && docker-compose restart
```

### Check Database
```bash
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT COUNT(*) FROM publications;"
```

## 📋 Deployment Checklist

- [ ] Stopped old containers
- [ ] Verified volumes exist (data safe)
- [ ] Uploaded new package
- [ ] Extracted package
- [ ] Made scripts executable
- [ ] Ran startup.sh
- [ ] Waited for backend to build (2-3 min)
- [ ] Verified all containers running
- [ ] Tested backend health
- [ ] Tested Content Publisher API
- [ ] Tested frontend access

## 🔍 Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker logs qr-listener-backend-prod --tail=100

# Restart backend
docker-compose restart backend
```

### Check Specific Service
```bash
# Backend
docker logs qr-listener-backend-prod --tail=50

# Frontend
docker logs qr-listener-frontend-prod --tail=50

# Nginx
docker logs qr-listener-nginx-prod --tail=50

# Database
docker logs qr-listener-postgres-prod --tail=50
```

### Restart Specific Service
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx
```

## ✅ Success Indicators

After deployment, you should see:
- All 5 containers running (postgres, redis, backend, frontend, nginx)
- Backend health: `QR Generation Service is healthy`
- Frontend accessible at: http://graceshoppee.tech:8080
- Content Publisher working
- Publish functionality working

## 📝 Notes

- **Data is preserved**: Docker volumes survive container restarts
- **Backend takes time**: 2-3 minutes to compile with Maven
- **Access URL**: http://graceshoppee.tech:8080 (NOT port 3000)
- **Package includes**: All fixes for publish functionality and JPA collection handling

