
# Operations (Dev)

## Prerequisites
- Node 18+ (tested with Node 22.16.0)
- pnpm 9+ (using pnpm 9.0.0)
- Docker & Docker Compose

## Quick Start
```bash
# Install dependencies
pnpm install

# Start infrastructure services
docker compose -f infra/docker-compose.dev.yml up -d

# Start applications (in separate terminals)
pnpm -F @legal/api dev    # API on http://localhost:4005
pnpm -F @legal/web dev    # Web on http://localhost:3005
```

## Environment Setup
Environment files are already configured:
- `apps/api/.env` - API configuration (PORT=4005, DATABASE_URL, etc.)
- `apps/web/.env.local` - Web app configuration (API_BASE_URL)

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

## Troubleshooting
- If port conflicts occur, check for existing services: `sudo lsof -i :PORT`
- Stop conflicting services: `sudo systemctl stop postgresql` (if needed)
- Restart Docker services: `docker compose -f infra/docker-compose.dev.yml restart`
