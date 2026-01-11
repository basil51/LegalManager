## Local (Traefik v3.2 + mkcert) — LegalManager

This project’s `docker-compose.yml` is production-oriented (it includes its own Traefik + Let’s Encrypt).

For local dev, we use the **shared Traefik** stack:
- Traefik: `../traefik-local` (v3.2)
- Domains:
  - `https://app.localhost`
  - `https://api.localhost`
  - Traefik dashboard: `https://traefik.localhost`

### 1) One-time laptop setup (if not done yet)

- External Docker network:

```bash
docker network create web || true
```

- `/etc/hosts` entries:

```text
127.0.0.1   app.localhost
127.0.0.1   api.localhost
127.0.0.1   traefik.localhost
```

- mkcert certs for local HTTPS (run from `../traefik-local`):

```bash
sudo apt install -y mkcert libnss3-tools
mkcert -install
cd ../traefik-local
mkdir -p certs
mkcert -cert-file ./certs/local.pem -key-file ./certs/local-key.pem app.localhost api.localhost traefik.localhost
```

### 2) Start Traefik (shared)

```bash
cd ../traefik-local
cp env.local.example env.local
docker compose --env-file env.local up -d
```

### 3) Start LegalManager (local compose)

```bash
cd ../LegalManager
docker compose -f docker-compose.local.yml up -d --build
```

### 4) Verify

- Web: `https://app.localhost`
- API: `https://api.localhost/api/v1/health`
- Traefik: `https://traefik.localhost`

