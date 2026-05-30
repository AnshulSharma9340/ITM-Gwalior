from __future__ import annotations

from sqlalchemy import JSON, Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models._base import Base, TimestampMixin


class ScopePreset(Base, TimestampMixin):
    """A named bundle of scope keys that can be applied to a user in one call.

    System presets (is_system=true) are seeded from code and cannot be deleted
    by the API; their scope_keys list can still be updated by re-running the
    seed script.
    """

    __tablename__ = "scope_presets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str | None] = mapped_column(String(512), nullable=True)
    scope_keys: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
