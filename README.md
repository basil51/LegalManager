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
- 🚀 **System-Based Development**: Optimized for performance and debugging

## 🚀 Quick Start

### System-Based Development Setup
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
- `OPERATIONS-SYSTEM.md` - System-based development operations

## 🔄 Keeping Documentation Updated
Run the status update script to keep documentation current:
```bash
./scripts/update-status.sh
```

## 🛠️ Development Setup

### System-Based Development
- **Pros**: Faster performance, lower resource usage, better debugging
- **Cons**: Requires system setup, potential conflicts with existing services
- **Best for**: Individual developers, performance-focused development

## 🔧 Service Management

### Start Services
```bash
./scripts/start-services.sh
```

### Stop Services
```bash
./scripts/stop-services.sh
```

### Manual Service Control
```bash
# PostgreSQL
sudo systemctl start postgresql    # Linux
brew services start postgresql@16   # macOS

# Redis
sudo systemctl start redis         # Linux
brew services start redis          # macOS

# MinIO
minio server /opt/minio/data --console-address :9001 &
```

## 📚 Test Credentials
- **Admin**: admin@legalfirm.com / password123
- **Lawyer**: lawyer1@legalfirm.com / password123
