# Docker + Traefik Deployment Guide

## 📋 Overview

This guide will help you deploy the Legal Manager application using Docker and Traefik as a reverse proxy.

## 🏗️ Architecture

```
Internet
   ↓
Traefik (Reverse Proxy + SSL)
   ↓
├── Web App (Next.js) - Port 3005
├── API (NestJS) - Port 4005
├── PostgreSQL - Port 5432
├── Redis - Port 6379
└── MinIO - Ports 9000, 9001
```

## 📦 What We'll Create

1. **Dockerfile** for API (NestJS)
2. **Dockerfile** for Web (Next.js)
3. **docker-compose.yml** - All services orchestration
4. **Traefik configuration** - Reverse proxy setup
5. **Environment files** - Production configuration
6. **.dockerignore** files - Optimize builds

## 🚀 Deployment Steps

### Step 1: Create Dockerfiles
- [x] API Dockerfile (multi-stage build)
- [x] Web Dockerfile (multi-stage build)
- [x] .dockerignore files

### Step 2: Create Docker Compose
- [x] docker-compose.yml with all services
- [x] Network configuration
- [x] Volume mounts
- [x] Environment variables

### Step 3: Traefik Configuration
- [x] Traefik service in docker-compose
- [x] Dynamic configuration
- [x] SSL/HTTPS setup
- [x] Routing rules

### Step 4: Environment Setup
- [x] Production .env files
- [x] Traefik environment
- [x] Service environment variables

### Step 5: Build and Deploy
- [ ] Build images
- [ ] Start services
- [ ] Verify deployment
- [ ] Run migrations
- [ ] Seed database (optional)

## 📁 File Structure

```
LegalManager/
├── docker/
│   ├── traefik/
│   │   └── traefik.yml
│   └── traefik/
│       └── dynamic/
│           └── middleware.yml
├── apps/
│   ├── api/
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   └── web/
│       ├── Dockerfile
│       └── .dockerignore
├── docker-compose.yml
├── .env.production
└── DEPLOY_DOCKER_TRAEFIK.md (this file)
```

## 🔧 Configuration Details

### Traefik Labels (for services)
- `traefik.enable=true` - Enable Traefik
- `traefik.http.routers.{service}.rule=Host(...)` - Domain routing
- `traefik.http.routers.{service}.entrypoints=websecure` - HTTPS
- `traefik.http.routers.{service}.tls.certresolver=letsencrypt` - SSL

### Network
- All services on `legal-network`
- Traefik on `web` network (external)

### Volumes
- PostgreSQL data: `postgres_data`
- MinIO data: `minio_data`
- Traefik config: `traefik_config`
- Traefik certs: `traefik_certs`

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **SSL/TLS**: Use Let's Encrypt for production
3. **Network Isolation**: Services communicate internally
4. **Secrets**: Use Docker secrets or environment files
5. **Firewall**: Only expose Traefik ports (80, 443)

## 📝 Environment Variables Needed

### API (.env)
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Strong secret
- `MINIO_ACCESS_KEY` - MinIO access
- `MINIO_SECRET_KEY` - MinIO secret
- `REDIS_HOST` - Redis hostname
- `ALLOWED_ORIGINS` - CORS origins

### Web (.env.local)
- `NEXT_PUBLIC_API_BASE_URL` - API URL

### Traefik
- `TRAEFIK_DOMAIN` - Your domain
- `EMAIL` - For Let's Encrypt

## 🎯 Quick Start Commands

```bash
# 1. Create environment files
cp PRODUCTION_ENV_TEMPLATE.md apps/api/.env
# Edit .env with your values

# 2. Set domain in docker-compose.yml
# Edit TRAEFIK_DOMAIN variable

# 3. Build and start
docker-compose build
docker-compose up -d

# 4. Run migrations
docker-compose exec api pnpm migration:run

# 5. Check logs
docker-compose logs -f
```

## 🔍 Verification

1. **Check services**: `docker-compose ps`
2. **Check Traefik dashboard**: `http://your-domain:8080`
3. **Test API**: `https://api.your-domain/api/v1/health`
4. **Test Web**: `https://your-domain`

## 🐛 Troubleshooting

### Services won't start
- Check environment variables
- Check port conflicts
- Check Docker logs: `docker-compose logs [service]`

### Traefik routing issues
- Check labels in docker-compose.yml
- Verify domain DNS points to server
- Check Traefik logs: `docker-compose logs traefik`

### Database connection errors
- Verify DATABASE_URL format
- Check PostgreSQL is running
- Verify network connectivity

## 📚 Next Steps After Deployment

1. Set up monitoring (optional)
2. Configure backups
3. Set up CI/CD (optional)
4. Enable logging aggregation
5. Set up alerts

---

**Status**: Ready to implement
**Last Updated**: January 2025
