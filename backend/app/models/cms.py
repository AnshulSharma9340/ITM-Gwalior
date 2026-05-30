from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models._base import Base, MetadataMixin, TimestampMixin


class Page(Base, TimestampMixin, MetadataMixin):
    """A page-shaped record. Most public URLs map 1:1 to a row here.

    `path` is the public URL (e.g. "/", "/about", "/admissions/ug").
    `key` is a stable identifier the frontend can grab a section by name.
    """

    __tablename__ = "pages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    path: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    hero_image_id: Mapped[int | None] = mapped_column(
        ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True
    )
    intro_md: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="published", nullable=False)
    scope_key: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)

    # Phase 2: draft of MetadataMixin/page fields (title/hero/intro/meta_*/og_image/canonical/robots/schema_jsonld)
    seo_payload_draft: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    meta_draft: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # bumped on publish; public read can use ?v= for cache busting
    cache_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    sections: Mapped[list["PageSection"]] = relationship(
        "PageSection",
        back_populates="page",
        cascade="all, delete-orphan",
        order_by="PageSection.position",
        lazy="selectin",
    )


class PageSection(Base, TimestampMixin):
    """One slot of editable content on a page. The shape of `payload` depends on `kind`."""

    __tablename__ = "page_sections"
    __table_args__ = (UniqueConstraint("page_id", "section_key", name="uq_page_section_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    page_id: Mapped[int] = mapped_column(
        ForeignKey("pages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    section_key: Mapped[str] = mapped_column(String(64), nullable=False)
    label: Mapped[str | None] = mapped_column(String(128), nullable=True)
    # rich_text | gallery | list | form | html | kv | image | hero
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    payload: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)

    # Phase 2: visual-editor drafts
    payload_draft: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    draft_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    draft_updated_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    page: Mapped["Page"] = relationship("Page", back_populates="sections")


class NavMenu(Base, TimestampMixin):
    __tablename__ = "nav_menus"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(128), nullable=False)

    items: Mapped[list["NavItem"]] = relationship(
        "NavItem",
        back_populates="menu",
        cascade="all, delete-orphan",
        order_by="NavItem.sort_order",
        lazy="selectin",
    )


class NavItem(Base, TimestampMixin):
    __tablename__ = "nav_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    menu_id: Mapped[int] = mapped_column(
        ForeignKey("nav_menus.id", ondelete="CASCADE"), nullable=False, index=True
    )
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("nav_items.id", ondelete="CASCADE"), nullable=True, index=True
    )
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    external_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(64), nullable=True)
    target: Mapped[str | None] = mapped_column(String(16), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    menu: Mapped["NavMenu"] = relationship("NavMenu", back_populates="items")
