# Backend Implementation Plan — Admin/Editor RBAC + Visual Page Editor (Backend Only)

Scope: backend (FastAPI + Postgres) only. The frontend (React/Vite) visual editor is being built by another developer; this document defines every API/contract they will consume.

Repo: https://github.com/ITMGWALIOR/ITM_GOI_BACKEND
Base branch: `main`
Working branch suggestion: `feat/admin-editor-v2`

---

## 1. Goals

1. Close 4 RBAC gaps in the existing scope system:
   - Add `seo.edit`, `analytics.view`, `blog.posts` scopes.
   - Add reusable **scope presets** so creating an Editor user takes one click instead of 20.
2. Make every page on the site editable in real time from the admin panel by exposing **per-section** draft/publish endpoints.
3. Add a minimal `Posts` model + CRUD to back a future blog.
4. Add an analytics summary endpoint the admin dashboard can render.
5. Index the existing frontend pages into the DB so the visual editor has something to load.

## 2. Non-goals (out of scope for v1)

- Live multi-user collaborative editing (no WebSockets, no OT/CRDT).
- Section version history beyond `payload` + `payload_draft`.
- Plugins / theme marketplace.
- Wiring real Plausible/GA — analytics endpoint returns numbers from our own audit + form tables only.

## 3. Existing foundation we are building on

| Already exists | File |
|---|---|
| `User` (roles: super_admin, editor, faculty, student) | `app/models/user.py` |
| `Scope`, `UserScope` many-to-many | `app/models/user.py` |
| `AuditLog`, `RefreshToken`, `LoginAttempt` | `app/models/user.py` |
| `Page`, `PageSection` (one row per editable slot, JSON payload) | `app/models/cms.py` |
| `NavMenu`, `NavItem` | `app/models/cms.py` |
| `MediaAsset`, `Setting` | `app/models/content.py` |
| 50-scope registry + `super_admin` bypass + `require(...)` dep | `app/core/rbac.py`, `app/deps.py` |
| Auth, media upload, public read APIs | `app/routers/*` |

The `Page` + `PageSection(kind, payload JSON)` shape is already perfect for a visual editor. We need a **draft column**, **granular per-section endpoints**, and the four scope/role additions.

---

## 4. Phases & deliverables

### Phase 1 — Scope, preset, and role additions (~4h)

#### 1A. New scope keys
File: `app/core/rbac.py`

Append to `SCOPES` tuple:

```python
ScopeDef("seo.edit",        "SEO / Meta",      "Per-page title, description, og:image, canonical"),
ScopeDef("analytics.view",  "Analytics",       "Read admin analytics summary"),
ScopeDef("blog.posts",      "Blog Posts",      "Create, edit, and publish blog posts"),
```

#### 1B. Scope presets

New model `app/models/scope_preset.py`:

```python
class ScopePreset(Base, TimestampMixin):
    __tablename__ = "scope_presets"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(64), unique=True, index=True)   # e.g. "editor_default"
    label: Mapped[str] = mapped_column(String(128))
    description: Mapped[str | None] = mapped_column(String(512))
    scope_keys: Mapped[list[str]] = mapped_column(JSON, default=list)       # ["site.pages","gallery",...]
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)         # cannot be deleted
```

Seed via `scripts/seed_scope_presets.py`:

