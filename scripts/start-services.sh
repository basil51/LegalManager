#!/bin/bash

echo "🚀 Starting LegalManager services..."

# Start PostgreSQL
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start postgresql
    echo "✅ PostgreSQL started"
elif command -v brew >/dev/null 2>&1; then
    brew services start postgresql@16
    echo "✅ PostgreSQL started"
fi

# Start Redis
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start redis
    echo "✅ Redis started"
elif command -v brew >/dev/null 2>&1; then
    brew services start redis
    echo "✅ Redis started"
fi

# Start MinIO (if not already running)
if ! pgrep -f "minio server" > /dev/null; then
    echo "🔄 Starting MinIO..."
    minio server /opt/minio/data --console-address :9001 &
    echo "✅ MinIO started"
else
    echo "✅ MinIO already running"
fi

echo "🎉 All services started!"
echo ""
echo "📋 Service URLs:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - MinIO: localhost:9000 (Console: localhost:9001)"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: pnpm install"
echo "  2. Run: pnpm dev"
