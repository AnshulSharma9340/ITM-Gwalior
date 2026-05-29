"""Placements and training information scraper."""
from __future__ import annotations

import logging
from typing import Any

from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.placements-scraper")


class PlacementsScraper(BaseScraper):
    """Scrapes placement and training information."""

    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url.rstrip("/")
        self.placement_paths = [
            "/placements",
            "/tap",
            "/training",
            "/placements-cell",
            "/internships",
            "/placement-stats",
            "/recruiters",
            "/tap-cell",
            "/xpertquest",
        ]

    async def scrape(self) -> list[dict[str, Any]]:
        """Scrape placement information."""
        results = []

        for path in self.placement_paths:
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
                                "category": "placements",
                                "source": url,
                            },
                        })
            except Exception as e:
                logger.warning("Error scraping placements page %s: %s", url, str(e))

        logger.info("Placements scraping complete", extra={"chunks": len(results)})
        return results
