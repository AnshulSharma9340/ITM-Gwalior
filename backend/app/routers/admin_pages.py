"""Admin/editor visual-editor surface for the CMS.

Mounted at `/api/admin/pages`. Each endpoint checks either `site.pages` (broad
editor) or the page's own `scope_key` (narrow editor). Write endpoints stage
changes in `*_draft` columns; `publish` promotes them to the live columns.

Concurrency: `PATCH /sections/{key}` accepts an optional `If-Match` header
carrying the section's current `draft_updated_at` ISO timestamp (or "0" for
no-draft). Mismatch → 409.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, Query, Request, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AppError, ConflictError, ForbiddenError, NotFoundError
from app.deps import get_current_user, has_any_scope
from app.models import MediaAsset, Page, PageSection, User
from app.schemas.admin_pages import (
    AdminMetaPatch,
    AdminPageEditOut,
    AdminPageListItem,
    AdminReorderRequest,
    AdminSectionCreate,
    AdminSectionOut,
    AdminSeoBlock,
    DiffOut,
    DiscardResult,
    MediaRef,
    PublishResult,
)
from app.schemas.admin_pages import AdminSectionPatch as SectionPatch
from app.services import audit

router = APIRouter(prefix="/admin/pages", tags=["admin-pages"])


# ── helpers ────────────────────────────────────────────────────────────


def _media_ref(db: Session, media_id: int | None) -> MediaRef | None:
    if not media_id:
        return None
    asset = db.get(MediaAsset, media_id)
    if not asset or not asset.is_active:
        return None
    return MediaRef(id=asset.id, public_url=asset.public_url, alt=asset.alt)


def _section_has_draft(s: PageSection) -> bool:
    return s.payload_draft is not None


def _section_to_out(s: PageSection) -> AdminSectionOut:
    return AdminSectionOut(
        id=s.id,
        section_key=s.section_key,
        label=s.label,
        kind=s.kind,
        position=s.position,
        is_active=s.is_active,
        payload=s.payload,
        payload_draft=s.payload_draft,
        draft_updated_at=s.draft_updated_at,
        has_draft=_section_has_draft(s),
    )


def _seo_block(db: Session, page: Page) -> AdminSeoBlock:
    draft = page.seo_payload_draft or {}
    return AdminSeoBlock(
        meta_title=draft.get("meta_title", page.meta_title),
        meta_description=draft.get("meta_description", page.meta_description),
        meta_keywords=draft.get("meta_keywords", page.meta_keywords),
        og_image=_media_ref(db, draft.get("og_image_id", page.og_image_id)),
        canonical_url=draft.get("canonical_url", page.canonical_url),
        robots=draft.get("robots", page.robots),
        schema_jsonld=draft.get("schema_jsonld", page.schema_jsonld),
        has_draft=page.seo_payload_draft is not None,
    )


def _page_has_draft(page: Page) -> bool:
    if page.seo_payload_draft is not None or page.meta_draft is not None:
        return True
    return any(_section_has_draft(s) for s in page.sections)


def _enforce_page_scope(page: Page, actor: User, *, for_seo: bool = False) -> None:
    """site.pages OR the page's own scope_key. For seo edits, also need seo.edit."""
    if actor.role == "super_admin":
        return
    if not (has_any_scope(actor, ["site.pages"]) or (page.scope_key and has_any_scope(actor, [page.scope_key]))):
        scopes_needed = "site.pages" + (f" or {page.scope_key}" if page.scope_key else "")
        raise ForbiddenError(f"Requires scope: {scopes_needed}")
    if for_seo and not has_any_scope(actor, ["seo.edit"]):
        raise ForbiddenError("Requires scope: seo.edit")


def _get_page_or_404(db: Session, key: str) -> Page:
    page = db.scalar(select(Page).where(Page.key == key))
    if not page:
        raise NotFoundError(f"Page '{key}' not found")
    return page


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ── list ───────────────────────────────────────────────────────────────


