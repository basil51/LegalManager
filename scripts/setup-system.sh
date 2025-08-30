#!/bin/bash

# LegalManager System Setup Script
# This script sets up the required services to run LegalManager without Docker

set -e

echo "🚀 Setting up LegalManager for system-based development..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install PostgreSQL
install_postgresql() {
    echo -e "${BLUE}📦 Installing PostgreSQL...${NC}"
    
    if command_exists psql; then
        echo -e "${GREEN}✅ PostgreSQL is already installed${NC}"
        return
    fi
    
    # Detect OS and install PostgreSQL
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt; then
            # Ubuntu/Debian
            sudo apt update
            sudo apt install -y postgresql postgresql-contrib
        elif command_exists yum; then
            # CentOS/RHEL
            sudo yum install -y postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
        elif command_exists dnf; then
            # Fedora
            sudo dnf install -y postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
        else
            echo -e "${RED}❌ Unsupported Linux distribution. Please install PostgreSQL manually.${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install postgresql@16
            brew services start postgresql@16
        else
            echo -e "${RED}❌ Homebrew not found. Please install Homebrew and PostgreSQL manually.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Unsupported operating system. Please install PostgreSQL manually.${NC}"
        exit 1
    fi
}

# Function to install Redis
install_redis() {
    echo -e "${BLUE}📦 Installing Redis...${NC}"
    
    if command_exists redis-server; then
        echo -e "${GREEN}✅ Redis is already installed${NC}"
        return
    fi
    
    # Detect OS and install Redis
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt; then
            # Ubuntu/Debian
            sudo apt update
            sudo apt install -y redis-server
        elif command_exists yum; then
            # CentOS/RHEL
            sudo yum install -y redis
        elif command_exists dnf; then
            # Fedora
            sudo dnf install -y redis
        else
            echo -e "${RED}❌ Unsupported Linux distribution. Please install Redis manually.${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install redis
            brew services start redis
        else
            echo -e "${RED}❌ Homebrew not found. Please install Homebrew and Redis manually.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Unsupported operating system. Please install Redis manually.${NC}"
        exit 1
    fi
}

# Function to install MinIO
install_minio() {
    echo -e "${BLUE}📦 Installing MinIO...${NC}"
    
    if command_exists minio; then
        echo -e "${GREEN}✅ MinIO is already installed${NC}"
        return
    fi
    
    # Download and install MinIO
    MINIO_VERSION="2024-01-16T16-07-38Z"
    MINIO_URL="https://dl.min.io/server/minio/release/linux-amd64/archive/minio.RELEASE.${MINIO_VERSION}"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget -O /tmp/minio "$MINIO_URL"
        chmod +x /tmp/minio
        sudo mv /tmp/minio /usr/local/bin/
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if command_exists brew; then
            brew install minio/stable/minio
        else
            echo -e "${YELLOW}⚠️  Please install MinIO manually from https://min.io/download${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Please install MinIO manually from https://min.io/download${NC}"
    fi
}

# Function to setup PostgreSQL
setup_postgresql() {
    echo -e "${BLUE}🔧 Setting up PostgreSQL...${NC}"
    
    # Start PostgreSQL service
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql@16
    fi
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE legal;" 2>/dev/null || echo -e "${YELLOW}⚠️  Database 'legal' might already exist${NC}"
    sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';" 2>/dev/null || echo -e "${YELLOW}⚠️  User 'postgres' might already exist${NC}"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE legal TO postgres;" 2>/dev/null || echo -e "${YELLOW}⚠️  Privileges might already be granted${NC}"
    
    echo -e "${GREEN}✅ PostgreSQL setup complete${NC}"
}

# Function to setup Redis
setup_redis() {
    echo -e "${BLUE}🔧 Setting up Redis...${NC}"
    
    # Start Redis service
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start redis
        sudo systemctl enable redis
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start redis
    fi
    
    echo -e "${GREEN}✅ Redis setup complete${NC}"
}

# Function to setup MinIO
setup_minio() {
    echo -e "${BLUE}🔧 Setting up MinIO...${NC}"
    
    # Create MinIO data directory
    sudo mkdir -p /opt/minio/data
    sudo chown $USER:$USER /opt/minio/data
    
    # Create MinIO configuration
    cat > ~/.minio/config.json << EOF
{
    "version": "1",
    "credentials": {
        "accessKey": "minio",
        "secretKey": "minio12345"
    }
}
EOF
    
    echo -e "${GREEN}✅ MinIO setup complete${NC}"
    echo -e "${YELLOW}⚠️  You'll need to start MinIO manually: minio server /opt/minio/data --console-address :9001${NC}"
}

# Function to create environment files
create_env_files() {
    echo -e "${BLUE}📝 Creating environment files...${NC}"
    
    # API environment file
    cat > apps/api/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/legal

# Server Configuration
PORT=4005
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio12345
MINIO_BUCKET_NAME=legal-documents
MINIO_USE_SSL=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
EOF

    # Web environment file
    cat > apps/web/.env.local << EOF
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4005/api/v1
EOF

    echo -e "${GREEN}✅ Environment files created${NC}"
}

# Function to create service management scripts
create_service_scripts() {
    echo -e "${BLUE}📝 Creating service management scripts...${NC}"
    
    # Start services script
    cat > scripts/start-services.sh << 'EOF'
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
EOF

    # Stop services script
    cat > scripts/stop-services.sh << 'EOF'
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
EOF

    # Make scripts executable
    chmod +x scripts/start-services.sh
    chmod +x scripts/stop-services.sh
    
    echo -e "${GREEN}✅ Service management scripts created${NC}"
}

# Main execution
main() {
    echo -e "${GREEN}🎯 LegalManager System Setup${NC}"
    echo "=================================="
    
    install_postgresql
    install_redis
    install_minio
    
    setup_postgresql
    setup_redis
    setup_minio
    
    create_env_files
    create_service_scripts
    
    echo ""
    echo -e "${GREEN}🎉 Setup complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "  1. Start services: ./scripts/start-services.sh"
    echo "  2. Install dependencies: pnpm install"
    echo "  3. Run migrations: cd apps/api && pnpm migration:run"
    echo "  4. Seed database: cd apps/api && pnpm seed"
    echo "  5. Start applications: pnpm dev"
    echo ""
    echo -e "${BLUE}📋 Service URLs:${NC}"
    echo "  - Web App: http://localhost:3005"
    echo "  - API: http://localhost:4005"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - MinIO: localhost:9000 (Console: localhost:9001)"
}

# Run main function
main
