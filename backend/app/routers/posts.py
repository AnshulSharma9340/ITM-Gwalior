"""Blog/Posts router — public read + admin CRUD.

Admin endpoints require scope `blog.posts`. Hard-delete requires super_admin.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy import and_, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AppError, ConflictError, ForbiddenError, NotFoundError
from app.deps import get_current_user, require
from app.models import MediaAsset, Post, User
from app.schemas.posts import PostCreate, PostListItem, PostOut, PostUpdate
from app.services import audit


def _media_url(db: Session, mid: int | None) -> str | None:
    if not mid:
        return None
    a = db.get(MediaAsset, mid)
    return a.public_url if a and a.is_active else None


def _to_list_item(db: Session, p: Post) -> PostListItem:
    return PostListItem(
        id=p.id,
        slug=p.slug,
        title=p.title,
        excerpt=p.excerpt,
        hero_image_url=_media_url(db, p.hero_image_id),
        status=p.status,  # type: ignore[arg-type]
        published_at=p.published_at,
        category=p.category,
        tags=list(p.tags or []),
        view_count=p.view_count,
        author_user_id=p.author_user_id,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


def _to_out(db: Session, p: Post) -> PostOut:
    base = _to_list_item(db, p)
    return PostOut(**base.model_dump(), body_md=p.body_md, seo_payload=p.seo_payload)


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ─────────────────── Public ───────────────────────────────────────────
public_router = APIRouter(prefix="/public/posts", tags=["public-posts"])


@public_router.get("", response_model=list[PostListItem])
def list_public_posts(
    db: Session = Depends(get_db),
    q: str | None = Query(None),
    category: str | None = Query(None),
    tag: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    stmt = select(Post).where(Post.status == "published")
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Post.title.ilike(like), Post.excerpt.ilike(like)))
    if category:
        stmt = stmt.where(Post.category == category)
    if tag:
        # Match a tag literal inside the JSON list — DB-portable enough.
        stmt = stmt.where(Post.tags.cast_to_text().ilike(f"%\"{tag}\"%"))  # type: ignore[attr-defined]
    stmt = stmt.order_by(Post.published_at.desc().nullslast()).offset((page - 1) * page_size).limit(page_size)
    rows = db.scalars(stmt).all()
    return [_to_list_item(db, r) for r in rows]


@public_router.get("/{slug}", response_model=PostOut)
def get_public_post(slug: str, db: Session = Depends(get_db)):
    post = db.scalar(select(Post).where(and_(Post.slug == slug, Post.status == "published")))
    if not post:
        raise NotFoundError("Post not found")
    post.view_count += 1
    db.commit()
    db.refresh(post)
    return _to_out(db, post)


# ─────────────────── Admin ────────────────────────────────────────────
admin_router = APIRouter(prefix="/admin/posts", tags=["admin-posts"])


@admin_router.get("", response_model=list[PostListItem], dependencies=[Depends(require("blog.posts"))])
def list_admin_posts(
    db: Session = Depends(get_db),
    q: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    category: str | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    stmt = select(Post)
    if status_filter:
        stmt = stmt.where(Post.status == status_filter)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Post.title.ilike(like), Post.slug.ilike(like)))
    if category:
        stmt = stmt.where(Post.category == category)
    stmt = stmt.order_by(Post.updated_at.desc()).limit(limit).offset(offset)
    rows = db.scalars(stmt).all()
    return [_to_list_item(db, r) for r in rows]


@admin_router.get("/{post_id}", response_model=PostOut, dependencies=[Depends(require("blog.posts"))])
def get_admin_post(post_id: int, db: Session = Depends(get_db)):
    post = db.get(Post, post_id)
    if not post:
        raise NotFoundError("Post not found")
    return _to_out(db, post)


@admin_router.post(
    "",
    response_model=PostOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require("blog.posts"))],
)
def create_post(
    body: PostCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    post = Post(
        slug=body.slug,
        title=body.title,
        excerpt=body.excerpt,
        body_md=body.body_md,
        hero_image_id=body.hero_image_id,
        category=body.category,
        tags=list(body.tags),
        seo_payload=body.seo_payload,
        status="draft",
        author_user_id=actor.id,
        created_by_user_id=actor.id,
        updated_by_user_id=actor.id,
    )
    db.add(post)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise ConflictError("Slug already exists") from e
    db.refresh(post)
    audit.record(
        db,
        user_id=actor.id,
        action="post.create",
        entity_type="post",
        entity_id=post.id,
        after={"slug": post.slug, "title": post.title},
        ip=request.client.host if request.client else None,
    )
    return _to_out(db, post)


@admin_router.patch("/{post_id}", response_model=PostOut, dependencies=[Depends(require("blog.posts"))])
def update_post(
    post_id: int,
    body: PostUpdate,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise NotFoundError("Post not found")
    before = {"title": post.title, "slug": post.slug, "status": post.status}
    for field, value in body.model_dump(exclude_unset=True).items():
        if field == "tags" and value is not None:
            value = list(value)
        setattr(post, field, value)
    post.updated_by_user_id = actor.id
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise ConflictError("Slug already used by another post") from e
    db.refresh(post)
    audit.record(
        db,
        user_id=actor.id,
        action="post.update",
        entity_type="post",
        entity_id=post.id,
        before=before,
        after={"title": post.title, "slug": post.slug},
        ip=request.client.host if request.client else None,
    )
    return _to_out(db, post)


@admin_router.post("/{post_id}/publish", response_model=PostOut, dependencies=[Depends(require("blog.posts"))])
def publish_post(
    post_id: int,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise NotFoundError("Post not found")
    if post.status == "published":
        raise AppError("ALREADY_PUBLISHED", "Post is already published", status_code=409)
    post.status = "published"
    post.published_at = _now()
    post.updated_by_user_id = actor.id
    db.commit()
    db.refresh(post)
    audit.record(
        db,
        user_id=actor.id,
        action="post.publish",
        entity_type="post",
        entity_id=post.id,
        after={"published_at": post.published_at.isoformat()},
        ip=request.client.host if request.client else None,
    )
    return _to_out(db, post)


@admin_router.post("/{post_id}/unpublish", response_model=PostOut, dependencies=[Depends(require("blog.posts"))])
def unpublish_post(
    post_id: int,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise NotFoundError("Post not found")
    post.status = "draft"
    post.updated_by_user_id = actor.id
    db.commit()
    db.refresh(post)
    audit.record(
        db,
        user_id=actor.id,
        action="post.unpublish",
        entity_type="post",
        entity_id=post.id,
        ip=request.client.host if request.client else None,
    )
    return _to_out(db, post)


@admin_router.delete("/{post_id}", status_code=204, dependencies=[Depends(require("blog.posts"))])
def delete_post(
    post_id: int,
    request: Request,
    hard: bool = Query(False),
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise NotFoundError("Post not found")
    if hard:
        if actor.role != "super_admin":
            raise ForbiddenError("Hard delete requires super_admin")
        db.delete(post)
        action = "post.delete_hard"
    else:
        post.status = "archived"
        post.updated_by_user_id = actor.id
        action = "post.archive"
    db.commit()
    audit.record(
        db,
        user_id=actor.id,
        action=action,
        entity_type="post",
        entity_id=post_id,
        ip=request.client.host if request.client else None,
    )
