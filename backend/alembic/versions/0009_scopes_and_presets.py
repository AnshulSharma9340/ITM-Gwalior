"""Phase 1: add seo.edit/analytics.view/blog.posts scopes + scope_presets table.

Revision ID: 0009
Revises: 0008
Create Date: 2026-05-29
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


NEW_SCOPES = [
    ("seo.edit", "SEO / Meta", "Per-page title, description, og:image, canonical, robots, schema"),
    ("analytics.view", "Analytics", "Read admin analytics summary"),
    ("blog.posts", "Blog Posts", "Create, edit, and publish blog posts"),
]


def upgrade() -> None:
    # 1. Seed new scope rows (idempotent, DB-portable)
    bind = op.get_bind()
    existing = {
        r[0]
        for r in bind.execute(
            sa.text("SELECT key FROM scopes WHERE key IN :keys").bindparams(
                sa.bindparam("keys", expanding=True)
            ),
            {"keys": [k for k, _, _ in NEW_SCOPES]},
        )
    }
    for key, label, description in NEW_SCOPES:
        if key in existing:
            continue
        bind.execute(
            sa.text(
                "INSERT INTO scopes (key, label, description, created_at) "
                "VALUES (:key, :label, :description, CURRENT_TIMESTAMP)"
            ),
            {"key": key, "label": label, "description": description},
        )

    # 2. scope_presets table (no Postgres-only defaults; ORM provides defaults)
    op.create_table(
        "scope_presets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(64), nullable=False, unique=True),
        sa.Column("label", sa.String(128), nullable=False),
        sa.Column("description", sa.String(512), nullable=True),
        sa.Column("scope_keys", sa.JSON(), nullable=False),
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "created_by_user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "updated_by_user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_scope_presets_key", "scope_presets", ["key"])

    # NOTE: system presets are seeded by `scripts/seed_scope_presets.py`
    # (run via deploy step after `alembic upgrade head`). Keeping that out of
    # the migration so re-running the seed doesn't require a new revision.


def downgrade() -> None:
    op.drop_index("ix_scope_presets_key", table_name="scope_presets")
    op.drop_table("scope_presets")
    bind = op.get_bind()
    for key, _, _ in NEW_SCOPES:
        bind.execute(sa.text("DELETE FROM scopes WHERE key = :key"), {"key": key})
