# Production Environment Variables Template

## ⚠️ CRITICAL: Set these before deploying!

Copy these to `apps/api/.env` and fill with STRONG, UNIQUE values.

```bash
# ============================================
# Database Configuration
# ============================================
# Generate strong password: openssl rand -base64 32
DATABASE_URL=postgresql://username:STRONG_PASSWORD_HERE@localhost:5432/legal_production

# ============================================
# Server Configuration
# ============================================
PORT=4005
NODE_ENV=production

# ============================================
# JWT Configuration
# ============================================
# Generate strong secret: openssl rand -base64 64
# MUST be at least 64 characters!
JWT_SECRET=YOUR_STRONG_JWT_SECRET_HERE_MINIMUM_64_CHARACTERS
JWT_EXPIRES_IN=24h

# ============================================
# MinIO Configuration
# ============================================
# Generate strong credentials: openssl rand -base64 32
# DO NOT use default values (minio/minio12345)!
MINIO_ENDPOINT=your-minio-server.com
MINIO_PORT=9000
MINIO_ACCESS_KEY=YOUR_STRONG_ACCESS_KEY_HERE
MINIO_SECRET_KEY=YOUR_STRONG_SECRET_KEY_HERE
MINIO_BUCKET_NAME=legal-documents
MINIO_USE_SSL=true

# ============================================
# Redis Configuration
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379

# ============================================
# CORS Configuration
# ============================================
# Comma-separated list of allowed origins
# Example: https://yourdomain.com,https://www.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ============================================
# Security Options
# ============================================
# Set to false to disable registration (recommended)
ALLOW_REGISTRATION=false
```

## Quick Setup Commands

```bash
# Generate JWT Secret (64+ characters)
openssl rand -base64 64

# Generate Database Password
openssl rand -base64 32

# Generate MinIO Credentials
openssl rand -base64 32
```

## ⚠️ IMPORTANT NOTES

1. **NEVER commit `.env` files** - They are in `.gitignore`
2. **Use different secrets for each environment** (dev, staging, production)
3. **Rotate secrets regularly** (every 90 days recommended)
4. **The application will FAIL to start** if default credentials are used
5. **This is intentional** - it prevents accidental deployment with weak security
