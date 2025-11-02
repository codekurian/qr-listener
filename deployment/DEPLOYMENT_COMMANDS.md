# Deployment Commands for A2 Hosting

## 📦 New Package
**File:** `qr-listener-docker-clean_*.zip` (latest)

## 🛑 Step 1: Stop Previous Deployment (PRESERVES DATA)

```bash
# Navigate to the old deployment directory
cd /app/qr-listener-docker-clean_*

# Stop all containers BUT PRESERVE VOLUMES (no -v flag!)
# ⚠️ IMPORTANT: DO NOT use 'docker-compose down -v' as it deletes volumes!
docker-compose down

# Verify database volume still exists (data is safe)
docker volume ls | grep postgres_data

# Go back to /app directory
cd /app
```

## 📥 Step 2: Upload New Package

**Using FileZilla:**
1. Connect to your A2 Hosting server
2. Navigate to `/app` directory
3. Upload the latest `qr-listener-docker-clean_*.zip` file

## 🚀 Step 3: Extract and Deploy (PRESERVES DATA)

```bash
# Navigate to /app
cd /app

# Extract the new package
unzip -o qr-listener-docker-clean_*.zip

# Navigate to new deployment directory
cd qr-listener-docker-clean_*

# Make scripts executable
chmod +x *.sh

# Start the application (automatically preserves existing database)
./startup.sh
```

## 💾 Data Preservation Confirmation

The startup script will:
- ✅ Detect existing database volumes
- ✅ Reuse existing volumes (preserving all data)
- ✅ Show warnings confirming data will be preserved
- ✅ Only initialize database if it's completely empty

## ⏳ Step 4: Wait for Services

The backend takes 2-3 minutes to build (Maven compilation). Monitor progress:

```bash
# Watch backend logs for startup
docker logs -f qr-listener-backend-prod | grep -i "started\|error"

# Or check all container statuses
docker-compose ps
```

## ✅ Step 5: Verify Deployment and Data

```bash
# Test backend health
curl http://localhost:8081/api/qr/health

# Test through Nginx
curl http://localhost:8080/api/qr/health

# Test stats endpoint
curl http://localhost:8080/api/admin/qr-codes/stats

# Verify your data is preserved (check QR code count)
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT COUNT(*) FROM qr_codes;"

# List some QR codes to confirm data exists
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT qr_id, target_url FROM qr_codes LIMIT 5;"

# Check all containers are running
docker-compose ps
```

## 🧹 Step 6: Cleanup Old Deployment (Optional)

After confirming the new deployment works and data is intact:

```bash
# Remove old deployment directory (data is in Docker volumes, not directories)
cd /app
rm -rf qr-listener-docker-clean_OLD_VERSION  # Replace with your old directory name

# Optional: Clean up unused Docker resources (BUT NOT VOLUMES!)
docker system prune -f
```

## 🔧 Quick Troubleshooting

If you encounter issues:

```bash
# Check container logs
docker logs qr-listener-backend-prod
docker logs qr-listener-frontend-prod
docker logs qr-listener-nginx-prod

# Verify database volume exists
docker volume ls | grep postgres_data

# Check database connection
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "\dt"

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx

# Full restart (preserves data)
docker-compose down
docker-compose up -d
```

## ⚠️ Data Safety Reminders

1. **Always use `docker-compose down`** (without `-v` flag)
2. **Never use `docker-compose down -v`** unless you want to DELETE all data
3. **Database volumes persist** across container restarts and deployments
4. **Init script is safe** - uses `ON CONFLICT DO NOTHING` to prevent overwriting
5. **Volume names are consistent** - same volume = same data

## 📋 What's New in This Deployment

✅ Custom QR size download (cm to pixels)
✅ Edit QR code functionality
✅ QR codes contain full redirect URLs (scannable)
✅ Input fields have visible text (fixed white text issue)
✅ Fixed Nginx port configuration
✅ Fixed database configuration (ddl-auto: update)
✅ Fixed CORS configuration for A2 Hosting
✅ **Database data preservation** - volumes persist across deployments

## 🌐 Access URLs

- **Frontend:** http://graceshoppee.tech:8080
- **Backend API:** http://graceshoppee.tech:8080/api
- **Health Check:** http://graceshoppee.tech:8080/api/qr/health