| Preset key | Includes scopes |
|---|---|
| `editor_default` | `site.pages`, `gallery`, `seo.edit`, `forms.contact`, `notices`, `events.cultural`, `events.pac` |
| `dept_editor_cse` | `dept.cse`, `gallery`, `seo.edit` |
| `dept_editor_ece` | `dept.ece`, `gallery`, `seo.edit` |
| `dept_editor_it` | `dept.it`, `gallery`, `seo.edit` |
| `dept_editor_ce` | `dept.ce`, `gallery`, `seo.edit` |
| `dept_editor_me` | `dept.me`, `gallery`, `seo.edit` |
| `dept_editor_mba` | `dept.mba`, `gallery`, `seo.edit` |
| `dept_editor_esh` | `dept.esh`, `gallery`, `seo.edit` |
| `admissions_team` | `admissions.content`, `admissions.leads`, `forms.contact`, `seo.edit` |
| `placement_team` | `placements.tap`, `gallery`, `seo.edit` |
| `research_team` | `research.rdcell`, `research.publications`, `research.journal`, `research.conference`, `research.fdp`, `research.innovation`, `seo.edit` |
| `compliance_team` | `compliance.naac`, `compliance.nirf`, `compliance.committees`, `compliance.policies` |
| `alumni_team` | `alumni.speaks`, `alumni.chapters`, `alumni.mentorship`, `alumni.membership` |
| `careers_team` | `careers.positions`, `careers.applications`, `careers.jrf` |
| `analytics_viewer` | `analytics.view` |

`is_system=true` for all of the above so they can't be accidentally deleted.

#### 1C. Endpoints

New router `app/routers/scope_presets.py`:

```
GET    /api/scope-presets                    super_admin    list all presets
GET    /api/scope-presets/{key}              super_admin    detail
POST   /api/scope-presets                    super_admin    create custom preset
PATCH  /api/scope-presets/{key}              super_admin    edit (system presets: 409)
DELETE /api/scope-presets/{key}              super_admin    delete (system presets: 409)
POST   /api/users/{user_id}/scopes/apply-preset    super_admin   body: {preset_key, mode: "replace"|"add"}
```

Existing `users.py` gains the apply-preset action; it writes an `AuditLog` row per scope grant.

#### 1D. Migration

`alembic/versions/0009_scopes_and_presets.py`:
- `INSERT` `seo.edit`, `analytics.view`, `blog.posts` into `scopes` table.
- `CREATE TABLE scope_presets` (id, key uniq, label, description, scope_keys jsonb, is_system bool, timestamps).
- Data migration that calls the seed function to populate the 15 built-in presets.

---

### Phase 2 — Per-section draft + publish API (~6h)

This is the meat of the visual editor backend.

#### 2A. Add draft column

Migration `alembic/versions/0010_page_section_drafts.py`:
- `ALTER TABLE page_sections ADD COLUMN payload_draft JSON NULL`
- `ALTER TABLE page_sections ADD COLUMN draft_updated_at TIMESTAMPTZ NULL`
- `ALTER TABLE page_sections ADD COLUMN draft_updated_by_user_id INT NULL REFERENCES users(id) ON DELETE SET NULL`
- `ALTER TABLE pages ADD COLUMN seo_payload JSON NULL`   (title_override, description, og_image_id, canonical, robots, schema_jsonld)
- `ALTER TABLE pages ADD COLUMN seo_payload_draft JSON NULL`

Update `app/models/cms.py` accordingly.

#### 2B. Admin pages router

New router `app/routers/admin_pages.py` mounted at `/api/admin/pages`. Every endpoint requires `super_admin` OR the page's `scope_key`.

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| GET | `/api/admin/pages` | — | `[{id, key, path, title, status, scope_key, has_draft, last_modified}]` | search via `?q=`, paginate |
| GET | `/api/admin/pages/{key}/edit` | — | full page object (see schema below) | merged draft view |
| PATCH | `/api/admin/pages/{key}/meta` | `{title?, hero_image_id?, intro_md?, seo_payload?}` | updated page | requires `site.pages` for non-seo fields, `seo.edit` for seo_payload |
| PATCH | `/api/admin/pages/{key}/sections/{section_key}` | `{payload, label?, is_active?}` | updated section | writes to `payload_draft`, NOT `payload` |
| POST | `/api/admin/pages/{key}/sections` | `{section_key, kind, label?, position?, payload?}` | new section | created with payload_draft only |
| DELETE | `/api/admin/pages/{key}/sections/{section_key}` | — | 204 | soft = `is_active=false`, hard via `?hard=true` |
| PATCH | `/api/admin/pages/{key}/sections/reorder` | `{order: [{section_key, position}]}` | updated list | bulk |
| POST | `/api/admin/pages/{key}/publish` | — | `{published_at}` | copies `payload_draft → payload`, nulls draft, same for page seo |
| POST | `/api/admin/pages/{key}/discard` | — | `{discarded_at}` | nulls `payload_draft` for all sections of this page |
| GET | `/api/admin/pages/{key}/diff` | — | `{sections: [{section_key, before, after}], meta: {...}}` | what would publish change |

