from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

PostStatus = Literal["draft", "published", "archived"]


class PostListItem(BaseModel):
    id: int
    slug: str
    title: str
    excerpt: str | None = None
    hero_image_url: str | None = None
    status: PostStatus
    published_at: datetime | None = None
    category: str | None = None
    tags: list[str] = []
    view_count: int = 0
    author_user_id: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PostOut(PostListItem):
    body_md: str
    seo_payload: dict | None = None


class PostCreate(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255, pattern=r"^[a-z0-9-]+$")
    title: str = Field(..., min_length=1, max_length=255)
    excerpt: str | None = Field(None, max_length=512)
    body_md: str = ""
    hero_image_id: int | None = None
    category: str | None = Field(None, max_length=64)
    tags: list[str] = Field(default_factory=list)
    seo_payload: dict | None = None


class PostUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    slug: str | None = Field(None, pattern=r"^[a-z0-9-]+$")
    excerpt: str | None = Field(None, max_length=512)
    body_md: str | None = None
    hero_image_id: int | None = None
    category: str | None = Field(None, max_length=64)
    tags: list[str] | None = None
    seo_payload: dict | None = None
