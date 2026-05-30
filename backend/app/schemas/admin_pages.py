from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class MediaRef(BaseModel):
    id: int
    public_url: str
    alt: str | None = None


class AdminPageListItem(BaseModel):
    id: int
    key: str
    path: str
    title: str
    status: str
    scope_key: str | None = None
    has_draft: bool
    draft_section_count: int = 0
    last_modified: datetime


class AdminSectionOut(BaseModel):
    id: int
    section_key: str
    label: str | None = None
    kind: str
    position: int
    is_active: bool
    payload: Any = None
    payload_draft: Any = None
    draft_updated_at: datetime | None = None
    has_draft: bool = False


class AdminSeoBlock(BaseModel):
    meta_title: str | None = None
    meta_description: str | None = None
    meta_keywords: list[str] | None = None
    og_image: MediaRef | None = None
    canonical_url: str | None = None
    robots: str = "index,follow"
    schema_jsonld: dict | None = None
    has_draft: bool = False


class AdminPageEditOut(BaseModel):
    id: int
    key: str
    path: str
    title: str
    status: str
    scope_key: str | None = None
    intro_md: str | None = None
    hero_image: MediaRef | None = None
    seo: AdminSeoBlock
    sections: list[AdminSectionOut]
    has_draft: bool
    cache_version: int


class AdminSectionPatch(BaseModel):
    payload: Any = None
    label: str | None = None
    is_active: bool | None = None


class AdminSectionCreate(BaseModel):
    section_key: str = Field(..., min_length=1, max_length=64)
    kind: str = Field(..., max_length=32)
    label: str | None = Field(None, max_length=128)
    position: int = 0
    payload: Any = None


class ReorderItem(BaseModel):
    section_key: str
    position: int


class AdminReorderRequest(BaseModel):
    order: list[ReorderItem]


class AdminMetaPatch(BaseModel):
    title: str | None = Field(None, max_length=255)
    intro_md: str | None = None
    hero_image_id: int | None = None
    seo_payload: dict | None = None  # {meta_title?, meta_description?, meta_keywords?, og_image_id?, canonical_url?, robots?, schema_jsonld?}


class PublishResult(BaseModel):
    published_at: datetime
    sections_promoted: int
    meta_promoted: bool


class DiscardResult(BaseModel):
    discarded_at: datetime
    sections_cleared: int


class DiffOut(BaseModel):
    sections: list[dict]
    meta: dict | None = None
    has_changes: bool
