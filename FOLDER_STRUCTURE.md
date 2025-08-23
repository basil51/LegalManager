
# Folder Structure

```
apps/
  web/   # Next.js app
  api/   # NestJS app
packages/
  ui/    # shared UI components
  i18n/  # shared i18n helpers
infra/
  docker-compose.dev.yml
```

Each app is deployed independently. Shared code lives in `packages/*`.
