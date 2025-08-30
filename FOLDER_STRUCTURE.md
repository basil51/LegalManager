
# Folder Structure

```
apps/
  web/   # Next.js app
  api/   # NestJS app
packages/
  ui/    # shared UI components
  i18n/  # shared i18n helpers
scripts/
  setup-system.sh      # System service setup
  start-services.sh    # Start system services
  stop-services.sh     # Stop system services
  dev.sh              # Development environment setup
  update-status.sh    # Update project status
```

Each app is deployed independently. Shared code lives in `packages/*`.

**Infrastructure Services** (System-based):
- PostgreSQL: localhost:5432
- Redis: localhost:6379  
- MinIO: localhost:9000