#### 2C. Page edit response schema

```jsonc
// GET /api/admin/pages/{key}/edit
{
  "id": 12,
  "key": "cse_department",
  "path": "/departments/cse",
  "title": "Computer Science & Engineering",
  "status": "published",
  "scope_key": "dept.cse",
  "has_draft": true,
  "draft_section_count": 3,
  "hero_image": { "id": 87, "public_url": "/uploads/.../cse-hero.jpg", "alt": "..." },
  "intro_md": "...",
  "seo": {
    "title_override": null,
    "description": "...",
    "og_image": { "id": 87, "public_url": "..." },
    "canonical": null,
    "robots": "index,follow",
    "schema_jsonld": null,
    "has_draft": false
  },
  "sections": [
    {
      "id": 301,
      "section_key": "hero",
      "kind": "hero",
      "label": "Hero banner",
      "position": 0,
      "is_active": true,
      "payload": { "title": "CSE", "subtitle": "...", "image_id": 87 },
      "payload_draft": null,
      "draft_updated_at": null
    },
    {
      "id": 302,
      "section_key": "faculty_list",
      "kind": "list",
      "payload": [ { "name":"...", "role":"...", "image_id": 90 } ],
      "payload_draft": [ { "name":"...edited" } ],
      "draft_updated_at": "2026-05-29T10:12:00Z"
    }
  ]
}
```

#### 2D. Section save semantics

- `PATCH .../sections/{section_key}` always writes to `payload_draft`. Public reads continue using `payload`. Editor reads use `payload_draft ?? payload`.
- The body's `payload` REPLACES `payload_draft` (full replace, not deep merge). Caller is responsible for sending the whole section value. (Avoids JSON-patch complexity; section payloads are small.)
- Server records `draft_updated_at`, `draft_updated_by_user_id`.
- Every PATCH writes an `AuditLog` row: `action=section.draft.update`, `entity_type=page_section`, `entity_id={section_key}`, before/after.

#### 2E. Publish semantics

`POST /api/admin/pages/{key}/publish`:
- For each section with a non-null `payload_draft`: copy to `payload`, set `payload_draft=NULL`, set `draft_updated_at=NULL`.
- If page has `seo_payload_draft`: copy to `seo_payload`, null the draft.
- Set `pages.updated_at = now()`.
- Write `AuditLog` row `action=page.publish`.
- Returns `{ published_at, sections_promoted: N }`.

If no drafts exist → 409 `{"detail":"Nothing to publish"}`.

#### 2F. Public read endpoint (already exists, verify behavior)

`GET /api/public/pages/{path}` must continue returning only `payload` (never `payload_draft`). Add a cache header so the CDN/edge caches the published version. Invalidate cache on publish (touch a version counter setting `pages.cache_version`).

#### 2G. Concurrency

Optimistic concurrency via `If-Match` header carrying the section's `draft_updated_at` (or `0` if no draft yet). Mismatch → `409 Conflict {"detail":"Someone else edited this section. Reload."}`. Frontend reloads on 409.

---

### Phase 3 — Seed pages from the current frontend (~2h)

Right now the React app declares pages in code; the DB doesn't know about most of them. The visual editor needs DB rows for every page it will edit.

#### 3A. Inventory

Source of truth: `frontend/src/App.jsx` routes. From the current repo:

