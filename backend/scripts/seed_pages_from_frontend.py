"""Seed `pages` + `page_sections` rows for every public route the React app has.

Idempotent: upserts by `(key)` for pages and `(page_id, section_key)` for sections.
Never deletes sections — editors can add custom ones beyond this catalogue.

Routes mirror `frontend/src/App.jsx` as of 2026-05. Total: 78 entries.

Run after `alembic upgrade head`:
    python -m scripts.seed_pages_from_frontend
"""
from __future__ import annotations

from typing import TypedDict

from sqlalchemy import select
from sqlalchemy.orm import Session


class _Section(TypedDict, total=False):
    section_key: str
    kind: str
    label: str
    payload: object


class _PageSpec(TypedDict, total=False):
    key: str
    path: str
    title: str
    scope_key: str | None
    sections: list[_Section]


def _s(section_key: str, kind: str, label: str, payload: object | None = None) -> _Section:
    if kind == "list":
        default: object = []
    elif kind in {"kv", "hero", "image", "form", "html", "rich_text"}:
        default = {}
    elif kind == "gallery":
        default = []
    else:
        default = {}
    return {
        "section_key": section_key,
        "kind": kind,
        "label": label,
        "payload": payload if payload is not None else default,
    }


HERO = lambda label="Hero banner": _s("hero", "hero", label)


def _dept_sections() -> list[_Section]:
    return [
        HERO(),
        _s("overview", "rich_text", "About the department"),
        _s("hod", "kv", "HOD profile", {"name": "", "designation": "", "photo_id": None, "message_md": ""}),
        _s("faculty", "list", "Faculty"),
        _s("labs", "list", "Labs"),
        _s("projects", "list", "Student projects"),
        _s("achievements", "list", "Achievements"),
        _s("gallery", "gallery", "Department gallery"),
    ]


def _cell_sections() -> list[_Section]:
    return [
        HERO(),
        _s("overview", "rich_text", "About"),
        _s("activities", "list", "Activities"),
        _s("team", "list", "Team"),
        _s("gallery", "gallery", "Gallery"),
    ]


def _about_sub_sections() -> list[_Section]:
    return [HERO(), _s("intro", "rich_text", "Intro"), _s("body", "rich_text", "Body content")]


def _gallery_sections() -> list[_Section]:
    return [HERO(), _s("intro", "rich_text", "Intro"), _s("photos", "gallery", "Photos")]


def _research_sub() -> list[_Section]:
    return [HERO(), _s("about", "rich_text", "About"), _s("content", "list", "Content")]


