"""Scrape LMS and ERP information from ITM Gwalior portals."""
from __future__ import annotations

import logging
from typing import Any

from app.ai_agent.config import settings
from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.lms-scraper")


class LMSScraper(BaseScraper):
    """Scrapes LMS and ERP portal information."""

    def __init__(self):
        super().__init__()
        self.urls = {
            "lms": settings.LMS_URL,
            "erp": settings.ERP_URL,
        }

    async def scrape(self) -> list[dict[str, Any]]:
        """Scrape LMS and ERP information."""
        results = []

        for category, url in self.urls.items():
            if not url or url == "https://":
                continue

            try:
                html = await self.fetch_page(url)
                if not html:
                    # Add basic metadata even if page is inaccessible
                    results.append({
                        "text": f"{category.upper()} Portal: {url}\n"
                                f"The {category.upper()} portal for ITM Gwalior is available at {url}. "
                                f"Students and faculty can log in using their institutional credentials.",
                        "metadata": {
                            "category": category,
                            "source": url,
                            "login_required": True,
                        },
                    })
                    continue

                text = self.extract_text(html)
                chunks = self.chunk_text(text)

                for chunk in chunks:
                    results.append({
                        "text": chunk,
                        "metadata": {
                            "category": category,
                            "source": url,
                        },
                    })

            except Exception as e:
                logger.warning("Error scraping %s: %s", url, str(e))
                results.append({
                    "text": f"{category.upper()} Portal is available at {url}.",
                    "metadata": {
                        "category": category,
                        "source": url,
                        "accessible": False,
                    },
                })

        return results