```
/                           home
/about                      about
/admissions                 admissions index
/admissions/ug              admissions UG
/admissions/pg              admissions PG
/admissions/seek            seek admission
/departments/cse            CSE
/departments/ece            ECE
/departments/it             IT
/departments/ce             Civil
/departments/me             Mechanical
/departments/mba            MBA
/departments/esh            ESH
/emerging/ai-ml             AI/ML
/emerging/cyber-security    Cyber
/emerging/cloud             Cloud
/library                    Library
/placements                 TAP / Placements
/research                   Research index
/research/rd-cell           R&D Cell
/research/publications      Publications
/research/journal           Journal
/research/conference        Conference
/research/fdp               FDP
/research/innovation        Innovation
/events/pac                 PAC
/events/cultural            Cultural
/cells/nss                  NSS
/cells/uba                  UBA
/cells/wec                  WEC
/cells/sports               Sports
/cells/iqac                 IQAC
/cells/anti-ragging         Anti-Ragging
/cells/other                Other Clubs
/alumni                     Alumni hub
/alumni/speaks              Alumni Speaks
/alumni/chapters            Chapters
/alumni/mentorship          Mentorship
/alumni/membership          Membership
/gallery                    Gallery hub
/compliance/naac            NAAC
/compliance/nirf            NIRF
/compliance/committees      Committees
/compliance/policies        Policies
/careers                    Open positions
/careers/jrf                JRF
/contact                    Contact
```

#### 3B. Section catalogue per page kind

A single Python dict defines, for each page key, the list of sections it should have. Example:

```python
PAGE_SECTIONS = {
    "home": [
        ("hero",          "hero",      "Hero slider"),
        ("stats",         "kv",        "Headline stats"),
        ("why_itm",       "rich_text", "Why ITM"),
        ("departments",   "list",      "Department cards"),
        ("placements",    "list",      "Placement highlights"),
        ("director",      "rich_text", "Director's vision"),
        ("testimonials",  "list",      "Testimonials"),
        ("cta",           "kv",        "Admission CTA"),
    ],
    "department_cse": [
        ("hero",        "hero",      "Hero banner"),
        ("overview",    "rich_text", "About"),
        ("hod",         "kv",        "HOD profile"),
        ("faculty",     "list",      "Faculty"),
        ("labs",        "list",      "Labs"),
        ("projects",    "list",      "Projects"),
        ("gallery",     "gallery",   "Department gallery"),
    ],
    # ...
}
```

#### 3C. Script

`scripts/seed_pages_from_frontend.py`:
- Idempotent: upserts page rows by `key`, then upserts each section by `(page_id, section_key)`.
- Sets `scope_key` per page (e.g. department pages get `dept.cse` etc.).
- Initial `payload` for each section is an empty value of the right shape (`{}`, `[]`, `""`) — frontend dev populates real content via the visual editor.
- Safe to re-run; never deletes sections that exist in DB but not in the catalogue (lets editors add custom sections).

Add seed to `Makefile` / docs: `python -m scripts.seed_pages_from_frontend`.

---

### Phase 4 — Blog/Posts (~4h)

#### 4A. Model

New `app/models/posts.py`:

```python
class Post(Base, TimestampMixin, MetadataMixin):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    excerpt: Mapped[str | None] = mapped_column(String(512))
    body_md: Mapped[str] = mapped_column(Text)
    hero_image_id: Mapped[int | None] = mapped_column(ForeignKey("media_assets.id", ondelete="SET NULL"))
    author_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    status: Mapped[str] = mapped_column(String(16), default="draft", index=True)   # draft|published|archived
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    category: Mapped[str | None] = mapped_column(String(64), index=True)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    seo_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
```

Migration `0011_posts.py` — table + indexes on `slug`, `status`, `published_at`, `category`.

#### 4B. Router

