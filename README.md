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

## Quick Start

```bash
# Install dependencies
pnpm install

# Start infrastructure services
docker compose -f infra/docker-compose.dev.yml up -d

# Start applications
pnpm -F @legal/api dev
pnpm -F @legal/web dev
```

## 🌐 Access Points
- **Web App**: http://localhost:3000/en (redirects to English by default)
- **API**: http://localhost:4003/api/v1 (Swagger docs at /docs)
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
- `OPERATIONS.md` - Development operations guide

## 🔄 Keeping Documentation Updated
Run the status update script to keep documentation current:
```bash
./scripts/update-status.sh
```
