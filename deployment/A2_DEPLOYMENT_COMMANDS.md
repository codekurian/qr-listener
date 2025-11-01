# A2 Hosting Deployment Commands

## Complete Deployment Steps

### Step 1: Stop Current Deployment

```bash
# Navigate to your current deployment (if you know the path)
cd /app/qr-listener-docker-clean_*  # or specific directory

# Stop all containers
docker-compose down

# Or stop all QR Listener containers by name
docker stop qr-listener-redis-prod qr-listener-postgres-prod qr-listener-backend-prod qr-listener-frontend-prod qr-listener-nginx-prod qr-listener-certbot-prod 2>/dev/null
docker rm qr-listener-redis-prod qr-listener-postgres-prod qr-listener-backend-prod qr-listener-frontend-prod qr-listener-nginx-prod qr-listener-certbot-prod 2>/dev/null
```

### Step 2: Upload New Package (via FileZilla)

Upload this file to A2 Hosting:
- `qr-listener-docker-clean_20251031_222942.zip`

Suggested upload location: `/app/` or `/root/`

### Step 3: Extract and Deploy New Package

```bash
# Navigate to where you uploaded the zip file
cd /app  # or wherever you uploaded it

# Extract the package
unzip qr-listener-docker-clean_20251031_222942.zip

# Navigate into the extracted directory
cd qr-listener-docker-clean_20251031_222942

# Make scripts executable
chmod +x *.sh

# Start the deployment
./startup.sh
```

### Step 4: Wait for Services to Start

The backend takes time to build (Maven compilation). Monitor progress:

```bash
# Watch backend build logs
docker logs -f qr-listener-backend-prod

# Or check all container status
docker-compose ps

# Check when backend is ready
docker logs qr-listener-backend-prod | grep -i "started\|listening\|running"
```

### Step 5: Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Test backend directly
curl http://localhost:8081/api/qr/health

# Test backend through Nginx
curl http://localhost:8080/api/qr/health

# Test frontend
curl -I http://localhost:8080

# Check Nginx logs if issues
docker logs qr-listener-nginx-prod
```

## Quick All-in-One Commands

### Complete Fresh Deployment (One Script)

```bash
# Navigate to upload location
cd /app

# Stop old containers (if any)
docker stop $(docker ps -q --filter "name=qr-listener") 2>/dev/null
docker rm $(docker ps -aq --filter "name=qr-listener") 2>/dev/null

# Extract new package
unzip -o qr-listener-docker-clean_20251031_222942.zip

# Go into package
cd qr-listener-docker-clean_20251031_222942

# Make scripts executable
chmod +x *.sh

# Start deployment
./startup.sh
```

### Check Deployment Status

```bash
# Container status
docker-compose ps

# Resource usage
docker stats --no-stream

# Health check
curl http://localhost:8081/api/qr/health && echo "✅ Backend OK"
curl http://localhost:8080/api/qr/health && echo "✅ Nginx OK"
curl -I http://localhost:3000 && echo "✅ Frontend OK"
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Last 50 lines
docker logs qr-listener-backend-prod --tail 50
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart nginx
```

### Stop Deployment

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

## Troubleshooting

### If Backend Build Fails

```bash
# Check backend logs
docker logs qr-listener-backend-prod

# Restart backend container
docker-compose restart backend

# Rebuild from scratch
docker-compose up -d --force-recreate backend
```

### If Nginx Not Working

```bash
# Check nginx logs
docker logs qr-listener-nginx-prod

# Test nginx config
docker exec qr-listener-nginx-prod nginx -t

# Restart nginx
docker-compose restart nginx
```

### If Port Conflicts

```bash
# Check what's using ports
netstat -tuln | grep -E '8080|8081|8443|3000|5432'

# Kill process on port (replace PORT with actual port)
# fuser -k 8080/tcp
```

## Access Your Application

After deployment completes:

- **Frontend:** http://graceshoppee.tech:8080
- **Backend API:** http://graceshoppee.tech:8080/api
- **Health Check:** http://graceshoppee.tech:8080/api/qr/health