`app/routers/posts.py`:

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/public/posts` | public | published only, `?category=`, `?tag=`, `?q=`, paginated |
| GET | `/api/public/posts/{slug}` | public | published only, increments `view_count` |
| GET | `/api/admin/posts` | `blog.posts` | all statuses, filter by status |
| GET | `/api/admin/posts/{id}` | `blog.posts` | |
| POST | `/api/admin/posts` | `blog.posts` | creates as draft |
| PATCH | `/api/admin/posts/{id}` | `blog.posts` | |
| POST | `/api/admin/posts/{id}/publish` | `blog.posts` | sets status, published_at |
| POST | `/api/admin/posts/{id}/unpublish` | `blog.posts` | back to draft |
| DELETE | `/api/admin/posts/{id}` | `blog.posts` | soft via `status=archived`, hard via `?hard=true` (super_admin only) |

#### 4C. Schemas

`app/schemas/posts.py` — `PostCreate`, `PostUpdate`, `PostOut`, `PostListItem` (lighter, no body).

---

### Phase 5 — Analytics endpoint (~3h)

#### 5A. Source data

We don't have a tracking pixel yet, so v1 reads from data we already collect:
- `audit_log` — admin actions per day
- form submissions tables (contact, admission inquiries, applications, grievance)
- `posts.view_count`
- `Page` rows — total page count

This gives an honest "what's happening inside the CMS" view without lying about pageviews. Adding Plausible/GA later is a config switch and a new provider class.

#### 5B. Router

`app/routers/analytics.py` mounted at `/api/admin/analytics`. All endpoints require `analytics.view`.

```
GET /api/admin/analytics/summary?range=7d|30d|90d
   → {
       range,
       admin_edits: { total, by_user: [{user_id, username, count}], by_day: [{date, count}] },
       leads:          { total_30d, by_source: [{source, count}], recent: [{id, name, source, created_at}] },
       form_submissions: {
         contact: { total, recent_7d },
         grievance: { total, recent_7d },
         admissions: { total, recent_7d },
         careers: { total, recent_7d }
       },
       blog: { published_count, total_views, top_posts: [{id, title, views}] },
       pages: { total, with_draft, last_published_at },
       users: { active, by_role: {super_admin, editor, faculty, student} }
     }

GET /api/admin/analytics/edits?range=7d
   → [ { date, count, user_id, username, action } ]   for charting

GET /api/admin/analytics/leads?range=30d&group_by=source|day
   → grouped counts

GET /api/admin/analytics/posts
   → [ { id, title, views, published_at } ] sorted desc
