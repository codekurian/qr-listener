#!/bin/bash
# Script to create or verify the fixed database volume
# Run this BEFORE first deployment or to ensure volume exists

VOLUME_NAME="qr_listener_postgres_data"

echo "📦 Checking database volume: $VOLUME_NAME"

if docker volume ls | grep -q "$VOLUME_NAME"; then
    echo "✅ Volume already exists: $VOLUME_NAME"
    echo "   Your data is safe!"
    docker volume inspect $VOLUME_NAME | grep -A 3 Mountpoint
else
    echo "📦 Creating new volume: $VOLUME_NAME"
    docker volume create $VOLUME_NAME
    echo "✅ Volume created successfully!"
fi

echo ""
echo "💾 Volume Information:"
docker volume inspect $VOLUME_NAME

