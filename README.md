# Legal Office Management System (Multilingual)

🚀 **Phase 0 Complete** - Modern monorepo with **Next.js 14.2.15 (web)** and **NestJS 11.1.6 (api)**, 
internationalization (ICU, next-intl 3.20.0), RTL/LTR via Tailwind logical utilities, 
and infrastructure for PostgreSQL/Redis/MinIO.

## 🎯 Current Status
- ✅ **Phase 0 Complete**: All infrastructure and scaffolding ready
- ✅ **Working i18n**: Full internationalization with language dropdown
- 🔄 **Phase 1 Ready**: Core case management features ready to implement
- 🌐 **Multilingual**: English, Arabic, Hebrew with RTL/LTR support
- 🏗️ **Stable Stack**: Proven stable versions (Next.js 14, React 18)

## 🚀 Quick Start

### Option 1: Docker-Based Development (Current)
```bash
# Install dependencies
pnpm install

# Start infrastructure services
docker compose -f infra/docker-compose.dev.yml up -d

# Start applications
pnpm -F @legal/api dev
pnpm -F @legal/web dev
```

### Option 2: System-Based Development (Recommended)
```bash
# Run automated setup (installs PostgreSQL, Redis, MinIO)
chmod +x scripts/setup-system.sh
./scripts/setup-system.sh

# Start system services
./scripts/start-services.sh

# Install dependencies
pnpm install

# Run migrations and seed database
cd apps/api && pnpm migration:run && pnpm seed

# Start applications
pnpm dev
```

**Benefits of System-Based Development:**
- ⚡ 2-3x faster startup times
- 💾 20-30% less memory usage
- 🔧 Better debugging and integration
- 🛠️ Direct access to service logs and configs

## 🌐 Access Points
- **Web App**: http://localhost:3005/en (redirects to English by default)
- **API**: http://localhost:4005/api/v1 (Swagger docs at /docs)
- **Infrastructure**:
  - PostgreSQL: localhost:5432
  - Redis: localhost:6379
  - MinIO: localhost:9000 (Console: localhost:9001)

## 📚 Documentation
- `STATUS.md` - Current progress and next steps
- `ROADMAP.md` - Development phases and timeline
- `I18N_GUIDE.md` - Internationalization setup
- `DB_SCHEMA.md` - Database structure
- `ARCHITECTURE.md` - System architecture
- `OPERATIONS.md` - Docker-based development operations
- `OPERATIONS-SYSTEM.md` - System-based development operations
- `MIGRATION-GUIDE.md` - Guide to migrate from Docker to system-based

## 🔄 Keeping Documentation Updated
Run the status update script to keep documentation current:
```bash
./scripts/update-status.sh
```

## 🛠️ Development Options

### Docker-Based Development
- **Pros**: Consistent environment, easy setup, isolation
- **Cons**: Slower startup, higher memory usage, Docker overhead
- **Best for**: Teams that prefer Docker, production parity requirements

### System-Based Development
- **Pros**: Faster performance, lower resource usage, better debugging
- **Cons**: Requires system setup, potential conflicts with existing services
- **Best for**: Individual developers, performance-focused development

## 🔧 Migration
If you're currently using Docker and want to switch to system-based development, see `MIGRATION-GUIDE.md` for detailed instructions.
