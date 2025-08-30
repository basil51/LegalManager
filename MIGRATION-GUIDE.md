# Migration Guide: Docker to System-Based Development

This guide will help you migrate your LegalManager project from Docker-based development to system-based development.

## Why Migrate?

### Benefits of System-Based Development
- **Faster startup times** (2-3x faster)
- **Lower memory usage** (20-30% less)
- **Better performance** (direct file system access)
- **Easier debugging** (direct access to logs and configs)
- **Better integration** with system tools
- **No Docker overhead**

### When to Stay with Docker
- **Team consistency** (if team prefers Docker)
- **Production parity** (if you need exact production environment)
- **Isolation requirements** (if you need complete isolation)

## Pre-Migration Checklist

### 1. Backup Your Data
```bash
# Export PostgreSQL data
docker exec -it legalmanager-db-1 pg_dump -U postgres legal > docker_backup_$(date +%Y%m%d_%H%M%S).sql

# Export MinIO data (if needed)
docker cp legalmanager-minio-1:/data ./minio_backup_$(date +%Y%m%d_%H%M%S)
```

### 2. Check System Requirements
```bash
# Check Node.js version
node --version  # Should be 18+

# Check pnpm version
pnpm --version  # Should be 9+

# Check available disk space
df -h  # Should have at least 5GB free
```

### 3. Stop Docker Services
```bash
# Stop all Docker services
docker compose -f infra/docker-compose.dev.yml down

# Verify services are stopped
docker ps  # Should show no running containers
```

## Migration Steps

### Step 1: Run Automated Setup
```bash
# Make setup script executable
chmod +x scripts/setup-system.sh

# Run the setup script
./scripts/setup-system.sh
```

The setup script will:
- Install PostgreSQL, Redis, and MinIO on your system
- Configure services with development-friendly settings
- Create environment files
- Set up service management scripts

### Step 2: Start System Services
```bash
# Start all infrastructure services
./scripts/start-services.sh
```

### Step 3: Restore Data (Optional)
If you want to restore your Docker data:

```bash
# Restore PostgreSQL data
psql -h localhost -U postgres -d legal < docker_backup_YYYYMMDD_HHMMSS.sql

# Restore MinIO data (if needed)
cp -r ./minio_backup_YYYYMMDD_HHMMSS/* /opt/minio/data/
```

### Step 4: Verify Setup
```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d legal -c "SELECT version();"

# Test Redis connection
redis-cli ping  # Should return PONG

# Test MinIO (if using)
curl http://localhost:9000/minio/health/live
```

### Step 5: Start Applications
```bash
# Install dependencies (if not already done)
pnpm install

# Run database migrations
cd apps/api && pnpm migration:run

# Seed database (if needed)
cd apps/api && pnpm seed

# Start applications
pnpm dev
```

## Post-Migration Verification

### 1. Check Service Status
```bash
# PostgreSQL
sudo systemctl status postgresql

# Redis
sudo systemctl status redis

# MinIO
pgrep -f "minio server"
```

### 2. Test Application Functionality
- Open http://localhost:3005/en
- Login with test credentials
- Test basic functionality (create case, upload document, etc.)
- Check API endpoints at http://localhost:4005/api/v1

### 3. Verify Performance
```bash
# Check startup times
time ./scripts/start-services.sh

# Check memory usage
ps aux | grep -E "(postgres|redis|minio)"
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using the ports
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :6379  # Redis
sudo lsof -i :9000  # MinIO

# Stop conflicting services
sudo systemctl stop postgresql  # If system PostgreSQL is running
sudo systemctl stop redis       # If system Redis is running
```

#### 2. Permission Issues
```bash
# Fix PostgreSQL permissions
sudo chown -R postgres:postgres /var/lib/postgresql
sudo chmod 700 /var/lib/postgresql/data

# Fix MinIO permissions
sudo chown -R $USER:$USER /opt/minio/data
```

#### 3. Database Connection Issues
```bash
# Test connection
psql -h localhost -U postgres -d legal

# Reset password if needed
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

#### 4. Service Won't Start
```bash
# Check service logs
sudo journalctl -u postgresql -f
sudo journalctl -u redis -f

# Restart services
sudo systemctl restart postgresql
sudo systemctl restart redis
```

### Rollback Plan

If you need to rollback to Docker:

```bash
# Stop system services
./scripts/stop-services.sh

# Start Docker services
docker compose -f infra/docker-compose.dev.yml up -d

# Restore Docker data (if needed)
docker exec -i legalmanager-db-1 psql -U postgres legal < docker_backup_YYYYMMDD_HHMMSS.sql
```

## Performance Comparison

### Startup Times
- **Docker**: 30-60 seconds
- **System**: 10-20 seconds

### Memory Usage
- **Docker**: ~800MB-1.2GB
- **System**: ~500MB-800MB

### Disk I/O
- **Docker**: Overhead from containerization
- **System**: Direct file system access

## Maintenance

### Regular Tasks
```bash
# Check service status weekly
./scripts/start-services.sh  # Shows status

# Backup database weekly
pg_dump -h localhost -U postgres legal > backup_$(date +%Y%m%d).sql

# Update system packages monthly
sudo apt update && sudo apt upgrade  # Ubuntu/Debian
brew update && brew upgrade          # macOS
```

### Service Updates
```bash
# Update PostgreSQL
sudo apt update && sudo apt upgrade postgresql  # Ubuntu/Debian
brew upgrade postgresql@16                      # macOS

# Update Redis
sudo apt update && sudo apt upgrade redis       # Ubuntu/Debian
brew upgrade redis                              # macOS

# Update MinIO
wget -O /tmp/minio https://dl.min.io/server/minio/release/linux-amd64/minio
sudo mv /tmp/minio /usr/local/bin/
```

## Support

If you encounter issues during migration:

1. **Check the troubleshooting section** above
2. **Review service logs** for error messages
3. **Verify system requirements** are met
4. **Consider rolling back** to Docker if needed

## Next Steps

After successful migration:

1. **Update your development workflow** to use system services
2. **Configure your IDE** for better integration
3. **Set up monitoring** for system services
4. **Document team procedures** for the new setup
