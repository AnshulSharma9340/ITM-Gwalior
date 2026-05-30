"""Scraper that indexes static ITM Gwalior data directly into the knowledge base.

Instead of scraping the React SPA (which returns empty HTML shells),
this reads the authoritative data from the codebase and indexes it.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.static-data")


class StaticDataScraper(BaseScraper):
    """Indexes pre-defined ITM Gwalior institutional data into the vector store."""

    def __init__(self):
        super().__init__()

    async def scrape(self) -> list[dict[str, Any]]:
        """Return static ITM data as indexable chunks."""
        results = []

        # ── Director & Officials ──────────────────────────────────────
        director_text = (
            "## Director of ITM Gwalior\n\n"
            "**Dr. Meenakshi Mazumdar** — Director, ITM Gwalior\n\n"
            "Dr. Meenakshi Mazumdar is the Director of Institute of Technology and Management (ITM), Gwalior. "
            "She leads the institute's vision for quality technical education and holistic student development.\n\n"
            "### Director's Message\n\n"
            "Welcome to Institute of Technology and Management, Gwalior. ITM, as is popularly known, "
            "has already established its position as a top technical institute in Madhya Pradesh.\n\n"
            "We offer multidisciplinary education across Computer Science, Information Technology, "
            "Electronics & Communication, Chemical, Civil and Mechanical Engineering, complemented by "
            "our flagship MBA programme. Holistic student development is delivered through our Activity "
            "Based Continuous Assessment System (ABCAS), project-based learning and a vibrant extracurricular calendar.\n\n"
            "Our placement record speaks for itself — over 80% of every graduating batch is placed. "
            "Our faculty drives research funded by the MP Council of Science and Research, and the "
            "institute partners with national programmes such as Unnat Bharat Abhiyan and PMKVY."
        )
        results.append({
            "text": director_text,
            "metadata": {"category": "general", "source": "itm_data:director", "url": "https://itm-gwalior.vercel.app/about/director-message"},
        })

        officials_text = (
            "## ITM Gwalior Officials and Leadership\n\n"
            "### Trust Management\n"
            "- **Mr. Rama Shankar Singh** — Chairman, Samata Lok Sansthan Trust\n"
            "- **Mrs. Kanupriya Singh Rathore** — Managing Trustee\n"
            "- **Mrs. Ruchi Singh Chauhan** — Vice-Chairperson, Trustee\n"
            "- **Ms. Palak Singh** — Trustee\n"
            "- **Dr. Daulat Singh Chauhan** — Managing Director\n\n"
            "### Academic Leadership\n"
            "- **Dr. R. D. Gupta** — Professor Emeritus\n"
            "- **Dr. Meenakshi Mazumdar** — Director, ITM Gwalior\n"
            "- **Dr. S. S. Chauhan** — Dean Academics, HoD Basic Science\n"
            "- **Dr. Prashant Shrivastava** — Dean Administration\n"
            "- **Dr. Deepesh Bharadwaj** — Dean Research\n"
            "- **Dr. Rajeev Singh Rathore** — Dean IQAC\n"
            "- **Dr. Manoj Mishra** — Dean Student Welfare\n"
            "- **Dr. Rishi Soni** — Dean Counselling, HoD CSE\n\n"
            "### Department Heads (HODs)\n"
            "- **Dr. Preeti Singh** — HoD, Management (MBA)\n"
            "- **Dr. Aditya Vidyarthi** — HoD, Information Technology\n"
            "- **Dr. Manoj Kumar Bandil** — HoD, Electronics & Communication\n"
            "- **Dr. Ashutosh Trivedi** — HoD, Civil Engineering\n"
            "- **Dr. Shiv Kumar Sharma** — HoD, Mechanical Engineering\n"
            "- **Dr. Rishi Soni** — HoD, Computer Science & Engineering"
        )
        results.append({
            "text": officials_text,
            "metadata": {"category": "general", "source": "itm_data:officials", "url": "https://itm-gwalior.vercel.app/about/officials"},
        })

        # ── Institute Info ────────────────────────────────────────────
        institute_text = (
            "## Institute of Technology and Management (ITM), Gwalior\n\n"
            "**Established:** 1997\n"
            "**Trust:** Samata Lok Sansthan Trust\n"
            "**Address:** ITM Campus, Opp. Sithouli Railway Station, NH-75 Sithouli, Jhansi Road, "
            "Gwalior – 475001 (M.P.), INDIA\n"
            "**Phone:** +91-751-2440056, +91-751-2432977\n"
            "**Admission Helpline:** +91-7773005065, +91-7773001624, +91-7773001627\n"
            "**Email:** admission@itmgoi.in\n\n"
            "### Affiliations\n"
            "- Engineering programmes: Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV), Bhopal\n"
            "- MBA programme: Jiwaji University, Gwalior\n\n"
            "### Accreditations\n"
            "- **NAAC** — Accredited with CGPA 3.01, A grade, valid till 24 Nov 2030\n"
            "- **AICTE** — Approved by All India Council for Technical Education\n"
            "- **NBA** — Accredited engineering programmes\n"
            "- **NIRF** — NIRF Ranked Institution\n\n"
            "### Campus Facts\n"
            "- 10.85 acre sprawling campus\n"
            "- 45 classrooms, 42 modern labs\n"
            "- 728 computers across academic blocks\n"
            "- 2500-seat NAAD Amphitheatre\n"
            "- 29+ years of educational legacy"
        )
        results.append({
            "text": institute_text,
            "metadata": {"category": "general", "source": "itm_data:institute", "url": "https://itm-gwalior.vercel.app/about"},
        })

        # ── Vision & Mission ──────────────────────────────────────────
        vision_text = (
            "## ITM Gwalior Vision and Mission\n\n"
            "### Vision\n"
            "To develop the institute into a centre of excellence in education, research, training "
            "and consultancy to the extent that it becomes a significant player in the technical "
            "and overall development of the country.\n\n"
            "### Mission\n"
            "- To meet the global need of competent and dedicated professionals.\n"
            "- To undertake R&D, Consultancy & extension activities which are of relevance to the "
            "needs of the mankind.\n"
            "- To serve the community by interaction on technical and other aspects of development.\n\n"
            "### Core Values\n"
            "- Humanity & Ethics: Humanity and ethics blended with sincerity, integrity and accountability.\n"
            "- Productive Delivery: Productive delivery supported by healthy competition.\n"
            "- Efficiency & Dynamism: Efficiency and dynamism coupled with sensitivity.\n"
            "- Rational Innovation: To nurture innovation and ability to think differently with rational creativity.\n"
            "- Sustainable Values: Appreciation of sustainable socio-cultural values."
        )
        results.append({
            "text": vision_text,
            "metadata": {"category": "general", "source": "itm_data:vision", "url": "https://itm-gwalior.vercel.app/about/mission-vision"},
        })

        # ── Achievements ──────────────────────────────────────────────
        achievements_text = (
            "## ITM Gwalior Achievements and Awards\n\n"
            "- **2024-25**: Microsoft Learn — Center of Excellence (Recognised May 2024 to April 2025)\n"
            "- **2024**: World Book of Records, London — Honoured for delivering Five Lakh Internships in Three Years (September 2024)\n"
            "- **2024**: EduSkills Virtual Internship Rankings — Ranked #35 All India in Engineering category\n"
            "- **2025**: Honeywell & ICT Academy — Recognised as Centre of Excellence for Women Empowerment\n"
            "- **2022**: Indian Education Excellence Awards — Best Institute for Training and Placements\n"
            "- **2014**: Silicon India Survey — Ranked 5th among top 10 Engineering Institutes of Central India"
        )
        results.append({
            "text": achievements_text,
            "metadata": {"category": "general", "source": "itm_data:achievements", "url": "https://itm-gwalior.vercel.app/about"},
        })

        # ── Facilities ────────────────────────────────────────────────
        facilities_text = (
            "## ITM Gwalior Campus Facilities\n\n"
            "- **ICT-Equipped Classrooms**: 45 classrooms total, 25 with smart interactive LCDs, projectors and Wi-Fi/LAN.\n"
            "- **42 State-of-the-Art Labs**: 18 specialised computing labs with virtual integration plus licensed ANSYS, Office & Turnitin.\n"
            "- **NAAD Amphitheatre**: 2,500-seat outdoor amphitheatre for cultural events and large gatherings.\n"
            "- **Auditorium (Upcoming)**: 1,500-seat modern in-house auditorium currently under development.\n"
            "- **728 Computers**: Hybrid terminals across academic blocks; fibre-optic backbone covers the campus.\n"
            "- **Akshardaam Central Library**: 64,000+ books, e-journals, IEEE & Springer access in a dedicated library block.\n"
            "- **Sports Complex**: Cricket, football, basketball, kabaddi, hockey, badminton + indoor gym & games room.\n"
            "- **On-Campus Hostels**: Separate residential blocks for boys & girls with mess, Wi-Fi and security.\n"
            "- **Meditation Zone**: A 'Zero Gravity' concept space and dedicated meditation centre for student wellness."
        )
        results.append({
            "text": facilities_text,
            "metadata": {"category": "general", "source": "itm_data:facilities", "url": "https://itm-gwalior.vercel.app/about/infrastructure"},
        })

        # ── Campus Buildings ──────────────────────────────────────────
        buildings_text = (
            "## ITM Gwalior Campus Buildings\n\n"
            "- **Carnot** — Mechanical Engineering\n"
            "- **Neumann** — Computer Science & Engineering\n"
            "- **Newton** — Basic Science & Examinations\n"
            "- **Old Reynolds** — Civil Engineering\n"
            "- **New Reynolds** — Information Technology\n"
            "- **Shannon** — Electronics & Communications\n"
            "- **Akshardaam** — Central Library\n"
            "- **TAP Cell** — Training & Placement"
        )
        results.append({
            "text": buildings_text,
            "metadata": {"category": "general", "source": "itm_data:buildings", "url": "https://itm-gwalior.vercel.app/about/infrastructure"},
        })

        # ── Distinctiveness ───────────────────────────────────────────
        distinctiveness_text = (
            "## ITM Gwalior Distinctiveness — Art, Culture and Education\n\n"
            "At ITM Gwalior, art, culture and education converge. Our campus is an open-air gallery "
            "where engineering students learn alongside global sculptures, classical music and "
            "centuries-old literary traditions.\n\n"
            "- **Harmony in Stone** (Since 2006): An international sculpture symposium that has hosted "
            "50+ sculptors from Japan, Germany, Italy, Mexico and South Africa.\n"
            "- **Harmony in Color** (Since 2007): A growing collection of paintings from diverse Indian "
            "and international traditions.\n"
            "- **Ibarat — Literary Festival** (Since 2007): Our annual literary and cultural event "
            "that brings together writers, poets and thinkers.\n"
            "- **Sangeet & Megh Malhar** (Since 2007): Music festivals celebrating classical-to-contemporary forms.\n"
            "- **Nritya Mahotsav**: A dance festival showcasing Odissi, Kathakali, Manipuri and other classical forms.\n"
            "- **Performing Arts as Curriculum** (Since 2022-23): PAC offers a value-added course under "
            "the Indian Knowledge System with hands-on training in theatre, music, dance and fine arts."
        )
        results.append({
            "text": distinctiveness_text,
            "metadata": {"category": "general", "source": "itm_data:distinctiveness", "url": "https://itm-gwalior.vercel.app/about/distinctiveness"},
        })

        # ── Contact Info ──────────────────────────────────────────────
        contact_text = (
            "## ITM Gwalior Contact Information\n\n"
            "**Institute of Technology and Management (ITM), Gwalior**\n"
            "ITM Campus, Opp. Sithouli Railway Station, NH-75 Sithouli, Jhansi Road, "
            "Gwalior – 475001 (M.P.), INDIA\n\n"
            "**Phone:** +91-751-2440056, +91-751-2432977\n"
            "**Admission Helpline:** +91-7773005065, +91-7773001624, +91-7773001627\n"
            "**Email:** admission@itmgoi.in\n"
            "**Website:** https://itm-gwalior.vercel.app\n"
            "**Legacy Website:** https://www.itmgoi.in"
        )
        results.append({
            "text": contact_text,
            "metadata": {"category": "contact_info", "source": "itm_data:contact", "url": "https://itm-gwalior.vercel.app/contact"},
        })

        logger.info(f"Static data indexed: {len(results)} documents")
        return results
