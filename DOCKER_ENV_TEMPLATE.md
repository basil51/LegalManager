# Docker Environment Variables Template

Copy these to `.env` file in the project root and fill with your values.

```bash
# ============================================
# Domain Configuration
# ============================================
TRAEFIK_DOMAIN=yourdomain.com
EMAIL=admin@yourdomain.com

# ============================================
# Database Configuration
# ============================================
POSTGRES_DB=legal
POSTGRES_USER=postgres
# Generate: openssl rand -base64 32
POSTGRES_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD

# ============================================
# JWT Configuration
# ============================================
# Generate: openssl rand -base64 64
JWT_SECRET=YOUR_STRONG_JWT_SECRET_MINIMUM_64_CHARACTERS
JWT_EXPIRES_IN=24h

# ============================================
# MinIO Configuration
# ============================================
# Generate: openssl rand -base64 32
MINIO_ROOT_USER=YOUR_STRONG_MINIO_USER
MINIO_ROOT_PASSWORD=YOUR_STRONG_MINIO_PASSWORD
MINIO_BUCKET_NAME=legal-documents

# ============================================
# Redis Configuration
# ============================================
# Generate: openssl rand -base64 32
REDIS_PASSWORD=YOUR_STRONG_REDIS_PASSWORD

# ============================================
# CORS Configuration
# ============================================
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Quick Setup

```bash
# 1. Copy this template
cp DOCKER_ENV_TEMPLATE.md .env

# 2. Generate passwords
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 32  # For other passwords

# 3. Edit .env with your values
nano .env
```

## Important Notes

- ⚠️ Never commit `.env` files to git
- 🔒 Use strong passwords (32+ characters)
- 🌐 Set `TRAEFIK_DOMAIN` to your actual domain
- 📧 Use a valid email for Let's Encrypt SSL
