"""One-shot import: frontend/src/data/departments_v2.js → departments + children.

Idempotent. Re-running updates the dept row if changed and replaces all
child rows (faculty/labs/etc.) to match the source. Safe to run after every
frontend data refresh.

Run from backend/:
    python -m scripts.import_departments
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import (
    Department,
    Faculty,
    HodProfile,
    IndustryPartner,
    Laboratory,
    StudentAward,
    StudentProject,
)

ROOT = Path(__file__).resolve().parents[2]
DATA_JS = ROOT / "frontend" / "src" / "data" / "departments_v2.js"
# Pre-rendered JSON shipped with the backend so HF Space (no Node, no frontend
# tree) can seed departments at startup.
DATA_JSON = Path(__file__).resolve().parents[1] / "data" / "departments.json"


def load_js_export() -> dict:
    # Production path: read the pre-rendered JSON committed alongside the backend.
    if DATA_JSON.exists():
        return json.loads(DATA_JSON.read_text(encoding="utf-8"))
    # Dev fallback: evaluate the live JS module via Node so local edits
    # to departments_v2.js flow through without a manual export step.
    if not DATA_JS.exists():
        raise FileNotFoundError(DATA_JS)
    file_url = DATA_JS.resolve().as_uri()
    try:
        out = subprocess.check_output(
            [
                "node",
                "--input-type=module",
                "-e",
                f"import('{file_url}').then(m => process.stdout.write(JSON.stringify(m.DEPARTMENTS)))",
            ],
            cwd=str(ROOT),
            stderr=subprocess.PIPE,
            timeout=30,
        )
        return json.loads(out)
    except (FileNotFoundError, subprocess.CalledProcessError) as e:
        raise SystemExit(
            "node is required to evaluate the JS data module. Install Node or pre-export the JSON.\n"
            f"underlying error: {e}"
        )


SCOPE_FOR_CODE = {
    "CSE": "dept.cse",
    "IT": "dept.it",
    "ECE": "dept.ece",
    "CE": "dept.ce",
    "ME": "dept.me",
    "MBA": "dept.mba",
    "ESH": "dept.esh",
}


def _split_accent(accent: str | None) -> tuple[str | None, str | None]:
    """'from-rose-500 to-[#800000]' → ('from-rose-500', 'to-[#800000]')."""
    if not accent:
        return None, None
    parts = accent.split()
    a_from = next((p for p in parts if p.startswith("from-")), None)
    a_to = next((p for p in parts if p.startswith("to-")), None)
    return a_from, a_to


def _dept_payload(key: str, src: dict) -> dict:
    a_from, a_to = _split_accent(src.get("accent"))
    return dict(
        code=src.get("code", key).upper(),
        name=src.get("name"),
        short_name=src.get("short"),
        page_path=src.get("subPath"),
        established_year=src.get("established"),
        intake=src.get("intake"),
        duration=src.get("duration"),
        mtech_since=src.get("mtechSince"),
        mtech_intake=src.get("mtechIntake"),
        affiliation=src.get("affiliation"),
        faculty_count=src.get("facultyCount"),
        accent_from=a_from,
        accent_to=a_to,
        accent_solid=src.get("accentSolid"),
        icon=src.get("icon"),
        image_url=src.get("image"),
        badge=src.get("badge"),
        subtitle=src.get("subtitle"),
        intro_md=src.get("intro"),
        chips=src.get("chips"),
        accreditations=src.get("accreditations"),
        specializations=src.get("specializations"),
        features=src.get("features"),
        hod_highlights=src.get("hodHighlights"),
        software=src.get("software"),
        vision=src.get("vision"),
        mission=src.get("mission"),
        peos=src.get("peos"),
        psos=src.get("psos"),
        achievements=src.get("achievements"),
        sub_units=src.get("subUnits"),
        infra=src.get("infra"),
        consultancy=src.get("consultancy"),
        events_list=src.get("events"),
        guest_lectures=src.get("guestLectures"),
        industrial_visits=src.get("industrialVisits"),
        placement_payload=src.get("placement"),
        placement_batches=src.get("placementBatches"),
        contact=src.get("contact"),
        scope_key=SCOPE_FOR_CODE.get((src.get("code") or key).upper()),
        slug=src.get("subPath", f"/{key}").lstrip("/"),
        meta_title=f"{src.get('name')} — ITM Gwalior" if src.get("name") else None,
        meta_description=src.get("subtitle") or src.get("intro"),
        is_published=True,
    )


def upsert_department(db, key: str, src: dict) -> Department:
    payload = _dept_payload(key, src)
    code = payload["code"]
    dept = db.scalar(select(Department).where(Department.code == code))
    if not dept:
        dept = Department(**payload)
        db.add(dept)
    else:
        for k, v in payload.items():
            setattr(dept, k, v)
    db.flush()
    return dept


def replace_children(db, dept: Department, src: dict) -> None:
    # HoD
    hod_src = src.get("hod")
    if dept.hod:
        db.delete(dept.hod)
        db.flush()
    if hod_src:
        db.add(HodProfile(
            department_id=dept.id,
            name=hod_src.get("name", ""),
            role=hod_src.get("role"),
            qualification=hod_src.get("qualification"),
            message_md=hod_src.get("message"),
            phone=hod_src.get("phone"),
            email=hod_src.get("email"),
            joined_on=hod_src.get("joined"),
            research_area=hod_src.get("research"),
        ))

    # Faculty highlights
    db.query(Faculty).filter(Faculty.department_id == dept.id).delete()
    for i, f in enumerate(src.get("facultyHighlights", []) or []):
        db.add(Faculty(
            department_id=dept.id,
            name=f.get("name", ""),
            role=f.get("role"),
            qualification=f.get("qual"),
            is_highlight=True,
            sort_order=i,
        ))

    # Labs
    db.query(Laboratory).filter(Laboratory.department_id == dept.id).delete()
    for i, l in enumerate(src.get("labs", []) or []):
        db.add(Laboratory(
            department_id=dept.id,
            name=l.get("name", ""),
            icon=l.get("icon"),
            description=l.get("desc"),
            sort_order=i,
        ))

    # Industry + Govt partners
    db.query(IndustryPartner).filter(IndustryPartner.department_id == dept.id).delete()
    for i, name in enumerate(src.get("industryPartners", []) or []):
        db.add(IndustryPartner(
            department_id=dept.id, name=name, category="industry", sort_order=i,
        ))
    base = len(src.get("industryPartners", []) or [])
    for i, name in enumerate(src.get("govPartners", []) or []):
        db.add(IndustryPartner(
            department_id=dept.id, name=name, category="govt", sort_order=base + i,
        ))

    # Projects
    db.query(StudentProject).filter(StudentProject.department_id == dept.id).delete()
    for i, p in enumerate(src.get("projects", []) or []):
        db.add(StudentProject(
            department_id=dept.id,
            title=p.get("title", ""),
            note=p.get("note"),
            sort_order=i,
        ))

    # Awards
    db.query(StudentAward).filter(StudentAward.department_id == dept.id).delete()
    for i, a in enumerate(src.get("studentAchievements", []) or []):
        db.add(StudentAward(
            department_id=dept.id,
            student_name=a.get("name", ""),
            award=a.get("award", ""),
            batch=a.get("batch"),
            sort_order=i,
        ))


def main() -> None:
    data = load_js_export()
    db = SessionLocal()
    try:
        for key, src in data.items():
            dept = upsert_department(db, key, src)
            replace_children(db, dept, src)
        db.commit()
        print(f"[import] departments processed: {len(data)}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
