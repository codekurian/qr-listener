# Check Services Status on A2 Hosting

## Quick Status Check

Run these commands on your A2 Hosting server:

### 1. Check Container Status
```bash
cd /app/qr-listener-production_20251101_200154
docker-compose ps
```

Or using the monitor script:
```bash
./monitor.sh status
```

### 2. Check Individual Services

#### Backend Health
```bash
# Direct backend check
curl http://localhost:8081/api/qr/health

# Through Nginx
curl http://localhost:8080/api/qr/health

# From external
curl http://graceshoppee.tech:8080/api/qr/health
```

#### Frontend Check
```bash
# Check if frontend is responding
curl -I http://localhost:3000

# Through Nginx
curl -I http://localhost:8080

# From external
curl -I http://graceshoppee.tech:8080
```

#### Database Check
```bash
# Check if database is accessible
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT version();"

# Check if tables exist
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "\dt"
```

### 3. Check Logs

#### All Services
```bash
docker-compose logs --tail=50
```

#### Specific Service
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

### 4. Health Check (Using Monitor Script)
```bash
./monitor.sh health
```

### 5. Check Resource Usage
```bash
docker stats --no-stream
```

### 6. Check if Services are Listening on Ports
```bash
# Check what's listening on ports
netstat -tlnp | grep -E '8080|8081|3000|5432|6379'

# Or using ss
ss -tlnp | grep -E '8080|8081|3000|5432|6379'
```

## Expected Results

### Container Status (docker-compose ps)
All containers should show "Up" status:
```
NAME                         STATUS
qr-listener-backend-prod     Up X minutes (healthy)
qr-listener-frontend-prod    Up X minutes
qr-listener-postgres-prod    Up X minutes (healthy)
qr-listener-redis-prod       Up X minutes
qr-listener-nginx-prod       Up X minutes
```

### Health Check Results
- Backend: Should return `QR Generation Service is healthy`
- Frontend: Should return HTTP 200 status
- Database: Should return PostgreSQL version

## Troubleshooting

### If Backend is Not Up
```bash
# Check backend logs for errors
docker logs qr-listener-backend-prod --tail=100 | grep -i error

# Check if Maven build completed
docker logs qr-listener-backend-prod | grep "BUILD SUCCESS"

# Check if Spring Boot started
docker logs qr-listener-backend-prod | grep "Started QrListenerApplication"
```

### If Frontend is Not Up
```bash
# Check frontend logs
docker logs qr-listener-frontend-prod --tail=100

# Check if build completed
docker logs qr-listener-frontend-prod | grep "compiled"

# Check if Next.js server started
docker logs qr-listener-frontend-prod | grep "ready"
```

### If Nginx is Not Up
```bash
# Check Nginx logs
docker logs qr-listener-nginx-prod --tail=50

# Test Nginx configuration
docker exec qr-listener-nginx-prod nginx -t
```

### Restart Services if Needed
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx
```

