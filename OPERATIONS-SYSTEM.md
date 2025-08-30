# Operations (System-Based Development)

## Prerequisites
- Node 18+ (tested with Node 22.16.0)
- pnpm 9+ (using pnpm 9.0.0)
- PostgreSQL 16
- Redis 7
- MinIO (optional - for file storage)

## Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated setup script
chmod +x scripts/setup-system.sh
./scripts/setup-system.sh
```

### Option 2: Manual Setup
If you prefer to install services manually:

#### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install MinIO
wget -O /tmp/minio https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x /tmp/minio
sudo mv /tmp/minio /usr/local/bin/
```

#### macOS
```bash
# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Install Redis
brew install redis
brew services start redis

# Install MinIO
brew install minio/stable/minio
```

## Quick Start
```bash
# Start infrastructure services
./scripts/start-services.sh

# Install dependencies
pnpm install

# Run database migrations
cd apps/api && pnpm migration:run

# Seed the database
cd apps/api && pnpm seed

# Start applications (in separate terminals)
pnpm -F @legal/api dev    # API on http://localhost:4005
pnpm -F @legal/web dev    # Web on http://localhost:3005
```

## Environment Setup
The setup script creates these environment files:
- `apps/api/.env` - API configuration (PORT=4005, DATABASE_URL, etc.)
- `apps/web/.env.local` - Web app configuration (API_BASE_URL)

## Service Management

### Start Services
```bash
./scripts/start-services.sh
```

### Stop Services
```bash
./scripts/stop-services.sh
```

### Manual Service Control

#### PostgreSQL
```bash
# Start
sudo systemctl start postgresql    # Linux
brew services start postgresql@16   # macOS

# Stop
sudo systemctl stop postgresql     # Linux
brew services stop postgresql@16    # macOS

# Status
sudo systemctl status postgresql   # Linux
brew services list | grep postgres # macOS
```

#### Redis
```bash
# Start
sudo systemctl start redis         # Linux
brew services start redis          # macOS

# Stop
sudo systemctl stop redis          # Linux
brew services stop redis           # macOS

# Status
sudo systemctl status redis        # Linux
brew services list | grep redis    # macOS
```

#### MinIO
```bash
# Start
minio server /opt/minio/data --console-address :9001 &

# Stop
pkill -f "minio server"

# Status
pgrep -f "minio server"
```

## Service Access
- **Web App**: http://localhost:3005/en
- **API**: http://localhost:4005/api/v1
- **API Docs**: http://localhost:4005/api/v1/docs
- **PostgreSQL**: localhost:5432 (user: `postgres`, password: `postgres`, db: `legal`)
- **Redis**: localhost:6379
- **MinIO**: localhost:9000 (Console: localhost:9001, user: `minio`, password: `minio12345`)

## Development Commands
```bash
# Run all apps in parallel
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Format all packages
pnpm format
```

# Database Management

## Migrations
```bash
# Generate new migration
cd apps/api && pnpm migration:generate -- -n MigrationName

# Run migrations
cd apps/api && pnpm migration:run

# Revert last migration
cd apps/api && pnpm migration:revert
```

## Seeding
```bash
# Seed the database
cd apps/api && pnpm seed
```

## Database Access
```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d legal

# List tables
\dt

# View table structure
\d table_name

# Exit
\q
```

## Troubleshooting

### Port Conflicts
If you get port conflicts, check for existing services:
```bash
# Check what's using a port
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :6379  # Redis
sudo lsof -i :9000  # MinIO
sudo lsof -i :4005  # API
sudo lsof -i :3005  # Web
```

### Stop Conflicting Services
```bash
# Stop system PostgreSQL if conflicting
sudo systemctl stop postgresql

# Stop system Redis if conflicting
sudo systemctl stop redis
```

### Service Status
```bash
# Check all service statuses
./scripts/start-services.sh  # This will show status and start if needed
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d legal -c "SELECT version();"

# Reset PostgreSQL password if needed
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### MinIO Issues
```bash
# Check MinIO status
pgrep -f "minio server"

# Restart MinIO
pkill -f "minio server"
minio server /opt/minio/data --console-address :9001 &

# Check MinIO logs
tail -f ~/.minio/logs/minio.log
```

## Performance Benefits

### System vs Docker Performance
- **Startup Time**: 2-3x faster (no Docker overhead)
- **Memory Usage**: 20-30% less memory usage
- **Disk I/O**: Better performance (direct file system access)
- **Network**: Lower latency (no Docker networking overhead)

### Development Experience
- **Logs**: Direct access to service logs
- **Debugging**: Easier debugging with system tools
- **Configuration**: Direct access to service configs
- **Integration**: Better integration with system tools

## Migration from Docker

If you're currently using Docker and want to migrate:

1. **Stop Docker services**:
   ```bash
   docker compose -f infra/docker-compose.dev.yml down
   ```

2. **Export data** (if needed):
   ```bash
   # Export PostgreSQL data
   docker exec -it legalmanager-db-1 pg_dump -U postgres legal > backup.sql
   
   # Import to system PostgreSQL
   psql -h localhost -U postgres -d legal < backup.sql
   ```

3. **Run system setup**:
   ```bash
   ./scripts/setup-system.sh
   ```

4. **Start system services**:
   ```bash
   ./scripts/start-services.sh
   ```

## Backup and Restore

### Database Backup
```bash
# Create backup
pg_dump -h localhost -U postgres legal > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U postgres legal < backup_file.sql
```

### MinIO Backup
```bash
# Backup MinIO data
cp -r /opt/minio/data /backup/minio_$(date +%Y%m%d_%H%M%S)

# Restore MinIO data
cp -r /backup/minio_backup /opt/minio/data
```

## Security Considerations

### Production vs Development
- The setup script creates development-friendly configurations
- For production, consider:
  - Stronger passwords
  - SSL/TLS encryption
  - Firewall rules
  - Regular backups
  - Service monitoring

### Environment Variables
- JWT_SECRET should be changed in production
- Database passwords should be strong
- Consider using environment-specific configs
