#!/bin/bash

# Legal Manager Development Script
# This script helps start the development environment with system-based services

echo "🚀 Starting Legal Manager Development Environment"
echo ""

# Check if system services are available
echo "🔍 Checking system services..."

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please run: ./scripts/setup-system.sh"
    exit 1
fi

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis is not installed. Please run: ./scripts/setup-system.sh"
    exit 1
fi

# Check MinIO
if ! command -v minio &> /dev/null; then
    echo "❌ MinIO is not installed. Please run: ./scripts/setup-system.sh"
    exit 1
fi

# Start system services
echo "📦 Starting system services..."
./scripts/start-services.sh

# Wait a moment for services to start
sleep 3

echo ""
echo "✅ System services started"
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
echo "📚 Test Credentials:"
echo "   - Admin: admin@legalfirm.com / password123"
echo "   - Lawyer: lawyer1@legalfirm.com / password123"
echo ""
