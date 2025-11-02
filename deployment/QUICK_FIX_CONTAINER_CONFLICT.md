# Quick Fix: Container Name Conflict

## Problem
```
Error response from daemon: Conflict. The container name "/qr-listener-redis-prod" is already in use...
```

## Solution

Run these commands on A2 Hosting to remove old containers:

```bash
# Stop old containers
docker stop qr-listener-redis-prod qr-listener-postgres-prod qr-listener-backend-prod qr-listener-frontend-prod qr-listener-nginx-prod qr-listener-certbot-prod 2>/dev/null || true

# Remove old containers (preserves volumes - data is safe!)
docker rm qr-listener-redis-prod qr-listener-postgres-prod qr-listener-backend-prod qr-listener-frontend-prod qr-listener-nginx-prod qr-listener-certbot-prod 2>/dev/null || true

# Verify volumes still exist (your data is safe)
docker volume ls | grep postgres_data

# Now run startup
./startup.sh
```

## Alternative: Use Docker Compose Down (in old directory)

If you have the old deployment directory:

```bash
# Navigate to old deployment
cd /app/qr-listener-production_*  # or old directory name

# Stop and remove containers (preserves volumes)
docker-compose down

# Go to new deployment
cd /app/qr-listener-production_20251101_200154

# Run startup
./startup.sh
```

## Verify Data is Preserved

After cleanup, verify your data is still there:

```bash
# Check volume exists
docker volume ls | grep postgres_data

# After containers start, check data
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT COUNT(*) FROM qr_codes;"
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT COUNT(*) FROM publications;"
```

**Note:** The `docker rm` command removes containers but NOT volumes. Your database data is stored in volumes and will be preserved!

