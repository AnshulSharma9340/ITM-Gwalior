# ITM Gwalior — official website (CMS + RBAC)

Production rewrite of `itmgoi.in` as a modern stack:

- **Frontend** — React 19 + Vite + Tailwind + Framer Motion + React Query
- **Backend** — FastAPI + SQLAlchemy 2 + Alembic + PostgreSQL 16 + Redis 7
- **Auth** — JWT (access + refresh), Argon2id, 50-scope RBAC, 3-tier login
  (super-admin · scoped editor · student/faculty)
- **Storage** — S3-compatible object storage (Cloudflare R2 / Hostinger),
  Pillow-generated WebP variants
- **Deploy** — Docker Compose on a Hostinger VPS behind nginx + Let's Encrypt,
  GitHub Actions CI/CD, nightly encrypted DB backups

> **Master plan & rationale** → [`BACKEND_IMPLEMENTATION_PLAN.md`](./BACKEND_IMPLEMENTATION_PLAN.md)
> **Doc index** → [`docs/`](./docs)

---

## Quickstart (5 minutes)

You need: Docker, Node 20, Python 3.11.

```bash
# 1. Backend
cd backend
cp .env.example .env
docker compose up -d                 # api + postgres + redis + adminer
docker compose exec api alembic upgrade head
docker compose exec api python -m scripts.seed

# 2. Frontend
cd ../frontend
npm install
npm run dev                          # http://localhost:5173
```

- Public site: <http://localhost:5173>
- API docs:   <http://localhost:8000/api/docs>
- DB UI:      <http://localhost:8080>  (Adminer; server=db user=itm pass=itm db=itm)

Default super-admin: `admin / admin123` — **change on first login**.

## How it's organised

| Folder | What's in it |
|---|---|
| `backend/`  | FastAPI app (`app/`), alembic migrations, seed scripts, pytest suite, Dockerfile, dev compose |
| `frontend/` | Vite + React SPA, typed axios clients, React Query hooks, public + admin pages |
| `deploy/`   | `nginx.conf` · `docker-compose.prod.yml` · `backup.sh` · `DEPLOY.md` · `RESTORE.md` · `locustfile.py` |
| `docs/`     | `DEMO.md` · `ARCHITECTURE.md` · `RBAC.md` · `API.md` · `REQUIREMENT_COVERAGE.md` |
| `postman/`  | `itmgoi.postman_collection.json` |
| `.github/workflows/` | `ci.yml` + `deploy.yml` |

## Documentation index

| Doc | When to read it |
|---|---|
| [`BACKEND_IMPLEMENTATION_PLAN.md`](./BACKEND_IMPLEMENTATION_PLAN.md) | One-time: understand the original 12-phase plan and why each choice was made |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Big-picture diagram, folder layout, data model groups |
| [`docs/RBAC.md`](./docs/RBAC.md) | Roles + the full 50-scope registry + how endpoint protection works |
| [`docs/API.md`](./docs/API.md) | Quickstart with curl; the canonical reference is `/api/docs` |
| [`docs/DEMO.md`](./docs/DEMO.md) | 15-minute viva script you can run live |
| [`docs/REQUIREMENT_COVERAGE.md`](./docs/REQUIREMENT_COVERAGE.md) | Sign-off checklist — 29 user-stated requirements + go-live items |
| [`deploy/DEPLOY.md`](./deploy/DEPLOY.md) | Hostinger VPS runbook: DNS, SSL, first boot, GitHub Actions wiring |
| [`deploy/RESTORE.md`](./deploy/RESTORE.md) | Backup decrypt + restore + quarterly DR drill |
| [`backend/README.md`](./backend/README.md) | Backend dev quickstart, common alembic / pytest commands |

## Three-tier login

| Tier | Login form tab | Default test account |
|---|---|---|
| Super-admin (edits anything) | **Admin** | `admin / admin123` |
| Scoped editor (one or more `dept.cse`, `placements.tap`, … scopes) | **Admin** | `cs_editor / cs-editor@123`, `placement_editor / placement@123` |
| Faculty (read-only + own dashboard) | **Faculty** | `faculty@itmgoi.in / faculty@123` |
| Student (read-only + own dashboard) | **Student** | `ITM2022CS001 / ITM2022CS001` |

Created by `python -m scripts.seed` on a virgin database; idempotent on
subsequent runs.

## Common dev tasks

```bash
# Backend
cd backend
docker compose logs -f api
docker compose exec api alembic revision --autogenerate -m "add foo"
docker compose exec api alembic upgrade head
docker compose exec api python -m scripts.seed
docker compose exec api pytest tests
docker compose exec api ruff check .

# Frontend
cd frontend
npm run dev
npx eslint src/api src/hooks src/pages/admin
npm run build          # produces frontend/dist
```

## Production

See [`deploy/DEPLOY.md`](./deploy/DEPLOY.md). A push to `main` triggers
[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) which:

1. builds the API image and pushes it to GHCR with the commit SHA tag,
2. builds the React bundle as an artifact,
3. rsyncs the bundle to `/var/www/itmgoi/dist`,
4. SSHes to the VPS, runs `alembic upgrade head` and `scripts.seed`,
5. restarts only the API container,
6. health-checks before declaring success.

## License

Internal project for Institute of Technology and Management, Gwalior.

////