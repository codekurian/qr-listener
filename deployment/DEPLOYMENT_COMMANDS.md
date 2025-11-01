# Deployment Commands for A2 Hosting

## 📦 New Package
**File:** `qr-listener-docker-clean_20251031_233149.zip`

## 🛑 Step 1: Stop Previous Deployment

```bash
# Navigate to the old deployment directory (adjust the timestamp to match your current deployment)
cd /app/qr-listener-docker-clean_*

# Stop all containers
docker-compose down

# Remove containers (if they exist)
docker rm -f qr-listener-backend-prod qr-listener-frontend-prod qr-listener-nginx-prod qr-listener-postgres-prod qr-listener-redis-prod qr-listener-certbot-prod 2>/dev/null || true

# Go back to /app directory
cd /app
```

## 📥 Step 2: Upload New Package

**Using FileZilla:**
1. Connect to your A2 Hosting server
2. Navigate to `/app` directory
3. Upload `qr-listener-docker-clean_20251031_233149.zip`

## 🚀 Step 3: Extract and Deploy

```bash
# Navigate to /app
cd /app

# Extract the new package
unzip -o qr-listener-docker-clean_20251031_233149.zip

# Navigate to new deployment directory
cd qr-listener-docker-clean_20251031_233149

# Make scripts executable
chmod +x *.sh

# Start the application
./startup.sh
```

## ⏳ Step 4: Wait for Services

The backend takes 2-3 minutes to build (Maven compilation). Monitor progress:

```bash
# Watch backend logs for startup
docker logs -f qr-listener-backend-prod | grep -i "started\|error"

# Or check all container statuses
docker-compose ps
```

## ✅ Step 5: Verify Deployment

```bash
# Test backend health
curl http://localhost:8081/api/qr/health

# Test through Nginx
curl http://localhost:8080/api/qr/health

# Test stats endpoint
curl http://localhost:8080/api/admin/qr-codes/stats

# Check all containers are running
docker-compose ps
```

## 🧹 Step 6: Cleanup Old Deployment (Optional)

After confirming the new deployment works:

```bash
# Remove old deployment directory
cd /app
rm -rf qr-listener-docker-clean_20251031_222942  # Replace with your old directory name

# Optional: Clean up unused Docker resources
docker system prune -f
```

## 🔧 Quick Troubleshooting

If you encounter issues:

```bash
# Check container logs
docker logs qr-listener-backend-prod
docker logs qr-listener-frontend-prod
docker logs qr-listener-nginx-prod

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx

# Full restart
docker-compose down
docker-compose up -d
```

## 📋 What's New in This Deployment

✅ QR codes now contain full redirect URLs (scannable)
✅ Input fields have visible text (fixed white text issue)
✅ Edit QR code functionality fully implemented
✅ Fixed Nginx port configuration
✅ Fixed database configuration (ddl-auto: update)
✅ Fixed CORS configuration for A2 Hosting

## 🌐 Access URLs

- **Frontend:** http://graceshoppee.tech:8080
- **Backend API:** http://graceshoppee.tech:8080/api
- **Health Check:** http://graceshoppee.tech:8080/api/qr/health
