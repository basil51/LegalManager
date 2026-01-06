# Docker + Traefik Deployment Steps

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Domain name pointing to your server IP
- Ports 80, 443, 8080 open in firewall

### Step 1: Create Docker Network

```bash
docker network create web
```

### Step 2: Set Environment Variables

```bash
# Copy the example file
cp .env.docker.example .env

# Edit .env with your values
nano .env
```

**Required values:**
- `TRAEFIK_DOMAIN` - Your domain (e.g., `legalfirm.com`)
- `EMAIL` - Email for Let's Encrypt SSL
- `POSTGRES_PASSWORD` - Strong database password
- `JWT_SECRET` - Strong JWT secret (64+ chars)
- `MINIO_ROOT_USER` - MinIO username
- `MINIO_ROOT_PASSWORD` - MinIO password
- `REDIS_PASSWORD` - Redis password
- `ALLOWED_ORIGINS` - Your domain(s)

**Generate strong passwords:**
```bash
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 32  # For passwords
```

### Step 3: Update Domain in docker-compose.yml

Edit `docker-compose.yml` and replace `${TRAEFIK_DOMAIN:-yourdomain.com}` references if needed, or ensure `.env` has `TRAEFIK_DOMAIN` set.

### Step 4: Build Images

```bash
docker-compose build
```

This will build:
- API image (NestJS)
- Web image (Next.js)

### Step 5: Start Services

```bash
docker-compose up -d
```

This starts:
- Traefik (reverse proxy)
- PostgreSQL (database)
- Redis (cache)
- MinIO (object storage)
- API (backend)
- Web (frontend)

### Step 6: Check Service Status

```bash
# Check all services
docker-compose ps

# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs -f api
```

### Step 7: Run Database Migrations

```bash
# Wait for services to be healthy (30-60 seconds)
sleep 60

# Run migrations
docker-compose exec api pnpm migration:run
```

### Step 8: (Optional) Seed Database

```bash
docker-compose exec api pnpm seed
```

### Step 9: Verify Deployment

1. **Check Traefik Dashboard**: `http://your-server-ip:8080`
   - Should show all services as "UP"

2. **Check API Health**: `https://api.yourdomain.com/api/v1/health`
   - Should return `{"status":"ok"}`

3. **Check Web App**: `https://yourdomain.com`
   - Should load the application

4. **Check MinIO Console**: `https://minio.yourdomain.com`
   - Should show MinIO console

## 🔧 Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f traefik
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart api
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes Data)
```bash
docker-compose down -v
```

### Update and Rebuild
```bash
# Pull latest code
git pull

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d
```

### Access Container Shell
```bash
# API container
docker-compose exec api sh

# Database container
docker-compose exec postgres psql -U postgres -d legal
```

## 🔒 Security Checklist

- [ ] All passwords are strong (32+ characters)
- [ ] JWT_SECRET is 64+ characters
- [ ] Domain DNS points to server IP
- [ ] Firewall only allows ports 80, 443
- [ ] Traefik dashboard is secured or disabled
- [ ] SSL certificates are working (Let's Encrypt)
- [ ] Environment variables are not committed to git

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs [service-name]

# Check if ports are in use
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Check Docker network
docker network ls
docker network inspect web
```

### Database connection errors
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d legal
```

### Traefik routing issues
```bash
# Check Traefik logs
docker-compose logs traefik

# Verify labels in docker-compose.yml
# Check DNS resolution
nslookup yourdomain.com
```

### SSL certificate issues
```bash
# Check certificate storage
docker-compose exec traefik ls -la /certs

# Check Traefik logs for ACME errors
docker-compose logs traefik | grep acme
```

### Build failures
```bash
# Clean build
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -f apps/api/Dockerfile -t test-api .
```

## 📊 Monitoring

### Check Resource Usage
```bash
docker stats
```

### Check Service Health
```bash
# API health
curl https://api.yourdomain.com/api/v1/health

# Web health
curl https://yourdomain.com/en
```

## 🔄 Updates and Maintenance

### Update Application Code
```bash
git pull
docker-compose build
docker-compose up -d
docker-compose exec api pnpm migration:run
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres legal > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres legal < backup_20250101.sql
```

## 📝 Notes

1. **First Run**: SSL certificates may take a few minutes to generate
2. **DNS**: Ensure your domain DNS points to server IP before starting
3. **Firewall**: Only expose ports 80, 443 (and 8080 for dashboard if needed)
4. **Backups**: Set up regular database backups
5. **Updates**: Keep Docker images updated for security

---

**Status**: Ready to deploy
**Last Updated**: January 2025