PAGE_CATALOGUE: list[_PageSpec] = [
    # ── Home + Contact ──────────────────────────────────────────────────
    {
        "key": "home",
        "path": "/",
        "title": "ITM Gwalior — Home",
        "scope_key": "site.pages",
        "sections": [
            _s("hero", "hero", "Hero slider"),
            _s("stats", "kv", "Headline stats", {"students": "", "faculty": "", "recruiters": "", "years": ""}),
            _s("why_itm", "rich_text", "Why ITM"),
            _s("departments", "list", "Department cards"),
            _s("placements", "list", "Placement highlights"),
            _s("director", "rich_text", "Director's vision"),
            _s("testimonials", "list", "Testimonials"),
            _s("cta", "kv", "Admission CTA", {"title": "", "subtitle": "", "button_text": "Apply now", "link": "/admissions/how-to-apply"}),
        ],
    },
    {"key": "contact", "path": "/contact", "title": "Contact us", "scope_key": "site.pages",
     "sections": [HERO(), _s("info", "kv", "Contact info", {"address": "", "phone": "", "email": "", "map_embed": ""}), _s("form_settings", "kv", "Form settings", {"thank_you": "", "notify_emails": []})]},
    {"key": "tap", "path": "/tap", "title": "Training & Placement (TAP)", "scope_key": "placements.tap",
     "sections": [HERO(), _s("overview", "rich_text", "About TAP"), _s("team", "list", "TAP team"), _s("services", "list", "Services"), _s("recruiters", "list", "Recruiters"), _s("statistics", "kv", "Stats", {"average": "", "highest": "", "offers": ""}), _s("records", "list", "Placement records"), _s("mous", "list", "MoUs"), _s("events", "list", "TAP events"), _s("testimonials", "list", "Recruiter testimonials")]},

    # ── About ──────────────────────────────────────────────────────────
    {"key": "about", "path": "/about", "title": "About ITM Gwalior", "scope_key": "site.pages",
     "sections": [HERO(), _s("vision_mission", "kv", "Vision & mission", {"vision": "", "mission": ""}), _s("history", "rich_text", "History"), _s("leadership", "list", "Leadership team"), _s("milestones", "list", "Milestones")]},
    {"key": "about_mission_vision", "path": "/about/mission-vision", "title": "Mission & Vision", "scope_key": "site.pages", "sections": _about_sub_sections()},
    {"key": "about_officials", "path": "/about/officials", "title": "ITM Officials", "scope_key": "site.pages", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("officials", "list", "Officials")]},
    {"key": "about_board", "path": "/about/board-of-governors", "title": "Board of Governors", "scope_key": "site.pages", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("members", "list", "Members")]},
    {"key": "about_director_message", "path": "/about/director-message", "title": "Director's Message", "scope_key": "site.pages", "sections": [HERO(), _s("message", "rich_text", "Message")]},
    {"key": "about_programmes", "path": "/about/programmes", "title": "Programmes Offered", "scope_key": "site.pages", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("programmes", "list", "Programmes")]},
    {"key": "about_infrastructure", "path": "/about/infrastructure", "title": "Infrastructure", "scope_key": "site.pages", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("highlights", "list", "Highlights"), _s("gallery", "gallery", "Gallery")]},
    {"key": "about_best_practices", "path": "/about/best-practices", "title": "Best Practices", "scope_key": "site.pages", "sections": _about_sub_sections()},
    {"key": "about_distinctiveness", "path": "/about/distinctiveness", "title": "Distinctiveness", "scope_key": "site.pages", "sections": _about_sub_sections()},
    {"key": "about_gwalior", "path": "/about/gwalior", "title": "What Gwalior Offers", "scope_key": "site.pages", "sections": _about_sub_sections()},
    {"key": "about_magazine", "path": "/about/magazine", "title": "Student Magazine", "scope_key": "site.pages", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("issues", "list", "Issues")]},
    {"key": "about_policies", "path": "/about/policies", "title": "Policies & Reports", "scope_key": "compliance.policies", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("documents", "list", "Documents")]},

    # ── Admissions ─────────────────────────────────────────────────────
    {"key": "admissions_index", "path": "/admissions", "title": "Admissions", "scope_key": "admissions.content",
     "sections": [HERO(), _s("overview", "rich_text", "Admissions overview"), _s("programmes", "list", "Programmes offered"), _s("timeline", "list", "Admission timeline"), _s("counsellors", "list", "Counsellors"), _s("faqs", "list", "FAQs")]},
    {"key": "admissions_ug", "path": "/admissions/ug", "title": "UG Courses", "scope_key": "admissions.content", "sections": [HERO(), _s("eligibility", "rich_text", "Eligibility"), _s("fees", "list", "Fee structure"), _s("documents", "list", "Required documents"), _s("quota", "list", "Quotas")]},
    {"key": "admissions_pg", "path": "/admissions/pg", "title": "PG Courses", "scope_key": "admissions.content", "sections": [HERO(), _s("eligibility", "rich_text", "Eligibility"), _s("fees", "list", "Fee structure"), _s("documents", "list", "Required documents")]},
    {"key": "admissions_seek", "path": "/admissions/how-to-apply", "title": "How to Seek Admission", "scope_key": "admissions.leads", "sections": [HERO(), _s("intro", "rich_text", "How it works"), _s("form_settings", "kv", "Form settings", {"thank_you": "", "redirect_url": ""})]},

    # ── Departments (short paths in App.jsx) ───────────────────────────
    {"key": "dept_cs", "path": "/cs", "title": "Computer Science & Engineering", "scope_key": "dept.cse", "sections": _dept_sections()},
    {"key": "dept_it", "path": "/it", "title": "Information Technology", "scope_key": "dept.it", "sections": _dept_sections()},
    {"key": "dept_ece", "path": "/ece", "title": "Electronics & Communication", "scope_key": "dept.ece", "sections": _dept_sections()},
    {"key": "dept_me", "path": "/me", "title": "Mechanical Engineering", "scope_key": "dept.me", "sections": _dept_sections()},
    {"key": "dept_ce", "path": "/ce", "title": "Civil Engineering", "scope_key": "dept.ce", "sections": _dept_sections()},
    {"key": "dept_mba", "path": "/mba", "title": "MBA · Management", "scope_key": "dept.mba", "sections": _dept_sections() + [_s("specialisations", "list", "Specialisations"), _s("consultancy", "list", "Consultancy")]},
    {"key": "dept_esh", "path": "/esh", "title": "Engineering Sciences & Humanities", "scope_key": "dept.esh", "sections": _dept_sections()},

    # Department dynamic / aliased entry points
    {"key": "dept_hub", "path": "/department", "title": "Departments Hub", "scope_key": "site.pages", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("departments", "list", "Departments")]},
    {"key": "dept_alias_civil", "path": "/department/civil", "title": "Civil (alias)", "scope_key": "dept.ce", "sections": _dept_sections()},
    {"key": "dept_alias_cse", "path": "/department/cse", "title": "CSE (alias)", "scope_key": "dept.cse", "sections": _dept_sections()},
    {"key": "dept_alias_ece", "path": "/department/ece", "title": "ECE (alias)", "scope_key": "dept.ece", "sections": _dept_sections()},
    {"key": "dept_alias_it", "path": "/department/it", "title": "IT (alias)", "scope_key": "dept.it", "sections": _dept_sections()},

    # ── Emerging branches ──────────────────────────────────────────────
    {"key": "emerging_branches", "path": "/emerging-branches", "title": "Emerging Branches", "scope_key": "site.pages", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("branches", "list", "Branches")]},
    {"key": "emerging_aiml", "path": "/aiml", "title": "AI / Machine Learning", "scope_key": "emerging.aiml", "sections": [HERO(), _s("overview", "rich_text", "Overview"), _s("curriculum", "list", "Curriculum"), _s("careers", "rich_text", "Career paths"), _s("labs", "list", "Labs")]},
    {"key": "emerging_cyber", "path": "/cyber-security", "title": "Cyber Security", "scope_key": "emerging.cyber", "sections": [HERO(), _s("overview", "rich_text", "Overview"), _s("curriculum", "list", "Curriculum"), _s("careers", "rich_text", "Career paths"), _s("labs", "list", "Labs")]},
    {"key": "emerging_cloud", "path": "/cloud-computing", "title": "Cloud Computing", "scope_key": "emerging.cloud", "sections": [HERO(), _s("overview", "rich_text", "Overview"), _s("curriculum", "list", "Curriculum"), _s("careers", "rich_text", "Career paths"), _s("labs", "list", "Labs")]},
    # Aliased department/cse/* routes
    {"key": "emerging_aiml_alias", "path": "/department/cse/aiml", "title": "AI/ML (alias)", "scope_key": "emerging.aiml", "sections": [HERO(), _s("overview", "rich_text", "Overview")]},
    {"key": "emerging_cloud_alias", "path": "/department/cse/cloud-computing", "title": "Cloud (alias)", "scope_key": "emerging.cloud", "sections": [HERO(), _s("overview", "rich_text", "Overview")]},
    {"key": "emerging_cyber_alias", "path": "/department/cse/cyber-security", "title": "Cyber (alias)", "scope_key": "emerging.cyber", "sections": [HERO(), _s("overview", "rich_text", "Overview")]},

    # ── Library ────────────────────────────────────────────────────────
    {"key": "library", "path": "/library", "title": "Central Library", "scope_key": "library", "sections": [HERO(), _s("overview", "rich_text", "Overview"), _s("collections", "list", "Collections"), _s("services", "list", "Services"), _s("gallery", "gallery", "Library gallery")]},
    {"key": "central_library", "path": "/central-library", "title": "Central Library (alias)", "scope_key": "library", "sections": [HERO(), _s("overview", "rich_text", "Overview")]},

    # ── Research ───────────────────────────────────────────────────────
    {"key": "research_index", "path": "/research", "title": "Research", "scope_key": "research.rdcell", "sections": [HERO(), _s("overview", "rich_text", "Research at ITM"), _s("focus_areas", "list", "Focus areas")]},
    {"key": "research_rdcell", "path": "/research/rd-cell", "title": "R&D Cell", "scope_key": "research.rdcell", "sections": [HERO(), _s("vision_mission", "kv", "Vision & mission", {"vision": "", "mission": ""}), _s("offerings", "list", "Offerings"), _s("policies", "list", "Policies")]},
    {"key": "research_journal", "path": "/research/journal", "title": "Journal", "scope_key": "research.journal", "sections": [HERO(), _s("about", "rich_text", "About the journal"), _s("editorial_board", "list", "Editorial board"), _s("issues", "list", "Issues")]},
    {"key": "research_conference", "path": "/research/conference", "title": "Conferences", "scope_key": "research.conference", "sections": [HERO(), _s("about", "rich_text", "About"), _s("conferences", "list", "Conferences"), _s("papers", "list", "Papers")]},
    {"key": "research_fdp", "path": "/research/fdp", "title": "Faculty Development Programmes", "scope_key": "research.fdp", "sections": [HERO(), _s("about", "rich_text", "About"), _s("upcoming", "list", "Upcoming FDPs"), _s("past", "list", "Past FDPs")]},
    {"key": "research_innovation", "path": "/research/innovation-ecosystem", "title": "Innovation Ecosystem", "scope_key": "research.innovation", "sections": [HERO(), _s("overview", "rich_text", "Overview"), _s("incubation", "rich_text", "Incubation"), _s("startups", "list", "Startups"), _s("patents", "list", "Patents")]},

    # ── Cells / Clubs (under /cells/* and short paths) ─────────────────
    {"key": "cell_nss", "path": "/cells/nss", "title": "NSS", "scope_key": "clubs.nss", "sections": _cell_sections()},
    {"key": "cell_uba", "path": "/cells/uba", "title": "Unnat Bharat Abhiyan", "scope_key": "clubs.uba", "sections": _cell_sections()},
    {"key": "cell_wec", "path": "/cells/wec", "title": "Women Empowerment Cell", "scope_key": "clubs.wec", "sections": _cell_sections()},
    {"key": "cell_sports", "path": "/cells/sports", "title": "Sports Cell", "scope_key": "clubs.sports", "sections": _cell_sections()},
    {"key": "cell_nss_short", "path": "/nss", "title": "NSS (short)", "scope_key": "clubs.nss", "sections": _cell_sections()},
    {"key": "cell_uba_short", "path": "/uba", "title": "UBA (short)", "scope_key": "clubs.uba", "sections": _cell_sections()},
    {"key": "cell_wec_short", "path": "/wec", "title": "WEC (short)", "scope_key": "clubs.wec", "sections": _cell_sections()},
    {"key": "cell_sports_short", "path": "/sports", "title": "Sports (short)", "scope_key": "clubs.sports", "sections": _cell_sections()},
    {"key": "cell_iqac", "path": "/iqac", "title": "IQAC", "scope_key": "clubs.iqac", "sections": _cell_sections()},
    {"key": "cell_anti_ragging", "path": "/anti-ragging", "title": "Anti-Ragging Cell", "scope_key": "clubs.anti_ragging", "sections": _cell_sections()},
    {"key": "cell_pac", "path": "/pac", "title": "Performing Arts Club", "scope_key": "events.pac", "sections": _cell_sections()},
    {"key": "cell_clubs_hub", "path": "/clubs", "title": "Clubs Hub", "scope_key": "clubs.other", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("clubs", "list", "Clubs")]},

    # ── Alumni ─────────────────────────────────────────────────────────
    {"key": "alumni_speaks", "path": "/alumni/speaks", "title": "Alumni Speaks", "scope_key": "alumni.speaks", "sections": [HERO(), _s("testimonials", "list", "Alumni testimonials")]},
    {"key": "alumni_chapters", "path": "/alumni/chapters", "title": "Alumni Chapters", "scope_key": "alumni.chapters", "sections": [HERO(), _s("intro", "rich_text", "About chapters"), _s("chapters", "list", "City chapters")]},
    {"key": "alumni_mentorship", "path": "/alumni/mentorship", "title": "Alumni Mentorship", "scope_key": "alumni.mentorship", "sections": [HERO(), _s("intro", "rich_text", "About mentorship"), _s("programmes", "list", "Mentorship programmes")]},
    {"key": "alumni_membership", "path": "/alumni/membership", "title": "Alumni Membership", "scope_key": "alumni.membership", "sections": [HERO(), _s("intro", "rich_text", "Membership"), _s("benefits", "list", "Benefits"), _s("form_settings", "kv", "Form settings", {"thank_you": ""})]},

    # ── Gallery ────────────────────────────────────────────────────────
    # Use existing "gallery" key to avoid path UNIQUE collision with the v1 seed.
    {"key": "gallery", "path": "/gallery", "title": "Gallery", "scope_key": "gallery", "sections": [HERO(), _s("categories", "list", "Categories"), _s("featured", "gallery", "Featured photos")]},
    {"key": "gallery_cultural", "path": "/gallery/cultural", "title": "Cultural Gallery", "scope_key": "gallery", "sections": _gallery_sections()},
    {"key": "gallery_experts", "path": "/gallery/experts", "title": "Expert Sessions Gallery", "scope_key": "gallery", "sections": _gallery_sections()},
    {"key": "gallery_infra", "path": "/gallery/infrastructure", "title": "Infrastructure Gallery", "scope_key": "gallery", "sections": _gallery_sections()},
    {"key": "gallery_sports", "path": "/gallery/sports", "title": "Sports Gallery", "scope_key": "gallery", "sections": _gallery_sections()},
    {"key": "gallery_students", "path": "/gallery/students", "title": "Students Gallery", "scope_key": "gallery", "sections": _gallery_sections()},
    {"key": "gallery_life", "path": "/gallery/life", "title": "Life at ITM", "scope_key": "gallery", "sections": _gallery_sections()},
    {"key": "gallery_videos", "path": "/gallery/videos", "title": "Video Gallery", "scope_key": "gallery", "sections": [HERO(), _s("videos", "list", "Videos")]},

    # ── Compliance (short paths) ───────────────────────────────────────
    {"key": "compliance_naac", "path": "/naac", "title": "NAAC", "scope_key": "compliance.naac", "sections": [HERO(), _s("grade", "kv", "NAAC grade", {"grade": "", "cycle": "", "cgpa": ""}), _s("documents", "list", "Documents")]},
    {"key": "compliance_nirf", "path": "/nirf", "title": "NIRF", "scope_key": "compliance.nirf", "sections": [HERO(), _s("rankings", "list", "Rankings"), _s("documents", "list", "Documents")]},
    {"key": "compliance_committees", "path": "/committees", "title": "Committees", "scope_key": "compliance.committees", "sections": [HERO(), _s("committees", "list", "Committees")]},
    {"key": "compliance_mous", "path": "/mous", "title": "MoUs", "scope_key": "compliance.committees", "sections": [HERO(), _s("mous", "list", "MoUs")]},
    {"key": "compliance_appreciation", "path": "/appreciation", "title": "Appreciation Letters", "scope_key": "compliance.committees", "sections": [HERO(), _s("letters", "list", "Letters")]},

    # ── Careers ────────────────────────────────────────────────────────
    {"key": "careers_index", "path": "/careers", "title": "Careers", "scope_key": "careers.positions", "sections": [HERO(), _s("intro", "rich_text", "Working at ITM"), _s("positions", "list", "Open positions")]},
    {"key": "careers_open_positions", "path": "/careers/open-positions", "title": "Open Positions", "scope_key": "careers.positions", "sections": [HERO(), _s("intro", "rich_text", "Intro"), _s("positions", "list", "Positions")]},
    {"key": "careers_jrf", "path": "/jrf", "title": "JRF Postings", "scope_key": "careers.jrf", "sections": [HERO(), _s("intro", "rich_text", "About JRF"), _s("postings", "list", "JRF postings")]},
]


