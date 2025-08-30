#!/bin/bash

echo "🛑 Stopping LegalManager services..."

# Stop MinIO
pkill -f "minio server" || echo "MinIO not running"

# Stop Redis
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl stop redis
elif command -v brew >/dev/null 2>&1; then
    brew services stop redis
fi

# Stop PostgreSQL
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl stop postgresql
elif command -v brew >/dev/null 2>&1; then
    brew services stop postgresql@16
fi

echo "✅ All services stopped"
