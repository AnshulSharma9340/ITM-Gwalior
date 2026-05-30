"""Admin analytics endpoints — reads from audit_log + form/lead tables + posts.

All endpoints require scope `analytics.view`. Responses memoised for 60s.
External providers (Plausible/GA) are NOT used in v1.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.cache import cache
from app.core.database import get_db
from app.deps import require
from app.models import (
    AdmissionLead,
    AuditLog,
    ContactSubmission,
    JobApplication,
    Page,
    PageSection,
    Post,
    User,
)

router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"])

Range = Literal["7d", "30d", "90d"]


def _range_to_delta(r: Range) -> timedelta:
    return {"7d": timedelta(days=7), "30d": timedelta(days=30), "90d": timedelta(days=90)}[r]


def _since(r: Range) -> datetime:
    return datetime.now(timezone.utc) - _range_to_delta(r)


def _cache_key(prefix: str, *parts: str) -> str:
    return f"analytics:{prefix}:" + ":".join(parts)


@router.get("/summary", dependencies=[Depends(require("analytics.view"))])
def summary(
    db: Session = Depends(get_db),
    range_: Range = Query("7d", alias="range"),
):
    key = _cache_key("summary", range_)
    cached = cache.get(key)
    if cached is not None:
        return cached

    since = _since(range_)
    leads_since = _since("30d")

    # Admin edits
    edits_total = db.scalar(
        select(func.count(AuditLog.id)).where(AuditLog.created_at >= since)
    ) or 0
    by_user_rows = (
        db.execute(
            select(AuditLog.user_id, func.count(AuditLog.id).label("c"))
            .where(AuditLog.created_at >= since, AuditLog.user_id.is_not(None))
            .group_by(AuditLog.user_id)
            .order_by(func.count(AuditLog.id).desc())
            .limit(10)
        )
        .all()
    )
    user_lookup = {
        u.id: u.username
        for u in db.scalars(
            select(User).where(User.id.in_([r.user_id for r in by_user_rows] or [0]))
        ).all()
    }
    by_user = [
        {"user_id": r.user_id, "username": user_lookup.get(r.user_id), "count": r.c}
        for r in by_user_rows
    ]

    # By-day series (DB-portable date grouping)
    by_day_rows = (
        db.execute(
            select(
                func.date_trunc("day", AuditLog.created_at).label("d"),
                func.count(AuditLog.id),
            )
            .where(AuditLog.created_at >= since)
            .group_by("d")
            .order_by("d")
        )
        .all()
    )
    by_day = [{"date": d.isoformat() if d else None, "count": c} for d, c in by_day_rows]

    # Leads (last 30d, separate from range so the dashboard always has a meaningful number)
    leads_total = db.scalar(
        select(func.count(AdmissionLead.id)).where(AdmissionLead.created_at >= leads_since)
    ) or 0
    leads_recent = (
        db.scalars(
            select(AdmissionLead)
            .where(AdmissionLead.created_at >= leads_since)
            .order_by(AdmissionLead.created_at.desc())
            .limit(10)
        )
        .all()
    )

    # Form submissions
    contact_total = db.scalar(select(func.count(ContactSubmission.id))) or 0
    contact_recent_7d = db.scalar(
        select(func.count(ContactSubmission.id)).where(
            ContactSubmission.created_at >= _since("7d")
        )
    ) or 0
    careers_total = db.scalar(select(func.count(JobApplication.id))) or 0
    careers_recent_7d = db.scalar(
        select(func.count(JobApplication.id)).where(
            JobApplication.created_at >= _since("7d")
        )
    ) or 0
    admissions_total = db.scalar(select(func.count(AdmissionLead.id))) or 0
    admissions_recent_7d = db.scalar(
        select(func.count(AdmissionLead.id)).where(AdmissionLead.created_at >= _since("7d"))
    ) or 0

    # Blog
    published_count = db.scalar(select(func.count(Post.id)).where(Post.status == "published")) or 0
    total_views = db.scalar(select(func.coalesce(func.sum(Post.view_count), 0))) or 0
    top_posts_rows = (
        db.scalars(
            select(Post)
            .where(Post.status == "published")
            .order_by(Post.view_count.desc())
            .limit(5)
        )
        .all()
    )

    # Pages
    pages_total = db.scalar(select(func.count(Page.id))) or 0
    with_draft = db.scalar(
        select(func.count(func.distinct(PageSection.page_id))).where(
            PageSection.payload_draft.is_not(None)
        )
    ) or 0
    last_published_at = db.scalar(
        select(func.max(AuditLog.created_at)).where(AuditLog.action == "page.publish")
    )

    # Users
    users_active = db.scalar(select(func.count(User.id)).where(User.is_active.is_(True))) or 0
    by_role_rows = (
        db.execute(
            select(User.role, func.count(User.id))
            .where(User.is_active.is_(True))
            .group_by(User.role)
        )
        .all()
    )
    by_role = {r[0]: r[1] for r in by_role_rows}

    payload = {
        "range": range_,
        "admin_edits": {
            "total": edits_total,
            "by_user": by_user,
            "by_day": by_day,
        },
        "leads": {
            "total_30d": leads_total,
            "recent": [
                {
                    "id": ld.id,
                    "name": ld.name,
                    "email": getattr(ld, "email", None),
                    "phone": getattr(ld, "phone", None),
                    "created_at": ld.created_at.isoformat(),
                }
                for ld in leads_recent
            ],
        },
        "form_submissions": {
            "contact": {"total": contact_total, "recent_7d": contact_recent_7d},
            "admissions": {"total": admissions_total, "recent_7d": admissions_recent_7d},
            "careers": {"total": careers_total, "recent_7d": careers_recent_7d},
        },
        "blog": {
            "published_count": published_count,
            "total_views": int(total_views),
            "top_posts": [
                {"id": p.id, "title": p.title, "slug": p.slug, "views": p.view_count}
                for p in top_posts_rows
            ],
        },
        "pages": {
            "total": pages_total,
            "with_draft": with_draft,
            "last_published_at": last_published_at.isoformat() if last_published_at else None,
        },
        "users": {
            "active": users_active,
            "by_role": by_role,
        },
    }
    cache.set(key, payload, ttl=60)
    return payload


@router.get("/edits", dependencies=[Depends(require("analytics.view"))])
def edits(
    db: Session = Depends(get_db),
    range_: Range = Query("7d", alias="range"),
):
    since = _since(range_)
    rows = (
        db.execute(
            select(AuditLog.created_at, AuditLog.user_id, AuditLog.action, AuditLog.entity_type)
            .where(AuditLog.created_at >= since)
            .order_by(AuditLog.created_at.desc())
            .limit(500)
        )
        .all()
    )
    return [
        {
            "created_at": r.created_at.isoformat(),
            "user_id": r.user_id,
            "action": r.action,
            "entity_type": r.entity_type,
        }
        for r in rows
    ]


@router.get("/leads", dependencies=[Depends(require("analytics.view"))])
def leads(
    db: Session = Depends(get_db),
    range_: Range = Query("30d", alias="range"),
    group_by: Literal["day", "source"] = Query("day"),
):
    since = _since(range_)
    if group_by == "day":
        rows = (
            db.execute(
                select(
                    func.date_trunc("day", AdmissionLead.created_at).label("d"),
                    func.count(AdmissionLead.id),
                )
                .where(AdmissionLead.created_at >= since)
                .group_by("d")
                .order_by("d")
            )
            .all()
        )
        return [{"date": d.isoformat() if d else None, "count": c} for d, c in rows]
    # source grouping (best-effort: AdmissionLead may not have a source column;
    # fall back to a single bucket if not present)
    source_col = getattr(AdmissionLead, "source", None)
    if source_col is None:
        total = db.scalar(
            select(func.count(AdmissionLead.id)).where(AdmissionLead.created_at >= since)
        ) or 0
        return [{"source": "unknown", "count": total}]
    rows = (
        db.execute(
            select(source_col, func.count(AdmissionLead.id))
            .where(AdmissionLead.created_at >= since)
            .group_by(source_col)
            .order_by(func.count(AdmissionLead.id).desc())
        )
        .all()
    )
    return [{"source": s or "unknown", "count": c} for s, c in rows]


@router.get("/posts", dependencies=[Depends(require("analytics.view"))])
def post_views(db: Session = Depends(get_db)):
    rows = (
        db.scalars(
            select(Post).order_by(Post.view_count.desc()).limit(50)
        )
        .all()
    )
    return [
        {
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "status": p.status,
            "views": p.view_count,
            "published_at": p.published_at.isoformat() if p.published_at else None,
        }
        for p in rows
    ]
