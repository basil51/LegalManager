#!/bin/bash

# Legal Manager Development Script
# This script helps start the development environment on the new ports

echo "🚀 Starting Legal Manager Development Environment"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start infrastructure services
echo "📦 Starting infrastructure services..."
docker compose -f infra/docker-compose.dev.yml up -d

# Wait a moment for services to start
sleep 3

echo ""
echo "✅ Infrastructure services started"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - MinIO: localhost:9000 (Console: localhost:9001)"
echo ""

# Check if services are running
echo "🔍 Checking service status..."
./scripts/update-status.sh

echo ""
echo "🎯 Next steps:"
echo "   1. Start the API server: pnpm -F @legal/api dev"
echo "   2. Start the Web app: pnpm -F @legal/web dev"
echo "   3. Or run both: pnpm dev"
echo ""
echo "🌐 Access points:"
echo "   - Web App: http://localhost:3005/en"
echo "   - API: http://localhost:4005/api/v1"
echo "   - API Docs: http://localhost:4005/api/v1/docs"
echo ""