def upsert_all(db: Session) -> tuple[int, int]:
    """Returns (pages_upserted, sections_upserted)."""
    from app.models import Page, PageSection

    pages_n = sections_n = 0
    for spec in PAGE_CATALOGUE:
        page = db.scalar(select(Page).where(Page.key == spec["key"]))
        if page is None:
            page = Page(
                key=spec["key"],
                path=spec["path"],
                title=spec["title"],
                scope_key=spec.get("scope_key"),
                status="published",
                is_published=True,
                robots="index,follow",
            )
            db.add(page)
            db.flush()
        else:
            page.path = spec["path"]
            page.title = spec.get("title", page.title)
            if "scope_key" in spec:
                page.scope_key = spec["scope_key"]
        pages_n += 1

        for i, sec in enumerate(spec.get("sections", [])):
            existing = db.scalar(
                select(PageSection).where(
                    PageSection.page_id == page.id,
                    PageSection.section_key == sec["section_key"],
                )
            )
            if existing is None:
                db.add(
                    PageSection(
                        page_id=page.id,
                        section_key=sec["section_key"],
                        label=sec.get("label"),
                        kind=sec["kind"],
                        position=i,
                        is_active=True,
                        payload=sec.get("payload"),
                    )
                )
            else:
                if existing.label is None:
                    existing.label = sec.get("label")
                if existing.payload in (None, {}, []) and existing.payload_draft is None:
                    existing.kind = sec["kind"]
                    existing.payload = sec.get("payload")
            sections_n += 1
        db.commit()
    return pages_n, sections_n


if __name__ == "__main__":
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        p, s = upsert_all(db)
        print(f"Upserted {p} pages and {s} sections.")
    finally:
        db.close()