@router.get("", response_model=list[AdminPageListItem])
def list_admin_pages(
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
    q: str | None = Query(None, description="Search by title or path"),
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    stmt = select(Page)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Page.title.ilike(like), Page.path.ilike(like), Page.key.ilike(like)))
    stmt = stmt.order_by(Page.path).limit(limit).offset(offset)
    pages = db.scalars(stmt).all()

    out: list[AdminPageListItem] = []
    for p in pages:
        # If the actor can't edit this page, skip it entirely (cleaner than 403 on click).
        try:
            _enforce_page_scope(p, actor)
        except ForbiddenError:
            continue
        draft_count = sum(1 for s in p.sections if _section_has_draft(s))
        out.append(
            AdminPageListItem(
                id=p.id,
                key=p.key,
                path=p.path,
                title=p.title,
                status=p.status,
                scope_key=p.scope_key,
                has_draft=_page_has_draft(p),
                draft_section_count=draft_count,
                last_modified=p.updated_at,
            )
        )
    return out


# ── edit view (draft merged) ───────────────────────────────────────────


@router.get("/{key}/edit", response_model=AdminPageEditOut)
def get_page_for_edit(
    key: str,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    page = _get_page_or_404(db, key)
    _enforce_page_scope(page, actor)
    return AdminPageEditOut(
        id=page.id,
        key=page.key,
        path=page.path,
        title=(page.meta_draft or {}).get("title", page.title),
        status=page.status,
        scope_key=page.scope_key,
        intro_md=(page.meta_draft or {}).get("intro_md", page.intro_md),
        hero_image=_media_ref(db, (page.meta_draft or {}).get("hero_image_id", page.hero_image_id)),
        seo=_seo_block(db, page),
        sections=[_section_to_out(s) for s in page.sections],
        has_draft=_page_has_draft(page),
        cache_version=page.cache_version,
    )


# ── meta + seo ─────────────────────────────────────────────────────────


@router.patch("/{key}/meta", response_model=AdminPageEditOut)
def patch_page_meta(
    key: str,
    body: AdminMetaPatch,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    page = _get_page_or_404(db, key)
    seo_dirty = body.seo_payload is not None
    _enforce_page_scope(page, actor, for_seo=seo_dirty)

    before = {"title": page.title, "intro_md": page.intro_md, "hero_image_id": page.hero_image_id}
    meta_draft = dict(page.meta_draft or {})
    if body.title is not None:
        meta_draft["title"] = body.title
    if body.intro_md is not None:
        meta_draft["intro_md"] = body.intro_md
    if body.hero_image_id is not None:
        meta_draft["hero_image_id"] = body.hero_image_id
    page.meta_draft = meta_draft or None

    if seo_dirty:
        page.seo_payload_draft = dict(body.seo_payload)

    page.updated_by_user_id = actor.id
    db.commit()
    db.refresh(page)

    audit.record(
        db,
        user_id=actor.id,
        action="page.meta.draft",
        entity_type="page",
        entity_id=page.id,
        before=before,
        after={"meta_draft": page.meta_draft, "seo_payload_draft": page.seo_payload_draft},
        ip=request.client.host if request.client else None,
    )
    return get_page_for_edit(key, db, actor)


# ── sections ───────────────────────────────────────────────────────────


@router.patch("/{key}/sections/{section_key}", response_model=AdminSectionOut)
def patch_section_draft(
    key: str,
    section_key: str,
    body: SectionPatch,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
    if_match: str | None = Header(None, alias="If-Match"),
):
    page = _get_page_or_404(db, key)
    _enforce_page_scope(page, actor)

    section = db.scalar(
        select(PageSection).where(
            PageSection.page_id == page.id, PageSection.section_key == section_key
        )
    )
    if not section:
        raise NotFoundError(f"Section '{section_key}' not found on page '{key}'")

    # Concurrency: caller declares the timestamp they last saw.
    if if_match is not None and if_match.strip() not in {"", "*"}:
        seen = (section.draft_updated_at.isoformat() if section.draft_updated_at else "0")
        if if_match.strip() != seen:
            raise AppError(
                "STALE_DRAFT",
                "Someone else edited this section. Reload to see the latest version.",
                status_code=409,
            )

    before = {
        "payload_draft": section.payload_draft,
        "label": section.label,
        "is_active": section.is_active,
    }
    if body.payload is not None:
        section.payload_draft = body.payload
    if body.label is not None:
        section.label = body.label
    if body.is_active is not None:
        section.is_active = body.is_active
    section.draft_updated_at = _now()
    section.draft_updated_by_user_id = actor.id
    section.updated_by_user_id = actor.id
    db.commit()
    db.refresh(section)

    audit.record(
        db,
        user_id=actor.id,
        action="section.draft.update",
        entity_type="page_section",
        entity_id=section.id,
        before=before,
        after={"payload_draft": section.payload_draft, "label": section.label, "is_active": section.is_active},
        ip=request.client.host if request.client else None,
    )
    return _section_to_out(section)


@router.post(
    "/{key}/sections",
    response_model=AdminSectionOut,
    status_code=status.HTTP_201_CREATED,
)
def add_section(
    key: str,
    body: AdminSectionCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    page = _get_page_or_404(db, key)
    _enforce_page_scope(page, actor)

    section = PageSection(
        page_id=page.id,
        section_key=body.section_key,
        label=body.label,
        kind=body.kind,
        position=body.position,
        is_active=True,
        payload=None,
        payload_draft=body.payload,
        draft_updated_at=_now() if body.payload is not None else None,
        draft_updated_by_user_id=actor.id if body.payload is not None else None,
        created_by_user_id=actor.id,
        updated_by_user_id=actor.id,
    )
    db.add(section)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise ConflictError(f"section_key '{body.section_key}' already exists on this page") from e
    db.refresh(section)
    audit.record(
        db,
        user_id=actor.id,
        action="section.create",
        entity_type="page_section",
        entity_id=section.id,
        after={"page_id": page.id, "section_key": section.section_key, "kind": section.kind},
        ip=request.client.host if request.client else None,
    )
    return _section_to_out(section)


@router.delete("/{key}/sections/{section_key}", status_code=204)
def delete_section(
    key: str,
    section_key: str,
    request: Request,
    hard: bool = Query(False, description="If true, hard-delete; else soft (is_active=false)"),
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    page = _get_page_or_404(db, key)
    _enforce_page_scope(page, actor)
    section = db.scalar(
        select(PageSection).where(
            PageSection.page_id == page.id, PageSection.section_key == section_key
        )
    )
    if not section:
        raise NotFoundError(f"Section '{section_key}' not found")
    if hard:
        if actor.role != "super_admin":
            raise ForbiddenError("Hard delete requires super_admin")
        db.delete(section)
        action = "section.delete_hard"
    else:
        section.is_active = False
        section.updated_by_user_id = actor.id
        action = "section.delete_soft"
    db.commit()
    audit.record(
        db,
        user_id=actor.id,
        action=action,
        entity_type="page_section",
        entity_id=section.id,
        ip=request.client.host if request.client else None,
    )


@router.patch("/{key}/sections/reorder", response_model=list[AdminSectionOut])
def reorder_sections(
    key: str,
    body: AdminReorderRequest,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    page = _get_page_or_404(db, key)
    _enforce_page_scope(page, actor)

    by_key = {s.section_key: s for s in page.sections}
    unknown = [item.section_key for item in body.order if item.section_key not in by_key]
    if unknown:
        raise AppError("UNKNOWN_SECTION", f"Unknown section_keys: {', '.join(unknown)}", status_code=400)

    for item in body.order:
        by_key[item.section_key].position = item.position
        by_key[item.section_key].updated_by_user_id = actor.id
    db.commit()
    audit.record(
        db,
        user_id=actor.id,
        action="section.reorder",
        entity_type="page",
        entity_id=page.id,
        after={"order": [{"k": i.section_key, "p": i.position} for i in body.order]},
        ip=request.client.host if request.client else None,
    )
    db.refresh(page)
    return [_section_to_out(s) for s in sorted(page.sections, key=lambda s: s.position)]


# ── publish / discard / diff ───────────────────────────────────────────


@router.post("/{key}/publish", response_model=PublishResult)
def publish_page(
    key: str,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    page = _get_page_or_404(db, key)
    _enforce_page_scope(page, actor)

    promoted = 0
    for s in page.sections:
        if s.payload_draft is not None:
            s.payload = s.payload_draft
            s.payload_draft = None
            s.draft_updated_at = None
            s.draft_updated_by_user_id = None
            s.updated_by_user_id = actor.id
            promoted += 1

    meta_promoted = False
    if page.meta_draft:
        md = page.meta_draft
        if "title" in md:
            page.title = md["title"]
        if "intro_md" in md:
            page.intro_md = md["intro_md"]
        if "hero_image_id" in md:
            page.hero_image_id = md["hero_image_id"]
        page.meta_draft = None
        meta_promoted = True

    if page.seo_payload_draft:
        sp = page.seo_payload_draft
        if "meta_title" in sp:
            page.meta_title = sp["meta_title"]
        if "meta_description" in sp:
            page.meta_description = sp["meta_description"]
        if "meta_keywords" in sp:
            page.meta_keywords = sp["meta_keywords"]
        if "og_image_id" in sp:
            page.og_image_id = sp["og_image_id"]
        if "canonical_url" in sp:
            page.canonical_url = sp["canonical_url"]
        if "robots" in sp:
            page.robots = sp["robots"]
        if "schema_jsonld" in sp:
            page.schema_jsonld = sp["schema_jsonld"]
        page.seo_payload_draft = None
        meta_promoted = True

    if promoted == 0 and not meta_promoted:
        raise AppError("NOTHING_TO_PUBLISH", "Nothing to publish on this page.", status_code=409)

    page.cache_version += 1
    page.updated_by_user_id = actor.id
    now = _now()
    db.commit()

    audit.record(
        db,
        user_id=actor.id,
        action="page.publish",
        entity_type="page",
        entity_id=page.id,
        after={"sections_promoted": promoted, "meta_promoted": meta_promoted, "cache_version": page.cache_version},
        ip=request.client.host if request.client else None,
    )
    return PublishResult(published_at=now, sections_promoted=promoted, meta_promoted=meta_promoted)


@router.post("/{key}/discard", response_model=DiscardResult)
def discard_drafts(
    key: str,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    page = _get_page_or_404(db, key)
    _enforce_page_scope(page, actor)

    cleared = 0
    for s in page.sections:
        if s.payload_draft is not None:
            s.payload_draft = None
            s.draft_updated_at = None
            s.draft_updated_by_user_id = None
            cleared += 1
    page.meta_draft = None
    page.seo_payload_draft = None
    page.updated_by_user_id = actor.id
    db.commit()
    audit.record(
        db,
        user_id=actor.id,
        action="page.discard_drafts",
        entity_type="page",
        entity_id=page.id,
        after={"sections_cleared": cleared},
        ip=request.client.host if request.client else None,
    )
    return DiscardResult(discarded_at=_now(), sections_cleared=cleared)


@router.get("/{key}/diff", response_model=DiffOut)
def page_diff(
    key: str,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    page = _get_page_or_404(db, key)
    _enforce_page_scope(page, actor)

    section_diffs: list[dict] = []
    for s in page.sections:
        if s.payload_draft is not None:
            section_diffs.append(
                {
                    "section_key": s.section_key,
                    "kind": s.kind,
                    "before": s.payload,
                    "after": s.payload_draft,
                }
            )

    meta_diff: dict | None = None
    if page.meta_draft or page.seo_payload_draft:
        meta_diff = {
            "meta_draft": page.meta_draft,
            "seo_payload_draft": page.seo_payload_draft,
        }

    return DiffOut(
        sections=section_diffs,
        meta=meta_diff,
        has_changes=bool(section_diffs or meta_diff),
    )
