#!/bin/bash

# Script to remove old containers blocking new deployment

echo "🧹 Removing old containers..."

# Stop and remove containers with conflicting names
docker stop qr-listener-redis-prod qr-listener-postgres-prod qr-listener-backend-prod qr-listener-frontend-prod qr-listener-nginx-prod qr-listener-certbot-prod 2>/dev/null || true
docker rm qr-listener-redis-prod qr-listener-postgres-prod qr-listener-backend-prod qr-listener-frontend-prod qr-listener-nginx-prod qr-listener-certbot-prod 2>/dev/null || true

# Remove all stopped containers
docker container prune -f

echo "✅ Old containers removed. You can now run ./startup.sh again"

