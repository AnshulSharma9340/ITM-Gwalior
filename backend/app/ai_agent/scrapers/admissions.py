"""Admissions information scraper."""
from __future__ import annotations

import logging
from typing import Any

from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.admissions-scraper")


class AdmissionsScraper(BaseScraper):
    """Scrapes admission-related information from ITM Gwalior websites."""

    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url.rstrip("/")
        self.admission_paths = [
            "/admissions",
            "/admissions/ug",
            "/admissions/pg",
            "/admissions/how-to-apply",
            "/admission",
            "/apply",
            "/fee-structure",
            "/scholarships",
            "/eligibility",
            "/admissions/important-dates",
        ]

    async def scrape(self) -> list[dict[str, Any]]:
        """Scrape admission information."""
        results = []

        for path in self.admission_paths:
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
                        category = "fees" if "fee" in path else ("admissions" if "admission" in path or "apply" in path or "eligibility" in path else "admissions")
                        results.append({
                            "text": chunk,
                            "metadata": {
                                "category": category,
                                "source": url,
                            },
                        })
            except Exception as e:
                logger.warning("Error scraping admissions page %s: %s", url, str(e))

        logger.info("Admissions scraping complete", extra={"chunks": len(results)})
        return results
