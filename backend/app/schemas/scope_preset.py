from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ScopePresetOut(BaseModel):
    id: int
    key: str
    label: str
    description: str | None = None
    scope_keys: list[str] = []
    is_system: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ScopePresetCreate(BaseModel):
    key: str = Field(..., min_length=2, max_length=64, pattern=r"^[a-z0-9_]+$")
    label: str = Field(..., min_length=1, max_length=128)
    description: str | None = Field(None, max_length=512)
    scope_keys: list[str] = Field(default_factory=list)


class ScopePresetUpdate(BaseModel):
    label: str | None = Field(None, min_length=1, max_length=128)
    description: str | None = Field(None, max_length=512)
    scope_keys: list[str] | None = None


class ApplyPresetRequest(BaseModel):
    preset_key: str = Field(..., min_length=2, max_length=64)
    mode: Literal["replace", "add"] = "add"
