
# ROADMAP

## Phase 0 – Scaffolding ✅ COMPLETED
- ✅ Monorepo + pnpm workspace setup
- ✅ Next.js 14.2.15 + Tailwind CSS + next-intl 3.20.0 (stable versions)
- ✅ NestJS 11.1.6 + TypeORM + Swagger 11.2.0
- ✅ PostgreSQL 16, Redis 7, MinIO (S3-compatible)
- ✅ Base entities: tenants, users, roles, user_roles
- ✅ i18n routing with ICU locales (`en`, `ar`, `he`), RTL/LTR support
- ✅ Complete UI internationalization with all strings translated
- ✅ API health endpoints and documentation
- ✅ Authentication system (JWT-based login/register)
- ✅ Row Level Security (RLS) for multi-tenant isolation

## Phase 1 – Core Case Management ✅ COMPLETED
- ✅ **Core entities**: clients, cases, courts, sessions (database schema)
- ✅ **Row Level Security**: Multi-tenant isolation with RLS policies
- ✅ **Clients module**: Full CRUD operations with tenant isolation
- ✅ **Courts module**: Full CRUD operations with tenant isolation
- ✅ **Cases module**: Full CRUD operations with advanced filtering (by status, type, lawyer)
- ✅ **Sessions module**: Full CRUD operations with advanced filtering (by status, type, case, lawyer, upcoming)
- ✅ **Documents management**: Upload/download via MinIO with auth, metadata, tags
- ✅ **Appointments system**: Full CRUD with reminders, cron job processing, and notification system
- ✅ **Internal messaging system**: Full CRUD with threading, read status, and tenant isolation
- ✅ **Frontend API Integration**: Centralized API client with TypeScript interfaces
- ✅ **Cases Management UI**: List view with search, filtering, and navigation
- ✅ **Billing primitives**: Invoice and payment entities, API endpoints, and frontend UI

## Phase 1.5 – Frontend UI Development ✅ COMPLETED
- ✅ **Frontend Structure**: Simplified layouts and routing
- ✅ **API Integration Layer**: Centralized client with TypeScript interfaces
- ✅ **Cases Management**: Complete CRUD interface with list, create, edit forms
- ✅ **Clients Management**: Complete CRUD interface with list, create, edit forms
- ✅ **Documents Management**: Upload form wired to API, list/download
- ✅ **Calendar Enhancement**: Appointments integration with filtering and event management
- ✅ **Navigation & UX**: Complete user experience polish with role-based access control
- ✅ **Internationalization**: Complete translation coverage for all UI elements (English, Arabic, Hebrew)
- ✅ **RTL Support**: Full right-to-left language support for Arabic and Hebrew
- ✅ **GitHub Repository**: Project uploaded to https://github.com/basil51/LegalManager

## Phase 2 – Client Portal & Finance
- Client portal (messages, docs, invoices/payments)
- Trust accounting, statements, reconciliations
- Reports & analytics

## Phase 3 – Integrations & AI
- Calendar sync (Google/Outlook), e-signature
- AI translation fallback + review workflow
- Advanced search, OCR

## Phase 4 – Hardening
- Security audit, load tests, DR runbooks, SLO monitoring
