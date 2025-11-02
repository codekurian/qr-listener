# How to Bring Down Docker Containers on A2 Hosting

## 🛑 Step-by-Step Instructions

### Option 1: Using Docker Compose (Recommended - Preserves Volumes)

```bash
# Navigate to your deployment directory
cd /app/qr-listener-production_20251101_200154

# Stop and remove containers (BUT PRESERVE VOLUMES)
docker-compose down

# Verify volumes still exist (your data is safe!)
docker volume ls | grep postgres_data
```

**Important:** `docker-compose down` **preserves volumes** - your database data is safe!

### Option 2: Stop Containers Only (No Removal)

```bash
# Just stop containers (doesn't remove them)
docker-compose stop

# Containers still exist, just stopped
docker-compose ps -a
```

### Option 3: Stop and Remove Specific Containers

```bash
# Stop containers
docker stop qr-listener-redis-prod qr-listener-postgres-prod qr-listener-backend-prod qr-listener-frontend-prod qr-listener-nginx-prod qr-listener-certbot-prod

# Remove containers (preserves volumes)
docker rm qr-listener-redis-prod qr-listener-postgres-prod qr-listener-backend-prod qr-listener-frontend-prod qr-listener-nginx-prod qr-listener-certbot-prod

# Verify volumes still exist
docker volume ls | grep postgres_data
```

### Option 4: Complete Cleanup (⚠️ CAUTION - Removes Everything)

**⚠️ WARNING: This removes containers AND volumes (will delete database data!)**

```bash
# Only use this if you want to start fresh (data will be lost!)
docker-compose down -v

# OR manually
docker-compose down --volumes --remove-orphans
```

**DO NOT use `-v` flag if you want to keep your data!**

## 🔍 Verify Containers are Down

```bash
# Check running containers
docker ps

# Check all containers (including stopped)
docker ps -a

# Should show no qr-listener containers running
```

## 💾 Data Safety Confirmation

**Before bringing down containers, verify your data is safe:**

```bash
# Check if volume exists
docker volume ls | grep qr_listener_postgres_data

# Inspect volume
docker volume inspect qr_listener_postgres_data
```

**Volumes persist independently of containers!**

## 🚀 Full Deployment Process

```bash
# 1. Stop current deployment (preserves data)
cd /app/qr-listener-production_20251101_200154
docker-compose down

# 2. Verify data is safe
docker volume ls | grep postgres_data

# 3. Navigate to app directory
cd /app

# 4. Extract new package (if needed)
unzip -o qr-listener-production_20251101_202134.zip

# 5. Start new deployment
cd qr-listener-production_20251101_202134
chmod +x *.sh
./startup.sh
```

## 📋 Quick Reference Commands

| Command | What It Does | Preserves Data? |
|---------|--------------|-----------------|
| `docker-compose down` | Stops and removes containers | ✅ Yes (volumes kept) |
| `docker-compose stop` | Stops containers only | ✅ Yes (volumes kept) |
| `docker-compose down -v` | Removes containers AND volumes | ❌ No (data deleted!) |
| `docker-compose up -d` | Starts containers (reuses volumes) | ✅ Yes |

## ✅ Recommended Approach

For your deployment, use:

```bash
cd /app/qr-listener-production_20251101_200154
docker-compose down

# Your data is safe in volumes!
# Now you can deploy the new package
```

