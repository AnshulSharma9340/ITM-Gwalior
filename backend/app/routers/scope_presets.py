from __future__ import annotations

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AppError, ConflictError, NotFoundError
from app.core.rbac import is_known_scope
from app.deps import get_current_user, super_admin
from app.models import ScopePreset, User
from app.schemas.scope_preset import (
    ScopePresetCreate,
    ScopePresetOut,
    ScopePresetUpdate,
)
from app.services import audit

router = APIRouter(prefix="/scope-presets", tags=["scope-presets"])


def _validate_scope_keys(keys: list[str]) -> None:
    unknown = [k for k in keys if not is_known_scope(k)]
    if unknown:
        raise AppError(
            "UNKNOWN_SCOPE",
            f"Unknown scope keys: {', '.join(unknown)}",
            status_code=400,
        )


@router.get("", response_model=list[ScopePresetOut])
def list_presets(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.scalars(select(ScopePreset).order_by(ScopePreset.is_system.desc(), ScopePreset.key)).all()
    return [ScopePresetOut.model_validate(r) for r in rows]


@router.get("/{key}", response_model=ScopePresetOut)
def get_preset(key: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    preset = db.scalar(select(ScopePreset).where(ScopePreset.key == key))
    if not preset:
        raise NotFoundError("Preset not found")
    return ScopePresetOut.model_validate(preset)


@router.post("", response_model=ScopePresetOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(super_admin)])
def create_preset(
    body: ScopePresetCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    _validate_scope_keys(body.scope_keys)
    preset = ScopePreset(
        key=body.key,
        label=body.label,
        description=body.description,
        scope_keys=sorted(set(body.scope_keys)),
        is_system=False,
        created_by_user_id=actor.id,
        updated_by_user_id=actor.id,
    )
    db.add(preset)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise ConflictError("Preset key already exists") from e
    db.refresh(preset)
    audit.record(
        db,
        user_id=actor.id,
        action="scope_preset.create",
        entity_type="scope_preset",
        entity_id=preset.id,
        after={"key": preset.key, "scope_keys": preset.scope_keys},
        ip=request.client.host if request.client else None,
    )
    return ScopePresetOut.model_validate(preset)


@router.patch("/{key}", response_model=ScopePresetOut, dependencies=[Depends(super_admin)])
def update_preset(
    key: str,
    body: ScopePresetUpdate,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    preset = db.scalar(select(ScopePreset).where(ScopePreset.key == key))
    if not preset:
        raise NotFoundError("Preset not found")
    if preset.is_system:
        raise AppError(
            "SYSTEM_PRESET",
            "System presets cannot be edited via API; re-run the seed script to update.",
            status_code=409,
        )
    before = {"label": preset.label, "scope_keys": list(preset.scope_keys)}
    if body.label is not None:
        preset.label = body.label
    if body.description is not None:
        preset.description = body.description
    if body.scope_keys is not None:
        _validate_scope_keys(body.scope_keys)
        preset.scope_keys = sorted(set(body.scope_keys))
    preset.updated_by_user_id = actor.id
    db.commit()
    db.refresh(preset)
    audit.record(
        db,
        user_id=actor.id,
        action="scope_preset.update",
        entity_type="scope_preset",
        entity_id=preset.id,
        before=before,
        after={"label": preset.label, "scope_keys": preset.scope_keys},
        ip=request.client.host if request.client else None,
    )
    return ScopePresetOut.model_validate(preset)


@router.delete("/{key}", status_code=204, dependencies=[Depends(super_admin)])
def delete_preset(
    key: str,
    request: Request,
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
):
    preset = db.scalar(select(ScopePreset).where(ScopePreset.key == key))
    if not preset:
        raise NotFoundError("Preset not found")
    if preset.is_system:
        raise AppError("SYSTEM_PRESET", "System presets cannot be deleted.", status_code=409)
    db.delete(preset)
    db.commit()
    audit.record(
        db,
        user_id=actor.id,
        action="scope_preset.delete",
        entity_type="scope_preset",
        entity_id=preset.id,
        ip=request.client.host if request.client else None,
    )
