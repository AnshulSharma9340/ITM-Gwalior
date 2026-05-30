from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AppError, ConflictError, NotFoundError
from app.core.rbac import SCOPES, is_known_scope
from app.core.security import hash_password
from app.deps import get_current_user, require, super_admin
from app.models import Scope, ScopePreset, User, UserScope
from app.schemas.scope_preset import ApplyPresetRequest
from app.schemas.user import (
    PasswordResetRequest,
    ScopeAssignment,
    ScopeOut,
    UserCreate,
    UserOut,
    UserUpdate,
)
from app.services import audit

router = APIRouter(prefix="/users", tags=["users"])


def _user_to_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,  # type: ignore[arg-type]
        is_active=user.is_active,
        must_change_password=user.must_change_password,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
        scopes=[s.key for s in user.scopes],
    )


@router.get("", response_model=list[UserOut], dependencies=[Depends(require("users.manage"))])
def list_users(
    db: Session = Depends(get_db),
    q: str | None = Query(None, description="Search by username/email/full_name"),
    role: str | None = Query(None),
    is_active: bool | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    stmt = select(User)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(User.username.ilike(like), User.email.ilike(like), User.full_name.ilike(like))
        )
    if role:
        stmt = stmt.where(User.role == role)
    if is_active is not None:
        stmt = stmt.where(User.is_active.is_(is_active))
    stmt = stmt.order_by(User.created_at.desc()).limit(limit).offset(offset)
    users = db.scalars(stmt).all()
    return [_user_to_out(u) for u in users]


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require("users.manage"))])
def create_user(
    body: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    # Reject unknown scope keys early
    unknown = [s for s in body.scopes if not is_known_scope(s)]
    if unknown:
        raise AppError("UNKNOWN_SCOPE", f"Unknown scopes: {', '.join(unknown)}", status_code=400)

    # Only super-admin may create another super-admin
    if body.role == "super_admin" and actor.role != "super_admin":
        raise AppError("FORBIDDEN", "Only a super-admin can create super-admins", status_code=403)

    user = User(
        username=body.username,
        email=str(body.email),
        full_name=body.full_name,
        phone=body.phone,
        role=body.role,
        password_hash=hash_password(body.password),
        is_active=body.is_active,
        must_change_password=body.must_change_password,
        created_by_user_id=actor.id,
        updated_by_user_id=actor.id,
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError as e:
        db.rollback()
        raise ConflictError("Username or email already exists") from e

    if body.scopes:
        scope_rows = db.scalars(select(Scope).where(Scope.key.in_(body.scopes))).all()
        for s in scope_rows:
            db.add(UserScope(user_id=user.id, scope_id=s.id, granted_by_user_id=actor.id))

    db.commit()
    db.refresh(user)
    audit.record(
        db,
        user_id=actor.id,
        action="user.create",
        entity_type="user",
        entity_id=user.id,
        after={"username": user.username, "role": user.role, "scopes": body.scopes},
        ip=request.client.host if request.client else None,
    )
    return _user_to_out(user)


@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(require("users.manage"))])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    return _user_to_out(user)


