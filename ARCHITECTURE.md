
# Architecture

```mermaid
flowchart LR
  subgraph Web[Next.js Web]
    UI[UI + Tailwind + next-intl]
  end

  subgraph API[NestJS API]
    C(Controllers)
    S(Services)
    R(Repositories/ORM)
  end

  UI <-- REST/JSON --> C
  C --> S
  S --> R
  R --> PG[(PostgreSQL)]
  S --> REDIS[(Redis)]
  S --> S3[(S3/MinIO)]
```

- **Internationalization:** ICU JSON per locale; `/[locale]/...` routing
- **Security:** RBAC, audit logs (planned), HTTPS, JWT/session (TBD)
- **Scalability:** API stateless, queue for jobs (BullMQ planned), CDN for static
