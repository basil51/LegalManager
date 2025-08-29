#!/bin/bash

# Update Status Script for Legal Office Management System
# This script helps keep STATUS.md and other documentation files updated

echo "🔄 Updating project status files..."

# Get current date
CURRENT_DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if services are running
API_RUNNING=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4005/api/v1/health 2>/dev/null || echo "000")
WEB_RUNNING=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/en 2>/dev/null || echo "000")
DB_RUNNING=$(docker ps --filter "name=infra_db" --format "table {{.Status}}" 2>/dev/null | grep -q "Up" && echo "running" || echo "stopped")

# Get package versions
NEXT_VERSION=$(grep '"next":' apps/web/package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')
NESTJS_VERSION=$(grep '"@nestjs/core":' apps/api/package.json | sed 's/.*"@nestjs/core": "\([^"]*\)".*/\1/')

echo "📊 Current Status:"
echo "  - API (port 4005): $([ "$API_RUNNING" = "200" ] && echo "✅ Running" || echo "❌ Stopped")"
echo "  - Web (port 3005): $([ "$WEB_RUNNING" = "200" ] && echo "✅ Running" || echo "❌ Stopped")"
echo "  - Database: $([ "$DB_RUNNING" = "running" ] && echo "✅ Running" || echo "❌ Stopped")"
echo "  - Next.js: $NEXT_VERSION"
echo "  - NestJS: $NESTJS_VERSION"

# Update STATUS.md with last updated timestamp
if [ -f "STATUS.md" ]; then
    # Add or update last updated timestamp
    if grep -q "Last Updated:" STATUS.md; then
        sed -i "s/Last Updated:.*/Last Updated: $CURRENT_DATE/" STATUS.md
    else
        echo "" >> STATUS.md
        echo "---" >> STATUS.md
        echo "Last Updated: $CURRENT_DATE" >> STATUS.md
    fi
    echo "✅ STATUS.md updated"
fi

echo "🎉 Status update complete!"
echo ""
echo "💡 Next steps:"
echo "  - Review STATUS.md for current progress"
echo "  - Check ROADMAP.md for upcoming tasks"
echo "  - Update documentation as needed"