```

#### 5C. Implementation notes

- All queries `LIMIT`-capped and use existing indexed columns (`created_at`, `status`, etc.).
- Memoize each summary call for 60s in `app/core/cache.py`.
- No background jobs in v1 — queries run on request.

---

### Phase 6 — Audit + auth glue + polish (~3h)

- Every Phase 2 / Phase 4 mutation writes an `AuditLog` row with `before` and `after`.
- Section save endpoint adds `If-Match` concurrency.
- Add `WWW-Authenticate: Bearer` correctly on 401 admin responses (some routers were inconsistent).
- Add a `last_seen_at` column on users (touched on token refresh) so the analytics "active users" count is honest.
- Add rate-limiting to the section save endpoint (`30/min/user`) using existing `app/core/ratelimit.py`.
- Update `README.md` + `deploy/DEPLOY.md` with the new env vars and migration commands.

---

## 5. Migration list (in order)

| File | Description |
|---|---|
| `alembic/versions/0009_scopes_and_presets.py` | Seed 3 scopes, create scope_presets table, seed 15 system presets |
| `alembic/versions/0010_page_section_drafts.py` | Add `payload_draft`, `draft_updated_at`, `draft_updated_by_user_id` to `page_sections`; add `seo_payload`, `seo_payload_draft` to `pages` |
| `alembic/versions/0011_posts.py` | Create `posts` table + indexes |
| `alembic/versions/0012_user_last_seen.py` | Add `users.last_seen_at` |
| `alembic/versions/0013_page_cache_version.py` | Add `pages.cache_version INT DEFAULT 1` |

Run order: `alembic upgrade head`.

---

## 6. File-by-file delta

### New files

```
app/models/scope_preset.py
app/models/posts.py
app/routers/admin_pages.py
app/routers/scope_presets.py
app/routers/posts.py
app/routers/analytics.py
app/schemas/scope_preset.py
app/schemas/admin_pages.py
app/schemas/posts.py
app/schemas/analytics.py
app/services/page_sections.py        # publish/discard/diff helpers, audit writes
app/services/analytics.py            # query helpers
scripts/seed_scope_presets.py
scripts/seed_pages_from_frontend.py
alembic/versions/0009_scopes_and_presets.py
alembic/versions/0010_page_section_drafts.py
alembic/versions/0011_posts.py
alembic/versions/0012_user_last_seen.py
alembic/versions/0013_page_cache_version.py
tests/test_admin_pages.py
tests/test_scope_presets.py
tests/test_posts.py
tests/test_analytics.py
tests/test_seo_edit_scope.py
```

### Files to edit

```
app/core/rbac.py                  # add 3 new scopes
app/models/cms.py                 # add draft columns + seo columns + cache_version
app/models/user.py                # add last_seen_at
app/models/__init__.py            # export ScopePreset, Post
app/routers/users.py              # add apply-preset endpoint
app/routers/public.py             # cache_version header for /pages
app/main.py                       # mount new routers
app/deps.py                       # helper `require_page_scope(page)` that checks scope_key
README.md                         # mention new endpoints
deploy/DEPLOY.md                  # add migration step + scope seed command
```

---

## 7. API surface for the frontend dev (single-page cheat sheet)

Base URL: `/api`. All admin endpoints require `Authorization: Bearer <access_token>`.

### Auth (already exists — included for completeness)

```
POST /api/auth/login                   → { access_token, refresh_token, user }
POST /api/auth/refresh                 → { access_token }
POST /api/auth/logout
GET  /api/auth/me                      → current user + scopes
```

### Pages (visual editor)

```
GET    /api/admin/pages                                    list, search
GET    /api/admin/pages/{key}/edit                         full editable view (draft merged)
PATCH  /api/admin/pages/{key}/meta                         title/hero/intro/seo
PATCH  /api/admin/pages/{key}/sections/{section_key}       save draft (If-Match)
POST   /api/admin/pages/{key}/sections                     add section
DELETE /api/admin/pages/{key}/sections/{section_key}       remove
PATCH  /api/admin/pages/{key}/sections/reorder             bulk reorder
POST   /api/admin/pages/{key}/publish                      promote draft → live
POST   /api/admin/pages/{key}/discard                      drop draft
GET    /api/admin/pages/{key}/diff                         show what publish will change
```

### Public reads (unchanged shape, draft never exposed)

```
GET /api/public/pages/{path}    → published page + sections (cache-friendly)
```

### Scopes / presets

```
GET    /api/scopes                              all known scope keys + labels
GET    /api/scope-presets                       list presets
POST   /api/scope-presets                       create custom
PATCH  /api/scope-presets/{key}                 edit (custom only)
DELETE /api/scope-presets/{key}                 delete (custom only)
POST   /api/users/{user_id}/scopes/apply-preset body: {preset_key, mode: "replace"|"add"}
```

### Posts

```
Public:
GET /api/public/posts                  list (filters: category, tag, q, page, page_size)
GET /api/public/posts/{slug}           detail

