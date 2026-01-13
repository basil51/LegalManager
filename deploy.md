# LegalManager Deployment Guide

This guide covers deploying LegalManager to a VPS with Ubuntu, Docker, and Traefik.

## Prerequisites

- Ubuntu server with Docker and Docker Compose installed
- Traefik running at `~/web/traefik` with the `traefik` network
- Domain name configured (e.g., `sparkco.vip`)
- DNS records pointing to your VPS

## Step 1: Clone the Repository

```bash
cd ~/Projects
git clone <your-repo-url> LegalManager
cd LegalManager
```

## Step 2: Set Up Environment Variables

Create a `.env.prod` file in the project root:

```bash
cat > .env.prod << 'EOF'
# Base domain for production
BASE_DOMAIN=sparkco.vip

# Database configuration
POSTGRES_DB=legal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<STRONG_PASSWORD_HERE>

# Redis configuration
REDIS_PASSWORD=<STRONG_PASSWORD_HERE>

# MinIO configuration
MINIO_ROOT_USER=<STRONG_USERNAME_HERE>
MINIO_ROOT_PASSWORD=<STRONG_PASSWORD_HERE>
MINIO_BUCKET_NAME=legal-documents

# JWT configuration
JWT_SECRET=<STRONG_RANDOM_SECRET_HERE>
JWT_EXPIRES_IN=24h

# API allowed origins (comma-separated)
ALLOWED_ORIGINS=https://legal.sparkco.vip
EOF
```

**Important:** Replace all placeholder values with strong, random passwords and secrets.

## Step 3: Create Production Docker Compose File

The project uses `docker-compose.local.yml` for local development. For production, you can either:

**Option A:** Use the existing `docker-compose.traefik.yml` (if it exists) or create a production version.

**Option B:** Use `docker-compose.local.yml` with production environment variables.

For simplicity, we'll use `docker-compose.local.yml` with production env vars.

## Step 4: Build and Start Services

```bash
# Export BASE_DOMAIN for docker-compose
export BASE_DOMAIN=sparkco.vip

# Build and start all services
docker compose -f docker-compose.local.yml --env-file .env.prod up -d --build
```

This will:
- Build the API and Web containers
- Start PostgreSQL, Redis, and MinIO
- Connect services to the Traefik network
- Make the app available at `http://legal.sparkco.vip`

## Step 5: Run Database Migrations

Wait for all containers to be healthy, then run migrations:

```bash
# Copy migration script to container
docker cp apps/api/run-migrations-seed.js legal-api:/app/apps/api/

# Run migrations
docker exec legal-api sh -c 'cd /app/apps/api && node run-migrations-seed.js'
```

You should see: `✅ 11 migrations executed`

## Step 6: Seed Initial Data

```bash
# Copy seed script to container
docker cp apps/api/run-seed.js legal-api:/app/apps/api/

# Run seed script
docker exec legal-api sh -c 'cd /app/apps/api && node run-seed.js'
```

This creates:
- Default roles (admin, lawyer, assistant, client)
- A tenant named "Legal Firm"
- Test users:
  - `admin@legalfirm.com` / `password123` (admin role)
  - `lawyer1@legalfirm.com` / `password123` (lawyer role)

**⚠️ Security Note:** Change these default passwords immediately after first login!

## Step 7: Verify Deployment

1. **Check container status:**
   ```bash
   docker compose -f docker-compose.local.yml ps
   ```

2. **Check Traefik routes:**
   ```bash
   curl http://localhost/api/http/routers | grep -i legal
   ```

3. **Test the application:**
   - Open `https://legal.sparkco.vip` (or `http://legal.sparkco.vip` if not using HTTPS)
   - Login with `admin@legalfirm.com` / `password123`
   - Verify sidebar navigation links appear

## Step 8: Configure HTTPS (Optional but Recommended)

If your Traefik is configured with Let's Encrypt, update the docker-compose file to use HTTPS:

1. Update `docker-compose.local.yml` to use `websecure` entrypoint
2. Add TLS certificate resolver labels
3. Update `NEXT_PUBLIC_API_BASE_URL` to use `https://`

Example labels for production:
```yaml
labels:
  - "traefik.http.routers.legal.rule=Host(`legal.${BASE_DOMAIN}`)"
  - "traefik.http.routers.legal.entrypoints=websecure"
  - "traefik.http.routers.legal.tls.certresolver=letsencrypt"
```

## Step 9: Set Up Automatic Backups (Recommended)

Create a backup script for the database:

```bash
cat > ~/backup-legal-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups/legal
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker exec legal-postgres pg_dump -U postgres legal > $BACKUP_DIR/legal_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "legal_*.sql" -mtime +7 -delete
EOF

chmod +x ~/backup-legal-db.sh
```

Add to crontab for daily backups:
```bash
crontab -e
# Add: 0 2 * * * ~/backup-legal-db.sh
```

## Step 10: Monitor Logs

```bash
# View all logs
docker compose -f docker-compose.local.yml logs -f

# View specific service logs
docker compose -f docker-compose.local.yml logs -f api
docker compose -f docker-compose.local.yml logs -f web
```

## Troubleshooting

### Containers not starting
- Check logs: `docker compose -f docker-compose.local.yml logs`
- Verify Traefik network exists: `docker network ls | grep traefik`
- Check environment variables: `docker exec legal-api printenv`

### Sidebar links not showing
- Verify user has roles: Check database `user_roles` table
- Log out and log back in to refresh permissions
- Check browser console for errors

### API connection errors
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly in web container
- Check Traefik routes: `curl http://localhost/api/http/routers`
- Verify API is accessible: `curl http://legal.sparkco.vip/api/v1/health`

### Database connection errors
- Verify PostgreSQL is running: `docker ps | grep postgres`
- Check database credentials in `.env.prod`
- Verify network connectivity: `docker exec legal-api ping postgres`

## Updating the Application

```bash
cd ~/Projects/LegalManager
git pull
export BASE_DOMAIN=sparkco.vip
docker compose -f docker-compose.local.yml --env-file .env.prod up -d --build

# Run migrations if needed
docker cp apps/api/run-migrations-seed.js legal-api:/app/apps/api/
docker exec legal-api sh -c 'cd /app/apps/api && node run-migrations-seed.js'
```

## Security Checklist

- [ ] Changed all default passwords in `.env.prod`
- [ ] Changed default admin user password after first login
- [ ] Configured HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enabled automatic backups
- [ ] Configured log rotation
- [ ] Set up monitoring/alerting
- [ ] Restricted database access
- [ ] Updated `ALLOWED_ORIGINS` in environment

## Quick Reference

**Start services:**
```bash
export BASE_DOMAIN=sparkco.vip
docker compose -f docker-compose.local.yml --env-file .env.prod up -d
```

**Stop services:**
```bash
docker compose -f docker-compose.local.yml down
```

**View logs:**
```bash
docker compose -f docker-compose.local.yml logs -f
```

**Restart a service:**
```bash
docker compose -f docker-compose.local.yml restart web
```

**Access database:**
```bash
docker exec -it legal-postgres psql -U postgres -d legal
```

## Support

For issues or questions, check:
- Application logs: `docker compose -f docker-compose.local.yml logs`
- Traefik dashboard: `http://localhost/dashboard/` (if enabled)
- Database: `docker exec -it legal-postgres psql -U postgres -d legal`
