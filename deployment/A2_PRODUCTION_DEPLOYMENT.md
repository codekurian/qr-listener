# A2 Hosting Production Deployment Guide

## 📦 Package Information

**Package File:** `qr-listener-production_YYYYMMDD_HHMMSS.zip`

**Features Included:**
- ✅ QR Code Management (Generate, Edit, Track)
- ✅ Content Publisher (Biographies & Family Stories)
  - Multi-step publication wizard
  - Photo upload with drag & drop
  - Rich text editor
  - Public viewing pages
  - Social sharing

## 🌐 URLs and Ports Configuration

All URLs use **HTTP** (not HTTPS) for A2 Hosting:

- **Main Site**: `http://graceshoppee.tech:8080`
- **Admin Dashboard**: `http://graceshoppee.tech:8080/dashboard`
- **Content Publisher**: `http://graceshoppee.tech:8080/publisher/dashboard`
- **Create Publication**: `http://graceshoppee.tech:8080/publisher/create`
- **Backend API**: `http://graceshoppee.tech:8080/api`
- **Public Publication**: `http://graceshoppee.tech:8080/p/{slug}`

**Port Configuration:**
- Nginx HTTP: `8080` (external access)
- Backend: `8081` (internal, proxied through Nginx)
- Frontend: `3000` (internal, proxied through Nginx)
- PostgreSQL: `5432` (internal)
- Redis: `6379` (internal)

## 📥 Deployment Steps

### Step 1: Stop Previous Deployment (Preserves Data)

```bash
# Navigate to old deployment (if exists)
cd /app/qr-listener-production_*

# Stop containers (preserves volumes - NO -v flag!)
docker-compose down

# Verify volumes still exist
docker volume ls | grep postgres_data

# Return to /app directory
cd /app
```

### Step 2: Upload Package via FileZilla

1. Connect to A2 Hosting via FileZilla
2. Navigate to `/app` directory
3. Upload: `qr-listener-production_YYYYMMDD_HHMMSS.zip`

### Step 3: Extract and Deploy

```bash
# Navigate to /app
cd /app

# Extract the package
unzip -o qr-listener-production_*.zip

# Navigate to extracted directory
cd qr-listener-production_*

# Make scripts executable
chmod +x *.sh

# Start deployment
./startup.sh
```

### Step 4: Monitor Startup

The backend takes 2-3 minutes to compile. Monitor progress:

```bash
# Watch backend logs
docker logs -f qr-listener-backend-prod

# Check container status
docker-compose ps

# Wait for "Started QrListenerApplication" message
```

### Step 5: Verify Deployment

```bash
# Test backend health
curl http://localhost:8081/api/qr/health

# Test through Nginx
curl http://localhost:8080/api/qr/health

# Test frontend
curl -I http://localhost:8080

# Check Content Publisher API
curl http://localhost:8080/api/publisher/publications/stats

# View all container statuses
./monitor.sh status
```

## 🛠️ Management Commands

### View Status
```bash
./monitor.sh status
```

### View Logs
```bash
# All logs
./monitor.sh logs

# Specific service
./monitor.sh logs backend
./monitor.sh logs frontend
./monitor.sh logs nginx
```

### Restart Services
```bash
# Restart all
./monitor.sh restart

# Restart specific service
./monitor.sh restart backend
```

### Health Check
```bash
./monitor.sh health
```

### Access Containers
```bash
# Backend logs
docker logs qr-listener-backend-prod

# Frontend logs
docker logs qr-listener-frontend-prod

# Database access
docker exec -it qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod
```

## 💾 Data Preservation

**⚠️ IMPORTANT**: Database data is automatically preserved!

- Docker volumes persist across deployments
- The `qr_listener_postgres_data` volume survives container restarts
- QR codes and publications are preserved automatically
- Startup script detects existing volumes and reuses them

## 🔧 Configuration Files

### Environment Variables
Edit `.env.example` (or create `.env`):
```bash
DB_PASSWORD=your_secure_password
NEXT_PUBLIC_API_BASE_URL=http://graceshoppee.tech:8080
NEXT_PUBLIC_BASE_URL=http://graceshoppee.tech:8080
```

### Docker Compose
Configuration: `docker-compose.yml`

### Nginx Configuration
Configuration: `nginx-config.conf`
- HTTP on port 8080
- Proxies `/api/*` to backend
- Proxies `/` to frontend

## 📊 Verification Checklist

After deployment, verify:

- [ ] Backend health check: `curl http://localhost:8080/api/qr/health`
- [ ] Frontend loads: `curl -I http://localhost:8080`
- [ ] Admin dashboard accessible
- [ ] Content Publisher accessible
- [ ] Can create new QR codes
- [ ] Can create new publications
- [ ] Database data preserved (check existing QR codes/publications)

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker logs qr-listener-backend-prod

# Check if Maven build succeeded
docker logs qr-listener-backend-prod | grep "BUILD SUCCESS"

# Restart backend
./monitor.sh restart backend
```

### Frontend Not Starting
```bash
# Check logs
docker logs qr-listener-frontend-prod

# Check if build succeeded
docker logs qr-listener-frontend-prod | grep "compiled"

# Restart frontend
./monitor.sh restart frontend
```

### Database Issues
```bash
# Check database container
docker logs qr-listener-postgres-prod

# Connect to database
docker exec -it qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod

# Check publications table
SELECT COUNT(*) FROM publications;
SELECT COUNT(*) FROM publication_photos;
```

### Nginx Issues
```bash
# Check Nginx logs
docker logs qr-listener-nginx-prod

# Test Nginx configuration
docker exec qr-listener-nginx-prod nginx -t

# Restart Nginx
./monitor.sh restart nginx
```

## 📝 Important Notes

1. **All URLs use HTTP** - A2 Hosting is configured for HTTP on port 8080
2. **Data Preservation** - Database volumes are preserved automatically
3. **First Deployment** - Database will be initialized automatically
4. **Subsequent Deployments** - Existing data is preserved
5. **Port 8080** - Nginx listens on port 8080 for external access

## 🔗 Quick Access Links

- **Main Site**: http://graceshoppee.tech:8080
- **Dashboard**: http://graceshoppee.tech:8080/dashboard
- **Publisher**: http://graceshoppee.tech:8080/publisher/dashboard
- **Create Publication**: http://graceshoppee.tech:8080/publisher/create
- **API Health**: http://graceshoppee.tech:8080/api/qr/health

## 📞 Support

If you encounter issues:
1. Check container logs: `./monitor.sh logs`
2. Check health status: `./monitor.sh health`
3. Verify all containers running: `docker-compose ps`
4. Check database: `docker exec -it qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod`

