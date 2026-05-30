"""Phase 2: draft columns on pages + page_sections, cache_version on pages.

Revision ID: 0010
Revises: 0009
Create Date: 2026-05-29
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0010"
down_revision: Union[str, None] = "0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # batch_alter_table works on both Postgres (issues plain ALTERs) and SQLite
    # (uses copy-and-move). FKs are declared inside the batch so SQLite is happy.
    with op.batch_alter_table("pages") as batch:
        batch.add_column(sa.Column("seo_payload_draft", sa.JSON(), nullable=True))
        batch.add_column(sa.Column("meta_draft", sa.JSON(), nullable=True))
        batch.add_column(
            sa.Column("cache_version", sa.Integer(), nullable=False, server_default="1")
        )

    with op.batch_alter_table("page_sections") as batch:
        batch.add_column(sa.Column("payload_draft", sa.JSON(), nullable=True))
        batch.add_column(sa.Column("draft_updated_at", sa.DateTime(timezone=True), nullable=True))
        batch.add_column(
            sa.Column(
                "draft_updated_by_user_id",
                sa.Integer(),
                sa.ForeignKey("users.id", name="fk_page_sections_draft_user", ondelete="SET NULL"),
                nullable=True,
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("page_sections") as batch:
        batch.drop_column("draft_updated_by_user_id")
        batch.drop_column("draft_updated_at")
        batch.drop_column("payload_draft")
    with op.batch_alter_table("pages") as batch:
        batch.drop_column("cache_version")
        batch.drop_column("meta_draft")
        batch.drop_column("seo_payload_draft")