Admin (scope: blog.posts):
GET    /api/admin/posts                all statuses
POST   /api/admin/posts                create draft
PATCH  /api/admin/posts/{id}           edit
POST   /api/admin/posts/{id}/publish
POST   /api/admin/posts/{id}/unpublish
DELETE /api/admin/posts/{id}           soft archive (hard via ?hard=true, super_admin only)
```

### Analytics (scope: analytics.view)

```
GET /api/admin/analytics/summary?range=7d|30d|90d
GET /api/admin/analytics/edits?range=...
GET /api/admin/analytics/leads?range=...&group_by=source|day
GET /api/admin/analytics/posts
```

### Media (already exists — for completeness)

```
POST /api/admin/media/upload           multipart, returns MediaAsset
GET  /api/admin/media                  list with filters
PATCH /api/admin/media/{id}            alt/caption/folder
DELETE /api/admin/media/{id}
```

### Error format (all endpoints)

```json
{ "detail": "Human-readable message", "code": "OPTIONAL_MACHINE_CODE" }
```

Status codes:
- 400 — validation
- 401 — missing/invalid token
- 403 — token OK but scope missing → `detail` lists required scopes
- 404 — not found
- 409 — concurrency conflict (`If-Match` mismatch) OR "Nothing to publish"
- 422 — body shape wrong (FastAPI default)
- 429 — rate limit

---

## 8. Testing strategy

- `pytest` with the existing `conftest.py` (transactional fixtures).
- New test modules per router; minimum coverage targets:
  - `test_admin_pages.py`: section CRUD, draft isolation (public still sees old payload), publish promotes all sections, discard nulls drafts, If-Match conflict, scope_key enforcement (editor with only `dept.cse` cannot PATCH a different page).
  - `test_scope_presets.py`: apply-preset replace vs add, system preset cannot be deleted.
  - `test_posts.py`: draft hidden from public, publish sets `published_at`, slug uniqueness.
  - `test_analytics.py`: response shape, scope enforcement.
  - `test_seo_edit_scope.py`: editor with `site.pages` but not `seo.edit` cannot PATCH meta with seo_payload.
- Manual smoke after Phase 3 seed: hit `GET /api/admin/pages` and confirm all ~45 page rows exist.

---

## 9. Effort estimate

| Phase | Effort |
|---|---|
| 1. Scopes + presets | 4h |
| 2. Per-section draft/publish API | 6h |
| 3. Page seed script | 2h |
| 4. Blog/Posts | 4h |
| 5. Analytics | 3h |
| 6. Audit/auth polish | 3h |
| Tests | 4h |
| **Total** | **~26h** (~3 focused days) |

Recommended PR order (each independent, each pushable to `main`):
1. Phase 1 (scopes + presets)
2. Phase 3 (page seed) — needs Phase 1's scope_key alignment
3. Phase 2 (draft + publish API) — biggest, most carefully reviewed
4. Phase 4 (blog) — independent of pages
5. Phase 5 (analytics)
6. Phase 6 (polish)

---

## 10. Open questions for the team

1. **Image fields on sections** — the frontend dev will reference images by `MediaAsset.id`. Does any current section store images as raw URL strings instead? If so, those will need a migration to map URL → media asset (separate task, ~2h).
2. **Multilingual content** — is hi/en bilingual content on the roadmap? If yes, `payload` should become `{ en: {...}, hi: {...} }`. Decide before Phase 2 so the schema is right the first time.
3. **Publish workflow** — does a Editor's publish need Admin approval, or can Editors publish directly within their scope? Plan assumes direct publish.
4. **Cache layer** — are we deploying with a CDN that respects `Cache-Control: s-maxage`? Cache invalidation via `cache_version` query param on the public endpoint won't help if there's no edge cache.
5. **Post categories** — fixed enum (`news`, `event`, `notice`, `blog`) or freeform string? Plan assumes freeform.
6. **Confirm `editor_default` preset scope list** — the table above is my guess. Want to lock the canonical set before seeding.

---

## 11. Deploy checklist (after each phase merge)

```bash
# on the server (or via CI)
git pull origin main
docker compose -f deploy/docker-compose.prod.yml build api
docker compose -f deploy/docker-compose.prod.yml run --rm api alembic upgrade head
docker compose -f deploy/docker-compose.prod.yml run --rm api python -m scripts.seed_scope_presets
# Phase 3 only:
docker compose -f deploy/docker-compose.prod.yml run --rm api python -m scripts.seed_pages_from_frontend
docker compose -f deploy/docker-compose.prod.yml up -d api
```

Rollback: revert the merge commit on `main`, run `alembic downgrade -1` per migration rolled back. Draft columns are additive so rollback is safe for live data.
