"""Seed the 15 system scope presets.

Idempotent: re-running upserts label/description/scope_keys by key.
DB-portable: uses SQLAlchemy ORM instead of vendor-specific UPSERT SQL,
so it works on both SQLite (local dev) and Postgres (production).
"""
from __future__ import annotations

from typing import TypedDict

from sqlalchemy import select

# The list is authoritative: editing here + re-running the script updates the DB.


class PresetSpec(TypedDict, total=False):
    key: str
    label: str
    description: str | None
    scope_keys: list[str]


SYSTEM_PRESETS: list[PresetSpec] = [
    {
        "key": "editor_default",
        "label": "Editor (default)",
        "description": "Standard content editor: pages, gallery, SEO, notices, common events, contact inbox.",
        "scope_keys": [
            "site.pages",
            "gallery",
            "seo.edit",
            "forms.contact",
            "notices",
            "events.cultural",
            "events.pac",
        ],
    },
    {
        "key": "dept_editor_cse",
        "label": "Department Editor — CSE",
        "description": "Edit Computer Science & Engineering department page.",
        "scope_keys": ["dept.cse", "gallery", "seo.edit"],
    },
    {
        "key": "dept_editor_ece",
        "label": "Department Editor — ECE",
        "description": "Edit Electronics & Communication department page.",
        "scope_keys": ["dept.ece", "gallery", "seo.edit"],
    },
    {
        "key": "dept_editor_it",
        "label": "Department Editor — IT",
        "description": "Edit Information Technology department page.",
        "scope_keys": ["dept.it", "gallery", "seo.edit"],
    },
    {
        "key": "dept_editor_ce",
        "label": "Department Editor — Civil",
        "description": "Edit Civil Engineering department page.",
        "scope_keys": ["dept.ce", "gallery", "seo.edit"],
    },
    {
        "key": "dept_editor_me",
        "label": "Department Editor — Mechanical",
        "description": "Edit Mechanical Engineering department page.",
        "scope_keys": ["dept.me", "gallery", "seo.edit"],
    },
    {
        "key": "dept_editor_mba",
        "label": "Department Editor — MBA",
        "description": "Edit MBA department page, specialisations, consultancy.",
        "scope_keys": ["dept.mba", "gallery", "seo.edit"],
    },
    {
        "key": "dept_editor_esh",
        "label": "Department Editor — ESH",
        "description": "Edit Engineering Sciences & Humanities department page.",
        "scope_keys": ["dept.esh", "gallery", "seo.edit"],
    },
    {
        "key": "admissions_team",
        "label": "Admissions Team",
        "description": "Admissions content + lead inbox + contact inbox + SEO.",
        "scope_keys": [
            "admissions.content",
            "admissions.leads",
            "forms.contact",
            "seo.edit",
        ],
    },
    {
        "key": "placement_team",
        "label": "Placement / TAP Team",
        "description": "Placement cell: team, services, MoUs, events, recruiters, records.",
        "scope_keys": ["placements.tap", "gallery", "seo.edit"],
    },
    {
        "key": "research_team",
        "label": "Research Office",
        "description": "R&D Cell, publications, journal, conference, FDP, innovation.",
        "scope_keys": [
            "research.rdcell",
            "research.publications",
            "research.journal",
            "research.conference",
            "research.fdp",
            "research.innovation",
            "seo.edit",
        ],
    },
    {
        "key": "compliance_team",
        "label": "Compliance / IQAC",
        "description": "NAAC, NIRF, committees, policies.",
        "scope_keys": [
            "compliance.naac",
            "compliance.nirf",
            "compliance.committees",
            "compliance.policies",
        ],
    },
    {
        "key": "alumni_team",
        "label": "Alumni Cell",
        "description": "Alumni speaks, chapters, mentorship, membership.",
        "scope_keys": [
            "alumni.speaks",
            "alumni.chapters",
            "alumni.mentorship",
            "alumni.membership",
        ],
    },
    {
        "key": "careers_team",
        "label": "Careers / HR",
        "description": "Open positions, JRF, applications inbox.",
        "scope_keys": [
            "careers.positions",
            "careers.applications",
            "careers.jrf",
        ],
    },
    {
        "key": "analytics_viewer",
        "label": "Analytics Viewer",
        "description": "Read-only analytics dashboard.",
        "scope_keys": ["analytics.view"],
    },
]


def upsert_all(session) -> int:
    """Upsert all SYSTEM_PRESETS. Returns count of rows written."""
    from app.models import ScopePreset

    n = 0
    for p in SYSTEM_PRESETS:
        existing = session.scalar(select(ScopePreset).where(ScopePreset.key == p["key"]))
        if existing is None:
            session.add(
                ScopePreset(
                    key=p["key"],
                    label=p["label"],
                    description=p.get("description"),
                    scope_keys=list(p["scope_keys"]),
                    is_system=True,
                )
            )
        else:
            existing.label = p["label"]
            existing.description = p.get("description")
            existing.scope_keys = list(p["scope_keys"])
            existing.is_system = True
        n += 1
    session.commit()
    return n


if __name__ == "__main__":
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        written = upsert_all(db)
        print(f"Seeded {written} system scope presets.")
    finally:
        db.close()
