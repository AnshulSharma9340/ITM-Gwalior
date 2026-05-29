"""Faculty information scraper."""
from __future__ import annotations

import logging
from typing import Any

from bs4 import BeautifulSoup

from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.faculty-scraper")


class FacultyScraper(BaseScraper):
    """Scrapes faculty information from ITM Gwalior websites."""

    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url.rstrip("/")
        self.faculty_paths = [
            "/faculty",
            "/faculty/cse",
            "/faculty/it",
            "/faculty/ece",
            "/faculty/mechanical",
            "/faculty/civil",
            "/faculty/mba",
            "/faculty/pharmacy",
            "/faculty/nursing",
            "/faculty/agriculture",
            "/faculty/management",
        ]

    async def scrape(self) -> list[dict[str, Any]]:
        """Scrape faculty information from multiple pages."""
        results = []

        for path in self.faculty_paths:
            url = f"{self.base_url}{path}"
            try:
                html = await self.fetch_page(url)
                if not html:
                    continue

                text = self.extract_text(html)
                if len(text) < 30:
                    continue

                chunks = self.chunk_text(text)
                for chunk in chunks:
                    if len(chunk) > 30:
                        results.append({
                            "text": chunk,
                            "metadata": {
                                "category": "faculty",
                                "source": url,
                                "department": self._extract_department(path),
                            },
                        })
            except Exception as e:
                logger.warning("Error scraping faculty page %s: %s", url, str(e))

        logger.info("Faculty scraping complete", extra={"chunks": len(results)})
        return results

    def _extract_department(self, path: str) -> str:
        """Extract department name from URL path."""
        dept_map = {
            "cse": "Computer Science Engineering",
            "it": "Information Technology",
            "ece": "Electronics & Communication Engineering",
            "mechanical": "Mechanical Engineering",
            "civil": "Civil Engineering",
            "mba": "MBA",
            "pharmacy": "Pharmacy",
            "nursing": "Nursing",
            "agriculture": "Agriculture",
            "management": "Management",
        }
        for key, name in dept_map.items():
            if key in path:
                return name
        return "General"