@router.patch("/{user_id}", response_model=UserOut, dependencies=[Depends(require("users.manage"))])
def update_user(
    user_id: int,
    body: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")

    before = {"email": user.email, "full_name": user.full_name, "role": user.role, "is_active": user.is_active}

    if body.role == "super_admin" and actor.role != "super_admin":
        raise AppError("FORBIDDEN", "Only a super-admin can promote to super-admin", status_code=403)

    if body.email is not None:
        user.email = str(body.email)
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.phone is not None:
        user.phone = body.phone
    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active

    user.updated_by_user_id = actor.id
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise ConflictError("Email already in use") from e

    db.refresh(user)
    audit.record(
        db,
        user_id=actor.id,
        action="user.update",
        entity_type="user",
        entity_id=user.id,
        before=before,
        after={"email": user.email, "full_name": user.full_name, "role": user.role, "is_active": user.is_active},
        ip=request.client.host if request.client else None,
    )
    return _user_to_out(user)


@router.delete("/{user_id}", status_code=204, dependencies=[Depends(super_admin)])
def deactivate_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    if user.id == actor.id:
        raise AppError("FORBIDDEN", "You cannot deactivate your own account", status_code=400)
    user.is_active = False
    db.commit()
    audit.record(
        db,
        user_id=actor.id,
        action="user.deactivate",
        entity_type="user",
        entity_id=user.id,
        ip=request.client.host if request.client else None,
    )


@router.post("/{user_id}/password", status_code=204, dependencies=[Depends(require("users.manage"))])
def admin_reset_password(
    user_id: int,
    body: PasswordResetRequest,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    user.password_hash = hash_password(body.new_password)
    user.must_change_password = body.must_change_password
    db.commit()
    audit.record(
        db,
        user_id=actor.id,
        action="user.password_reset",
        entity_type="user",
        entity_id=user.id,
        ip=request.client.host if request.client else None,
    )


@router.post("/{user_id}/scopes", response_model=UserOut, dependencies=[Depends(require("users.manage"))])
def update_user_scopes(
    user_id: int,
    body: ScopeAssignment,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")

    unknown = [s for s in (body.add + body.remove) if not is_known_scope(s)]
    if unknown:
        raise AppError("UNKNOWN_SCOPE", f"Unknown scopes: {', '.join(unknown)}", status_code=400)

    before_keys = sorted(s.key for s in user.scopes)

    if body.remove:
        remove_ids = [s.id for s in db.scalars(select(Scope).where(Scope.key.in_(body.remove))).all()]
        if remove_ids:
            db.query(UserScope).filter(
                UserScope.user_id == user.id, UserScope.scope_id.in_(remove_ids)
            ).delete(synchronize_session=False)

    if body.add:
        existing_ids = {s.id for s in user.scopes}
        add_rows = db.scalars(select(Scope).where(Scope.key.in_(body.add))).all()
        for s in add_rows:
            if s.id not in existing_ids:
                db.add(UserScope(user_id=user.id, scope_id=s.id, granted_by_user_id=actor.id))

    db.commit()
    db.refresh(user)
    after_keys = sorted(s.key for s in user.scopes)

    audit.record(
        db,
        user_id=actor.id,
        action="user.scopes_update",
        entity_type="user",
        entity_id=user.id,
        before={"scopes": before_keys},
        after={"scopes": after_keys},
        ip=request.client.host if request.client else None,
    )
    return _user_to_out(user)


@router.post("/{user_id}/scopes/apply-preset", response_model=UserOut, dependencies=[Depends(require("users.manage"))])
def apply_scope_preset(
    user_id: int,
    body: ApplyPresetRequest,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    preset = db.scalar(select(ScopePreset).where(ScopePreset.key == body.preset_key))
    if not preset:
        raise NotFoundError(f"Preset '{body.preset_key}' not found")

    before_keys = sorted(s.key for s in user.scopes)

    if body.mode == "replace":
        db.query(UserScope).filter(UserScope.user_id == user.id).delete(synchronize_session=False)
        db.flush()
        existing_ids: set[int] = set()
    else:
        existing_ids = {s.id for s in user.scopes}

    target_keys = [k for k in preset.scope_keys if is_known_scope(k)]
    if target_keys:
        rows = db.scalars(select(Scope).where(Scope.key.in_(target_keys))).all()
        for s in rows:
            if s.id not in existing_ids:
                db.add(UserScope(user_id=user.id, scope_id=s.id, granted_by_user_id=actor.id))

    db.commit()
    db.refresh(user)
    after_keys = sorted(s.key for s in user.scopes)
    audit.record(
        db,
        user_id=actor.id,
        action="user.scopes_apply_preset",
        entity_type="user",
        entity_id=user.id,
        before={"scopes": before_keys},
        after={"scopes": after_keys, "preset": preset.key, "mode": body.mode},
        ip=request.client.host if request.client else None,
    )
    return _user_to_out(user)


# ──────────────────────────────────────────────────────────────────────
# Scope catalog (any authenticated user can list; only super-admin to mutate
# — and we never mutate at runtime, scopes come from the registry seed).
# ──────────────────────────────────────────────────────────────────────
catalog_router = APIRouter(prefix="/scopes", tags=["scopes"])


@catalog_router.get("", response_model=list[ScopeOut])
def list_scopes(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.scalars(select(Scope).order_by(Scope.key)).all()
    return [ScopeOut.model_validate(s) for s in rows]


@catalog_router.get("/registry", response_model=list[ScopeOut])
def list_scope_registry(_: User = Depends(get_current_user)):
    """Returns the code-side registry — useful to detect scopes added but not yet seeded."""
    return [
        ScopeOut(id=i, key=sd.key, label=sd.label, description=sd.description)
        for i, sd in enumerate(SCOPES, start=1)
    ]
