# Local Docker Development Guide

This guide explains how to run the QR Listener application locally using Docker.

## Prerequisites

1. **Docker Desktop** (or Docker Engine) must be installed and running
2. Ensure Docker has sufficient resources:
   - At least 4GB RAM allocated
   - 2 CPU cores recommended

## Quick Start

### 1. Start Docker Desktop
Make sure Docker Desktop is running on your machine.

### 2. Start All Services
```bash
./scripts/start-local-docker.sh
```

This script will:
- ✅ Pull required Docker images
- ✅ Start PostgreSQL database
- ✅ Start Redis (caching)
- ✅ Build and start Spring Boot backend
- ✅ Start Next.js frontend
- ✅ Wait for all services to be healthy

### 3. Access the Application

Once started, access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Dashboard**: http://localhost:3000/dashboard
- **Content Publisher**: http://localhost:3000/publisher/dashboard
- **Create Publication**: http://localhost:3000/publisher/create

### 4. Stop Services
```bash
./scripts/stop-local-docker.sh
```

## Manual Commands

### Start Services
```bash
docker-compose -f docker-compose.local.yml up -d
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.local.yml logs -f

# Specific service
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f frontend
docker-compose -f docker-compose.local.yml logs -f db
```

### Stop Services
```bash
docker-compose -f docker-compose.local.yml down
```

### Restart a Service
```bash
docker-compose -f docker-compose.local.yml restart backend
docker-compose -f docker-compose.local.yml restart frontend
```

### View Status
```bash
docker-compose -f docker-compose.local.yml ps
```

## Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| PostgreSQL | qr-listener-postgres-local | 5432 | Database |
| Redis | qr-listener-redis-local | 6379 | Cache |
| Backend | qr-listener-backend-local | 8080 | Spring Boot API |
| Frontend | qr-listener-frontend-local | 3000 | Next.js App |

## Database Connection

**Local Docker:**
- Host: `localhost` (from host) or `db` (from containers)
- Port: `5432`
- Database: `qr_listener`
- Username: `qr_user`
- Password: `local_dev_password`

## Troubleshooting

### Docker is not running
```bash
# Check Docker status
docker info

# Start Docker Desktop manually
```

### Port already in use
If ports 3000, 5432, 6379, or 8080 are already in use:
1. Stop the conflicting service
2. Or modify ports in `docker-compose.local.yml`

### Backend won't start
```bash
# Check backend logs
docker-compose -f docker-compose.local.yml logs backend

# Rebuild backend
docker-compose -f docker-compose.local.yml up -d --build backend
```

### Frontend won't start
```bash
# Check frontend logs
docker-compose -f docker-compose.local.yml logs frontend

# Rebuild frontend
docker-compose -f docker-compose.local.yml up -d --build frontend
```

### Database connection issues
```bash
# Check database logs
docker-compose -f docker-compose.local.yml logs db

# Restart database
docker-compose -f docker-compose.local.yml restart db
```

### Reset everything
```bash
# Stop and remove all containers and volumes
docker-compose -f docker-compose.local.yml down -v

# Start fresh
./scripts/start-local-docker.sh
```

## First Time Setup

On first run:
1. Docker images will be downloaded (takes a few minutes)
2. Backend will build with Maven (takes 2-5 minutes)
3. Frontend will install npm packages (takes 1-2 minutes)
4. Database will initialize

**Total first-time startup: ~5-10 minutes**

Subsequent startups: ~1-2 minutes

## Development Workflow

### Hot Reload
- **Frontend**: Changes to `frontend/src` are automatically reloaded
- **Backend**: Changes require container restart:
  ```bash
  docker-compose -f docker-compose.local.yml restart backend
  ```

### Viewing Logs in Real-Time
```bash
# All services
docker-compose -f docker-compose.local.yml logs -f

# Backend only
docker-compose -f docker-compose.local.yml logs -f backend
```

### Making Code Changes

**Frontend:**
- Edit files in `frontend/src/`
- Changes appear automatically (hot reload)
- No restart needed

**Backend:**
- Edit files in `backend/qr-listener-backend/src/`
- Restart backend container:
  ```bash
  docker-compose -f docker-compose.local.yml restart backend
  ```

## Database Access

### Connect via psql
```bash
docker-compose -f docker-compose.local.yml exec db psql -U qr_user -d qr_listener
```

### Run SQL scripts
```bash
docker-compose -f docker-compose.local.yml exec -T db psql -U qr_user -d qr_listener < scripts/init-db-prod.sql
```

## Health Checks

### Backend Health
```bash
curl http://localhost:8080/api/qr/health
```

### Frontend Health
```bash
curl http://localhost:3000
```

### Database Health
```bash
docker-compose -f docker-compose.local.yml exec db pg_isready -U qr_user -d qr_listener
```

## Clean Up

### Remove containers (keep volumes/data)
```bash
docker-compose -f docker-compose.local.yml down
```

### Remove everything including data
```bash
docker-compose -f docker-compose.local.yml down -v
```

### Remove all unused Docker resources
```bash
docker system prune -a
```

## Tips

1. **First startup takes time**: Be patient on first run
2. **Check logs if stuck**: Use `logs -f` to see what's happening
3. **Database persists**: Data survives container restarts
4. **Hot reload works**: Frontend changes appear automatically
5. **Backend needs restart**: Restart backend container after code changes

