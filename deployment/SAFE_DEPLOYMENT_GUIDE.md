# Safe Deployment Guide - Preserving Database Data

## ⚠️ Important: Database Data Preservation

When deploying updates, your existing database data will be **automatically preserved** because:

1. **Docker Volumes Persist**: The `postgres_data` volume stores all your data and persists across container restarts
2. **Volume Names are Consistent**: Same volume name = same data
3. **Init Script is Safe**: The `init-db-prod.sql` script only runs on **first initialization** and uses `ON CONFLICT DO NOTHING` to prevent overwriting existing data

## 🔒 How Data is Preserved

### Docker Volume Persistence
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data  # This volume persists data
```

The `postgres_data` volume:
- ✅ Survives container restarts
- ✅ Survives `docker-compose down` (if you don't use `-v` flag)
- ✅ Survives new deployments (same volume name)
- ❌ Only deleted if you explicitly run `docker-compose down -v` (DON'T DO THIS!)

## 📋 Safe Deployment Steps

### Step 1: Stop Old Deployment (Preserves Database)

```bash
# Navigate to old deployment
cd /app/qr-listener-docker-clean_*

# Stop containers BUT KEEP VOLUMES (don't use -v flag!)
docker-compose down

# Verify database volume still exists
docker volume ls | grep postgres_data
```

### Step 2: Extract New Deployment

```bash
cd /app
unzip -o qr-listener-docker-clean_*.zip
cd qr-listener-docker-clean_*
```

### Step 3: Start New Deployment (Reuses Existing Volume)

```bash
chmod +x *.sh
./startup.sh
```

The new deployment will:
- ✅ Reuse the existing `postgres_data` volume
- ✅ Preserve all your QR codes, redirect logs, and analytics
- ✅ Only initialize if the database is completely empty

## 🔍 Verifying Data is Preserved

After deployment, verify your data:

```bash
# Check database volume exists
docker volume ls | grep postgres_data

# Check data in database
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT COUNT(*) FROM qr_codes;"

# List your QR codes
docker exec qr-listener-postgres-prod psql -U qr_user_prod -d qr_listener_prod -c "SELECT qr_id, target_url FROM qr_codes LIMIT 10;"
```

## ⚠️ What NOT to Do

### ❌ DON'T Delete Volumes
```bash
# DON'T run this - it deletes all data!
docker-compose down -v

# DON'T run this either
docker volume rm <volume_name>
```

### ❌ DON'T Use Different Volume Names
Make sure your `docker-compose.yml` uses the same volume name:
```yaml
volumes:
  postgres_data:  # This name should be consistent
```

### ❌ DON'T Recreate Database Container with --force-recreate
```bash
# Avoid this unless you know what you're doing
docker-compose up -d --force-recreate db
```

## 💾 Backup Before Deployment (Recommended)

Before major deployments, create a backup:

```bash
# Create backup
docker exec qr-listener-postgres-prod pg_dump -U qr_user_prod qr_listener_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use Docker volume backup
docker run --rm -v qr-listener-docker-clean_*_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

## 🔄 Rollback Plan

If something goes wrong, you can rollback:

```bash
# Stop new deployment
docker-compose down

# Restore backup (if created)
docker exec -i qr-listener-postgres-prod psql -U qr_user_prod qr_listener_prod < backup_YYYYMMDD_HHMMSS.sql

# Or start old deployment again
cd /app/qr-listener-docker-clean_OLD_VERSION
docker-compose up -d
```

## ✅ Deployment Checklist

- [ ] Backup database (optional but recommended)
- [ ] Stop old deployment: `docker-compose down` (without `-v`)
- [ ] Extract new deployment package
- [ ] Verify volume exists: `docker volume ls | grep postgres_data`
- [ ] Start new deployment: `./startup.sh`
- [ ] Verify data: Check QR codes count matches previous count
- [ ] Test application functionality

## 📊 Volume Information

Your database volume contains:
- All QR codes (qr_codes table)
- All redirect logs (qr_redirect_logs table)
- All applications (applications table)
- Database sequences and indexes

**Volume Location:** Docker manages volumes, typically at:
- Linux: `/var/lib/docker/volumes/<volume_name>/_data`
- But you should access data through Docker commands only

## 🆘 If Data Appears Lost

1. **Check if volume still exists:**
   ```bash
   docker volume ls
   ```

2. **Check if data is in the volume:**
   ```bash
   docker run --rm -v <volume_name>:/data alpine ls -la /data
   ```

3. **Restore from backup** (if available)

4. **Contact support** with volume information

