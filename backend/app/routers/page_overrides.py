"""Per-route page overrides — the persistence layer for the in-place visual editor.

The frontend's `EditModeContext` calls these endpoints to read/write a JSON blob
per public route. Each blob captures inline text overrides, image swaps, list
edits, and layout (section order/visibility).

Storage: a single `settings` row keyed `page_overrides:{path}`. No new schema.

Read is public (so live visitors see published edits). Write requires
`site.pages` scope (or super_admin).

Path is taken as a positional URL segment via `{path:path}` so callers can pass
real routes (e.g. `/about/mission-vision`).
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user, require
from app.models import Setting, User
from app.services import audit


def _norm(path: str) -> str:
    """Normalise a path: ensure leading slash, strip trailing slash (except root)."""
    p = path if path.startswith("/") else "/" + path
    if len(p) > 1 and p.endswith("/"):
        p = p.rstrip("/")
    return p


def _key(path: str) -> str:
    return f"page_overrides:{_norm(path)}"


# ── Public read ────────────────────────────────────────────────────────
public_router = APIRouter(prefix="/public/page-overrides", tags=["page-overrides"])


@public_router.get("/{path:path}")
def get_overrides(path: str, response: Response, db: Session = Depends(get_db)):
    """Return the saved overrides for a path, or an empty object if none.

    Cached for 30s at the edge — accepts mild staleness for visitors after a PUT.
    Admin reads bypass this via the admin variant below.
    """
    row = db.get(Setting, _key(path))
    response.headers["Cache-Control"] = "public, max-age=30"
    return {
        "path": _norm(path),
        "overrides": row.value if row else {},
        "updated_at": row.updated_at.isoformat() if row else None,
    }


# ── Admin write ────────────────────────────────────────────────────────
admin_router = APIRouter(prefix="/admin/page-overrides", tags=["page-overrides"])


@admin_router.put("/{path:path}", dependencies=[Depends(require("site.pages"))])
def put_overrides(
    path: str,
    body: dict,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    """Upsert the overrides blob for a path. Body is the full JSON to store
    (callers send the merged value; this endpoint replaces, not patches).
    """
    k = _key(path)
    row = db.get(Setting, k)
    before = row.value if row else None
    if row is None:
        row = Setting(
            key=k,
            value=body,
            group="page_overrides",
            description=f"Inline editor overrides for {_norm(path)}",
            updated_by_user_id=actor.id,
        )
        db.add(row)
    else:
        row.value = body
        row.updated_by_user_id = actor.id
    db.commit()
    db.refresh(row)
    audit.record(
        db,
        user_id=actor.id,
        action="page_override.put",
        entity_type="setting",
        entity_id=k,
        before={"value": before} if before is not None else None,
        after={"value": row.value},
        ip=request.client.host if request.client else None,
    )
    return {
        "path": _norm(path),
        "overrides": row.value,
        "updated_at": row.updated_at.isoformat(),
    }


@admin_router.delete("/{path:path}", status_code=204, dependencies=[Depends(require("site.pages"))])
def delete_overrides(
    path: str,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    """Drop all overrides for a path (revert to template defaults)."""
    k = _key(path)
    row = db.get(Setting, k)
    if not row:
        return
    before = row.value
    db.delete(row)
    db.commit()
    audit.record(
        db,
        user_id=actor.id,
        action="page_override.delete",
        entity_type="setting",
        entity_id=k,
        before={"value": before},
        ip=request.client.host if request.client else None,
    )


@admin_router.get("/{path:path}", dependencies=[Depends(get_current_user)])
def get_overrides_admin(path: str, db: Session = Depends(get_db)):
    """Admin variant of the public reader — same shape, but requires auth, so
    the editor's fetch flows through one consistent base path.
    """
    row = db.get(Setting, _key(path))
    return {
        "path": _norm(path),
        "overrides": row.value if row else {},
        "updated_at": row.updated_at.isoformat() if row else None,
    }
